import { data } from "ttn"

const appID = "doorsensorgw2019"
const accessKey = "ttn-account-v2.tks9H-OecpQ5Y-v0CKtZgcA900K9PfaDkbFJOBzbUm8"

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
