'use strict';

// read env vars from .env file
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');

const { db } = require('./db')
const seed = require('../script/seed');

const APP_PORT = process.env.APP_PORT || 8000;

const app = express();

app.use(
  bodyParser.urlencoded({
    extended: false,
  }),
);

// logging middleware
app.use(morgan("dev"));


app.use(bodyParser.json());
app.use(cors());

app.use("/auth", require("./auth"));
app.use('/api', require('./api'));


// error handling endware
app.use((err, req, res, next) => {
  console.error(err);
  console.error(err.stack);
  res.status(err.status || 500).send(err.message || "Internal server error.");
});


const init = async () => {
  try {
    if(process.env.SEED === 'true'){
      await seed();
    }
    else {
      await db.sync()
    }
    app.listen(APP_PORT, function() {
            console.log('Spirit Cat Api server listening on port ' + APP_PORT);
    });
  } catch (ex) {
    console.log(ex)
  }
}

init()
