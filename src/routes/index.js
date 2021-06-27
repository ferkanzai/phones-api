const router = require("express").Router();

module.exports = (db) => {
  router.use("/ping", require("./ping")(db));
  router.use("/phones", require("./phones")(db));

  return router;
};
