# Load env vars from .env file
require 'dotenv'
Dotenv.load

require 'base64'
require 'date'
require 'json'
require 'plaid'
require 'sinatra'
require 'pp'

set :port, ENV['APP_PORT'] || 8000

# disable CSRF warning on localhost due to usage of local /api proxy in react app.
# delete this for a production application.
set :protection, :except => [:json_csrf]

configuration = Plaid::Configuration.new
configuration.server_index = Plaid::Configuration::Environment[ENV['PLAID_ENV'] || 'sandbox']
configuration.api_key["PLAID-CLIENT-ID"] = ENV['PLAID_CLIENT_ID']
configuration.api_key["PLAID-SECRET"] = ENV['PLAID_SECRET']
configuration.api_key["Plaid-Version"] = "2020-09-14"

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
  item_public_token_exchange_request = Plaid::ItemPublicTokenExchangeRequest.new({:public_token=>params["public_token"]})
  exchange_token_response =
  client.item_public_token_exchange(
    item_public_token_exchange_request
  )
  access_token = exchange_token_response.access_token
  item_id = exchange_token_response.item_id
  pretty_print_response(exchange_token_response)
  content_type :json
  exchange_token_response.to_hash.to_json
end

# Retrieve Transactions for an Item
# https://plaid.com/docs/#transactions
get '/api/transactions' do
  START_DATE = (Date.today - 365)
  END_DATE = Date.today
  begin
    transactions_get_request = Plaid::TransactionsGetRequest.new
    transactions_get_request.access_token = access_token
    transactions_get_request.start_date = START_DATE
    transactions_get_request.end_date = END_DATE
    transactions_response =
      client.transactions_get(transactions_get_request)
    pretty_print_response(transactions_response)
    content_type :json
    transactions_response.to_hash.to_json
  rescue Plaid::Error => e
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
    auth_get_request = Plaid::AuthGetRequest.new
    auth_get_request.access_token = access_token
    auth_response = client.auth_get(auth_get_request)
    pretty_print_response(auth_response)
    content_type :json
    auth_response.to_hash.to_json
  rescue Plaid::Error => e
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
    identity_get_request = Plaid::IdentityGetRequest.new
    identity_get_request.access_token = access_token
    identity_response = client.identity_get(identity_get_request)
    pretty_print_response(identity_response)
    content_type :json
    { identity: identity_response.to_hash['accounts']}.to_json
  rescue Plaid::Error => e
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
    balance_get_request = Plaid::AccountsBalanceGetRequest.new
    balance_get_request.access_token = access_token
    balance_response = client.accounts_balance_get(balance_get_request)
    pretty_print_response(balance_response)
    content_type :json
    balance_response.to_hash.to_json
  rescue Plaid::Error => e
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
    accounts_get_request = Plaid::AccountsGetRequest.new
    accounts_get_request.access_token = access_token
    account_response = client.accounts_get(accounts_get_request)
    pretty_print_response(account_response)
    content_type :json
    account_response.to_hash.to_json
  rescue Plaid::Error => e
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
    investments_holdings_get_request = Plaid::InvestmentsHoldingsGetRequest.new
    investments_holdings_get_request.access_token = access_token

    product_response = client.investments_holdings_get(investments_holdings_get_request)
    
    pretty_print_response(product_response)
    content_type :json
    { holdings: product_response.to_hash}.to_json
  rescue Plaid::Error => e
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
  rescue Plaid::Error => e
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
      client_report_id: "123",
      webhook: "https://www.example.com",
      user: {
        client_user_id: "789",
        first_name: "Jane",
        middle_name: "Leah",
        last_name: "Doe",
        ssn: "123-45-6789",
        phone_number: "(555) 123-4567",
        email: "jane.doe@example.com",
      },
    }
    asset_report_create_request = Plaid::AssetReportCreateRequest.new
    asset_report_create_request.access_tokens = [access_token]
    asset_report_create_request.days_requested = 20
    asset_report_create_request.options = options

    asset_report_create_response =
      client.asset_report_create(asset_report_create_request)
    pretty_print_response(asset_report_create_response)
  rescue Plaid::Error => e
    error_response = format_error(e)
    pretty_print_response(error_response)
    content_type :json
    error_response.to_json
  end

  asset_report_token = asset_report_create_response.asset_report_token

  asset_report_json = nil
  asset_report_pdf = nil
  # num_retries_remaining = 20
  # while num_retries_remaining > 0
  #   begin
  #     asset_report_get_request = Plaid::AssetReportGetRequest.new
  #     asset_report_get_request.asset_report_token = asset_report_token
  #     asset_report_get_response = client.asset_report_get(asset_report_get_request)
  #     asset_report_json = asset_report_get_response['report']
  #     break
  #   rescue Plaid::Error => e
  #     if e.error_code == 'PRODUCT_NOT_READY'
  #       puts num_retries_remaining
  #       num_retries_remaining -= 1
  #       sleep(1)
  #       next
  #     end
  #     error_response = format_error(e)
  #     puts "TRY RIGHT HERE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
  #     puts num_retries_remaining
  #     pretty_print_response(error_response)
  #     content_type :json
  #     return error_response.to_json
  #   end
  # end
  begin
    
    50.times do
      begin
        asset_report_get_request = Plaid::AssetReportGetRequest.new
        asset_report_get_request.asset_report_token = asset_report_token
        asset_report_get_response = client.asset_report_get(asset_report_get_request)
        asset_report_json = asset_report_get_response.report
        asset_report_pdf_get_request = Plaid::AssetReportPDFGetRequest.new
        asset_report_pdf_get_request.asset_report_token = asset_report_token
        asset_report_pdf = client.asset_report_pdf_get( asset_report_pdf_get_request)
        puts "FIRST RIGHT HERE_____________________________________________________________________"
        puts asset_report_pdf
        break
      rescue Plaid::ApiError => e
        json_response = JSON.parse(e.response_body)
        raise e if json_response["error_code"] != "PRODUCT_NOT_READY"
        sleep 1
      end
    end
    
  
    # asset_report_pdf_get_request = Plaid::AssetReportPDFGetRequest.new
    # asset_report_pdf_get_request.asset_report_token = asset_report_token
    # asset_report_pdf = client.asset_report_pdf_get(asset_report_token)
 
   


  rescue Plaid::Error => e
    error_response = format_error(e)
    pretty_print_response(error_response)
    content_type :json
    error_response.to_json
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
  puts "I AM RIGHT HERE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
  puts Base64.encode64(asset_report_pdf.to_s)
  content_type :json
  {
    json: asset_report_json.to_hash,
    pdf: Base64.encode64(asset_report_pdf.to_s)
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
    payment_initiation_payment_get_request = Plaid::PaymentInitiationPaymentGetRequest.new
    payment_initiation_payment_get_request.payment_id = payment_id
    payment_get_response = client.payment_initiation_payment_get(payment_initiation_payment_get_request)
    content_type :json
    { payment: payment_get_response.to_hash}.to_json
  rescue Plaid::Error => e
    error_response = format_error(e)
    pretty_print_response(error_response)
    content_type :json
    error_response.to_json
  end
end

post '/api/create_link_token' do
  begin
    link_token_create_request = Plaid::LinkTokenCreateRequest.new({
      :user => { :client_user_id => "user-id" },
      :client_name => "Plaid Quickstart",
      :products => ENV['PLAID_PRODUCTS'].split(','),
      :country_codes => ENV['PLAID_COUNTRY_CODES'].split(','),
      :language => "en",
      :redirect_uri => nil_if_empty_envvar('PLAID_REDIRECT_URI')
    })
    response = client.link_token_create(link_token_create_request)

    content_type :json
    { link_token: response.link_token }.to_json
  rescue Plaid::Error => e
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
    payment_initiation_recipient_create_request = Plaid::PaymentInitiationRecipientCreateRequest.new
    payment_initiation_recipient_create_request.name = "Bruce Wayne"
    payment_initiation_recipient_create_request.iban = "GB33BUKB20201555555555"
    payment_initiation_recipient_create_request.address = {
      street: ["686 Bat Cave Lane"],
      city: "Gotham",
      postal_code: "99999",
      country: "GB",
    }
    payment_initiation_recipient_create_request.bacs = {
      account: "26207729",
      sort_code: "560029",
    }

    create_recipient_response = client.payment_initiation_recipient_create(
     payment_initiation_recipient_create_request
    )
    recipient_id = create_recipient_response.recipient_id

    payment_initiation_recipient_get_request = Plaid::PaymentInitiationRecipientGetRequest.new
    payment_initiation_recipient_get_request.recipient_id = recipient_id

    get_recipient_response = client.payment_initiation_recipient_get(
      payment_initiation_recipient_get_request
    )

    payment_initiation_payment_create_request = Plaid::PaymentInitiationPaymentCreateRequest.new
    payment_initiation_payment_create_request.recipient_id = recipient_id
    payment_initiation_payment_create_request.reference = "testpayment"
    payment_initiation_payment_create_request.amount = {
      value: 100.00,
      currency: "GBP",
    }
    create_payment_response = client.payment_initiation_payment_create(
      payment_initiation_payment_create_request
    )

    payment_id = create_payment_response.payment_id


    link_token_create_request = Plaid::LinkTokenCreateRequest.new({
      :user => { :client_user_id => "user-id" },
      :client_name => "Plaid Quickstart",
      :products => ENV['PLAID_PRODUCTS'].split(','),
      :country_codes => ENV['PLAID_COUNTRY_CODES'].split(','),
      :language => "en",
      :payment_initiation=>{:payment_id=>payment_id},
      :redirect_uri => nil_if_empty_envvar('PLAID_REDIRECT_URI')
    })
    response = client.link_token_create(link_token_create_request)

    content_type :json
    { link_token: response.link_token }.to_hash.to_json
    
  rescue Plaid::Error => e
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


def poll_for_asset_report(asset_report_token)
  response = nil
  50.times do
    begin
      asset_report_get_request = Plaid::AssetReportGetRequest.new
      asset_report_get_request.asset_report_token = asset_report_token

      response = @client.asset_report_get(asset_report_get_request)
      break
    rescue Plaid::ApiError => e
      json_response = JSON.parse(e.response_body)
      raise e if json_response["error_code"] != "PRODUCT_NOT_READY"
      sleep 1
    end
  end
  assert response, "Timed out while waiting for asset report generation"
  response
end