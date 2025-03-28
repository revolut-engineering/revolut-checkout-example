# Card popup example

This repository contains an example integration of card popup and how to integrate it in your web application. It includes setup instructions, and testing guidelines using Revolut's Merchant API.

## System requirements

- Node.js 16 or later

## Setup

1. Clone this repo

   ```sh
   $ git clone git@github.com:revolut-engineering/revolut-checkout-example.git
   $ cd revolut-checkout-example/card-popup-example/server
   ```

1. Install dependencies

   ```sh title='NPM'
   $ npm install
   ```

1. Create a [Revolut Business sandbox account](https://sandbox-business.revolut.com)

1. Update your API keys

   Copy and rename `.env.example` file to `.env` and update it with your [keys](https://sandbox-business.revolut.com/merchant/api)

   ```
   REVOLUT_API_PUBLIC_KEY=<your_revolut_public_key>
   REVOLUT_API_SECRET_KEY=<your_revolut_secret_key>
   ```

1. Run the server

   ```sh title='NPM'
   $ npm start
   ```

> [!TIP]
> For testing purposes you can use our [test cards](https://developer.revolut.com/docs/guides/accept-payments/get-started/test-in-the-sandbox-environment/test-cards).
> For testing other environments you can change the `REVOLUT_API_URL`, update you Revolut keys and start the server again.

## Order management

In this example, we have omitted the order management process, as it is entirely up to you to implement according to your specific needs. However, if you'd like, you can explore our [revolut-pay-example](../revolut-pay-example) to gain valuable insights on how it can be implemented.

The Revolut Merchant API supports [webhooks](https://developer.revolut.com/docs/merchant/webhooks) to push event notifications corresponding to order and payment status changes to an specified URL.

> [!NOTE]
> For more information, see: [Use webhooks to keep track of the payment lifecycle](https://developer.revolut.com/docs/guides/accept-payments/tutorials/work-with-webhooks/using-webhooks)

## Documentation

Read more about online card payments on our official [Developer Portal](https://developer.revolut.com/docs/guides/accept-payments/payment-methods/card-payments/introduction).

## Related

- [`@revolut/checkout`](https://github.com/revolut-engineering/revolut-checkout) - RevolutCheckout.js as npm module

---

© Revolut LTD
