import assert from "assert";
import crypto from "crypto";
import http from "http";
import fetch from "node-fetch";

const webhookSecret = "wsk_test_secret";
const apiSecretKey = "sk_test_secret";
const retrievedOrders = new Map();
let retrieveOrderCalls = 0;

const merchantApi = http.createServer((req, res) => {
  const orderId = req.url.replace("/api/orders/", "");
  retrieveOrderCalls += 1;

  if (req.method !== "GET" || !retrievedOrders.has(orderId)) {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
    return;
  }

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(retrievedOrders.get(orderId)));
});

const listen = (server) =>
  new Promise((resolve, reject) => {
    const listeningServer = server.listen(0, "127.0.0.1", () => {
      resolve({
        server: listeningServer,
        port: listeningServer.address().port,
      });
    });

    listeningServer.on("error", reject);
  });

const close = (server) =>
  new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });

const signBody = (body, timestamp, secret = webhookSecret) => {
  return crypto
    .createHmac("sha256", secret)
    .update(`v1.${timestamp}.${body}`)
    .digest("hex");
};

const sendWebhook = async (port, payload, headers = {}) => {
  const body = JSON.stringify(payload);

  return fetch(`http://127.0.0.1:${port}/webhook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body,
  });
};

const sendSignedWebhook = async (port, payload, signatureOverride) => {
  const body = JSON.stringify(payload);
  const timestamp = Date.now().toString();
  const signature = signatureOverride || `v1=${signBody(body, timestamp)}`;

  return fetch(`http://127.0.0.1:${port}/webhook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Revolut-Request-Timestamp": timestamp,
      "Revolut-Signature": signature,
    },
    body,
  });
};

const waitFor = async (predicate) => {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (predicate()) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 25));
  }

  throw new Error("Timed out waiting for condition");
};

const run = async () => {
  const merchantApiServer = await listen(merchantApi);

  process.env.REVOLUT_API_URL = `http://127.0.0.1:${merchantApiServer.port}`;
  process.env.REVOLUT_API_SECRET_KEY = apiSecretKey;
  process.env.REVOLUT_WEBHOOK_SECRET = webhookSecret;
  process.env.STATIC_DIR = "../client/html";

  const { default: app } = await import("../app.js");
  const { default: orders } = await import("../orders.js");
  const appServer = await listen(app);

  try {
    let response = await sendWebhook(appServer.port, {
      event: "ORDER_COMPLETED",
      order_id: "order_missing_signature",
    });
    assert.equal(response.status, 400);
    assert.equal(await response.text(), "Missing signature headers");

    response = await sendWebhook(
      appServer.port,
      {
        event: "ORDER_COMPLETED",
        order_id: "order_malformed_signature",
      },
      {
        "Revolut-Request-Timestamp": Date.now().toString(),
        "Revolut-Signature": "malformed",
      },
    );
    assert.equal(response.status, 400);
    assert.equal(await response.text(), "Malformed signature header");

    response = await sendSignedWebhook(
      appServer.port,
      {
        event: "ORDER_COMPLETED",
        order_id: "order_invalid_signature",
      },
      "v1=invalid",
    );
    assert.equal(response.status, 403);
    assert.equal(await response.text(), "Invalid signature");

    response = await sendSignedWebhook(appServer.port, {
      event: "ORDER_COMPLETED",
    });
    assert.equal(response.status, 400);
    assert.equal(await response.text(), "Missing order id");

    response = await sendSignedWebhook(appServer.port, {
      event: "ORDER_AUTHORISED",
    });
    assert.equal(response.status, 400);
    assert.equal(await response.text(), "Missing order id");

    response = await sendSignedWebhook(appServer.port, {
      event: "DISPUTE_ACTION_REQUIRED",
      dispute_id: "dispute_action_required",
    });
    assert.equal(response.status, 200);
    assert.equal(retrieveOrderCalls, 0);

    const multipleSignaturePayload = {
      event: "ORDER_UNKNOWN",
      order_id: "order_multiple_signatures",
    };
    const multipleSignatureBody = JSON.stringify(multipleSignaturePayload);
    const multipleSignatureTimestamp = Date.now().toString();
    response = await sendWebhook(appServer.port, multipleSignaturePayload, {
      "Revolut-Request-Timestamp": multipleSignatureTimestamp,
      "Revolut-Signature": `v1=invalid,v1=${signBody(
        multipleSignatureBody,
        multipleSignatureTimestamp,
      )}`,
    });
    assert.equal(response.status, 200);

    orders.createOrder({
      id: "order_completed",
      token: "token_completed",
      description: "Completed test order",
      state: "pending",
      amount: 1000,
      currency: "GBP",
    });
    retrievedOrders.set("order_completed", {
      id: "order_completed",
      state: "completed",
      amount: 1000,
      currency: "GBP",
    });

    response = await sendSignedWebhook(appServer.port, {
      event: "ORDER_COMPLETED",
      order_id: "order_completed",
    });
    assert.equal(response.status, 200);
    await waitFor(() => retrieveOrderCalls === 1);

    orders.createOrder({
      id: "order_authorised",
      token: "token_authorised",
      description: "Authorised test order",
      state: "pending",
      amount: 1500,
      currency: "GBP",
    });
    retrievedOrders.set("order_authorised", {
      id: "order_authorised",
      state: "authorised",
      amount: 1500,
      currency: "GBP",
    });

    response = await sendSignedWebhook(appServer.port, {
      event: "ORDER_AUTHORISED",
      order_id: "order_authorised",
    });
    assert.equal(response.status, 200);
    await waitFor(() => retrieveOrderCalls === 2);

    orders.createOrder({
      id: "order_not_completed",
      token: "token_not_completed",
      description: "Incomplete order",
      state: "pending",
      amount: 2000,
      currency: "GBP",
    });
    retrievedOrders.set("order_not_completed", {
      id: "order_not_completed",
      state: "authorised",
      amount: 2000,
      currency: "GBP",
    });

    response = await sendSignedWebhook(appServer.port, {
      event: "ORDER_COMPLETED",
      order_id: "order_not_completed",
    });
    assert.equal(response.status, 200);
    await waitFor(() => retrieveOrderCalls === 3);

    const incompleteOrder = orders.getOrderByRevolutId("order_not_completed");
    assert.equal(incompleteOrder.state, "pending");
  } finally {
    await close(appServer.server);
    await close(merchantApiServer.server);
  }
};

run()
  .then(() => {
    console.log("Webhook tests passed");
  })
  .catch(async (error) => {
    console.error(error);
    process.exitCode = 1;

    try {
      await close(merchantApi);
    } catch {
      // The server may already be closed.
    }
  });
