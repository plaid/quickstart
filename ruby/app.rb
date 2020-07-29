require 'base64'
require 'date'
require 'json'
require 'plaid'
require 'sinatra'

set :port, ENV['APP_PORT'] || 8000

client = Plaid::Client.new(env: ENV['PLAID_ENV'] || 'sandbox',
                           client_id: ENV['PLAID_CLIENT_ID'],
                           secret: ENV['PLAID_SECRET'])

# We store the access_token in memory - in production, store it in a secure
# persistent data store.
access_token = nil
# The payment_id is only relevant for the UK Payment Initiation product.
# We store the payment_token in memory - in production, store it in a secure
# persistent data store.

payment_id = nil
item_id = nil

get '/' do
  File.read('../html/index.html')
end

# This is an endpoint defined for the OAuth flow to redirect to.
get '/oauth-response.html' do
  erb File.read('../html/oauth-response.html')
end

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
  exchange_token_response =
    client.item.public_token.exchange(params['public_token'])
  access_token = exchange_token_response['access_token']
  item_id = exchange_token_response['item_id']
  pretty_print_response(exchange_token_response)

  content_type :json
  exchange_token_response.to_json
end

# Retrieve Transactions for an Item
# https://plaid.com/docs/#transactions
get '/api/transactions' do
  now = Date.today
  thirty_days_ago = (now - 30)
  begin
    product_response =
      client.transactions.get(access_token, thirty_days_ago, now)
    pretty_print_response(product_response)
    content_type :json
    product_response.to_json
  rescue Plaid::PlaidAPIError => e
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
    product_response = client.auth.get(access_token)
    pretty_print_response(product_response)
    content_type :json
    product_response.to_json
  rescue Plaid::PlaidAPIError => e
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
    product_response = client.identity.get(access_token)
    pretty_print_response(product_response)
    content_type :json
    { identity: product_response.accounts}.to_json
  rescue Plaid::PlaidAPIError => e
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
    product_response = client.accounts.balance.get(access_token)
    pretty_print_response(product_response)
    content_type :json
    product_response.to_json
  rescue Plaid::PlaidAPIError => e
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
    product_response = client.accounts.get(access_token)
    pretty_print_response(product_response)
    content_type :json
    product_response.to_json
  rescue Plaid::PlaidAPIError => e
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
    product_response = client.investments.holdings.get(access_token)
    pretty_print_response(product_response)
    content_type :json
    { holdings: product_response }.to_json
  rescue Plaid::PlaidAPIError => e
    error_response = format_error(e)
    pretty_print_response(error_response)
    content_type :json
    error_response.to_json
  end
end

# Retrieve Investment Transactions for an Item
# https://plaid.com/docs/#investments
get '/api/investment_transactions' do
  now = Date.today
  thirty_days_ago = (now - 30)
  begin
    product_response = client.investments.transactions.get(access_token, thirty_days_ago, now)
    pretty_print_response(product_response)
    content_type :json
    { investment_transactions: product_response }.to_json
  rescue Plaid::PlaidAPIError => e
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
    asset_report_create_response =
      client.asset_report.create([access_token], 10, {})
    pretty_print_response(asset_report_create_response)
  rescue Plaid::PlaidAPIError => e
    error_response = format_error(e)
    pretty_print_response(error_response)
    content_type :json
    error_response.to_json
  end

  asset_report_token = asset_report_create_response['asset_report_token']

  asset_report_json = nil
  num_retries_remaining = 20
  while num_retries_remaining > 0
    begin
      asset_report_get_response = client.asset_report.get(asset_report_token)
      asset_report_json = asset_report_get_response['report']
      break
    rescue Plaid::PlaidAPIError => e
      if e.error_code == 'PRODUCT_NOT_READY'
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

  asset_report_pdf = client.asset_report.get_pdf(asset_report_token)

  content_type :json
  {
    json: asset_report_json,
    pdf: Base64.encode64(asset_report_pdf)
  }.to_json
end
# rubocop:enable Metrics/BlockLength

# Retrieve high-level information about an Item
# https://plaid.com/docs/#retrieve-item
get '/api/item' do
  item_response = client.item.get(access_token)
  institution_response =
    client.institutions.get_by_id(item_response['item']['institution_id'])
  content_type :json
  { item: item_response['item'],
    institution: institution_response['institution'] }.to_json
end

# This functionality is only relevant for the UK Payment Initiation product.
# Retrieve Payment for a specified Payment ID
get '/api/payment' do
  begin
    payment_get_response = client.payment_initiation.get_payment(payment_id)
    content_type :json
    { payment: payment_get_response}.to_json
  rescue Plaid::PlaidAPIError => e
    error_response = format_error(e)
    pretty_print_response(error_response)
    content_type :json
    error_response.to_json
  end
end

post '/api/create_link_token' do
  begin
    response = client.link_token.create(
      user: {
        # This should correspond to a unique id for the current user.
        client_user_id: "user-id",
      },
      client_name: "Plaid Quickstart",
      products: ENV['PLAID_PRODUCTS'].split(','),
      country_codes: ENV['PLAID_COUNTRY_CODES'].split(','),
      language: "en",
      redirect_uri: nil_if_empty_envvar('PLAID_REDIRECT_URI'),
    )

    content_type :json
    { link_token: response.link_token }.to_json
  rescue Plaid::PlaidAPIError => e
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
    create_recipient_response = client.payment_initiation.create_recipient(
      'Harry Potter',
      'GB33BUKB20201555555555',
      {
        street:      ['4 Privet Drive'],
        city:        'Little Whinging',
        postal_code: '11111',
        country:     'GB'
      },
      account: '555555',
    )
    recipient_id = create_recipient_response.recipient_id

    create_payment_response = client.payment_initiation.create_payment(
      recipient_id,
      'payment_ref',
      currency: 'GBP',
      value:    12.34
    )
    payment_id = create_payment_response.payment_id
    response = client.link_token.create(
      user: {
        # This should correspond to a unique id for the current user.
        client_user_id: "user-id",
      },
      client_name: "Plaid Quickstart",
      products: ENV['PLAID_PRODUCTS'].split(','),
      country_codes: ENV['PLAID_COUNTRY_CODES'].split(','),
      language: "en",
      redirect_uri: nil_if_empty_envvar('PLAID_REDIRECT_URI'),
      payment_initiation: {
        payment_id: payment_id,
      },
    )

    content_type :json
    { link_token: response.link_token }.to_json
  rescue Plaid::PlaidAPIError => e
    error_response = format_error(e)
    pretty_print_response(error_response)
    content_type :json
    error_response.to_json
  end
end

def format_error(err)
  {
    error: {
      error_code: err.error_code,
      error_message: err.error_message,
      error_type: err.error_type
    }
  }
end

def pretty_print_response(response)
  puts JSON.pretty_generate(response)
end
