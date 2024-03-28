const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors"); // Import cors package
const mongoose = require("mongoose");
const router = require("./src/routes/router");

const app = express();


app.use(express.json());
app.use("/", router);
// Enable CORS for all origins
app.use(cors());


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

exports.api = functions.https.onRequest(app);

