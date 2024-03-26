const express = require("express");
const router = express.Router();
const controller = require('../controller/controller')

router.post("/login",controller.login);

router.post("/sendResult/send-result",controller.sendResult);

router.get("/getEmail",controller.getallEmail);


module.exports = router;