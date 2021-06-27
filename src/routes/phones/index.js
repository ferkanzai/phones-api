const router = require("express").Router();

module.exports = (db) => {
  router.get("/:phoneId", require("./getPhoneById")(db));
  router.get("/", require("./getAllPhones")(db));
  router.post("/add", require("./postAddPhone")(db));
  router.delete("/delete/:phoneId", require("./deletePhoneById")(db));
  router.patch("/edit/:phoneId", require("./patchModifyPhone")(db));

  return router;
};
