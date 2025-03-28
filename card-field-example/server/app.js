import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import path from "path";
import ejs from "ejs";
import { fileURLToPath } from "url";
import fetch from "node-fetch";
import orders from "./orders.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// use environment variables from .env
dotenv.config({
  path: "./.env",
});

// parse application/json
app.use(
  bodyParser.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  }),
);

/* ################ API ENDPOINTS ################ */

// Create order
app.post("/api/orders", async (req, res) => {
  try {
    const { amount, currency, name } = req.body;
    // For more information, see: https://developer.revolut.com/docs/merchant/create-order
    const response = await fetch(`${process.env.REVOLUT_API_URL}/api/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.REVOLUT_API_SECRET_KEY}`,
        "Content-Type": "application/json",
        "Revolut-Api-Version": "2023-09-01",
      },
      body: JSON.stringify({
        description: name,
        amount,
        currency,
      }),
    });

    const revolutOrder = await response.json();
    const { revolutPublicOrderId, description, state } =
      orders.createOrder(revolutOrder);

    res.status(response.status);

    res.json({
      description,
      revolutPublicOrderId,
      state,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Order creation failed",
    });
  }
});

/* ################ end API ENDPOINTS ################ */

/* ################ CLIENT ENDPOINTS ################ */

app.engine("html", ejs.renderFile);
app.set("view engine", "html");
app.set("views", path.join(__dirname, process.env.STATIC_DIR));

// Main Page
app.get(["/", "/card_field"], (req, res) => {
  res.render("index");
});

// Checkout Page
app.get("/checkout", (req, res) => {
  res.render("checkout");
});

app.get("/config", (req, res) => {
  res.send({
    revolutPublicKey: process.env.REVOLUT_API_PUBLIC_KEY,
  });
});

// Optionally, you can define a static files directory (CSS, JS, images, etc.)
app.use("/", express.static(path.join(__dirname, process.env.STATIC_DIR)));

// Not found route
app.use((req, res) => {
  res.status(404);
  res.send(`<h1>Error 404: Resource not found</h1>`);
});

/* ################ end CLIENT ENDPOINTS ################ */

app.listen(process.env.PORT || 5177, () =>
  console.log(`Server running on http://localhost:${process.env.PORT || 5177}`),
);
