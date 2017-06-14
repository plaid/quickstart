require 'date'
require 'sinatra'
require 'plaid'

set :public_folder, File.dirname(__FILE__) + '/public'

client = Plaid::Client.new(env: :sandbox,
                           client_id: ENV['PLAID_CLIENT_ID'],
                           secret: ENV['PLAID_SECRET'],
                           public_key: ENV['PLAID_PUBLIC_KEY'])

access_token = nil

get '/' do
  erb :index
end

post '/get_access_token' do
  exchange_token_response = client.item.public_token.exchange(params['public_token'])
  access_token = exchange_token_response['access_token']
  item_id = exchange_token_response['item_id']
  puts "access token: #{access_token}"
  puts "item id: #{item_id}"
  exchange_token_response.to_json
end

get '/accounts' do
  auth_response = client.auth.get(access_token)
  content_type :json
  auth_response.to_json
end

get '/item' do
  item_response = client.item.get(access_token)
  institution_response = client.institutions.get_by_id(item_response['item']['institution_id'])
  content_type :json
  { item: item_response['item'], institution: institution_response['institution'] }.to_json
end

get '/transactions' do
  now = Date.today
  thirty_days_ago = (now - 30)
  begin
    transactions_response = client.transactions.get(access_token, thirty_days_ago, now)
  rescue Plaid::ItemError => e
    transactions_response = { error: {error_code: e.error_code, error_message: e.error_message}}
  end
  content_type :json
  transactions_response.to_json
end

get '/create_public_token' do
  public_token_response = client.item.public_token.exchange(access_token)
  content_type :json
  public_token_response.to_json
end
