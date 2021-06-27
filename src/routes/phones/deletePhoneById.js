const { deletePhoneById } = require("../../queries/phones");

module.exports = (db) => async (req, res, next) => {
  const { phoneId } = req.params;

  try {
    const result = await deletePhoneById(db, phoneId);

    if (result instanceof Error) {
      throw result;
    }

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.info("> something went wrong: ", error.message);
    next(error);
  }
};
