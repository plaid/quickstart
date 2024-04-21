'use strict';

const router = require("express").Router();

module.exports = router;
//router.use("/users", require("./users"));
router.use("/plaid", require("./plaid"));
router.use("/auth", require("./auth"));

router.use((err, req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});
