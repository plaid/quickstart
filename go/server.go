package main

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"sort"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/joho/godotenv"

	plaid "github.com/plaid/plaid-go/v49"
	plaidclient "github.com/plaid/plaid-go/v49/client"
	"github.com/plaid/plaid-go/v49/core"
	"github.com/plaid/plaid-go/v49/option"
	"github.com/plaid/plaid-go/v49/transfer"
)

var (
	PLAID_CLIENT_ID     = ""
	PLAID_SECRET        = ""
	PLAID_ENV           = ""
	PLAID_PRODUCTS      = ""
	PLAID_COUNTRY_CODES = ""
	PLAID_REDIRECT_URI  = ""
	SIGNAL_RULESET_KEY  = ""
	APP_PORT            = ""
	client              *plaidclient.Client
)

var environments = map[string]string{
	"sandbox":    plaid.Environments.Sandbox,
	"production": plaid.Environments.Production,
}

// plaidAPIVersion is the Plaid API version this sample is written against.
const plaidAPIVersion = "2020-09-14"

func init() {
	// load env vars from .env file
	err := godotenv.Load()
	if err != nil {
		fmt.Printf("Error when loading environment variables from .env file: %v\n", err)
	}

	// set constants from env
	PLAID_CLIENT_ID = os.Getenv("PLAID_CLIENT_ID")
	PLAID_SECRET = os.Getenv("PLAID_SECRET")

	if PLAID_CLIENT_ID == "" || PLAID_SECRET == "" {
		log.Fatal("Error: PLAID_SECRET or PLAID_CLIENT_ID is not set. Did you copy .env.example to .env and fill it out?")
	}

	PLAID_ENV = os.Getenv("PLAID_ENV")
	PLAID_PRODUCTS = os.Getenv("PLAID_PRODUCTS")
	PLAID_COUNTRY_CODES = os.Getenv("PLAID_COUNTRY_CODES")
	PLAID_REDIRECT_URI = os.Getenv("PLAID_REDIRECT_URI")
	SIGNAL_RULESET_KEY = os.Getenv("SIGNAL_RULESET_KEY")
	APP_PORT = os.Getenv("APP_PORT")

	// set defaults
	if PLAID_PRODUCTS == "" {
		PLAID_PRODUCTS = "transactions"
	}
	if PLAID_COUNTRY_CODES == "" {
		PLAID_COUNTRY_CODES = "US"
	}
	if PLAID_ENV == "" {
		PLAID_ENV = "sandbox"
	}
	if APP_PORT == "" {
		APP_PORT = "8000"
	}

	baseURL := environments[PLAID_ENV]
	// An empty base URL would send requests to production, so fail fast.
	if baseURL == "" {
		log.Fatalf("Error: unknown PLAID_ENV %q", PLAID_ENV)
	}

	client = newPlaidClient(baseURL)
}

func newPlaidClient(baseURL string) *plaidclient.Client {
	return plaidclient.NewClient(
		option.WithClientID(plaid.String(PLAID_CLIENT_ID)),
		option.WithSecret(PLAID_SECRET),
		option.WithVersion(plaid.String(plaidAPIVersion)),
		option.WithBaseURL(baseURL),
	)
}

func main() {
	r := gin.Default()

	r.POST("/api/info", info)

	// For OAuth flows, the process looks as follows.
	// 1. Create a link token with the redirectURI (as white listed at https://dashboard.plaid.com/team/api).
	// 2. Once the flow succeeds, Plaid Link will redirect to redirectURI with
	// additional parameters (as required by OAuth standards and Plaid).
	// 3. Re-initialize with the link token (from step 1) and the full received redirect URI
	// from step 2.

	r.POST("/api/link_exit_error", linkExitError)
	r.POST("/api/set_access_token", getAccessToken)
	r.POST("/api/create_link_token_for_payment", createLinkTokenForPayment)
	r.GET("/api/auth", auth)
	r.GET("/api/accounts", accounts)
	r.GET("/api/balance", balance)
	r.GET("/api/item", item)
	r.POST("/api/item", item)
	r.GET("/api/identity", identity)
	r.GET("/api/transactions", transactions)
	r.POST("/api/transactions", transactions)
	r.GET("/api/payment", payment)
	r.GET("/api/create_public_token", createPublicToken)
	r.POST("/api/create_link_token", createLinkToken)
	r.POST("/api/create_user_token", createUserToken)
	r.GET("/api/investments_transactions", investmentTransactions)
	r.GET("/api/holdings", holdings)
	r.GET("/api/assets", assets)
	r.GET("/api/transfer_authorize", transferAuthorize)
	r.GET("/api/transfer_create", transferCreate)
	r.GET("/api/signal_evaluate", signalEvaluate)
	r.GET("/api/statements", statements)
	r.GET("/api/cra/get_base_report", getCraBaseReportHandler)
	r.GET("/api/cra/get_income_insights", getCraIncomeInsightsHandler)
	r.GET("/api/cra/get_partner_insights", getCraPartnerInsightsHandler)

	err := r.Run(":" + APP_PORT)
	if err != nil {
		panic("unable to start server")
	}
}

