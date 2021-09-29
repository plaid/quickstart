package main

import (
	"bufio"
	"context"
	"encoding/base64"
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	plaid "github.com/plaid/plaid-go/plaid"
)

var (
	PLAID_CLIENT_ID                      = ""
	PLAID_SECRET                         = ""
	PLAID_ENV                            = ""
	PLAID_PRODUCTS                       = ""
	PLAID_COUNTRY_CODES                  = ""
	PLAID_REDIRECT_URI                   = ""
	APP_PORT                             = ""
	client              *plaid.APIClient = nil
)

var environments = map[string]plaid.Environment{
	"sandbox":     plaid.Sandbox,
	"development": plaid.Development,
	"production":  plaid.Production,
}

func init() {
	// load env vars from .env file
	err := godotenv.Load()
	if err != nil {
		fmt.Println("Error when loading environment variables from .env file %w", err)
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
	if PLAID_CLIENT_ID == "" {
		log.Fatal("PLAID_CLIENT_ID is not set. Make sure to fill out the .env file")
	}
	if PLAID_SECRET == "" {
		log.Fatal("PLAID_SECRET is not set. Make sure to fill out the .env file")
	}

	// create Plaid client
	configuration := plaid.NewConfiguration()
	configuration.AddDefaultHeader("PLAID-CLIENT-ID", PLAID_CLIENT_ID)
	configuration.AddDefaultHeader("PLAID-SECRET", PLAID_SECRET)
	configuration.UseEnvironment(environments[PLAID_ENV])
	client = plaid.NewAPIClient(configuration)
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
	r.GET("/api/investment_transactions", investmentTransactions)
	r.GET("/api/holdings", holdings)
	r.GET("/api/assets", assets)
	r.GET("/api/transfer", transfer)

	err := r.Run(":" + APP_PORT)
	if err != nil {
		panic("unable to start server")
	}
}

// We store the access_token in memory - in production, store it in a secure
// persistent data store.
var accessToken string
var itemID string

var paymentID string

// The transfer_id is only relevant for the Transfer ACH product.
// We store the transfer_id in memory - in production, store it in a secure
// persistent data store
var transferID string

func renderError(c *gin.Context, originalErr error) {
	if plaidError, err := plaid.ToPlaidError(originalErr); err == nil {
		// Return 200 and allow the front end to render the error.
		c.JSON(http.StatusOK, gin.H{"error": plaidError})
		return
	}

	c.JSON(http.StatusInternalServerError, gin.H{"error": originalErr.Error()})
}

func getAccessToken(c *gin.Context) {
	publicToken := c.PostForm("public_token")
	ctx := context.Background()

	// exchange the public_token for an access_token
	exchangePublicTokenResp, _, err := client.PlaidApi.ItemPublicTokenExchange(ctx).ItemPublicTokenExchangeRequest(
		*plaid.NewItemPublicTokenExchangeRequest(publicToken),
	).Execute()
	if err != nil {
		renderError(c, err)
		return
	}

	accessToken = exchangePublicTokenResp.GetAccessToken()
	itemID = exchangePublicTokenResp.GetItemId()
	if itemExists(strings.Split(PLAID_PRODUCTS, ","), "transfer") {
		transferID, err = authorizeAndCreateTransfer(ctx, client, accessToken)
	}

	fmt.Println("public token: " + publicToken)
	fmt.Println("access token: " + accessToken)
	fmt.Println("item ID: " + itemID)

	c.JSON(http.StatusOK, gin.H{
		"access_token": accessToken,
		"item_id":      itemID,
	})
}

// This functionality is only relevant for the UK Payment Initiation product.
// Creates a link token configured for payment initiation. The payment
// information will be associated with the link token, and will not have to be
// passed in again when we initialize Plaid Link.
func createLinkTokenForPayment(c *gin.Context) {
	ctx := context.Background()

	// Create payment recipient
	paymentRecipientRequest := plaid.NewPaymentInitiationRecipientCreateRequest("Harry Potter")
	paymentRecipientRequest.SetIban("GB33BUKB20201555555555")
	paymentRecipientRequest.SetAddress(*plaid.NewPaymentInitiationAddress(
		[]string{"4 Privet Drive"},
		"Little Whinging",
		"11111",
		"GB",
	))
	paymentRecipientCreateResp, _, err := client.PlaidApi.PaymentInitiationRecipientCreate(ctx).PaymentInitiationRecipientCreateRequest(*paymentRecipientRequest).Execute()
	if err != nil {
		renderError(c, err)
		return
	}

	// Create payment
	paymentCreateRequest := plaid.NewPaymentInitiationPaymentCreateRequest(
		paymentRecipientCreateResp.GetRecipientId(),
		"paymentRef",
		*plaid.NewPaymentAmount("GBP", 12.34),
	)
	paymentCreateResp, _, err := client.PlaidApi.PaymentInitiationPaymentCreate(ctx).PaymentInitiationPaymentCreateRequest(*paymentCreateRequest).Execute()
	if err != nil {
		renderError(c, err)
		return
	}

	paymentID = paymentCreateResp.GetPaymentId()
	fmt.Println("payment id: " + paymentID)

	linkTokenCreateReqPaymentInitiation := plaid.NewLinkTokenCreateRequestPaymentInitiation(paymentID)
	linkToken, err := linkTokenCreate(linkTokenCreateReqPaymentInitiation)
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

	authGetResp, _, err := client.PlaidApi.AuthGet(ctx).AuthGetRequest(
		*plaid.NewAuthGetRequest(accessToken),
	).Execute()

	if err != nil {
		renderError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"accounts": authGetResp.GetAccounts(),
		"numbers":  authGetResp.GetNumbers(),
	})
}

