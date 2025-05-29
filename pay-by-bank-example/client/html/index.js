import RevolutCheckout from "https://unpkg.com/@revolut/checkout/esm";
import {
  staticProduct,
  addNotification,
} from "./utils.js";

document.addEventListener("DOMContentLoaded", async () => {
  const { revolutPublicKey } = await fetch("/config").then((r) => r.json());
  if (!revolutPublicKey) {
    addNotification(
      "No public key is defined in your .env file. Please check and try again",
    );
    alert("Please set your Revolut Public Key in the .env file");
    return;
  }

  const { payByBank } = await RevolutCheckout.payments({
    locale: "en", // Optional, defaults to 'auto'
    publicToken: revolutPublicKey, // Merchant public API key
  });

  const payByBankButton = document.getElementById('pay-by-bank')
  payByBankButton.addEventListener('click', async () => {
    const payByBankInstance = payByBank({
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
      onSuccess() {
        // Do something to handle successful payments
        window.alert('Successful payment!')
      },
      onError(error) {
        // Do something to handle payment errors
        window.alert(`Something went wrong. ${error}`)
      }
    })

    payByBankInstance.show()
  })
});
