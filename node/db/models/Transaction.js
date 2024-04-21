const Sequelize = require("sequelize");
const db = require("../db");

const Transaction = db.define("transaction", {
  amount: {
    type: Sequelize.DECIMAL,
    allowNull: false
  },
});

module.exports = Transaction;
