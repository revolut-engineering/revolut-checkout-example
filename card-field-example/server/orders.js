// Simulate a database API
// Keep in mind that the order management process it's entirely your choice
const orders = new Map();

const createOrder = (revolutOrder) => {
  console.log(`revolutOrder ->`, revolutOrder);
  // Generate a unique id (database job in a real-world scenario)
  const orderId = generateUniqueId();
  const order = {
    id: orderId,
    revolutOrderId: revolutOrder.id,
    revolutPublicOrderId: revolutOrder.token,
    description: revolutOrder.description,
    state: revolutOrder.state,
    amount: revolutOrder.amount,
    currency: revolutOrder.currency,
  };

  orders.set(orderId, order);

  console.log(`Order saved with id: ${orderId}`);
  return order;
};

// Helper function to generate a unique ID (database job in a real-world scenario)
const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export default {
  createOrder,
};
