const db = require("../config/db");
const { sql } = require("slonik");

const createManufacturerTable = async () => {
  try {
    await db.query(sql`
      CREATE TABLE IF NOT EXISTS manufacturers (
        id SERIAL UNIQUE,
        api_id INT,
        name TEXT NOT NULL,
        url TEXT
      );
    `);

    console.info("> Manufacturers table created");
  } catch (error) {
    console.info("> error creating manufacturers table:", error.message);
  }
};

const createPhonesTable = async () => {
  try {
    await db.query(sql`
      CREATE TABLE IF NOT EXISTS phones (
        id SERIAL UNIQUE,
        api_id INT,
        manufacturer_id INTEGER NOT NULL REFERENCES manufacturers (id) ON DELETE SET NULL,
        name TEXT,
        release_date TEXT,
        battery_size INT,
        rear_camera TEXT,
        main_camera TEXT,
        second_camera TEXT,
        third_camera TEXT,
        front_camera TEXT,
        dual_sim BOOLEAN DEFAULT false,
        bluetooth FLOAT,
        wifi_type TEXT,
        usb_type TEXT,
        location TEXT,
        dimensions TEXT,
        weight TEXT,
        colors TEXT,
        display_size FLOAT,
        display_resolution TEXT,
        display_type TEXT,
        soc TEXT,
        cpu TEXT,
        gpu TEXT,
        ram TEXT,
        storage TEXT,
        storage_expansion TEXT,
        os TEXT,
        picture TEXT
      );
    `);

    console.info("> Phones table created");
  } catch (error) {
    console.info("> error creating phones table:", error.message);
  }
};

(async () => {
  await createManufacturerTable();
  await createPhonesTable();
})();
