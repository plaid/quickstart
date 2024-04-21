const Sequelize = require("sequelize");
const db = require("../db");

const AccessToken = db.define("access_token", {
  access_token: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
  },
  item_id: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
  },
});

module.exports = AccessToken;