// We store the access_token, user_token, and user_id in memory - in production, store it in a secure
// persistent data store.
var accessToken string
var userToken string
var userID string
var itemID string

var paymentID string

// The authorizationID is only relevant for the Transfer ACH product.
// We store the authorizationID in memory - in production, store it in a secure
// persistent data store
var authorizationID string
var accountID string

func linkExitError(c *gin.Context) {
	var body map[string]interface{}
	if err := c.BindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid JSON"})
		return
	}
	jsonBytes, _ := json.MarshalIndent(body, "", "  ")
	fmt.Println("[Link Exit Error (frontend)]")
	fmt.Println(string(jsonBytes))
	c.JSON(http.StatusOK, gin.H{"status": "logged"})
}

// plaidErrorBody is satisfied by every typed error in package plaid
// (BadRequestError, ServerError, ...).
type plaidErrorBody interface {
	GetBody() *plaid.PlaidError
}

func toPlaidError(err error) (*plaid.PlaidError, int, bool) {
	var typed plaidErrorBody
	var apiErr *core.APIError
	status := 0
	if errors.As(err, &apiErr) {
		status = apiErr.StatusCode
	}
	if errors.As(err, &typed) && typed.GetBody() != nil {
		return typed.GetBody(), status, true
	}
	// Non-JSON error bodies (e.g. a proxy's HTML 502) come back as a bare
	// *core.APIError, not as one of the typed errors.
	return nil, status, false
}

func renderError(c *gin.Context, originalErr error) {
	if plaidError, status, ok := toPlaidError(originalErr); ok {
		errorJSON, _ := json.MarshalIndent(plaidError, "", "  ")
		fmt.Println(string(errorJSON))
		statusCode := status
		if plaidError.Status != nil {
			statusCode = *plaidError.Status
		}
		if statusCode == 0 {
			statusCode = http.StatusInternalServerError
		}
		c.JSON(statusCode, gin.H{"error": plaidError})
		return
	}

	fmt.Println(originalErr.Error())
	c.JSON(http.StatusInternalServerError, gin.H{"error": originalErr.Error()})
}

func getAccessToken(c *gin.Context) {
	publicToken := c.PostForm("public_token")
	ctx := context.Background()

	// exchange the public_token for an access_token
	exchangePublicTokenResp, err := client.Item.ExchangePublicToken(ctx, &plaid.ItemPublicTokenExchangeRequest{
		PublicToken: publicToken,
	})
	if err != nil {
		renderError(c, err)
		return
	}

	accessToken = exchangePublicTokenResp.AccessToken
	itemID = exchangePublicTokenResp.ItemID

	fmt.Println("public token: " + publicToken)
	fmt.Println("access token: " + accessToken)
	fmt.Println("item ID: " + itemID)

	c.JSON(http.StatusOK, gin.H{
		"access_token": accessToken,
		"item_id":      itemID,
	})
}

