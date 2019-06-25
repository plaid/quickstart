'use strict';

var util = require('util');

var envvar = require('envvar');
var express = require('express');
var bodyParser = require('body-parser');
var moment = require('moment');
var plaid = require('plaid');

var APP_PORT = envvar.number('APP_PORT', 8000);
var PLAID_CLIENT_ID = envvar.string('PLAID_CLIENT_ID');
var PLAID_SECRET = envvar.string('PLAID_SECRET');
var PLAID_PUBLIC_KEY = envvar.string('PLAID_PUBLIC_KEY');
var PLAID_ENV = envvar.string('PLAID_ENV', 'sandbox');

// PLAID_PRODUCTS is a comma-separated list of products to use when initializing
// Link. Note that this list must contain 'assets' in order for the app to be
// able to create and retrieve asset reports.
var PLAID_PRODUCTS = envvar.string('PLAID_PRODUCTS', 'transactions');

// PLAID_PRODUCTS is a comma-separated list of countries for which users
// will be able to select institutions from.
var PLAID_COUNTRY_CODES = envvar.string('PLAID_COUNTRY_CODES', 'US,CA,GB,FR,ES');


// We store the access_token in memory - in production, store it in a secure
// persistent data store
var ACCESS_TOKEN = null;
var PUBLIC_TOKEN = null;
var ITEM_ID = null;

// Initialize the Plaid client
// Find your API keys in the Dashboard (https://dashboard.plaid.com/account/keys)
var client = new plaid.Client(
  PLAID_CLIENT_ID,
  PLAID_SECRET,
  PLAID_PUBLIC_KEY,
  plaid.environments[PLAID_ENV],
  {version: '2019-05-29', clientApp: 'Plaid Quickstart'}
);

var app = express();
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

app.get('/', function(request, response, next) {
  response.render('index.ejs', {
    PLAID_PUBLIC_KEY: PLAID_PUBLIC_KEY,
    PLAID_ENV: PLAID_ENV,
    PLAID_PRODUCTS: PLAID_PRODUCTS,
    PLAID_COUNTRY_CODES: PLAID_COUNTRY_CODES,
  });
});

// Exchange token flow - exchange a Link public_token for
// an API access_token
// https://plaid.com/docs/#exchange-token-flow
app.post('/get_access_token', function(request, response, next) {
  PUBLIC_TOKEN = request.body.public_token;
  client.exchangePublicToken(PUBLIC_TOKEN, function(error, tokenResponse) {
    if (error != null) {
      prettyPrintResponse(error);
      return response.json({
        error: error,
      });
    }
    ACCESS_TOKEN = tokenResponse.access_token;
    ITEM_ID = tokenResponse.item_id;
    prettyPrintResponse(tokenResponse);
    response.json({
      access_token: ACCESS_TOKEN,
      item_id: ITEM_ID,
      error: null,
    });
  });
});


// Retrieve Transactions for an Item
// https://plaid.com/docs/#transactions
app.get('/transactions', function(request, response, next) {
  // Pull transactions for the Item for the last 30 days
  var startDate = moment().subtract(30, 'days').format('YYYY-MM-DD');
  var endDate = moment().format('YYYY-MM-DD');
  client.getTransactions(ACCESS_TOKEN, startDate, endDate, {
    count: 250,
    offset: 0,
  }, function(error, transactionsResponse) {
    if (error != null) {
      prettyPrintResponse(error);
      return response.json({
        error: error
      });
    } else {
      prettyPrintResponse(transactionsResponse);
      response.json({error: null, transactions: transactionsResponse});
    }
  });
});

// Retrieve Identity for an Item
// https://plaid.com/docs/#identity
app.get('/identity', function(request, response, next) {
  client.getIdentity(ACCESS_TOKEN, function(error, identityResponse) {
    if (error != null) {
      prettyPrintResponse(error);
      return response.json({
        error: error,
      });
    }
    prettyPrintResponse(identityResponse);
    response.json({error: null, identity: identityResponse});
  });
});

// Retrieve real-time Balances for each of an Item's accounts
// https://plaid.com/docs/#balance
app.get('/balance', function(request, response, next) {
  client.getBalance(ACCESS_TOKEN, function(error, balanceResponse) {
    if (error != null) {
      prettyPrintResponse(error);
      return response.json({
        error: error,
      });
    }
    prettyPrintResponse(balanceResponse);
    response.json({error: null, balance: balanceResponse});
  });
});

// Retrieve an Item's accounts
// https://plaid.com/docs/#accounts
app.get('/accounts', function(request, response, next) {
  client.getAccounts(ACCESS_TOKEN, function(error, accountsResponse) {
    if (error != null) {
      prettyPrintResponse(error);
      return response.json({
        error: error,
      });
    }
    prettyPrintResponse(accountsResponse);
    response.json({error: null, accounts: accountsResponse});
  });
});

// Retrieve ACH or ETF Auth data for an Item's accounts
// https://plaid.com/docs/#auth
app.get('/auth', function(request, response, next) {
  client.getAuth(ACCESS_TOKEN, function(error, authResponse) {
    if (error != null) {
      prettyPrintResponse(error);
      return response.json({
        error: error,
      });
    }
    prettyPrintResponse(authResponse);
    response.json({error: null, auth: authResponse});
  });
});

