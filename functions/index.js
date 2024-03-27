/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */



const functions = require("firebase-functions");
const express = require("express");
const mongoose = require("mongoose");
const router = require("./src/routes/router");

const app = express();


app.use(express.json());
app.use("/", router);

exports.api = functions.https.onRequest(app);