func accounts(c *gin.Context) {
	ctx := context.Background()

	accountsGetResp, _, err := client.PlaidApi.AccountsGet(ctx).AccountsGetRequest(
		*plaid.NewAccountsGetRequest(accessToken),
	).Execute()

	if err != nil {
		renderError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"accounts": accountsGetResp.GetAccounts(),
	})
}

func balance(c *gin.Context) {
	ctx := context.Background()

	balancesGetResp, _, err := client.PlaidApi.AccountsBalanceGet(ctx).AccountsBalanceGetRequest(
		*plaid.NewAccountsBalanceGetRequest(accessToken),
	).Execute()

	if err != nil {
		renderError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"accounts": balancesGetResp.GetAccounts(),
	})
}

func item(c *gin.Context) {
	ctx := context.Background()

	itemGetResp, _, err := client.PlaidApi.ItemGet(ctx).ItemGetRequest(
		*plaid.NewItemGetRequest(accessToken),
	).Execute()

	if err != nil {
		renderError(c, err)
		return
	}

	institutionGetByIdResp, _, err := client.PlaidApi.InstitutionsGetById(ctx).InstitutionsGetByIdRequest(
		*plaid.NewInstitutionsGetByIdRequest(
			*itemGetResp.GetItem().InstitutionId.Get(),
			convertCountryCodes(strings.Split(PLAID_COUNTRY_CODES, ",")),
		),
	).Execute()

	if err != nil {
		renderError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"item":        itemGetResp.GetItem(),
		"institution": institutionGetByIdResp.GetInstitution(),
	})
}

func identity(c *gin.Context) {
	ctx := context.Background()

	identityGetResp, _, err := client.PlaidApi.IdentityGet(ctx).IdentityGetRequest(
		*plaid.NewIdentityGetRequest(accessToken),
	).Execute()
	if err != nil {
		renderError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"identity": identityGetResp.GetAccounts(),
	})
}

