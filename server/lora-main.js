"use strict";
require("babel-core/register");
require("babel-polyfill");
require('babel-register')({
    presets: [ "es2015", "stage-0" ]
})
// Import the rest of our application.
module.exports = require('./lora-server.js')