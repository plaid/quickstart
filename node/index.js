// read env vars from .env file
require('dotenv').config();
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const util = require('util');
const express = require('express');
const bodyParser = require('body-parser');
const moment = require('moment');

const APP_PORT = process.env.APP_PORT || 8000;
const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_SECRET = process.env.PLAID_SECRET;
const PLAID_ENV = process.env.PLAID_ENV || 'sandbox';

// PLAID_PRODUCTS is a comma-separated list of products to use when initializing
// Link. Note that this list must contain 'assets' in order for the app to be
// able to create and retrieve asset reports.
const PLAID_PRODUCTS = (process.env.PLAID_PRODUCTS || 'transactions').split(
  ',',
);

// PLAID_COUNTRY_CODES is a comma-separated list of countries for which users
// will be able to select institutions from.
const PLAID_COUNTRY_CODES = (process.env.PLAID_COUNTRY_CODES || 'US').split(
  ',',
);

// Parameters used for the OAuth redirect Link flow.
//
// Set PLAID_REDIRECT_URI to 'http://localhost:3000'
// The OAuth redirect flow requires an endpoint on the developer's website
// that the bank website should redirect to. You will need to configure
// this redirect URI for your client ID through the Plaid developer dashboard
// at https://dashboard.plaid.com/team/api.
const PLAID_REDIRECT_URI = process.env.PLAID_REDIRECT_URI || '';

// Parameter used for OAuth in Android. This should be the package name of your app,
// e.g. com.plaid.linksample
const PLAID_ANDROID_PACKAGE_NAME = process.env.PLAID_ANDROID_PACKAGE_NAME || '';

// We store the access_token in memory - in production, store it in a secure
// persistent data store
let ACCESS_TOKEN = null;
let PUBLIC_TOKEN = null;
let ITEM_ID = null;
// The payment_id is only relevant for the UK Payment Initiation product.
// We store the payment_id in memory - in production, store it in a secure
// persistent data store
let PAYMENT_ID = null;

// Initialize the Plaid client
// Find your API keys in the Dashboard (https://dashboard.plaid.com/account/keys)

const configuration = new Configuration({
  basePath: PlaidEnvironments[PLAID_ENV],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
      'PLAID-SECRET': PLAID_SECRET,
      'Plaid-Version': '2020-09-14',
    },
  },
});

const client = new PlaidApi(configuration);

const app = express();
app.use(
  bodyParser.urlencoded({
    extended: false,
  }),
);
app.use(bodyParser.json());

// Create a link token with configs which we can then use to initialize Plaid Link client-side.
// See https://plaid.com/docs/#create-link-token
app.post('/api/create_link_token', async function (request, response) {
  const configs = {
    user: {
      // This should correspond to a unique id for the current user.
      client_user_id: 'user-id',
    },
    client_name: 'Plaid Quickstart',
    products: PLAID_PRODUCTS,
    country_codes: PLAID_COUNTRY_CODES,
    language: 'en',
  };

  if (PLAID_REDIRECT_URI !== '') {
    configs.redirect_uri = PLAID_REDIRECT_URI;
  }

  if (PLAID_ANDROID_PACKAGE_NAME !== '') {
    configs.android_package_name = PLAID_ANDROID_PACKAGE_NAME;
  }
  try {
    const createTokenResponse = await client.linkTokenCreate(configs);
    response.json(createTokenResponse.data);
  } catch (error) {
    prettyPrintResponse(error);
    return response.json({
      error: error.response.data,
    });
  }
});

// Create a link token with configs which we can then use to initialize Plaid Link client-side.
// See https://plaid.com/docs/#payment-initiation-create-link-token-request
app.post(
  '/api/create_link_token_for_payment',
  async function (request, response, next) {
    try {
      const createRecipientResponse = await client.paymentInitiationRecipientCreate(
        {
          name: 'Harry Potter',
          iban: 'GB33BUKB20201555555555',
          address: {
            street: ['4 Privet Drive'],
            city: 'Little Whinging',
            postal_code: '11111',
            country: 'GB',
          },
        },
      );
      const recipientId = createRecipientResponse.recipient_id;

      const createPaymentResponse = await client.paymentInitiationPaymentCreate(
        {
          recipient_id: recipientId,
          reference: 'payment_ref',
          amount: {
            value: 12.34,
            currency: 'GBP',
          },
        },
      );
      PAYMENT_ID= createPaymentResponse.payment_id;
     
      const configs = {
        user: {
          // This should correspond to a unique id for the current user.
          client_user_id: 'user-id',
        },
        client_name: 'Plaid Quickstart',
        products: PLAID_PRODUCTS,
        country_codes: PLAID_COUNTRY_CODES,
        language: 'en',
        payment_initiation: {
          payment_id: PAYMENT_ID,
        },
      };
      if (PLAID_REDIRECT_URI !== '') {
        configs.redirect_uri = PLAID_REDIRECT_URI;
      }
      const createTokenResponse = await client.linkTokenCreate(configs);
      response.json(createTokenResponse.data);
    } catch (error) {
      prettyPrintResponse(error);
      return response.json({
        error: error.response.data,
      });
    }
  },
);

