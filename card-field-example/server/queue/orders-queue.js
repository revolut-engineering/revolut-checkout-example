import fastq from "fastq";
import orders from "../orders.js";

const worker = async ({ order_id: revolutOrderId, event: status }) => {
  const order = orders.getOrderByRevolutId(revolutOrderId);

  orders.updateOrderStatus(order.id, status);
};

// Use any queue library that best suits your needs (AWS SQS, PubSub, bull, etc.)
const ordersQueue = fastq.promise(worker, 1);

export default ordersQueue;