func transactions(c *gin.Context) {
	ctx := context.Background()

	// pull transactions for the past 30 days
	endDate := time.Now().Local().Format("2006-01-02")
	startDate := time.Now().Local().Add(-30 * 24 * time.Hour).Format("2006-01-02")

	transactionsResp, _, err := client.PlaidApi.TransactionsGet(ctx).TransactionsGetRequest(
		*plaid.NewTransactionsGetRequest(
			accessToken,
			startDate,
			endDate,
		),
	).Execute()

	if err != nil {
		renderError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"accounts":     transactionsResp.GetAccounts(),
		"transactions": transactionsResp.GetTransactions(),
	})
}

// This functionality is only relevant for the UK Payment Initiation product.
// Retrieve Payment for a specified Payment ID
func payment(c *gin.Context) {
	ctx := context.Background()

	paymentGetResp, _, err := client.PlaidApi.PaymentInitiationPaymentGet(ctx).PaymentInitiationPaymentGetRequest(
		*plaid.NewPaymentInitiationPaymentGetRequest(paymentID),
	).Execute()

	if err != nil {
		renderError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"payment": paymentGetResp,
	})
}

// This functionality is only relevant for the ACH Transfer product.
// Retrieve Transfer for a specified Transfer ID
func transfer(c *gin.Context) {
	ctx := context.Background()

	transferGetResp, _, err := client.PlaidApi.TransferGet(ctx).TransferGetRequest(
		*plaid.NewTransferGetRequest(transferID),
	).Execute()
	if err != nil {
		renderError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"transfer": transferGetResp.GetTransfer(),
	})
}

func investmentTransactions(c *gin.Context) {
	ctx := context.Background()

	endDate := time.Now().Local().Format("2006-01-02")
	startDate := time.Now().Local().Add(-30 * 24 * time.Hour).Format("2006-01-02")

	request := plaid.NewInvestmentsTransactionsGetRequest(accessToken, startDate, endDate)
	invTxResp, _, err := client.PlaidApi.InvestmentsTransactionsGet(ctx).InvestmentsTransactionsGetRequest(*request).Execute()

	if err != nil {
		renderError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"investment_transactions": invTxResp,
	})
}

