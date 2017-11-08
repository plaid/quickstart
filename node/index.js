'use strict';
const envvar = require('envvar');
const express = require('express');
const bodyParser = require('body-parser');
const moment = require('moment');
const plaid = require('plaid');

const APP_PORT = envvar.number('APP_PORT', 9000);
const PLAID_CLIENT_ID = envvar.string('PLAID_CLIENT_ID');
const PLAID_SECRET = envvar.string('PLAID_SECRET');
const PLAID_PUBLIC_KEY = envvar.string('PLAID_PUBLIC_KEY');
const PLAID_ENV = envvar.string('PLAID_ENV', 'sandbox');

// We store the access_token in memory - in production, store it in a secure
// persistent data store
let ACCESS_TOKEN = null;
let PUBLIC_TOKEN = null;
let ITEM_ID = null;

// Initialize the Plaid client
const client = new plaid.Client(
  PLAID_CLIENT_ID,
  PLAID_SECRET,
  PLAID_PUBLIC_KEY,
  plaid.environments[PLAID_ENV]
);

let app = express();
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (request, response, next) => {
  response.render('index.ejs', {
    PLAID_PUBLIC_KEY: PLAID_PUBLIC_KEY,
    PLAID_ENV: PLAID_ENV,
  });
});

app.post('/get_access_token', (request, response, next) => {
  PUBLIC_TOKEN = request.body.public_token;
  
  client.exchangePublicToken(PUBLIC_TOKEN)
  .then(tokenResponse => {
    ACCESS_TOKEN = tokenResponse.access_token;
    ITEM_ID = tokenResponse.item_id;
    console.log(`Access Token: ${ACCESS_TOKEN}`);
    console.log(`Item ID: ${ITEM_ID}`);
    response.json({ 'error': false });
  }).catch(error => {
    let msg = 'Could not exchange public_token!';
    console.log(msg + '\n' + error);
    return response.json({ error: msg });
  })

});

app.get('/accounts', (request, response, next) => {
  // Retrieve high-level account information and account and routing numbers
  // for each account associated with the Item.
  client.getAuth(ACCESS_TOKEN)
  .then(authResponse => {
    console.log(authResponse.accounts);
    response.json({
      error: false,
      accounts: authResponse.accounts,
      numbers: authResponse.numbers,
    });
  }).catch(error => {
    let msg = 'Unable to pull accounts from the Plaid API.';
    console.log(msg + '\n' + error);
    return response.json({ error: msg });
  });

});

app.post('/item', function(request, response, next) {
  // Pull the Item - this includes information about available products,
  // billed products, webhook information, and more.
  client.getItem(ACCESS_TOKEN)
  .then(itemResponse => {
    // Also pull information about the institution
    client.getInstitutionById(itemResponse.item.institution_id)
    .then(instRes => {
      response.json({
        item: itemResponse.item,
        institution: instRes.institution,
      });
    }).catch(error => {
      let msg = 'Unable to pull institution information from the Plaid API.';
      console.log(msg + '\n' + error);
      return response.json({ error: msg });
    });

  }).catch(error => {
    console.log(JSON.stringify(error));
    return response.json({ error: error });
  });

});

app.post('/transactions', (request, response, next) => {
  // Pull transactions for the Item for the last 30 days
  let startDate = moment().subtract(30, 'days').format('YYYY-MM-DD');
  let endDate = moment().format('YYYY-MM-DD');
  let options = {
    count: 250,
    offset: 0,
  };

  client.getTransactions(ACCESS_TOKEN, startDate, endDate, options)
  .then(transactionsResponse => {
    console.log(`pulled ${transactionsResponse.transactions.length} transactions`);
    response.json(transactionsResponse);
  }).catch(error => {
    console.log(JSON.stringify(error));
    return response.json({ error: error });
  });

});

let server = app.listen(APP_PORT, () => {
  console.log(`plaid-walkthrough server listening on port ${APP_PORT}`);
});