// This functionality is only relevant for the UK/EU Payment Initiation product.
// Creates a link token configured for payment initiation. The payment
// information will be associated with the link token, and will not have to be
// passed in again when we initialize Plaid Link.
// See:
// - https://plaid.com/docs/payment-initiation/
// - https://plaid.com/docs/#payment-initiation-create-link-token-request
func createLinkTokenForPayment(c *gin.Context) {
	ctx := context.Background()

	// Create payment recipient
	paymentRecipientCreateResp, err := client.PaymentInitiation.CreateRecipient(ctx, &plaid.PaymentInitiationRecipientCreateRequest{
		Name: "Harry Potter",
		Iban: plaid.String("GB33BUKB20201555555555"),
		Address: &plaid.PaymentInitiationAddress{
			Street:     []string{"4 Privet Drive"},
			City:       "Little Whinging",
			PostalCode: "11111",
			Country:    "GB",
		},
	})
	if err != nil {
		renderError(c, err)
		return
	}

	// Create payment
	paymentCreateResp, err := client.PaymentInitiation.CreatePayment(ctx, &plaid.PaymentInitiationPaymentCreateRequest{
		RecipientID: paymentRecipientCreateResp.RecipientID,
		Reference:   "paymentRef",
		Amount:      &plaid.PaymentAmount{Currency: plaid.PaymentAmountCurrencyGbp, Value: 1.34},
	})
	if err != nil {
		renderError(c, err)
		return
	}

	// We store the payment_id in memory for demo purposes - in production, store it in a secure
	// persistent data store along with the Payment metadata, such as userId.
	paymentID = paymentCreateResp.PaymentID
	fmt.Println("payment id: " + paymentID)

	// Create the link_token
	linkToken, err := linkTokenCreate(&plaid.LinkTokenCreateRequestPaymentInitiation{
		PaymentID: plaid.String(paymentID),
	})
	if err != nil {
		renderError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"link_token": linkToken,
	})
}

func auth(c *gin.Context) {
	ctx := context.Background()

	authGetResp, err := client.Auth.Get(ctx, &plaid.AuthGetRequest{AccessToken: accessToken})
	if err != nil {
		renderError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"accounts": authGetResp.Accounts,
		"numbers":  authGetResp.Numbers,
	})
}

func accounts(c *gin.Context) {
	ctx := context.Background()

	accountsGetResp, err := client.Accounts.Get(ctx, &plaid.AccountsGetRequest{AccessToken: accessToken})
	if err != nil {
		renderError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"accounts": accountsGetResp.Accounts,
	})
}

func balance(c *gin.Context) {
	ctx := context.Background()

	accountsGetResp, err := client.Accounts.GetBalance(ctx, &plaid.AccountsBalanceGetRequest{AccessToken: accessToken})
	if err != nil {
		renderError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"accounts": accountsGetResp.Accounts,
	})
}

func item(c *gin.Context) {
	ctx := context.Background()

	itemGetResp, err := client.Item.Get(ctx, &plaid.ItemGetRequest{AccessToken: accessToken})
	if err != nil {
		renderError(c, err)
		return
	}

	if itemGetResp.Item == nil || itemGetResp.Item.InstitutionID == nil {
		renderError(c, fmt.Errorf("item has no institution_id"))
		return
	}

	institutionGetByIDResp, err := client.Institutions.GetByID(ctx, &plaid.InstitutionsGetByIDRequest{
		InstitutionID: *itemGetResp.Item.InstitutionID,
		CountryCodes:  convertCountryCodes(strings.Split(PLAID_COUNTRY_CODES, ",")),
	})
	if err != nil {
		renderError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"item":        itemGetResp.Item,
		"institution": institutionGetByIDResp.Institution,
	})
}

func identity(c *gin.Context) {
	ctx := context.Background()

	identityGetResp, err := client.Identity.Get(ctx, &plaid.IdentityGetRequest{AccessToken: accessToken})
	if err != nil {
		renderError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"identity": identityGetResp.Accounts,
	})
}

