const { patchModifyPhone } = require("../../queries/phones");

module.exports = (db) => async (req, res, next) => {
  const { phoneId } = req.params;
  const {
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
    picture,
  } = req.body;

  try {
    if (
      !name ||
      !soc ||
      !cpu ||
      !ram ||
      !gpu ||
      !display_size ||
      !display_type ||
      !os ||
      !storage ||
      !usb_type ||
      !weight ||
      !dimensions ||
      !rear_camera ||
      !battery_size
    ) {
      const error = new Error("all fields are mandatory");
      error.code = 400;
      throw error;
    }

    const result = await patchModifyPhone(
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
    );

    if (result instanceof Error) {
      throw result;
    }

    console.log(result);
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
