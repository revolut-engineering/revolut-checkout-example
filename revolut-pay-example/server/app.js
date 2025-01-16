import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import path from "path";
import ejs from "ejs";
import { fileURLToPath } from "url";
import fetch from "node-fetch";
import { validateSignature, validateTimestamp } from "./helpers.js";
import orders from "./orders.js";
import ordersQueue from "./queue/orders-queue.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// use environment variables from .env
dotenv.config({
  path: "./.env",
});

// parse application/json
app.use(
  bodyParser.json({
    verify: (req, res, buf) => {
      // We need the raw body to verify webhook signatures.
      req.rawBody = buf;
    },
  }),
);

/* ################ API ENDPOINTS ################ */

// Create order
app.post("/api/orders", async (req, res) => {
  try {
    const { amount, currency, name } = req.body;
    // For more information, see: https://developer.revolut.com/docs/merchant/create-order
    const response = await fetch(
      `${process.env.REVOLUT_API_URL}/api/1.0/orders`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.REVOLUT_API_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: name,
          amount,
          currency,
        }),
      },
    );

    const revolutOrder = await response.json();
    const { revolutPublicOrderId, description, state } =
      orders.createOrder(revolutOrder);

    res.status(response.status);

    res.json({
      description,
      revolutPublicOrderId,
      state,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Order creation failed",
    });
  }
});

// Get the order
app.get("/api/orders/:id", async (req, res) => {
  try {
    const order = orders.getOrderByRevolutPublicId(req.params.id);
    const response = await fetch(
      // For more information, see: https://developer.revolut.com/docs/merchant/retrieve-order
      // We use the internal revolut id instead of the public one
      `${process.env.REVOLUT_API_URL}/api/1.0/orders/${order.revolutOrderId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.REVOLUT_API_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    res.status(response.status);

    res.json(await response.json());
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to get order",
    });
  }
});

app.post("/webhook", (req, res) => {
  try {
    const revolutSignature = req.headers["revolut-signature"];
    const revolutRequestTimestamp = req.headers["revolut-request-timestamp"];
    const rawPayload = req.rawBody;
    const payload = req.body;

    // Revolut signature verification
    // For more information visit https://developer.revolut.com/docs/guides/accept-payments/tutorials/work-with-webhooks/verify-the-payload-signature
    const revolutSignatureVersion = revolutSignature.substring(
      0,
      revolutSignature.indexOf("="),
    );
    const payloadToSign =
      `${revolutSignatureVersion}.` +
      `${revolutRequestTimestamp}.` +
      rawPayload;
    const isSignatureValid = validateSignature({
      signatureVersion: revolutSignatureVersion,
      originalSignature: revolutSignature,
      signingSecret: process.env.REVOLUT_WEBHOOK_SECRET,
      payloadToSign,
    });

    // Validates if the timestamp is within an acceptable timeframe
    // For more information visit https://webhooks.fyi/security/replay-prevention
    const isTimestampValid = validateTimestamp(revolutRequestTimestamp);

    if (!isTimestampValid) {
      // The request timestamp is outside of the tolerance zone.
      return res.status(403).send("Timestamp outside the tolerance zone");
    }

    if (isSignatureValid) {
      switch (payload.event) {
        // Don't process orders directly in the webhook handler
        // Schedule order management logic (send emails, update orders, etc.) and return 200 as soon as possible
        case "ORDER_COMPLETED":
          console.log("Webhook - Order Completed!");
          ordersQueue.push(payload);
          break;
        case "ORDER_AUTHORISED":
          console.log("Webhook - Order Authorised!");
          ordersQueue.push(payload);
          break;
        default:
          console.log("Webhook - Order Event", payload.event);
          ordersQueue.push(payload);
          break;
      }

      res.sendStatus(200);
    }
  } catch (error) {
    console.log(error);
  }
});

/* ################ end API ENDPOINTS ################ */

/* ################ CLIENT ENDPOINTS ################ */

app.engine("html", ejs.renderFile);
app.set("view engine", "html");
app.set("views", path.join(__dirname, process.env.STATIC_DIR));

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/config", (req, res) => {
  res.send({
    revolutPublicKey: process.env.REVOLUT_API_PUBLIC_KEY,
  });
});

// Optionally, you can define a static files directory (CSS, JS, images, etc.)
app.use("/", express.static(path.join(__dirname, process.env.STATIC_DIR)));

// Order status Page
app.get("/order-status", (req, res) => {
  res.render("order-status");
});

// Redirect URLs Page
app.get("/redirect_urls", (req, res) => {
  res.render("redirect-urls");
});

// Handling Redirect URLs (success|cancel|failure)
app.get("/:type(success|cancel|failure)", (req, res) => {
  res.render("order-status");
});

app.use((req, res) => {
  res.status(404);
  res.send(`<h1>Error 404: Resource not found</h1>`);
});

/* ################ end CLIENT ENDPOINTS ################ */

app.listen(process.env.PORT || 5177, () =>
  console.log(`Server running on http://localhost:${process.env.PORT || 5177}`),
);
