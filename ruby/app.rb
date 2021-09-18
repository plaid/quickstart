# Load env vars from .env file
require 'dotenv'
Dotenv.load

require 'base64'
require 'date'
require 'json'
require 'plaid'
require 'sinatra'

set :port, ENV['APP_PORT'] || 8000

# disable CSRF warning on localhost due to usage of local /api proxy in react app.
# delete this for a production application.
set :protection, :except => [:json_csrf]

configuration = Plaid::Configuration.new
configuration.server_index = Plaid::Configuration::Environment[ENV['PLAID_ENV'] || 'sandbox']
configuration.api_key['PLAID-CLIENT-ID'] = ENV['PLAID_CLIENT_ID']
configuration.api_key['PLAID-SECRET'] = ENV['PLAID_SECRET']
configuration.api_key['Plaid-Version'] = '2020-09-14'

api_client = Plaid::ApiClient.new(
  configuration
)

client = Plaid::PlaidApi.new(api_client)
# We store the access_token in memory - in production, store it in a secure
# persistent data store.
access_token = nil
# The payment_id is only relevant for the UK Payment Initiation product.
# We store the payment_token in memory - in production, store it in a secure
# persistent data store.

payment_id = nil
item_id = nil

# The transfer_id is only relevant for Transfer ACH product.
# We store the transfer_id in memomory - in produciton, store it in a secure
# persistent data store
transfer_id = nil

post '/api/info' do
  content_type :json
  {
    item_id:      item_id,
    access_token: access_token,
    products:     ENV['PLAID_PRODUCTS'].split(','),
  }.to_json
end

# Exchange token flow - exchange a Link public_token for
# an API access_token
# https://plaid.com/docs/#exchange-token-flow
post '/api/set_access_token' do
  item_public_token_exchange_request = Plaid::ItemPublicTokenExchangeRequest.new(
    { public_token: params['public_token'] }
  )
  exchange_token_response =
    client.item_public_token_exchange(
      item_public_token_exchange_request
    )
  access_token = exchange_token_response.access_token
  item_id = exchange_token_response.item_id
  if ENV['PLAID_PRODUCTS'].split(',').include?('transfer')
    transfer_id = authorize_and_create_transfer(access_token, client)
  end
  pretty_print_response(exchange_token_response.to_hash)
  content_type :json
  exchange_token_response.to_hash.to_json
end

# Retrieve Transactions for an Item
# https://plaid.com/docs/#transactions
get '/api/transactions' do
  begin
    start_date = (Date.today - 30)
    end_date = Date.today
    transactions_get_request = Plaid::TransactionsGetRequest.new(
      {
        access_token: access_token,
        start_date: start_date,
        end_date: end_date
      }
    )
    transactions_response =
      client.transactions_get(transactions_get_request)
    pretty_print_response(transactions_response.to_hash)
    content_type :json
    transactions_response.to_hash.to_json
  rescue Plaid::ApiError => e
    error_response = format_error(e)
    pretty_print_response(error_response)
    content_type :json
    error_response.to_json
  end
end

# Retrieve ACH or ETF account numbers for an Item
# https://plaid.com/docs/#auth
get '/api/auth' do
  begin
    auth_get_request = Plaid::AuthGetRequest.new({ access_token: access_token })
    auth_response = client.auth_get(auth_get_request)
    pretty_print_response(auth_response.to_hash)
    content_type :json
    auth_response.to_hash.to_json
  rescue Plaid::ApiError => e
    error_response = format_error(e)
    pretty_print_response(error_response)
    content_type :json
    error_response.to_json
  end
end

# Retrieve Identity data for an Item
# https://plaid.com/docs/#identity
get '/api/identity' do
  begin
    identity_get_request = Plaid::IdentityGetRequest.new({ access_token: access_token })
    identity_response = client.identity_get(identity_get_request)
    pretty_print_response(identity_response.to_hash)
    content_type :json
    { identity: identity_response.to_hash[:accounts] }.to_json
  rescue Plaid::ApiError => e
    error_response = format_error(e)
    pretty_print_response(error_response)
    content_type :json
    error_response.to_json
  end
end

