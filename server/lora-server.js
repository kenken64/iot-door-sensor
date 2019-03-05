console.log("Lora device server");
const express = require("express"),
  bodyParser = require("body-parser"),
  assert = require("assert"),
  path = require("path");

var app = express();

// init router
var router = express.Router();

app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/", router);

router.post("/sigfox-callback-data", (req, res, next) => {
  console.log("/sigfox-callback-data");
  console.log(req.body);
  res.status(200).json({});
});

router.post("/sigfox-error", (req, res, next) => {
  console.log("/sigfox-error");
  console.log(req.body);
  res.json({});
});

router.post("/sigfox-service", (req, res, next) => {
  console.log("/sigfox-service");
  console.log(req.body);
  res.json({});
});

app.listen(3000, function() {
  console.log("App is running on port " + 3000);
});
