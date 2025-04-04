import RevolutCheckout from "https://unpkg.com/@revolut/checkout/esm";
import { addModalNotification, staticProduct } from "./utils.js";

const payButton = document.getElementById("pay-button");

if (payButton) {
  payButton.addEventListener("click", async () => {
    /**
     * Create the order.
     * Keep in mind that when to create the order is totally up to your implementation.
     * But the widget needs it for its initialization.
     * More info: https://developer.revolut.com/docs/guides/accept-payments/payment-methods/card-payments/web/pop-up#how-it-works
     */
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

    // Initialise the widget
    const { payWithPopup } = await RevolutCheckout(
      order.revolutPublicOrderId,
      "sandbox",
    );

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
}
