import fastq from "fastq";
import fetch from "node-fetch";
import orders from "../orders.js";

const getExpectedOrderState = (event) => {
  switch (event) {
    case "ORDER_COMPLETED":
      return "completed";
    case "ORDER_AUTHORISED":
      return "authorised";
    default:
      return null;
  }
};

const retrieveRevolutOrder = async (revolutOrderId) => {
  const response = await fetch(
    `${process.env.REVOLUT_API_URL}/api/orders/${revolutOrderId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.REVOLUT_API_SECRET_KEY}`,
        "Content-Type": "application/json",
        "Revolut-Api-Version": "2024-09-01",
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to retrieve Revolut order: ${response.status}`);
  }

  return response.json();
};

const isOrderVerified = (localOrder, revolutOrder, expectedState) => {
  return (
    revolutOrder.state === expectedState &&
    revolutOrder.amount === localOrder.amount &&
    revolutOrder.currency === localOrder.currency
  );
};

const worker = async ({ order_id: revolutOrderId, event }) => {
  const expectedState = getExpectedOrderState(event);

  if (!expectedState) {
    return;
  }

  const order = orders.getOrderByRevolutId(revolutOrderId);

  if (!order) {
    return;
  }

  try {
    const revolutOrder = await retrieveRevolutOrder(revolutOrderId);

    // A webhook is a trigger, not final payment proof.
    if (!isOrderVerified(order, revolutOrder, expectedState)) {
      console.log("Webhook order verification failed", {
        revolutOrderId,
        expectedState,
        revolutState: revolutOrder.state,
      });
      return;
    }

    orders.updateOrderStatus(order.id, revolutOrder.state);
  } catch (error) {
    console.error(error);
  }
};

// Use any queue library that best suits your needs (AWS SQS, PubSub, bull, etc.)
const ordersQueue = fastq.promise(worker, 1);

export default ordersQueue;
