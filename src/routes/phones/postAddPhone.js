const { postAddPhone } = require("../../queries/phones");

module.exports = (db) => async (req, res, next) => {
  const {
    name = null,
    manufacturer,
    soc = null,
    cpu = null,
    ram = null,
    gpu = null,
    display_size = null,
    display_type = null,
    os = null,
    storage = null,
    usb_type = null,
    weight = null,
    dimensions = null,
    rear_camera = null,
    battery_size = null,
    picture = null,
  } = req.body;

  try {
    if (!manufacturer || !name)
      throw new Error("unable to add phone without manufacturer and name");

    const result = await postAddPhone(
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
    );

    if (result instanceof Error) {
      throw result;
    }

    const { rows, rowCount } = result;

    res.status(200).json({
      success: true,
      count: rowCount,
      data: rows,
    });
  } catch (error) {
    console.info("> something went wrong: ", error.message);
    next(error);
  }
};
