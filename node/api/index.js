'use strict';

const router = require("express").Router();

module.exports = router;
//router.use("/users", require("./users"));
router.use("/plaid", require("./plaid"));

router.use((_, _, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});