func transactions(c *gin.Context) {
	ctx := context.Background()

	// Set cursor to empty to receive all historical updates
	var cursor *string

	// New transaction updates since "cursor"
	var added []*plaid.Transaction
	var modified []*plaid.Transaction
	var removed []*plaid.RemovedTransaction // Removed transaction ids
	hasMore := true
	const maxSyncPolls = 10
	syncPolls := 0
	// Iterate through each page of new transaction updates for item
	for hasMore {
		resp, err := client.Transactions.Sync(ctx, &plaid.TransactionsSyncRequest{
			AccessToken: accessToken,
			Cursor:      cursor,
		})
		if err != nil {
			renderError(c, err)
			return
		}

		// Update cursor to the next cursor
		nextCursor := resp.NextCursor
		cursor = &nextCursor

		// If no transactions are available yet, wait and poll the endpoint.
		// Normally, we would listen for a webhook, but the Quickstart doesn't
		// support webhooks. For a webhook example, see
		// https://github.com/plaid/tutorial-resources or
		// https://github.com/plaid/pattern

		if *cursor == "" {
			syncPolls++
			if syncPolls >= maxSyncPolls {
				renderError(c, fmt.Errorf("timed out waiting for transactions to become available after %d polls", maxSyncPolls))
				return
			}
			time.Sleep(2 * time.Second)
			continue
		}

		// Add this page of results
		added = append(added, resp.Added...)
		modified = append(modified, resp.Modified...)
		removed = append(removed, resp.Removed...)
		hasMore = resp.HasMore
	}

	sort.Slice(added, func(i, j int) bool {
		return added[i].Date.Before(added[j].Date)
	})

	start := len(added) - 9
	if start < 0 {
		start = 0
	}
	latestTransactions := added[start:]

	c.JSON(http.StatusOK, gin.H{
		"latest_transactions": latestTransactions,
	})
}

// This functionality is only relevant for the UK Payment Initiation product.
// Retrieve Payment for a specified Payment ID
func payment(c *gin.Context) {
	ctx := context.Background()

	paymentGetResp, err := client.PaymentInitiation.GetPayment(ctx, &plaid.PaymentInitiationPaymentGetRequest{
		PaymentID: paymentID,
	})
	if err != nil {
		renderError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"payment": paymentGetResp,
	})
}

// This functionality is only relevant for the ACH Transfer product.
// Create Transfer for a specified Authorization ID

func transferAuthorize(c *gin.Context) {
	ctx := context.Background()
	accountsGetResp, err := client.Accounts.Get(ctx, &plaid.AccountsGetRequest{AccessToken: accessToken})
	if err != nil {
		renderError(c, err)
		return
	}

	accountID = accountsGetResp.Accounts[0].AccountID
	transferType, err := plaid.NewTransferTypeFromString("debit")
	if err != nil {
		renderError(c, err)
		return
	}
	transferNetwork, err := plaid.NewTransferNetworkFromString("ach")
	if err != nil {
		renderError(c, err)
		return
	}
	achClass, err := plaid.NewAchClassFromString("ppd")
	if err != nil {
		renderError(c, err)
		return
	}

	transferAuthorizationCreateResp, err := client.Transfer.Authorization.Create(ctx, &transfer.TransferAuthorizationCreateRequest{
		AccessToken: accessToken,
		AccountID:   accountID,
		Type:        transferType,
		Network:     transferNetwork,
		Amount:      "1.00",
		AchClass:    achClass.Ptr(),
		User: &plaid.TransferAuthorizationUserInRequest{
			LegalName: "FirstName LastName",
		},
	})
	if err != nil {
		renderError(c, err)
		return
	}

	authorizationID = transferAuthorizationCreateResp.Authorization.ID

	c.JSON(http.StatusOK, transferAuthorizationCreateResp)
}

func transferCreate(c *gin.Context) {
	ctx := context.Background()

	transferCreateResp, err := client.Transfer.Create(ctx, &plaid.TransferCreateRequest{
		AccessToken:     accessToken,
		AccountID:       accountID,
		AuthorizationID: authorizationID,
		Description:     "Debit",
	})
	if err != nil {
		renderError(c, err)
		return
	}

	c.JSON(http.StatusOK, transferCreateResp)
}

func signalEvaluate(c *gin.Context) {
	ctx := context.Background()
	accountsGetResp, err := client.Accounts.Get(ctx, &plaid.AccountsGetRequest{AccessToken: accessToken})
	if err != nil {
		renderError(c, err)
		return
	}

	accountID = accountsGetResp.Accounts[0].AccountID

	// Generate unique transaction ID using timestamp and random component
	clientTransactionID := fmt.Sprintf("txn-%d-%s", time.Now().UnixNano(), uuid.New().String()[:8])

	signalEvaluateRequest := &plaid.SignalEvaluateRequest{
		AccessToken:         accessToken,
		AccountID:           accountID,
		ClientTransactionID: clientTransactionID,
		Amount:              100.00,
	}
	if SIGNAL_RULESET_KEY != "" {
		signalEvaluateRequest.RulesetKey = plaid.String(SIGNAL_RULESET_KEY)
	}

	signalEvaluateResp, err := client.Signal.Evaluate(ctx, signalEvaluateRequest)
	if err != nil {
		renderError(c, err)
		return
	}

	c.JSON(http.StatusOK, signalEvaluateResp)
}

