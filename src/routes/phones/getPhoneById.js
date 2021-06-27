const { getPhoneById } = require("../../queries/phones");

module.exports = (db) => async (req, res, next) => {
  const { phoneId } = req.params;

  try {
    const result = await getPhoneById(db, phoneId);

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
