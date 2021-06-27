const db = require("../config/db");
const { sql } = require("slonik");
const fs = require("fs");
const path = require("path");

const manufacturers = require("../phones/manufacturers");

const manufacturerMapping = (manufacturer) => ({
  api_id: manufacturer.id,
  name: manufacturer.name,
  url: manufacturer.url,
});

const insertManufacturers = async (manufacturers) => {
  try {
    await db.transaction(async (tx) => {
      for await (const manufacturer of manufacturers) {
        await tx.query(sql`
          INSERT INTO manufacturers (
            api_id,
            name,
            url
          ) VALUES (
            ${manufacturer.api_id},
            ${manufacturer.name},
            ${manufacturer.url}
            ) ON CONFLICT DO NOTHING;
        `);
      }
    });

    console.info("> manufacturers data inserted");
  } catch (error) {
    console.info("> error inserting manufacturers data:", error.message);
  }
};

const phonesMapping = (phone) => ({
  api_id: phone.id,
  manufacturer_id: phone.manufacturer,
  name: phone.name,
  release_date: phone.release_date,
  battery_size:
    Number(
      phone.specs.Battery?.find(
        (spec) => spec.name === "Capacity:"
      )?.description.split(" ")[0]
    ) || null,
  rear_camera:
    phone.specs.Camera?.find((spec) => spec.name === "Rear:")?.description ||
    null,
  main_camera:
    phone.specs.Camera?.find((spec) => spec.name === "Main camera:")
      ?.description || null,
  second_camera:
    phone.specs.Camera?.find((spec) => spec.name === "Second camera:")
      ?.description || null,
  third_camera:
    phone.specs.Camera?.find((spec) => spec.name === "Third camera:")
      ?.description || null,
  front_camera:
    phone.specs.Camera?.find((spec) => spec.name === "Front:")?.description ||
    null,
  dual_sim:
    phone.specs.Cellular?.find((spec) => spec.name === "Dual SIM:")
      ?.description === "Yes"
      ? true
      : false,
  bluetooth:
    Number(
      phone.specs["Connectivity & Features"]?.find(
        (spec) => spec.name === "Bluetooth:"
      )?.description
    ) || null,
  wifi_type:
    phone.specs["Connectivity & Features"]?.find(
      (spec) => spec.name === "Wi-Fi:"
    )?.description || null,
  usb_type:
    phone.specs["Connectivity & Features"]?.find((spec) => spec.name === "USB:")
      ?.description || null,
  location:
    phone.specs["Connectivity & Features"]?.find(
      (spec) => spec.name === "Location:"
    )?.description || null,
  dimensions:
    phone.specs.Design?.find((spec) => spec.name === "Dimensions:")
      ?.description || null,
  weight:
    phone.specs.Design?.find((spec) => spec.name === "Weight:")?.description ||
    null,
  colors:
    phone.specs.Design?.find((spec) => spec.name === "Colors:")?.description ||
    null,
  display_size:
    Number(
      phone.specs.Display?.find(
        (spec) => spec.name === "Size:"
      )?.description.split(" ")[0]
    ) || null,
  display_resolution:
    phone.specs.Display?.find((spec) => spec.name === "Resolution:")
      ?.description || null,
  display_type:
    phone.specs.Display?.find((spec) => spec.name === "Technology:")
      ?.description || null,
  soc:
    phone.specs.Hardware?.find((spec) => spec.name === "System chip:")
      ?.description || null,
  cpu:
    phone.specs.Hardware?.find((spec) => spec.name === "Processor:")
      ?.description || null,
  gpu:
    phone.specs.Hardware?.find((spec) => spec.name === "GPU:")?.description ||
    null,
  ram:
    phone.specs.Hardware?.find((spec) => spec.name === "RAM:")?.description ||
    null,
  storage:
    phone.specs.Hardware?.find((spec) => spec.name === "Internal storage:")
      ?.description || null,
  storage_expansion:
    phone.specs.Hardware?.find((spec) => spec.name === "Storage expansion:")
      ?.description || null,
  os:
    phone.specs.Hardware?.find((spec) => spec.name === "OS:")?.description ||
    null,
  picture: phone.image_url || null,
});

const insertPhones = async (phones) => {
  try {
    await db.transaction(async (tx) => {
      for await (const phone of phones) {
        await tx.query(sql`
        INSERT INTO phones (
          api_id,
          manufacturer_id,
          name,
          release_date,
          battery_size,
          rear_camera,
          main_camera,
          second_camera,
          third_camera,
          front_camera,
          dual_sim,
          bluetooth,
          wifi_type,
          usb_type,
          location,
          dimensions,
          weight,
          colors,
          display_size,
          display_resolution,
          display_type,
          soc,
          cpu,
          gpu,
          ram,
          storage,
          storage_expansion,
          os,
          picture
        ) VALUES (
          ${phone.api_id},
          ${phone.manufacturer_id},
          ${phone.name},
          ${phone.release_date},
          ${phone.battery_size},
          ${phone.rear_camera},
          ${phone.main_camera},
          ${phone.second_camera},
          ${phone.third_camera},
          ${phone.front_camera},
          ${phone.dual_sim},
          ${phone.bluetooth},
          ${phone.wifi_type},
          ${phone.usb_type},
          ${phone.location},
          ${phone.dimensions},
          ${phone.weight},
          ${phone.colors},
          ${phone.display_size},
          ${phone.display_resolution},
          ${phone.display_type},
          ${phone.soc},
          ${phone.cpu},
          ${phone.gpu},
          ${phone.ram},
          ${phone.storage},
          ${phone.storage_expansion},
          ${phone.os},
          ${phone.picture}
            ) ON CONFLICT DO NOTHING;
        `);
      }
    });

    console.info("> phones data inserted");
  } catch (error) {
    console.log(error);
    console.info("> error inserting phones data:", error.message);
  }
};

(async () => {
  const manufacturersToDb = manufacturers.map(manufacturerMapping);

  await insertManufacturers(manufacturersToDb);

  const allPhones = [];

  const jsonsFiles = fs
    .readdirSync(path.join(__dirname, "../phones"))
    .filter((file) => path.extname(file) === ".json");

  for (const file of jsonsFiles) {
    const manufacturerName = file.split(".")[0];

    const manufacturerId = (
      await db.query(sql`
      SELECT id FROM manufacturers WHERE name = ${manufacturerName}
    `)
    ).rows[0].id;

    const phones = JSON.parse(
      fs.readFileSync(path.join(__dirname, `../phones/${file}`))
    );

    phones
      .map(phonesMapping)
      .map((phone) => ({ ...phone, manufacturer_id: manufacturerId }))
      .map((phone) => allPhones.push(phone));
  }

  await insertPhones(allPhones);
})();