func investmentTransactions(c *gin.Context) {
	ctx := context.Background()

	endDate := time.Now().Local()
	startDate := time.Now().Local().Add(-30 * 24 * time.Hour)

	page, err := client.Investments.GetTransactions(ctx, &plaid.InvestmentsTransactionsGetRequest{
		AccessToken: accessToken,
		StartDate:   startDate,
		EndDate:     endDate,
	})
	if err != nil {
		renderError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"investments_transactions": page.Response,
	})
}

func holdings(c *gin.Context) {
	ctx := context.Background()

	holdingsGetResp, err := client.Investments.GetHoldings(ctx, &plaid.InvestmentsHoldingsGetRequest{AccessToken: accessToken})
	if err != nil {
		renderError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"holdings": holdingsGetResp,
	})
}

func info(context *gin.Context) {
	context.JSON(http.StatusOK, map[string]interface{}{
		"item_id":      itemID,
		"access_token": accessToken,
		"products":     strings.Split(PLAID_PRODUCTS, ","),
	})
}

func createPublicToken(c *gin.Context) {
	ctx := context.Background()

	// Create a one-time use public_token for the Item.
	// This public_token can be used to initialize Link in update mode for a user
	publicTokenCreateResp, err := client.Item.CreatePublicToken(ctx, &plaid.ItemPublicTokenCreateRequest{AccessToken: accessToken})
	if err != nil {
		renderError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"public_token": publicTokenCreateResp.PublicToken,
	})
}

func createLinkToken(c *gin.Context) {
	linkToken, err := linkTokenCreate(nil)
	if err != nil {
		renderError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"link_token": linkToken})
}

func createUserToken(c *gin.Context) {
	err := userTokenCreate()
	if err != nil {
		renderError(c, err)
		return
	}
	response := gin.H{}
	if userToken != "" {
		response["user_token"] = userToken
	}
	if userID != "" {
		response["user_id"] = userID
	}
	c.JSON(http.StatusOK, response)
}

func convertCountryCodes(countryCodeStrs []string) []plaid.CountryCode {
	countryCodes := []plaid.CountryCode{}

	for _, countryCodeStr := range countryCodeStrs {
		countryCodes = append(countryCodes, plaid.CountryCode(countryCodeStr))
	}

	return countryCodes
}

func convertProducts(productStrs []string) []plaid.Products {
	products := []plaid.Products{}

	for _, productStr := range productStrs {
		products = append(products, plaid.Products(productStr))
	}

	return products
}

func containsProduct(products []plaid.Products, product plaid.Products) bool {
	for _, p := range products {
		if p == product {
			return true
		}
	}
	return false
}

func isCraProductList(products []plaid.Products) bool {
	return containsProduct(products, plaid.ProductsCraBaseReport) ||
		containsProduct(products, plaid.ProductsCraIncomeInsights) ||
		containsProduct(products, plaid.ProductsCraPartnerInsights)
}

