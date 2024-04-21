const Sequelize = require("sequelize");
const db = require("../db");

const Bank = db.define("bank", {
  name: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
  },
  instituion_id: {
    type: Sequelize.STRING,
  }
});

module.exports = Bank;
