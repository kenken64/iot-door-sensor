'use strict';

import { data } from "ttn"

const appID = process.env.LORAWAN_APP_ID;
const accessKey = process.env.LORAWAN_ACCESS_KEY;

const main = async function () {
  const client = await data(appID, accessKey)
  console.log("main");
  console.log(client);
  client
    .on("uplink", function (devID, payload) {
      console.log("Received uplink from ", devID)
      console.log(payload)
      console.log(payload.payload_raw.toString('utf8'));
    })
}

main().catch(function (err) {
  console.error(err)
  process.exit(1)
})
