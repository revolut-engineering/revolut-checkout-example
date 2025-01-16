// Simulate a database API
// Keep in mind that the order management process it's entirely your choice
const orders = new Map();

const createOrder = (revolutOrder) => {
  // Generate a unique id (database job in a real-world scenario)
  const orderId = generateUniqueId();
  const order = {
    id: orderId,
    revolutOrderId: revolutOrder.id,
    revolutPublicOrderId: revolutOrder.public_id,
    description: revolutOrder.description,
    state: revolutOrder.state,
    amount: revolutOrder["order_amount"].value,
    currency: revolutOrder["order_amount"].currency,
  };

  orders.set(orderId, order);

  console.log(`Order saved with id: ${orderId}`);
  return order;
};

const getOrderByRevolutPublicId = (revolutPublicId) => {
  // Retrieve order data from the map using the revolutPublicOrderId
  for (const [orderId, orderData] of orders.entries()) {
    if (orderData.revolutPublicOrderId === revolutPublicId) {
      return { orderId, ...orderData };
    }
  }

  console.log(`Order with revolutPublicOrderId ${revolutPublicId} not found`);
  return null;
};

const getOrderByRevolutId = (revolutOrderId) => {
  // Retrieve order data from the map using the revolutOrderId
  for (const [orderId, orderData] of orders.entries()) {
    if (orderData.revolutOrderId === revolutOrderId) {
      return { orderId, ...orderData };
    }
  }

  console.log(`Order with revolutOrderId ${revolutOrderId} not found`);
  return null;
};

const updateOrderStatus = (orderId, newStatus) => {
  const orderData = orders.get(orderId);

  if (orderData) {
    const updatedOrderData = { ...orderData, status: newStatus };
    orders.set(orderId, updatedOrderData);

    console.log(
      `Order status updated for orderId: ${orderId} - New status: ${newStatus}`,
    );
  } else {
    console.log(`Order with orderId ${orderId} not found `);
  }
};

// Helper function to generate a unique ID (database job in a real-world scenario)
const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export default {
  createOrder,
  getOrderByRevolutPublicId,
  getOrderByRevolutId,
  updateOrderStatus,
};
