const { getAllPhones } = require("../../queries/phones");
const getOffset = require("../../utils");

module.exports = (db) => async (req, res, next) => {
  const { limit = 50, page = 1 } = req.query;

  const offset = getOffset(limit, page);

  try {
    if (limit > 100) throw new Error("max limit is 100");

    const result = await getAllPhones(db, limit, offset);

    if (result instanceof Error) {
      throw result;
    }

    const { rows, rowCount } = result;

    nextPage = !rowCount || rowCount < limit ? null : Number(page) + 1;

    res.status(200).json({
      success: true,
      count: rowCount,
      nextPage,
      data: rows,
    });
  } catch (error) {
    console.info("> something went wrong: ", error.message);
    next(error);
  }
};
