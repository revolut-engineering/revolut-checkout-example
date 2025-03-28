# Revolut Pay integration example

![Revolut logo](../images/logo-revolut-pay.svg)

This example demonstrates how to integrate Revolut Pay into your checkout process using a two-tiered approach that separates the client-side presentation from the backend logic. Explore this simplified demo to observe the code and SDK configuration you need to start accepting payments with Revolut Pay.

The example inlcudes a simple Node.JS server app using the Merchant API, paired with a simple HTML client checkout experience.

**You only need to run the server component - the server handles order creation and serves the client checkout page.**

> [!TIP]
> For testing we suggest configuring the demo with your Sandbox API keys.

## Architecture

- **Backend (Server)**
  - Creates orders and handles tokens needed to initialise the payment session.
  - Serves the client-side checkout page.
- **Frontend (Client)**
  - A simple HTML page that renders the Revolut Pay button using the token provided by the server.

## Integration paths

The example showcases two integration options:

- **Event handling:** The SDK listens to payment events (e.g., success, error, cancel) via callbacks.
- **Redirect URLs:** The SDK redirects the user to a specified URLs based on the payment outcome

> [!NOTE]
> For further details about the code and the SDK's behaviour, please refer to the inline comments in the code.

## Requirements

- Revolut Merchant API keys
- Node.js 16 or later

## Project setup

### 1. Installation

1. Start by cloning the repository:

    ```sh
    git clone git@github.com:revolut-engineering/revolut-checkout-example.git
    ```

1. Open the repository folder:

    ```sh
    cd revolut-checkout-example/revolut-pay-example/server
    ```

1. Install dependencies with your package manager:

    ```sh title='NPM'
    npm install
    ```
    ```sh title='Yarn'
    yarn install
    ```

### 2. Create account

1. If you didn't have already, create a [Revolut Business sandbox account](https://sandbox-business.revolut.com)
1. Get your Public and Private API keys from [Merchant API settings](https://sandbox-business.revolut.com/settings/apis?tab=merchant-api).

### 3. Set enviroment variables

1. Copy and rename the `.env.example` file to `.env`
1. Add your corresponding API keys to the following variables:
    
    ```properties
    REVOLUT_API_PUBLIC_KEY=<your_revolut_public_key>
    REVOLUT_API_SECRET_KEY=<your_revolut_secret_key>
    ```

### 4. Run the application

1. Run the server to host the application on your localhost:

    ```sh title='NPM'
    npm start
    ```
    ```sh title='Yarn'
    yarn start
    ```


### 5. Test the SDK

1. Visit [http://localhost:5177/](http://localhost:5177/) to see the application.
1. From the sidebar, select the integration you want to test:
  - **Event Handlers**
  - **Redirect URLs** 
1. Try out different [payment flows](https://developer.revolut.com/docs/guides/accept-payments/get-started/test-implementation/test-flows#revolut-pay) using our [test cards](https://developer.revolut.com/docs/guides/accept-payments/get-started/test-in-the-sandbox-environment/test-cards) in the Sandbox environment.

> [!TIP]
> To test the SDK in production enviroment update the following enviroment variables: `REVOLUT_API_URL`, `REVOLUT_API_PUBLIC_KEY`, `REVOLUT_API_SECRET_KEY` and restart the server.
>
> To test Revolut Pay account-to-account payment flow in prodcution, you need a Revolut account and the Revolut app installed.

## Webhooks

The Revolut Merchant API supports [webhooks](https://developer.revolut.com/docs/merchant/webhooks) which deliver asynchronous event notifications about order and payment status changes.

> [!NOTE]
> For more information, see: [Use webhooks to keep track of the payment lifecycle](https://developer.revolut.com/docs/guides/accept-payments/tutorials/work-with-webhooks/using-webhooks)

### 1. Set up a public URL for your localhost

1. Install [ngrok](https://www.npmjs.com/package/ngrok) or any similar tool to obtain a public URL:

  ```sh
  npm install ngrok -g
  ```
  ```sh
  yarn global add ngrok
  ```

1. Start ngrok on your server port:

  ```sh
  ngrok http 5177
  ```

The command outputs a public URL where you can access your demo app when your localhost is running. You'll use this public URL in the next step.

### 2. Configure the webhook in the Merchant API

1. Check the [Create a webhook](https://developer.revolut.com/docs/merchant/set-webhook) endpoint in the Merchant API documentation.
1. Set up a webhook URL in the Merchant API by posting this request:

  ```sh
  curl -L -X POST 'https://sandbox-merchant.revolut.com/api/1.0/webhooks' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <yourSecretApiKey>' \
  --data-raw '{
    "url": "<yourPublicUrl>/webhook",
    "events": [
      "ORDER_COMPLETED",
      "ORDER_AUTHORISED"
    ]
  }'
  ```

  Replace `<yourSecretApiKey>` with your secret key (as in your `.env` file, `REVOLUT_API_SECRET_KEY`) and `<yourPublicUrl>` with the public URL from ngrok.

  You should receive a JSON with the following sturcture:
  
  ```json
  {
    "id": "396a4d93-70c3-44ca-8fb9-ca903a5505d7",
    "url": "<your_public_url>/webhook",
    "events": ["ORDER_COMPLETED", "ORDER_AUTHORISED"],
    "signing_secret": "<signing_secret_key>"
  }
  ```

### 3. Finalise your setup

1. Update environment variables, by adding the returned `signing_secret` to your `.env` file as `REVOLUT_WEBHOOK_SECRET`.    
1. (Re)start your local server.

When your server is running, you should see webhook events logged in the console as they are received.

## Documentation

Read more about Revolut Pay on our official [Developer Portal](https://developer.revolut.com/docs/guides/accept-payments/payment-methods/accept-payments-via-revolut-pay2/introduction-revolut-pay).

## Related

- [`@revolut/checkout`](https://github.com/revolut-engineering/revolut-checkout) - RevolutCheckout.js as npm module

---

© Revolut LTD
