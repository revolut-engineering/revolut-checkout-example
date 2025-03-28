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
  const { createCardField } = await RevolutCheckout(order, "sandbox");

  // Configure cardField
  // https://developer.revolut.com/docs/guides/accept-payments/payment-methods/card-payments/web/card-field#42-javascript-integration
  const cardField = createCardField({
    target: document.getElementById("card-field"),
    onSuccess() {
      addModalNotification("Payment successful", "Your order is now completed");
    },
    onError(error) {
      // Handle payment errors accordingly
      addModalNotification("Payment failed", "Something went wrong");
    },
    onValidation(errors) {
      // Concatenate the error messages into a single string
      const concatenatedErrors = errors
        ?.map((error) => error.message)
        .join(" - ");

      if (concatenatedErrors.length) {
        addNotification(concatenatedErrors);
      }
    },
  });

  const form = document.getElementById("checkoutForm");
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    // More fields are available for submission, please check:
    // https://developer.revolut.com/docs/guides/accept-payments/payment-methods/card-payments/web/card-field#example-with-additional-parameters
    cardField.submit({
      name: formData.get("name"),
      email: formData.get("email"),
    });
  });
});
