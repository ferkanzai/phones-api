const db = require("../config/db");
const { sql } = require("slonik");

const dropManufacturers = async () => {
  try {
    await db.query(sql`
      DROP TABLE manufacturers
    `);
  } catch (error) {
    console.info("> error dropping manufacturers data:", error.message);
  }
};

const dropPhones = async () => {
  try {
    await db.query(sql`
      DROP TABLE phones
    `);
  } catch (error) {
    console.info("> error dropping phones data:", error.message);
  }
};

(async () => {
  console.info("> dropping data");
  await dropPhones();
  await dropManufacturers();
  console.info("> done!");
})();