// linkTokenCreate creates a link token using the specified parameters
func linkTokenCreate(
	paymentInitiation *plaid.LinkTokenCreateRequestPaymentInitiation,
) (string, error) {
	ctx := context.Background()

	// Institutions from all listed countries will be shown.
	countryCodes := convertCountryCodes(strings.Split(PLAID_COUNTRY_CODES, ","))
	redirectURI := PLAID_REDIRECT_URI

	// This should correspond to a unique id for the current user.
	// Typically, this will be a user ID number from your application.
	// Personally identifiable information, such as an email address or phone number, should not be used here.
	request := &plaid.LinkTokenCreateRequest{
		ClientName:   "Plaid Quickstart",
		Language:     "en",
		CountryCodes: countryCodes,
		User: &plaid.LinkTokenCreateRequestUser{
			ClientUserID: time.Now().String(),
		},
	}

	products := convertProducts(strings.Split(PLAID_PRODUCTS, ","))
	if paymentInitiation != nil {
		request.PaymentInitiation = paymentInitiation
		// The 'payment_initiation' product has to be the only element in the 'products' list.
		request.Products = []plaid.Products{plaid.ProductsPaymentInitiation}
	} else {
		request.Products = products
	}

	if containsProduct(products, plaid.ProductsStatements) {
		request.Statements = &plaid.LinkTokenCreateRequestStatements{
			StartDate: time.Now().Local().Add(-30 * 24 * time.Hour),
			EndDate:   time.Now().Local(),
		}
	}

	if isCraProductList(products) {
		// Use user_token if available, otherwise use user_id
		if userToken != "" {
			fmt.Println("Creating link token with user_token:", userToken)
			request.UserToken = plaid.String(userToken)
			// Keep user object when using user_token
		} else if userID != "" {
			fmt.Println("Creating link token with user_id:", userID)
			request.UserID = plaid.String(userID)
			// Remove user object when using user_id
			request.User = nil
		} else {
			fmt.Println("ERROR: Both userToken and userID are empty!")
		}
		request.ConsumerReportPermissiblePurpose = plaid.ConsumerReportPermissiblePurposeAccountReviewCredit.Ptr()
		request.CraOptions = &plaid.LinkTokenCreateRequestCraOptions{DaysRequested: 60}
	}

	if redirectURI != "" {
		request.RedirectURI = plaid.String(redirectURI)
	}

	linkTokenCreateResp, err := client.Link.CreateToken(ctx, request)
	if err != nil {
		return "", err
	}

	return linkTokenCreateResp.LinkToken, nil
}

// Create a user token which can be used for Plaid Check, Income, or Multi-Item link flows
// https://plaid.com/docs/api/users/#usercreate
func userTokenCreate() error {
	ctx := context.Background()

	clientUserID := time.Now().String()

	request := &plaid.UserCreateRequest{
		// Typically this will be a user ID number from your application.
		ClientUserID: clientUserID,
	}

	products := convertProducts(strings.Split(PLAID_PRODUCTS, ","))
	if isCraProductList(products) {
		// Try with Identity field first (new-style)
		request.Identity = &plaid.ClientUserIdentity{
			Name: &plaid.ClientUserIdentityName{
				GivenName:  "Harry",
				FamilyName: "Potter",
			},
			DateOfBirth: plaid.Time(plaid.MustParseDate("1980-07-31")),
			PhoneNumbers: []*plaid.ClientUserIdentityPhoneNumber{
				{Data: "+16174567890", Primary: true},
			},
			Emails: []*plaid.ClientUserIdentityEmail{
				{Data: "harrypotter@example.com", Primary: true},
			},
			Addresses: []*plaid.ClientUserIdentityAddress{
				{
					Street1:    plaid.String("4 Privet Drive"),
					City:       plaid.String("New York"),
					Region:     plaid.String("NY"),
					PostalCode: plaid.String("11111"),
					Country:    "US",
					Primary:    true,
				},
			},
		}
	}

	userCreateResp, err := client.User.Create(ctx, request)
	if err != nil {
		plaidErr, _, ok := toPlaidError(err)
		if ok && plaidErr.ErrorCode == "INVALID_FIELD" {
			request2 := &plaid.UserCreateRequest{ClientUserID: clientUserID}

			if isCraProductList(products) {
				request2.ConsumerReportUserIdentity = &plaid.ConsumerReportUserIdentity{
					FirstName:    "Harry",
					LastName:     "Potter",
					PhoneNumbers: []string{"+16174567890"},
					Emails:       []string{"harrypotter@example.com"},
					DateOfBirth:  plaid.Time(plaid.MustParseDate("1980-07-31")),
					PrimaryAddress: &plaid.AddressData{
						City:       plaid.String("New York"),
						Region:     plaid.String("NY"),
						Street:     plaid.String("4 Privet Drive"),
						PostalCode: plaid.String("11111"),
						Country:    plaid.String("US"),
					},
				}
				// Legacy sent "ssn_last_4": null via NewNullableString(nil); keep that wire shape.
				request2.ConsumerReportUserIdentity.SetSsnLast4(nil)
			}

			userCreateResp, err = client.User.Create(ctx, request2)
			if err != nil {
				return err
			}
		} else {
			return err
		}
	}

	// Store both user_token and user_id
	if userCreateResp.UserToken != nil {
		userToken = *userCreateResp.UserToken
		fmt.Println("Created user with user_token:", userToken)
	}
	if userCreateResp.UserID != "" {
		userID = userCreateResp.UserID
		fmt.Println("Created user with user_id:", userID)
	}

	return nil
}

