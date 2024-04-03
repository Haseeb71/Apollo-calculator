const express = require("express");
var nodemailer = require("nodemailer");
const admin = require("firebase-admin");
const serviceAccount = require("../controller/apollo-new-be333-firebase-adminsdk-pkue0-d1a84782a3.json");
const bcrypt = require("bcrypt");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://console.firebase.google.com/u/0/project/apollo-new-be333/firestore/data/~2F",
});

const firestore = admin.firestore();

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Get the user document based on the provided email
    const userQuerySnapshot = await firestore
      .collection("user")
      .where("email", "==", email)
      .get();

    if (userQuerySnapshot.empty) {
      // No user found with the provided email
      return res.status(404).json({ status: false, message: "User not found" });
    }

    // Assuming there's only one user with the given email
    const userData = userQuerySnapshot.docs[0].data();

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, userData.password);

    if (isPasswordValid) {
      // Password is valid
      return res
        .status(200)
        .json({ status: true, message: "Login successful" });
    } else {
      // Password is invalid
      return res
        .status(401)
        .json({ status: false, message: "Invalid password" });
    }
  } catch (error) {
    console.error("Error checking user:", error);
    return res
      .status(500)
      .json({ status: false, message: "Internal Server Error" });
  }
};

const getallEmail = async (req, res) => {
  try {
    const snapshot = await firestore.collection("emails").get();
    const emails = [];
    snapshot.forEach((doc) => {
      const emailData = doc.data();
      emails.push(emailData);
    });

    res.status(200).json({ emails });
  } catch (error) {
    console.error("Error fetching emails:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const sendResult = async (req, res) => {
  const {
    mode = 0,
    howMuchYourHome = 0,
    howMuchYourAppliance = 0,
    howMuchOffGrid = 0,
    stayOn = 0,
    power240v = "",
    howLongOutage = "",
    solarSupply = "",
    name = "",
    email = "",
    solarNeeds = 0,
    batteryNeeds = 0,
    apollo5k = 0,
    expansionBattery = 0,
    solarPanels = 0,
    maximumInput = 0,
    totalInput = 0,
    dailyInput = 0,
    subTotal = "",
    tax = "",
    cost = "",
    personalPower = "",
    phone = "",
  } = req.body;

  // Store email in Firestore
  await firestore.collection("emails").add({
    mode,
    howMuchYourHome,
    howMuchYourAppliance,
    howMuchOffGrid,
    stayOn,
    power240v,
    howLongOutage,
    solarSupply,
    name,
    email,
    solarNeeds,
    batteryNeeds,
    apollo5k,
    expansionBattery,
    solarPanels,
    maximumInput,
    totalInput,
    dailyInput,
    subTotal,
    tax,
    cost,
    personalPower,
    phone,
  });

  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "sales@hysolis.com",
      pass: "zooujmkdxwawtxpk",
    },
  });

  let questionAndResponse = null;
  let header = `
    <div style="font-size: 16px;">
      Name: ${name}
    </div>
    <div style="font-size: 16px; ">
      Email: ${email}
    </div>
    <div style="font-size: 16px; margin-bottom: 20px;">
    Phone: ${phone}
    </div>
  `;
  let stayOnString = "";
  let howLongOutageString = "";
  if (stayOn === "0.4") {
    stayOnString =
      "Just the essentials (Appliances you need to keep your family warm and safe)";
  } else if (stayOn === "0.6") {
    stayOnString =
      "Some comforts (The essentials + lights/TV/computers and other less energy-intensive appliances)";
  } else if (stayOn === "0.75") {
    stayOnString =
      "More comforts (Some comforts + medium to high energy-intensive appliances like vacuum cleaners, microwave ovens, hair dryers, etc.)";
  } else {
    stayOnString = "Everything.";
  }

  if (howLongOutage === "hours") {
    howLongOutageString = "Just a few hours (1hr-6hr)";
  } else if (howLongOutage === "half") {
    howLongOutageString = "Half a day";
  } else if (howLongOutage === "day") {
    howLongOutageString = "About a day";
  } else if (howLongOutage === "days") {
    howLongOutageString = "A few days";
  } else {
    howLongOutageString = "More than a week";
  }
  if (mode === 0) {
    questionAndResponse = `
    <div style="font-weight: bold; font-size: 16px; ">
    Why are you looking for a personal power grid?
    </div>
    <div style="padding-left: 12px; font-size: 14px; margin-bottom: 20px; margin-top: 5px;">
      I want backup power during outages.
    </div>
    <div style="font-weight: bold; font-size: 16px; ">How much power (kWh) does your home use on average each day?</div>
    <div style="padding-left: 12px; font-size: 14px; margin-bottom: 20px; margin-top: 5px;">
      ${howMuchYourHome}
    </div>
    <div style="font-weight: bold; font-size: 16px; ">When the power goes out, what do you want to stay on?</div>
    <div style="padding-left: 12px; font-size: 14px; margin-bottom: 20px; margin-top: 5px;">
      ${stayOnString}
    </div>
    <div style="font-weight: bold; font-size: 16px; margin-top: 5px; ">Do you need to power any 240V Appliances?</div>
    <div style="padding-left: 12px; font-size: 14px; margin-bottom: 20px; margin-top: 5px;">
      ${power240v}
    </div>
    <div style="font-weight: bold; font-size: 16px; margin-bottom: 5px; ">How long of an outage do you want to be prepared for?</div>
    <div style="padding-left: 12px; font-size: 14px; margin-bottom: 20px; margin-top: 5px; ">
      ${howLongOutageString}
    </div>
    `;
    if (solarSupply) {
      questionAndResponse += `<div style="font-weight: bold; font-size: 16px;">We recommend solar in this situation. Do you plan to use solar to supplement your power needs?</div><div style="padding-left: 12px; font-size: 14px;">${solarSupply}</div>`;
    }
  } else if (mode === 1) {
    questionAndResponse = `
      <div style="font-weight: bold; font-size: 16px;">
        Why are you looking for a personal power grid?
      </div>
      <div style="padding-left: 12px; font-size: 14px;">
        I want off-grid power to power my cabin, toolshed, remote jobsite, etc.
      </div>
      <div style="font-weight: bold; font-size: 16px;">How much power (kWh) does your off-grid/mobile site need each day?</div>
      <div style="padding-left: 12px; font-size: 14px;">
        ${howMuchYourAppliance}
      </div>
      <div style="font-weight: bold; font-size: 16px;">Do you need to power any 240V Appliances?</div>
      <div style="padding-left: 12px; font-size: 14px;">
        ${power240v}
      </div>
    `;
  } else {
    questionAndResponse = `
      <div style="font-weight: bold; font-size: 16px;">
        Why are you looking for a personal power grid?
      </div>
      <div style="padding-left: 12px; font-size: 14px;">
        I want mobile power for my RV, mobile business, contractor's van, etc.
      </div>
      <div style="font-weight: bold; font-size: 16px;">How much power (kWh) does your off-grid site use on average each day?</div>
      <div style="padding-left: 12px; font-size: 14px;">
        ${howMuchOffGrid}
      </div>
      <div style="font-weight: bold; font-size: 16px;">Do you need to power any 240V Appliances?</div>
      <div style="padding-left: 12px; font-size: 14px;">
        ${power240v}
      </div>
    `;
  }

  const htmlContent = `${header}${questionAndResponse}
  <div style="font-weight: bold; font-size: 18px; margin-top: 20px;">
  Your Energy Requirements
</div>

<div style="display: flex; align-items: center; justify-content: flex-start; margin-bottom: 10px; width: fit-content;">
  <div style="min-width: 190px; margin-right: 10px; font-size: 12px;">Energy production (solar)</div>
  <div style="min-width: 80px;text-align: right; margin-right: 10px;">${solarNeeds}</div>
  <div>kWh</div>
</div>

<div style="display: flex; align-items: center; justify-content: flex-start;  width: fit-content;">
  <div style="min-width: 190px; margin-right: 10px; font-size: 12px; ">Energy storage (batter)</div>
  <div style="min-width: 80px;text-align: right; margin-right: 10px; ">${batteryNeeds}</div>
  <div>kWh</div>
</div>
<div style="font-weight: bold; margin-bottom: 5px; font-size: 18px; margin-top: 20px;">Our System Recommendation</div>
<div style="font-weight: bold; margin-bottom: 5px; font-size: 15px; margin-bottom: 10px;">Configuration:</div>
<div style="display: flex; align-items: center; justify-content: flex-start; margin-bottom: 10px; width: fit-content;">
  <div style="min-width: 190px; margin-right: 10px; font-size: 12px;">Apollo 5K:</div>
  <div style="min-width: 80px;text-align: right; margin-right: 10px;">${apollo5k}</div>
  
</div>
<div style="display: flex; align-items: center; justify-content: flex-start; margin-bottom: 10px; width: fit-content;">
  <div style="min-width: 190px; margin-right: 10px; font-size: 12px;">Expansion Battery</div>
  <div style="min-width: 80px;text-align: right; margin-right: 10px;">${expansionBattery}</div>
</div>
<div style="display: flex; align-items: center; justify-content: flex-start; margin-bottom: 10px; width: fit-content;">
  <div style="min-width: 190px; margin-right: 10px; font-size: 12px;">410 Watt Solar Panel</div>
  <div style="min-width: 80px;text-align: right; margin-right: 10px;">${solarPanels}</div>
</div>
<div style="font-weight: bold; margin-bottom: 5px; font-size: 15px; margin-bottom: 10px; margin-top:10px">Power Generation:</div>
<div style="display: flex; align-items: center; justify-content: flex-start; margin-bottom: 10px; width: fit-content;">
  <div style="min-width: 190px; margin-right: 10px; font-size: 12px;">Maximum continuous load</div>
  <div style="min-width: 80px;text-align: right; margin-right: 10px;">${maximumInput}</div>
  <div>kWh</div>
</div>
<div style="display: flex; align-items: center; justify-content: flex-start; margin-bottom: 10px; width: fit-content;">
  <div style="min-width: 190px; margin-right: 10px; font-size: 12px;">Total battery capacity</div>
  <div style="min-width: 80px;text-align: right; margin-right: 10px;">${totalInput}</div>
  <div>kWh</div>
</div>
<div style="display: flex; align-items: center; justify-content: flex-start; margin-bottom: 10px; width: fit-content;">
  <div style="min-width: 190px; margin-right: 10px; font-size: 12px;">Daily solar power generated</div>
  <div style="min-width: 80px;text-align: right; margin-right: 10px;">${dailyInput}</div>
  <div>kWh</div>
</div>
<div style="font-weight: bold; margin-bottom: 5px; font-size: 15px;">Price:</div>
<div style="display: flex; align-items: center; justify-content: flex-start; margin-bottom: 10px; width: fit-content;">
  <div style="font-weight: bold; font-size: 14px; min-width: 190px; margin-right: 10px; font-size: 12px;">Base price</div>
  <div style="min-width: 80px;text-align: right; margin-right: 10px;">${subTotal}</div>
</div><div style="min-width:80px;text-align:right;margin-right:10px"></div>
<div style="display: flex; align-items: center; justify-content: flex-start; margin-bottom: 10px; width: fit-content;">
  <div style="min-width: 190px; margin-right: 10px; font-size: 12px;">Less: Federal tax credit (30%)</div>
  <div style="min-width: 80px;text-align: right; margin-right: 10px; border-bottom: 1px solid black;">${tax}</div>
</div>
<div style="display: flex; align-items: center; justify-content: flex-start; margin-bottom: 10px; width: fit-content;">
  <div style="font-weight: bold; font-size: 14px; min-width: 190px; margin-right: 10px; font-size: 12px;">Net price</div>
  <div style="min-width: 80px;text-align: right; margin-right: 10px; border-bottom: 4px double black; font-weight: bold;">${cost}</div>
</div>
  `;

  // let mailOptions = {
  //   from: "sales@hysolis.com", // sender address
  //   to: email, // list of receivers
  //   bcc: "sales@hysolis.com", // bcc address
  //   subject: `Your Hysolis Apollo Configuration Results`, // Subject line
  //   html: htmlContent,
  // };

  // transporter.sendMail(mailOptions, (error, info) => {
  //   if (error) {
  //     console.log("error", error);
  //     res.status(500).send({ message: "No recipients defined" });
  //   }
  // });

  let mailOptions1 = {
    from: "sales@hysolis.com", // sender address
    to: email, // list of receivers
    bcc: "sales@hysolis.com", // bcc address
    subject: `Your Hysolis Apollo Configuration Results`, // Subject line
    html: htmlContent,
  };

  transporter.sendMail(mailOptions1, (error, info) => {
    if (error) {
      console.log("error", error);
      res.status(500).send({ message: "No recipients defined" });
    } else {
      res.status(200).json({
        success: true,
        response: info.response,
      });
    }
  });
};

module.exports = {
  sendResult,
  getallEmail,
  login,
};
