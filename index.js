const express = require("express");
const mongoose =require("mongoose");
const router = require('./src/routes/router');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json()); 

app.use('/', router);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});