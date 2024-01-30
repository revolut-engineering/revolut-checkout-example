import { setOrderState, loadingData, addNotification } from "./utils.js";

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const publicOrderId = urlParams.get("_rp_oid");

  if (!publicOrderId) {
    loadingData({ loading: false, error: true });
    addNotification(`Failed to get the order ID`);
    return;
  }

  // Polling mechanism to get order status
  async function getOrderStatus() {
    try {
      loadingData({ loading: true });
      const response = await fetch(`/api/orders/${publicOrderId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        loadingData({ loading: false });
        setOrderState(publicOrderId, "FAILED");
        return;
      }

      const order = await response.json();

      loadingData({ loading: false });
      setOrderState(publicOrderId, order.state);

      if (order.state === "pending" || order.state === "processing") {
        setTimeout(getOrderStatus, 1000);
      }
    } catch (error) {
      console.log(error);

      loadingData({ loading: false, error: true });
      addNotification(`Failed to get the order status`);
    }
  }

  getOrderStatus();
});
