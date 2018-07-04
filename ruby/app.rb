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

post '/get_access_token' do
  exchange_token_response =
    client.item.public_token.exchange(params['public_token'])
  access_token = exchange_token_response['access_token']
  pretty_print_response(exchange_token_response)

  content_type :json
  exchange_token_response.to_json
end

post '/get_product' do
  product_response = nil
  error_response = nil
  if params['product'] == 'transactions'
    now = Date.today
    thirty_days_ago = (now - 30)
    begin
      product_response =
        client.transactions.get(access_token, thirty_days_ago, now)
    rescue Plaid::PlaidAPIError => e
      error_response = format_error(e)
    end
  elsif params['product'] == 'auth'
    begin
      product_response = client.auth.get(access_token)
    rescue Plaid::PlaidAPIError => e
      error_response = format_error(e)
    end
  elsif params['product'] == 'identity'
    begin
      product_response = client.identity.get(access_token)
    rescue Plaid::PlaidAPIError => e
      error_response = format_error(e)
    end
  elsif params['product'] == 'balance'
    begin
      product_response = client.accounts.balance.get(access_token)
    rescue Plaid::PlaidAPIError => e
      error_response = format_error(e)
    end
  end

  if !error_response.nil?
    pretty_print_response(error_response)
    content_type :json
    error_response.to_json
  else
    pretty_print_response(product_response)
    content_type :json
    { params['product'] => product_response }.to_json
  end
end

post '/item' do
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
