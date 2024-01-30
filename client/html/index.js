import RevolutCheckout from "https://unpkg.com/@revolut/checkout/esm";
import { staticProduct, addNotification } from "./utils.js";

document.addEventListener("DOMContentLoaded", async () => {
  const { revolutPublicKey } = await fetch("/config").then((r) => r.json());
  if (!revolutPublicKey) {
    addNotification(
      "No public key is defined in your .env file. Please check and try again",
    );
    alert("Please set your Revolut Public Key in the .env file");
    return;
  }

  const { revolutPay } = await RevolutCheckout.payments({
    locale: "en", // Optional, defaults to 'en'
    mode: "sandbox", // Optional, defaults to 'prod'
    publicToken: revolutPublicKey, // Merchant public API key
  });

  const paymentOptions = {
    currency: staticProduct.currency,
    totalAmount: staticProduct.amount,
    mobileRedirectUrls: {
      success: `${window.location.origin}/success`,
      failure: `${window.location.origin}/failure`,
      cancel: `${window.location.origin}/cancel`,
    },

    createOrder: async () => {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: staticProduct.amount,
          currency: staticProduct.currency,
          name: staticProduct.name,
        }),
      });

      const order = await response.json();

      return { publicId: order.revolutPublicOrderId };
    },
  };

  // Mount Revolut Pay Button
  revolutPay.mount(document.getElementById("revolut-pay"), paymentOptions);

  // Event handlers
  revolutPay.on("payment", (event) => {
    switch (event.type) {
      case "cancel": {
        console.log("payment canceled");
        addNotification(
          `Order canceled ${event.orderId ? `- orderId: ${event.orderId}` : ""}`,
        );
        break;
      }

      case "success":
        console.log("payment successful");
        window.location.href = `/order-status?_rp_oid=${event.orderId}`;
        break;

      case "error":
        console.log("error in payment");
        if (event.orderId) {
          window.location.href = `/order-status?_rp_oid=${event.orderId}`;
        } else {
          addNotification(event.error.message);
        }
        break;
    }
  });
});