# Retrieve real-time balance data for each of an Item's accounts
# https://plaid.com/docs/#balance
get '/api/balance' do
  begin
    balance_get_request = Plaid::AccountsBalanceGetRequest.new({ access_token: access_token })
    balance_response = client.accounts_balance_get(balance_get_request)
    pretty_print_response(balance_response.to_hash)
    content_type :json
    balance_response.to_hash.to_json
  rescue Plaid::ApiError => e
    error_response = format_error(e)
    pretty_print_response(error_response)
    content_type :json
    error_response.to_json
  end
end

# Retrieve an Item's accounts
# https://plaid.com/docs/#accounts
get '/api/accounts' do
  begin
    accounts_get_request = Plaid::AccountsGetRequest.new({ access_token: access_token })
    account_response = client.accounts_get(accounts_get_request)
    pretty_print_response(account_response.to_hash)
    content_type :json
    account_response.to_hash.to_json
  rescue Plaid::ApiError => e
    error_response = format_error(e)
    pretty_print_response(error_response)
    content_type :json
    error_response.to_json
  end
end

# Retrieve Holdings data for an Item
# https://plaid.com/docs/#investments
get '/api/holdings' do
  begin
    investments_holdings_get_request = Plaid::InvestmentsHoldingsGetRequest.new({ access_token: access_token })
    product_response = client.investments_holdings_get(investments_holdings_get_request)
    pretty_print_response(product_response.to_hash)
    content_type :json
    { holdings: product_response.to_hash }.to_json
  rescue Plaid::ApiError => e
    error_response = format_error(e)
    pretty_print_response(error_response)
    content_type :json
    error_response.to_hash.to_json
  end
end

# Retrieve Investment Transactions for an Item
# https://plaid.com/docs/#investments
get '/api/investment_transactions' do
  begin
    start_date = (Date.today - 30)
    end_date = Date.today
    investments_transactions_get_request = Plaid::InvestmentsTransactionsGetRequest.new(
      {
        access_token: access_token,
        start_date: start_date,
        end_date: end_date
      }
    )
    transactions_response = client.investments_transactions_get(investments_transactions_get_request)
    pretty_print_response(transactions_response.to_hash)
    content_type :json
    { investment_transactions: transactions_response.to_hash }.to_json
  rescue Plaid::ApiError => e
    error_response = format_error(e)
    pretty_print_response(error_response)
    content_type :json
    error_response.to_json
  end
end

# Create and then retrieve an Asset Report for one or more Items. Note that an
# Asset Report can contain up to 100 items, but for simplicity we're only
# including one Item here.
# https://plaid.com/docs/#assets
# rubocop:disable Metrics/BlockLength
get '/api/assets' do
  begin
    options = {
      client_report_id: '123',
      webhook: 'https://www.example.com',
      user: {
        client_user_id: '789',
        first_name: 'Jane',
        middle_name: 'Leah',
        last_name: 'Doe',
        ssn: '123-45-6789',
        phone_number: '(555) 123-4567',
        email: 'jane.doe@example.com'
      }
    }
    asset_report_create_request = Plaid::AssetReportCreateRequest.new(
      {
        access_tokens: [access_token],
        days_requested: 20,
        options: options
      }
    )
    asset_report_create_response =
      client.asset_report_create(asset_report_create_request)
    pretty_print_response(asset_report_create_response.to_hash)
  rescue Plaid::ApiError => e
    error_response = format_error(e)
    pretty_print_response(error_response)
    content_type :json
    error_response.to_json
  end

  asset_report_token = asset_report_create_response.asset_report_token
  asset_report_json = nil
  num_retries_remaining = 20
  while num_retries_remaining.positive?
    begin
      asset_report_get_request = Plaid::AssetReportGetRequest.new({ asset_report_token: asset_report_token })
      asset_report_get_response = client.asset_report_get(asset_report_get_request)
      asset_report_json = asset_report_get_response.report
      break
    rescue Plaid::ApiError => e
      json_response = JSON.parse(e.response_body)
      if json_response['error_code'] == 'PRODUCT_NOT_READY'
        num_retries_remaining -= 1
        sleep(1)
        next
      end
      error_response = format_error(e)
      pretty_print_response(error_response)
      content_type :json
      return error_response.to_json
    end
  end

  if asset_report_json.nil?
    content_type :json
    return {
      error: {
        error_code: 0,
        error_message: 'Timed out when polling for Asset Report'
      }
    }.to_json
  end

  asset_report_pdf_get_request = Plaid::AssetReportPDFGetRequest.new({ asset_report_token: asset_report_token })
  asset_report_pdf = client.asset_report_pdf_get( asset_report_pdf_get_request)

  content_type :json
  { json: asset_report_json.to_hash,
    pdf: Base64.encode64(File.read(asset_report_pdf)) }.to_json