// Exchange token flow - exchange a Link public_token for
// an API access_token
// https://plaid.com/docs/#exchange-token-flow
app.post('/api/set_access_token', async function (request, response, next) {
  PUBLIC_TOKEN = request.body.public_token;
  try {
    const tokenResponse = await client.itemPublicTokenExchange({
      public_token: PUBLIC_TOKEN,
    });
    ACCESS_TOKEN = tokenResponse.data.access_token;
    ITEM_ID = tokenResponse.data.item_id;
    response.json({
      access_token: ACCESS_TOKEN,
      item_id: ITEM_ID,
      error: null,
    });
  } catch (error) {
    prettyPrintResponse(error);
    return response.json({
      error: error.response.data,
    });
  }
});

// Retrieve ACH or ETF Auth data for an Item's accounts
// https://plaid.com/docs/#auth
app.get('/api/auth', async function (request, response, next) {
  try {
    const authResponse = await client.authGet({ access_token: ACCESS_TOKEN });
    prettyPrintResponse(authResponse);
    response.json(authResponse.data);
  } catch (error) {
    prettyPrintResponse(error);
    return response.json(makeErrorObject(error.response));
  }
});

// Retrieve Transactions for an Item
// https://plaid.com/docs/#transactions
app.get('/api/transactions', async function (request, response, next) {
  // Pull transactions for the Item for the last 30 days
  const startDate = moment().subtract(30, 'days').format('YYYY-MM-DD');
  const endDate = moment().format('YYYY-MM-DD');
  try {
    const transactionsResponse = await client.transactionsGet({
      access_token: ACCESS_TOKEN,
      start_date: startDate,
      end_date: endDate,
      options: {
        count: 250,
        offset: 0,
      },
    });
    prettyPrintResponse(transactionsResponse);
    response.json(transactionsResponse.data);
  } catch (error) {
    prettyPrintResponse(error);
    return response.json(makeErrorObject(error.response));
  }
});

// Retrieve Investment Transactions for an Item
// https://plaid.com/docs/#investments
app.get(
  '/api/investment_transactions',
  async function (request, response, next) {
    const startDate = moment().subtract(30, 'days').format('YYYY-MM-DD');
    const endDate = moment().format('YYYY-MM-DD');
    try {
      const investmentTransactionsResponse = await client.investmentTransactionsGet(
        {
          access_token: ACCESS_TOKEN,
          start_date: startDate,
          end_date: endDate,
        },
      );
      prettyPrintResponse(investmentTransactionsResponse);
      response.json({
        error: null,
        investment_transactions: investmentTransactionsResponse.data,
      });
    } catch (error) {
      prettyPrintResponse(error);
      return response.json(makeErrorObject(error.response));
    }
  },
);

// Retrieve Identity for an Item
// https://plaid.com/docs/#identity
app.get('/api/identity', async function (request, response, next) {
  try {
    const identityResponse = await client.identityGet({
      access_token: ACCESS_TOKEN,
    });
    prettyPrintResponse(identityResponse);
    response.json({ identity: identityResponse.data.accounts });
  } catch (error) {
    prettyPrintResponse(error);
    return response.json(makeErrorObject(error.response));
  }
});

// Retrieve real-time Balances for each of an Item's accounts
// https://plaid.com/docs/#balance
app.get('/api/balance', async function (request, response, next) {
  try {
    const balanceResponse = await client.accountsBalanceGet({
      access_token: ACCESS_TOKEN,
    });
    prettyPrintResponse(balanceResponse);
    response.json(balanceResponse.data);
  } catch (error) {
    prettyPrintResponse(error);
    return response.json(makeErrorObject(error.response));
  }
});

// Retrieve Holdings for an Item
// https://plaid.com/docs/#investments
app.get('/api/holdings', async function (request, response, next) {
  try {
    const holdingsResponse = await client.investmentsHoldingsGet({
      access_token: ACCESS_TOKEN,
    });
    prettyPrintResponse(holdingsResponse);
    response.json({ error: null, holdings: holdingsResponse.data });
  } catch (error) {
    prettyPrintResponse(error);
    return response.json(makeErrorObject(error.response));
  }
});

