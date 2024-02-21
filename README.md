# Revolut Pay example

This repository contains an example integration of Revolut Pay, demonstrating how to integrate Revolut Pay's payment processing capabilities in your web application. It includes setup instructions, webhook configuration, and testing guidelines using Revolut's Merchant API.

## System requirements

- Node.js 16 or later

## Setup

1. Clone this repo

    ```sh
    $ git clone git@github.com:revolut-engineering/revolut-checkout-example.git
    $ cd revolut-checkout-example/server
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

## Webhooks

The Revolut Merchant API supports [webhooks](https://developer.revolut.com/docs/merchant/webhooks) to push event notifications corresponding to order and payment status changes to an specified URL.

> [!NOTE]
> For more information, see: [Use webhooks to keep track of the payment lifecycle](https://developer.revolut.com/docs/guides/accept-payments/tutorials/work-with-webhooks/using-webhooks)

### Set up webhooks for your localhost

1. Set a public URL for your localhost

    Use [ngrok](https://www.npmjs.com/package/ngrok) or any similar tool to obtain a public URL.
    
    ```sh
    $ npm install ngrok -g
    $ ngrok http 5177
    ```

1. Set up a webhook URL in the Merchant API

    Check the [Create a webhook](https://developer.revolut.com/docs/merchant/set-webhook) endpoint in the Merchant API specification.

    Replace `<yourSecretApiKey>` with the same key you used in the `.env` file (`REVOLUT_API_SECRET_KEY`) and `<yourPublicUrl>` with the public URL obtained in the previous step.

    ```sh
    curl -L -X POST 'https:/sandbox-merchant.revolut.com/api/1.0/webhooks' \
    -H 'Content-Type: application/json' \
    -H 'Accept: application/json' \
    -H 'Authorization: Bearer <yourSecretApiKey>' \
    --data-raw '{
      "url": "<yourPublicUrl>",
      "events": [
        "ORDER_COMPLETED",
        "ORDER_AUTHORISED"
      ]
    }'
    ```

    The response has the following JSON structure:
    
    ```json
    {
      "id": "396a4d93-70c3-44ca-8fb9-ca903a5505d7",
      "url": "<your_public_url>/webhook",
      "events": ["ORDER_COMPLETED", "ORDER_AUTHORISED"],
      "signing_secret": "<signing_secret_key>"
    }
    ```

1. Use the `signing_secret` in your `.env` file (`REVOLUT_WEBHOOK_SECRET`) and start the server.
    
1. You should see events logged in the console where the CLI is running.

## Documentation

Read more about Revolut Pay on our official [Developer Portal](https://developer.revolut.com/docs/guides/accept-payments/payment-methods/accept-payments-via-revolut-pay2/introduction-revolut-pay).

## Related

- [`@revolut/checkout`](https://github.com/revolut-engineering/revolut-checkout) - RevolutCheckout.js as npm module

---

© Revolut LTD
