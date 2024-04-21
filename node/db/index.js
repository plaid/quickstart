const db = require("./db");

const User = require("./models/User");
const AccessToken = require("./models/AccessToken");
const Item = require("./models/Item");
const Bank = require("./models/Bank");
const Transaction = require("./models/Transaction");

User.hasMany(AccessToken);
AccessToken.hasOne(Item);
Item.hasMany(Bank);
Item.hasMany(Transaction);

module.exports = {
  db,
  models: {
    User,
    AccessToken,
    Item,
    Bank,
    Transaction,
  },
};