func holdings(c *gin.Context) {
	ctx := context.Background()

	holdingsGetResp, _, err := client.PlaidApi.InvestmentsHoldingsGet(ctx).InvestmentsHoldingsGetRequest(
		*plaid.NewInvestmentsHoldingsGetRequest(accessToken),
	).Execute()
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
	publicTokenCreateResp, _, err := client.PlaidApi.ItemCreatePublicToken(ctx).ItemPublicTokenCreateRequest(
		*plaid.NewItemPublicTokenCreateRequest(accessToken),
	).Execute()

	if err != nil {
		renderError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"public_token": publicTokenCreateResp.GetPublicToken(),
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

// linkTokenCreate creates a link token using the specified parameters
func linkTokenCreate(
	paymentInitiation *plaid.LinkTokenCreateRequestPaymentInitiation,
) (string, error) {
	ctx := context.Background()
	countryCodes := convertCountryCodes(strings.Split(PLAID_COUNTRY_CODES, ","))
	products := convertProducts(strings.Split(PLAID_PRODUCTS, ","))
	redirectURI := PLAID_REDIRECT_URI

	user := plaid.LinkTokenCreateRequestUser{
		ClientUserId: time.Now().String(),
	}

	request := plaid.NewLinkTokenCreateRequest(
		"Plaid Quickstart",
		"en",
		countryCodes,
		user,
	)

	request.SetProducts(products)

	if redirectURI != "" {
		request.SetRedirectUri(redirectURI)
	}

	if paymentInitiation != nil {
		request.SetPaymentInitiation(*paymentInitiation)
	}

	linkTokenCreateResp, _, err := client.PlaidApi.LinkTokenCreate(ctx).LinkTokenCreateRequest(*request).Execute()

	if err != nil {
		return "", err
	}

	return linkTokenCreateResp.GetLinkToken(), nil
}

func assets(c *gin.Context) {
	ctx := context.Background()

	// create the asset report
	assetReportCreateResp, _, err := client.PlaidApi.AssetReportCreate(ctx).AssetReportCreateRequest(
		*plaid.NewAssetReportCreateRequest([]string{accessToken}, 10),
	).Execute()
	if err != nil {
		renderError(c, err)
		return
	}

	assetReportToken := assetReportCreateResp.GetAssetReportToken()

	// get the asset report
	assetReportGetResp, err := pollForAssetReport(ctx, client, assetReportToken)
	if err != nil {
		renderError(c, err)
		return
	}

	// get it as a pdf
	pdfRequest := plaid.NewAssetReportPDFGetRequest(assetReportToken)
	pdfFile, _, err := client.PlaidApi.AssetReportPdfGet(ctx).AssetReportPDFGetRequest(*pdfRequest).Execute()
	if err != nil {
		renderError(c, err)
		return
	}

	reader := bufio.NewReader(pdfFile)
	content, err := ioutil.ReadAll(reader)
	if err != nil {
		renderError(c, err)
		return
	}

	// convert pdf to base64
	encodedPdf := base64.StdEncoding.EncodeToString(content)

	c.JSON(http.StatusOK, gin.H{
		"json": assetReportGetResp.GetReport(),
		"pdf":  encodedPdf,
	})
}

func pollForAssetReport(ctx context.Context, client *plaid.APIClient, assetReportToken string) (*plaid.AssetReportGetResponse, error) {
	numRetries := 20
	request := plaid.NewAssetReportGetRequest(assetReportToken)

	for i := 0; i < numRetries; i++ {
		response, _, err := client.PlaidApi.AssetReportGet(ctx).AssetReportGetRequest(*request).Execute()
		if err != nil {
			plaidErr, err := plaid.ToPlaidError(err)
			if plaidErr.ErrorCode == "PRODUCT_NOT_READY" {
				time.Sleep(1 * time.Second)
				continue
			} else {
				return nil, err
			}
		} else {
			return &response, nil
		}
	}
	return nil, errors.New("Timed out when polling for an asset report.")
}

// This is a helper function to authorize and create a Transfer after successful
// exchange of a public_token for an access_token. The transfer_id is then used
// to obtain the data about that particular Transfer.
func authorizeAndCreateTransfer(ctx context.Context, client *plaid.APIClient, accessToken string) (string, error) {
	// We call /accounts/get to obtain first account_id - in production,
	// account_id's should be persisted in a data store and retrieved
	// from there.
	accountsGetResp, _, _ := client.PlaidApi.AccountsGet(ctx).AccountsGetRequest(
		*plaid.NewAccountsGetRequest(accessToken),
	).Execute()

	accountID := accountsGetResp.GetAccounts()[0].AccountId



	transferAuthorizationCreateUser := plaid.NewTransferUserInRequest("FirstName LastName")
	transferAuthorizationCreateRequest := plaid.NewTransferAuthorizationCreateRequest(
		accessToken,
		accountID,
		"credit",
		"ach",
		"12.34",
		"ppd",
		*transferAuthorizationCreateUser,
	)
	transferAuthorizationCreateResp, _, err := client.PlaidApi.TransferAuthorizationCreate(ctx).TransferAuthorizationCreateRequest(*transferAuthorizationCreateRequest).Execute()
	if err != nil {
		return "", err
	}
	authorizationID := transferAuthorizationCreateResp.GetAuthorization().Id

	transferCreateRequest := plaid.NewTransferCreateRequest(
		"1223abc456xyz7890001",
		accessToken,
		accountID,
		authorizationID,
		"credit",
		"ach",
		"12.34",
		"Payment",
		"ppd",
		*transferAuthorizationCreateUser,
	)
	transferCreateResp, _, err := client.PlaidApi.TransferCreate(ctx).TransferCreateRequest(*transferCreateRequest).Execute()
	if err != nil {
		return "", err
	}

	return transferCreateResp.GetTransfer().Id, nil
}

// Helper function to determine if Transfer is in Plaid product array
func itemExists(array []string, product string) bool {
	for _, item := range array {
		if item == product {
			return true
		}
	}

	return false
}
