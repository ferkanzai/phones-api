const router = require("express").Router();

module.exports = (db) => {
  router.get("/", require("./ping")(db));

  return router;
};