// Retrieve information about an Item
// https://plaid.com/docs/#retrieve-item
app.get('/api/item', async function (request, response, next) {
  try {
    // Pull the Item - this includes information about available products,
    // billed products, webhook information, and more.
    const itemResponse = await client.itemGet({ access_token: ACCESS_TOKEN });
    // Also pull information about the institution
    const instResponse = await client.institutionsGetById({
      institution_id: itemResponse.data.item.institution_id,
      country_codes: ['US'],
    });
    prettyPrintResponse(itemResponse);
    response.json({
      item: itemResponse.data.item,
      institution: instResponse.data.institution,
    });
  } catch (error) {
    prettyPrintResponse(error);
    return response.json(makeErrorObject(error.response));
  }
});

// Retrieve an Item's accounts
// https://plaid.com/docs/#accounts
app.get('/api/accounts', async function (request, response, next) {
  try {
    const accountsResponse = await client.accountsGet({
      access_token: ACCESS_TOKEN,
    });
    prettyPrintResponse(accountsResponse);
    response.json(accountsResponse.data);
  } catch (error) {
    prettyPrintResponse(error);
    return response.json(makeErrorObject(error.response));
  }
});

// Create and then retrieve an Asset Report for one or more Items. Note that an
// Asset Report can contain up to 100 items, but for simplicity we're only
// including one Item here.
// https://plaid.com/docs/#assets
app.get('/api/assets', async function (request, response, next) {
  // You can specify up to two years of transaction history for an Asset
  // Report.
  const daysRequested = 10;

  // The `options` object allows you to specify a webhook for Asset Report
  // generation, as well as information that you want included in the Asset
  // Report. All fields are optional.
  const options = {
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
  try {
    const assetReportCreateResponse = await client.assetReportCreate({
      access_tokens: [ACCESS_TOKEN],
      days_requested: daysRequested,
      options,
    });
    prettyPrintResponse(assetReportCreateResponse);
    const assetReportToken = assetReportCreateResponse.asset_report_token;
    respondWithAssetReport(20, assetReportToken, client, response);
  } catch {
    prettyPrintResponse(error);
    return response.json(makeErrorObject(error.response));
  }
});

// This functionality is only relevant for the UK Payment Initiation product.
// Retrieve Payment for a specified Payment ID
app.get('/api/payment', function (request, response, next) {
  try{
    const paymentGetResponse = await client.paymentInitiationPaymentGet({payment_id: PAYMENT_ID});
    prettyPrintResponse(paymentGetResponse);
    response.json({ error: null, payment: paymentGetResponse.data });
}catch{
      prettyPrintResponse(error);
      return response.json(makeErrorObject(error.response));
    }
});

const server = app.listen(APP_PORT, function () {
  console.log('plaid-quickstart server listening on port ' + APP_PORT);
});

const prettyPrintResponse = (response) => {
  console.log(util.inspect(response, { colors: true, depth: 4 }));
};

// This is a helper function to poll for the completion of an Asset Report and
// then send it in the response to the client. Alternatively, you can provide a
// webhook in the `options` object in your `/asset_report/create` request to be
// notified when the Asset Report is finished being generated.
const respondWithAssetReport = async (
  numRetriesRemaining,
  assetReportToken,
  client,
  response,
) => {
  if (numRetriesRemaining == 0) {
    return response.json({
      error: 'Timed out when polling for Asset Report',
    });
  }

  const includeInsights = false;
  try{
  const assetReportGetResponse = await client.assetReportGet({
   asset_report_token: assetReportToken,
    include_insights: includeInsights,
  });
  const assetReportGetPdfResponse = await client.assetReportPdfGet({
    asset_report_token: assetReportToken});
    response.json({
      error: null,
      json: assetReportGetResponse.report,
      pdf: assetReportGetPdfResponse.buffer.toString('base64'),
    });
} catch(error) {
        prettyPrintResponse(error);
        if (error.error_code == 'PRODUCT_NOT_READY') {
          setTimeout(
            () =>
              respondWithAssetReport(
                --numRetriesRemaining,
                assetReportToken,
                client,
                response,
              ),
            1000,
          );
          return;
        }
        return response.json({
          error:error.response.data,
        });
      }
};

const makeErrorObject = (error) => {
  return {
    error: { ...error.data, status_code: error.status },
  };
};
