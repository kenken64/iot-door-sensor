'use strict';
require("dotenv").config();
const express = require("express"),
  bodyParser = require("body-parser"),
  multer  = require('multer'),
  assert = require("assert"),
  cors = require('cors'),
  path = require("path");

var app = express();

app.use(cors());
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./firmware/")
  },
  filename: function (req, file, cb) {
    console.log(file.originalname);
    console.log(path.extname(file.originalname));
    cb(null, file.originalname)
  }
})

var upload = multer({ storage: storage }).single('firmware');
const OTA_SERVER_PORT = process.env.OTA_SERVER_PORT;
// init router
var router = express.Router();

app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(bodyParser.json({ limit: "50mb" }));

app.use("/api", router);
app.use('/firmware', express.static(path.join(__dirname, 'firmware')))

router.post("/firmware-upload", (req, res, next) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      res.status(500).json(err);
    } else if (err) {
      // An unknown error occurred when uploading.
      res.status(500).json(err);
    }
    // Everything went fine.
    res.status(200).json({message: "done"});
  })
  
});

app.listen(OTA_SERVER_PORT, function() {
  console.log("OTA Server is running on port " + OTA_SERVER_PORT);
});