func statements(c *gin.Context) {
	ctx := context.Background()
	statementsListResp, err := client.Statements.List(ctx, &plaid.StatementsListRequest{AccessToken: accessToken})
	if err != nil {
		renderError(c, err)
		return
	}

	var statementID string
	for _, account := range statementsListResp.Accounts {
		if len(account.Statements) > 0 {
			statementID = account.Statements[0].StatementID
			break
		}
	}
	if statementID == "" {
		c.JSON(http.StatusOK, gin.H{
			"json": statementsListResp,
			"pdf":  nil,
		})
		return
	}

	statementsDownloadResp, err := client.Statements.Download(ctx, &plaid.StatementsDownloadRequest{
		AccessToken: accessToken,
		StatementID: statementID,
	})
	if err != nil {
		renderError(c, err)
		return
	}

	content, err := io.ReadAll(statementsDownloadResp)
	if err != nil {
		renderError(c, err)
		return
	}

	// convert pdf to base64
	encodedPdf := base64.StdEncoding.EncodeToString(content)

	c.JSON(http.StatusOK, gin.H{
		"json": statementsListResp,
		"pdf":  encodedPdf,
	})
}

func assets(c *gin.Context) {
	ctx := context.Background()

	// create the asset report
	assetReportCreateResp, err := client.AssetReport.Create(ctx, &plaid.AssetReportCreateRequest{
		DaysRequested: 10,
		AccessTokens:  []string{accessToken},
	})
	if err != nil {
		renderError(c, err)
		return
	}

	assetReportToken := assetReportCreateResp.AssetReportToken

	// get the asset report
	assetReportGetResp, err := pollForAssetReport(ctx, assetReportToken)
	if err != nil {
		renderError(c, err)
		return
	}

	// get it as a pdf
	pdfFile, err := client.AssetReport.GetPdf(ctx, &plaid.AssetReportPdfGetRequest{AssetReportToken: assetReportToken})
	if err != nil {
		renderError(c, err)
		return
	}

	content, err := io.ReadAll(pdfFile)
	if err != nil {
		renderError(c, err)
		return
	}

	// convert pdf to base64
	encodedPdf := base64.StdEncoding.EncodeToString(content)

	c.JSON(http.StatusOK, gin.H{
		"json": assetReportGetResp.Report,
		"pdf":  encodedPdf,
	})
}

func pollForAssetReport(ctx context.Context, assetReportToken string) (*plaid.AssetReportGetResponse, error) {
	return pollWithRetries(func() (*plaid.AssetReportGetResponse, error) {
		return client.AssetReport.Get(ctx, &plaid.AssetReportGetRequest{AssetReportToken: plaid.String(assetReportToken)})
	}, 1000, 20)
}

// craUserRef mirrors the legacy "user_token if available, otherwise user_id" logic.
func craUserRef() (token *string, id *string) {
	if userToken != "" {
		return plaid.String(userToken), nil
	} else if userID != "" {
		return nil, plaid.String(userID)
	}
	return nil, nil
}

// Retrieve CRA Base Report and PDF
// Base report: https://plaid.com/docs/check/api/#cracheck_reportbase_reportget
// PDF: https://plaid.com/docs/check/api/#cracheck_reportpdfget
func getCraBaseReportHandler(c *gin.Context) {
	ctx := context.Background()
	getResponse, err := getCraBaseReportWithRetries(ctx)
	if err != nil {
		renderError(c, err)
		return
	}

	token, id := craUserRef()
	pdfResponse, err := client.CheckReport.GetPdf(ctx, &plaid.CraCheckReportPdfGetRequest{UserToken: token, UserID: id})
	if err != nil {
		renderError(c, err)
		return
	}

	content, err := io.ReadAll(pdfResponse)
	if err != nil {
		renderError(c, err)
		return
	}

	// convert pdf to base64
	encodedPdf := base64.StdEncoding.EncodeToString(content)

	c.JSON(http.StatusOK, gin.H{
		"report": getResponse.Report,
		"pdf":    encodedPdf,
	})
}

