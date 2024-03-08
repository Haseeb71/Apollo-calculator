const express = require("express");
const mongoose =require("mongoose");
const router = require('./src/routes/router');
const cors = require('cors');


const app = express();
const port = process.env.PORT || 3000;

const corsOptions = {
  origin: 'http://127.0.0.1:5500'
};
app.use(cors(corsOptions));


app.use(express.json()); 

app.use('/', router);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});