require 'date'
require 'json'
require 'plaid'
require 'sinatra'

set :public_folder, File.dirname(__FILE__) + '/static'
# set :port, ENV['PLAID_ENV'] || 4567

client = Plaid::Client.new(env: ENV['PLAID_ENV'],
                           client_id: ENV['PLAID_CLIENT_ID'],
                           secret: ENV['PLAID_SECRET'],
                           public_key: ENV['PLAID_PUBLIC_KEY'])

access_token = nil

get '/' do
  erb :index
end

# Exchange token flow - exchange a Link public_token for
# an API access_token
# https://plaid.com/docs/#exchange-token-flow
post '/get_access_token' do
  exchange_token_response =
    client.item.public_token.exchange(params['public_token'])
  access_token = exchange_token_response['access_token']
  pretty_print_response(exchange_token_response)

  content_type :json
  exchange_token_response.to_json
end

# Retrieve Transactions for an Item
# https://plaid.com/docs/#transactions
get '/transactions' do
  now = Date.today
  thirty_days_ago = (now - 30)
  begin
    product_response =
      client.transactions.get(access_token, thirty_days_ago, now)
    pretty_print_response(product_response)
    content_type :json
    { transactions: product_response }.to_json
  rescue Plaid::PlaidAPIError => e
    error_response = format_error(e)
    pretty_print_response(error_response)
    content_type :json
    error_response.to_json
  end
end

# Retrieve ACH or ETF account numbers for an Item
# https://plaid.com/docs/#auth
get '/auth' do
  begin
    product_response = client.auth.get(access_token)
    pretty_print_response(product_response)
    content_type :json
    { auth: product_response }.to_json
  rescue Plaid::PlaidAPIError => e
    error_response = format_error(e)
    pretty_print_response(error_response)
    content_type :json
    error_response.to_json
  end
end

# Retrieve Identity data for an Item
# https://plaid.com/docs/#identity
get '/identity' do
  begin
    product_response = client.identity.get(access_token)
    pretty_print_response(product_response)
    content_type :json
    { identity: product_response }.to_json
  rescue Plaid::PlaidAPIError => e
    error_response = format_error(e)
    pretty_print_response(error_response)
    content_type :json
    error_response.to_json
  end
end

# Retrieve real-time balance data for each of an Item's accounts
# https://plaid.com/docs/#balance
get '/balance' do
  begin
    product_response = client.accounts.balance.get(access_token)
    pretty_print_response(product_response)
    content_type :json
    { balance: product_response }.to_json
  rescue Plaid::PlaidAPIError => e
    error_response = format_error(e)
    pretty_print_response(error_response)
    content_type :json
    error_response.to_json
  end
end

# Retrieve an Item's accounts
# https://plaid.com/docs/#accounts
get '/accounts' do
  begin
    product_response = client.accounts.get(access_token)
    pretty_print_response(product_response)
    content_type :json
    { accounts: product_response }.to_json
  rescue Plaid::PlaidAPIError => e
    error_response = format_error(e)
    pretty_print_response(error_response)
    content_type :json
    error_response.to_json
  end
end

# Retrieve high-level information about an Item
# https://plaid.com/docs/#retrieve-item
get '/item' do
  item_response = client.item.get(access_token)
  institution_response =
    client.institutions.get_by_id(item_response['item']['institution_id'])
  content_type :json
  { item: item_response['item'],
    institution: institution_response['institution'] }.to_json
end

post '/set_access_token' do
  access_token = params['access_token']
  item = client.item.get(access_token)
  content_type :json
  { error: false, item_id: item['item']['item_id'] }.to_json
end

def format_error(err)
  { error: { error_code: err.error_code, error_message: err.error_message } }
end

def pretty_print_response(response)
  puts JSON.pretty_generate(response)
end