end

# rubocop:enable Metrics/BlockLength

# Retrieve high-level information about an Item
# https://plaid.com/docs/#retrieve-item
get '/api/item' do
  begin
    item_get_request = Plaid::ItemGetRequest.new({ access_token: access_token})
    item_response = client.item_get(item_get_request)
    institutions_get_by_id_request = Plaid::InstitutionsGetByIdRequest.new(
      {
        institution_id: item_response.item.institution_id,
        country_codes: ['US']
      }
    )
    institution_response =
      client.institutions_get_by_id(institutions_get_by_id_request)
    pretty_print_response(item_response.to_hash)
    pretty_print_response(institution_response.to_hash)
    content_type :json
    { item: item_response.item.to_hash,
      institution: institution_response.institution.to_hash }.to_json
  rescue Plaid::ApiError => e
    error_response = format_error(e)
    pretty_print_response(error_response)
    content_type :json
    error_response.to_json
  end
end

# This functionality is only relevant for the ACH Transfer product.
# Retrieve Transfer for a specified Transfer ID

get '/api/transfer' do
  begin
    transfer_get_request = Plaid::TransferGetRequest.new({ transfer_id: transfer_id })
    transfer_get_response = client.transfer_get(transfer_get_request)
    pretty_print_response(transfer_get_response.to_hash)
    content_type :json
    { error: nil, transfer: transfer_get_response.transfer.to_hash}.to_json
  rescue Plaid::ApiError => e
    error_response = format_error(e)
    pretty_print_response(error_response)
    content_type :json
    error_response.to_json
  end
end

# This functionality is only relevant for the UK Payment Initiation product.
# Retrieve Payment for a specified Payment ID
get '/api/payment' do
  begin
    payment_initiation_payment_get_request = Plaid::PaymentInitiationPaymentGetRequest.new({ payment_id: payment_id})
    payment_get_response = client.payment_initiation_payment_get(payment_initiation_payment_get_request)
    pretty_print_response(payment_get_response.to_hash)
    content_type :json
    { payment: payment_get_response.to_hash}.to_json
  rescue Plaid::ApiError => e
    error_response = format_error(e)
    pretty_print_response(error_response)
    content_type :json
    error_response.to_json
  end
end

post '/api/create_link_token' do
  begin
    link_token_create_request = Plaid::LinkTokenCreateRequest.new(
      {
        user: { client_user_id: 'user-id' },
        client_name: 'Plaid Quickstart',
        products: ENV['PLAID_PRODUCTS'].split(','),
        country_codes: ENV['PLAID_COUNTRY_CODES'].split(','),
        language: 'en',
        redirect_uri: nil_if_empty_envvar('PLAID_REDIRECT_URI')
      }
    )
    link_response = client.link_token_create(link_token_create_request)
    pretty_print_response(link_response.to_hash)
    content_type :json
    { link_token: link_response.link_token }.to_json
  rescue Plaid::ApiError => e
    error_response = format_error(e)
    pretty_print_response(error_response)
    content_type :json
    error_response.to_json
  end
end

def nil_if_empty_envvar(field)
  val = ENV[field]
  puts "val #{val}"
  if !val.nil? && val.length > 0
    return val
  else
    return nil
  end
end