// Retrieve Holdings for an Item
// https://plaid.com/docs/#investments
app.get('/holdings', function(request, response, next) {
  client.getHoldings(ACCESS_TOKEN, function(error, holdingsResponse) {
    if (error != null) {
      prettyPrintResponse(error);
      return response.json({
        error: error,
      });
    }
    prettyPrintResponse(holdingsResponse);
    response.json({error: null, holdings: holdingsResponse});
  });
});

// Retrieve Investment Transactions for an Item
// https://plaid.com/docs/#investments
app.get('/investment_transactions', function(request, response, next) {
  var startDate = moment().subtract(30, 'days').format('YYYY-MM-DD');
  var endDate = moment().format('YYYY-MM-DD');
  client.getInvestmentTransactions(ACCESS_TOKEN, startDate, endDate, function(error, investmentTransactionsResponse) {
    if (error != null) {
      prettyPrintResponse(error);
      return response.json({
        error: error,
      });
    }
    prettyPrintResponse(investmentTransactionsResponse);
    response.json({error: null, investment_transactions: investmentTransactionsResponse});
  });
});

// Create and then retrieve an Asset Report for one or more Items. Note that an
// Asset Report can contain up to 100 items, but for simplicity we're only
// including one Item here.
// https://plaid.com/docs/#assets
app.get('/assets', function(request, response, next) {
  // You can specify up to two years of transaction history for an Asset
  // Report.
  var daysRequested = 10;

  // The `options` object allows you to specify a webhook for Asset Report
  // generation, as well as information that you want included in the Asset
  // Report. All fields are optional.
  var options = {
    client_report_id: 'Custom Report ID #123',
    // webhook: 'https://your-domain.tld/plaid-webhook',
    user: {
      client_user_id: 'Custom User ID #456',
      first_name: 'Alice',
      middle_name: 'Bobcat',
      last_name: 'Cranberry',
      ssn: '123-45-6789',
      phone_number: '555-123-4567',
      email: 'alice@example.com',
    },
  };
  client.createAssetReport(
    [ACCESS_TOKEN],
    daysRequested,
    options,
    function(error, assetReportCreateResponse) {
      if (error != null) {
        prettyPrintResponse(error);
        return response.json({
          error: error,
        });
      }
      prettyPrintResponse(assetReportCreateResponse);

      var assetReportToken = assetReportCreateResponse.asset_report_token;
      respondWithAssetReport(20, assetReportToken, client, response);
    });
});

// Retrieve information about an Item
// https://plaid.com/docs/#retrieve-item
app.get('/item', function(request, response, next) {
  // Pull the Item - this includes information about available products,
  // billed products, webhook information, and more.
  client.getItem(ACCESS_TOKEN, function(error, itemResponse) {
    if (error != null) {
      prettyPrintResponse(error);
      return response.json({
        error: error
      });
    }
    // Also pull information about the institution
    client.getInstitutionById(itemResponse.item.institution_id, function(err, instRes) {
      if (err != null) {
        var msg = 'Unable to pull institution information from the Plaid API.';
        console.log(msg + '\n' + JSON.stringify(error));
        return response.json({
          error: msg
        });
      } else {
        prettyPrintResponse(itemResponse);
        response.json({
          item: itemResponse.item,
          institution: instRes.institution,
        });
      }
    });
  });
});

var server = app.listen(APP_PORT, function() {
  console.log('plaid-quickstart server listening on port ' + APP_PORT);
});

var prettyPrintResponse = response => {
  console.log(util.inspect(response, {colors: true, depth: 4}));
};

// This is a helper function to poll for the completion of an Asset Report and
// then send it in the response to the client. Alternatively, you can provide a
// webhook in the `options` object in your `/asset_report/create` request to be
// notified when the Asset Report is finished being generated.
var respondWithAssetReport = (
  numRetriesRemaining,
  assetReportToken,
  client,
  response
) => {
  if (numRetriesRemaining == 0) {
    return response.json({
      error: 'Timed out when polling for Asset Report',
    });
  }

  var includeInsights = false;
  client.getAssetReport(
    assetReportToken,
    includeInsights,
    function(error, assetReportGetResponse) {
      if (error != null) {
        prettyPrintResponse(error);
        if (error.error_code == 'PRODUCT_NOT_READY') {
          setTimeout(
            () => respondWithAssetReport(
              --numRetriesRemaining, assetReportToken, client, response),
            1000
          );
          return
        }

        return response.json({
          error: error,
        });
      }

      client.getAssetReportPdf(
        assetReportToken,
        function(error, assetReportGetPdfResponse) {
          if (error != null) {
            return response.json({
              error: error,
            });
          }

          response.json({
            error: null,
            json: assetReportGetResponse.report,
            pdf: assetReportGetPdfResponse.buffer.toString('base64'),
          })
        }
      );
    }
  );
};

app.post('/set_access_token', function(request, response, next) {
  ACCESS_TOKEN = request.body.access_token;
  client.getItem(ACCESS_TOKEN, function(error, itemResponse) {
    response.json({
      item_id: itemResponse.item.item_id,
      error: false,
    });
  });
});
