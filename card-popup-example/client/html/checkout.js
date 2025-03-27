import RevolutCheckout from "https://unpkg.com/@revolut/checkout/esm";
import { addNotification, addModalNotification } from "./utils.js";

document.addEventListener("DOMContentLoaded", async () => {
  const { revolutPublicKey } = await fetch("/config").then((r) => r.json());
  if (!revolutPublicKey) {
    addNotification(
      "No public key is defined in your .env file. Please check and try again",
    );
    alert("Please set your Revolut Public Key in the .env file");
    return;
  }
  const urlParams = new URLSearchParams(window.location.search);
  const order = urlParams.get("order");

  // Initialise the widget
  const { payWithPopup } = await RevolutCheckout(order, "sandbox");

  const payButton = document.getElementById("pay-button");
  payButton.addEventListener("click", (e) => {
    // Configure card pop-up
    // https://developer.revolut.com/docs/guides/accept-payments/payment-methods/card-payments/web/pop-up
    payWithPopup({
      onSuccess() {
        addModalNotification(
          "Payment successful",
          "Your order is now completed",
        );
      },
      onError() {
        // Handle payment errors accordingly
        addModalNotification("Payment failed", "Something went wrong");
      },
    });
  });
});