# This functionality is only relevant for the UK Payment Initiation product.
# Sets the payment token in memory on the server side. We generate a new
# payment token so that the developer is not required to supply one.
# This makes the quickstart easier to use.
post '/api/create_link_token_for_payment' do
  begin
    payment_initiation_recipient_create_request = Plaid::PaymentInitiationRecipientCreateRequest.new(
      {
        name: 'Bruce Wayne',
        iban: 'GB33BUKB20201555555555',
        address: {
          street: ['686 Bat Cave Lane'],
          city: 'Gotham',
          postal_code: '99999',
          country: 'GB',
        },
        bacs: {
          account: '26207729',
          sort_code: '560029',
        }
      }
    )
    create_recipient_response = client.payment_initiation_recipient_create(
      payment_initiation_recipient_create_request
    )
    recipient_id = create_recipient_response.recipient_id

    payment_initiation_recipient_get_request = Plaid::PaymentInitiationRecipientGetRequest.new(
      {
        recipient_id: recipient_id
      }
    )
    get_recipient_response = client.payment_initiation_recipient_get(
      payment_initiation_recipient_get_request
    )

    payment_initiation_payment_create_request = Plaid::PaymentInitiationPaymentCreateRequest.new(
      {
        recipient_id: recipient_id,
        reference: 'testpayment',
        amount: {
          value: 100.00,
          currency: 'GBP'
        }
      }
    )
    create_payment_response = client.payment_initiation_payment_create(
      payment_initiation_payment_create_request
    )
    payment_id = create_payment_response.payment_id

    link_token_create_request = Plaid::LinkTokenCreateRequest.new(
      {
        user: { client_user_id: 'user-id' },
        client_name: 'Plaid Quickstart',
        products: ENV['PLAID_PRODUCTS'].split(','),
        country_codes: ENV['PLAID_COUNTRY_CODES'].split(','),
        language: 'en',
        payment_initiation: { payment_id: payment_id },
        redirect_uri: nil_if_empty_envvar('PLAID_REDIRECT_URI')
      }
    )
    link_response = client.link_token_create(link_token_create_request)
    pretty_print_response(link_response.to_hash)
    content_type :json
    { link_token: link_response.link_token }.to_hash.to_json
    
  rescue Plaid::ApiError => e
    error_response = format_error(e)
    pretty_print_response(error_response)
    content_type :json
    error_response.to_json
  end
end

def format_error(err)
  body = JSON.parse(err.response_body)
  {
    error: {
      status_code: err.code,
      error_code: body['error_code'],
      error_message: body['error_message'],
      error_type: body['error_type']
    }
  }
end

def pretty_print_response(response)
  puts JSON.pretty_generate(response)
end

# This is a helper function to authorize and create a Transfer after successful
# exchange of a public_token for an access_token. The TRANSFER_ID is then used
# to obtain the data about that particular Transfer.
def authorize_and_create_transfer(access_token, client)
  begin
    # We call /accounts/get to obtain first account_id - in production,
    # account_id's should be persisted in a data store and retrieved
    # from there.
    accounts_get_request = Plaid::AccountsGetRequest.new({ access_token: access_token })
    accounts_get_response = client.accounts_get(accounts_get_request)
    account_id = accounts_get_response.accounts[0].account_id

    transfer_authorization_create_request = Plaid::TransferAuthorizationCreateRequest.new({
      access_token: access_token,
      account_id: account_id,
      type: 'credit',
      network: 'ach',
      amount: '12.34',
      ach_class: 'ppd',
      user: {
        legal_name: 'FirstName LastName',
        email_address: 'foobar@email.com',
        address: {
          street: '123 Main St.',
          city: 'San Francisco',
          region: 'CA',
          postal_code: '94053',
          country: 'US'
        }
      },
    })
    transfer_authorization_create_response = client.transfer_authorization_create(transfer_authorization_create_request)
    pretty_print_response(transfer_authorization_create_response.to_hash)
    authorization_id = transfer_authorization_create_response.authorization.id

    transfer_create_request = Plaid::TransferCreateRequest.new({
      idempotency_key: "1223abc456xyz7890001",
      access_token: access_token,
      account_id: account_id,
      authorization_id: authorization_id,
      type: 'credit',
      network: 'ach',
      amount: '12.34',
      description: 'Payment',
      ach_class: 'ppd',
      user: {
        legal_name: 'FirstName LastName',
        email_address: 'foobar@email.com',
        address: {
          street: '123 Main St.',
          city: 'San Francisco',
          region: 'CA',
          postal_code: '94053',
          country: 'US'
        }
      },
    })
    transfer_create_response = client.transfer_create(transfer_create_request)
    pretty_print_response(transfer_create_response.to_hash)
    transfer_id = transfer_create_response.transfer.id
    return transfer_id
  rescue Plaid::ApiError => e
    error_response = format_error(e)
    pretty_print_response(error_response)
  end


end