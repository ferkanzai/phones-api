require("dotenv").config();
const axios = require("axios");
const manufacturers = require("./phones/manufacturers");
const fs = require("fs");
const path = require("path");

const API = "http://grabaphone.herokuapp.com/api";

(async () => {
  for await (manufacturer of manufacturers) {
    try {
      const result = await axios.get(
        `${API}/get-devices?key=${process.env.GRAB_A_PHONE_API_KEY}&manufacturer=${manufacturer.name}`
      );

      const devices = result.data.Devices;

      await fs.writeFileSync(
        path.join(__dirname, `./phones/${manufacturer.name}.json`),
        JSON.stringify(devices, null, 2)
      );
    } catch (err) {
      console.error(`Unable to get ${manufacturer} phones`);
    }
  }
})();
