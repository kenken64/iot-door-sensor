console.log("Sigfox device server");
const express = require("express"),
  bodyParser = require("body-parser"),
  assert = require("assert"),
  structuredMessage = require("./structuredMessage"),
  path = require("path");

var app = express();

// init router

app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(express.static(path.join(__dirname, "public")));

var router = express.Router();

app.use("/", router);

router.post("/sigfox-callback-data", (req, res, next) => {
  console.log("/sigfox-callback-data");
  //console.log(req);
  console.log(req.body.data);
  if (!req.body || !req.body.data)
    res.status(500).json(Object.assign({}, req.body));
  try {
    const decodedData = structuredMessage.decodeMessage(req.body.data);
    console.log(decodedData);
    const result = Object.assign({}, req.body, decodedData);
    console.log(">>>>" + JSON.stringify(result));
    res.status(200).json(result);
  } catch (error) {
    //  In case of error, return the original message.
    res.status(500).json(req.body);
  }
  console.log("------------------------");
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
