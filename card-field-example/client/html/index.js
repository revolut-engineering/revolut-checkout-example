import { staticProduct } from "./utils.js";

const checkoutButton = document.getElementById("checkout-btn");

if (checkoutButton) {
  checkoutButton.addEventListener("click", async () => {
    // Create the order
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

    // Navigate to checkout page
    window.location.href = `/checkout?order=${order.revolutPublicOrderId}`;
  });
}
