const { sql } = require("slonik");

const getAllPhones = async (db, limit, offset) => {
  try {
    return await db.query(sql`
      SELECT * FROM phones ORDER BY api_id LIMIT ${limit} OFFSET ${offset};
    `);
  } catch (error) {
    console.info("> something went wrong:", error.message);
    return error;
  }
};

const getPhoneById = async (db, phoneId) => {
  try {
    return await db.query(sql`
      SELECT p.*, m.name AS manufacturer
      FROM phones p JOIN manufacturers m ON p.manufacturer_id = m.id
       WHERE p.id = ${phoneId};
    `);
  } catch (error) {
    console.info("> something went wrong:", error.message);
    return error;
  }
};

const postAddPhone = async (
  db,
  name,
  manufacturer,
  soc,
  cpu,
  ram,
  gpu,
  display_size,
  display_type,
  os,
  storage,
  usb_type,
  weight,
  dimensions,
  rear_camera,
  battery_size,
  picture
) => {
  try {
    return await db.transaction(async (tx) => {
      const manufacturer_id =
        (
          await tx.query(sql`
          SELECT id FROM manufacturers WHERE name ILIKE ('%' || ${manufacturer} || '%');
        `)
        ).rows[0]?.id ||
        (
          await tx.query(sql`
          INSERT INTO manufacturers (name) VALUES (${manufacturer}) RETURNING id;
        `)
        ).rows[0].id;

      return await tx.query(sql`
        INSERT INTO phones (
          name,
          manufacturer_id,
          soc,
          cpu,
          ram,
          gpu,
          display_size,
          display_type,
          os,
          storage,
          usb_type,
          weight,
          dimensions,
          rear_camera,
          battery_size,
          picture
        ) VALUES (
          ${name},
          ${manufacturer_id},
          ${soc},
          ${cpu},
          ${ram},
          ${gpu},
          ${display_size},
          ${display_type},
          ${os},
          ${storage},
          ${usb_type},
          ${weight},
          ${dimensions},
          ${rear_camera},
          ${battery_size},
          ${picture}
        ) RETURNING *;
      `);
    });
  } catch (error) {
    console.info("> something went wrong:", error.message);
    return error;
  }
};

const deletePhoneById = async (db, phoneId) => {
  try {
    return await db.query(sql`
      DELETE FROM phones WHERE id = ${phoneId};
    `);
  } catch (error) {
    console.info("> something went wrong:", error.message);
    return error;
  }
};

const patchModifyPhone = async (
  db,
  phoneId,
  name,
  soc,
  cpu,
  ram,
  gpu,
  display_size,
  display_type,
  os,
  storage,
  usb_type,
  weight,
  dimensions,
  rear_camera,
  battery_size,
  picture
) => {
  try {
    if (picture)
      return await db.query(sql`
      UPDATE phones 
        SET name = ${name}, soc = ${soc}, cpu = ${cpu},
        ram = ${ram}, gpu = ${gpu}, display_size = ${display_size},
        display_type = ${display_type}, os = ${os}, storage = ${storage},
        usb_type = ${usb_type}, weight = ${weight}, dimensions = ${dimensions},
        rear_camera = ${rear_camera}, battery_size = ${battery_size},
        picture = ${picture}
        WHERE id = ${phoneId}
        RETURNING *;
    `);

    return await db.query(sql`
    UPDATE phones 
      SET name = ${name}, soc = ${soc}, cpu = ${cpu},
      ram = ${ram}, gpu = ${gpu}, display_size = ${display_size},
      display_type = ${display_type}, os = ${os}, storage = ${storage},
      usb_type = ${usb_type}, weight = ${weight}, dimensions = ${dimensions},
      rear_camera = ${rear_camera}, battery_size = ${battery_size}
      WHERE id = ${phoneId}
      RETURNING *;
  `);
  } catch (error) {
    console.info("> something went wrong:", error.message);
    return error;
  }
};

module.exports = {
  getAllPhones,
  getPhoneById,
  postAddPhone,
  deletePhoneById,
  patchModifyPhone,
};
