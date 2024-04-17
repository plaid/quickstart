const db = require("./db");

const User = require("./models/User");
const Transaction = require("./models/Transaction");

User.hasMany(Transaction);


module.exports = {
  db,
  models: {
    User,
    Transaction,
  },
};