func getCraBaseReportWithRetries(ctx context.Context) (*plaid.CraCheckReportBaseReportGetResponse, error) {
	return pollWithRetries(func() (*plaid.CraCheckReportBaseReportGetResponse, error) {
		token, id := craUserRef()
		return client.CheckReport.GetBaseReport(ctx, &plaid.CraCheckReportBaseReportGetRequest{UserToken: token, UserID: id})
	}, 1000, 20)
}

// Retrieve CRA Income Insights and PDF with Insights
// Income insights: https://plaid.com/docs/check/api/#cracheck_reportincome_insightsget
// PDF w/ income insights: https://plaid.com/docs/check/api/#cracheck_reportpdfget
func getCraIncomeInsightsHandler(c *gin.Context) {
	ctx := context.Background()
	getResponse, err := getCraIncomeInsightsWithRetries(ctx)
	if err != nil {
		renderError(c, err)
		return
	}

	token, id := craUserRef()
	pdfResponse, err := client.CheckReport.GetPdf(ctx, &plaid.CraCheckReportPdfGetRequest{
		UserToken: token,
		UserID:    id,
		AddOns:    []plaid.CraPdfAddOns{plaid.CraPdfAddOnsCraIncomeInsights},
	})
	if err != nil {
		renderError(c, err)
		return
	}

	content, err := io.ReadAll(pdfResponse)
	if err != nil {
		renderError(c, err)
		return
	}

	// convert pdf to base64
	encodedPdf := base64.StdEncoding.EncodeToString(content)

	c.JSON(http.StatusOK, gin.H{
		"report": getResponse.Report,
		"pdf":    encodedPdf,
	})
}

func getCraIncomeInsightsWithRetries(ctx context.Context) (*plaid.CraCheckReportIncomeInsightsGetResponse, error) {
	return pollWithRetries(func() (*plaid.CraCheckReportIncomeInsightsGetResponse, error) {
		token, id := craUserRef()
		return client.CheckReport.GetIncomeInsights(ctx, &plaid.CraCheckReportIncomeInsightsGetRequest{UserToken: token, UserID: id})
	}, 1000, 20)
}

// Retrieve CRA Partner Insights
// https://plaid.com/docs/check/api/#cracheck_reportpartner_insightsget
func getCraPartnerInsightsHandler(c *gin.Context) {
	ctx := context.Background()
	getResponse, err := getCraPartnerInsightsWithRetries(ctx)
	if err != nil {
		renderError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"report": getResponse.Report,
	})
}

func getCraPartnerInsightsWithRetries(ctx context.Context) (*plaid.CraCheckReportPartnerInsightsGetResponse, error) {
	return pollWithRetries(func() (*plaid.CraCheckReportPartnerInsightsGetResponse, error) {
		token, id := craUserRef()
		return client.CheckReport.GetPartnerInsights(ctx, &plaid.CraCheckReportPartnerInsightsGetRequest{UserToken: token, UserID: id})
	}, 1000, 20)
}

// Since this quickstart does not support webhooks, this function can be used to poll
// an API that would otherwise be triggered by a webhook.
// For a webhook example, see
// https://github.com/plaid/tutorial-resources or
// https://github.com/plaid/pattern
func pollWithRetries[T any](requestCallback func() (T, error), ms int, retriesLeft int) (T, error) {
	var zero T
	if retriesLeft == 0 {
		return zero, fmt.Errorf("ran out of retries while polling")
	}
	response, err := requestCallback()
	if err != nil {
		plaidErr, status, ok := toPlaidError(err)
		isProductNotReady := ok && plaidErr.ErrorCode == "PRODUCT_NOT_READY"
		isServerError := status >= 500
		if !isProductNotReady && !isServerError {
			return zero, err
		}
		time.Sleep(time.Duration(ms) * time.Millisecond)
		return pollWithRetries[T](requestCallback, ms, retriesLeft-1)
	}
	return response, nil
}
