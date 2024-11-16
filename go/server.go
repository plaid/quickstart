package main

import (
	"bufio"
	"context"
	"encoding/base64"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"sort"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	plaid "github.com/plaid/plaid-go/v31/plaid"
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
	"sandbox":    plaid.Sandbox,
	"production": plaid.Production,
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

// We store the access_token and user_token in memory - in production, store it in a secure
// persistent data store.
var accessToken string
var userToken string
var itemID string

var paymentID string

// The authorizationID is only relevant for the Transfer ACH product.
// We store the authorizationID in memory - in production, store it in a secure
// persistent data store
var authorizationID string
var accountID string

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
		*plaid.NewPaymentAmount("GBP", 1.34),
	)
	paymentCreateResp, _, err := client.PlaidApi.PaymentInitiationPaymentCreate(ctx).PaymentInitiationPaymentCreateRequest(*paymentCreateRequest).Execute()
	if err != nil {
		renderError(c, err)
		return
	}

	// We store the payment_id in memory for demo purposes - in production, store it in a secure
	// persistent data store along with the Payment metadata, such as userId.
	paymentID = paymentCreateResp.GetPaymentId()
	fmt.Println("payment id: " + paymentID)

	// Create the link_token
	linkTokenCreateReqPaymentInitiation := plaid.NewLinkTokenCreateRequestPaymentInitiation()
	linkTokenCreateReqPaymentInitiation.SetPaymentId(paymentID)
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

	// Set cursor to empty to receive all historical updates
	var cursor *string

	// New transaction updates since "cursor"
	var added []plaid.Transaction
	var modified []plaid.Transaction
	var removed []plaid.RemovedTransaction // Removed transaction ids
	hasMore := true
	// Iterate through each page of new transaction updates for item
	for hasMore {
		request := plaid.NewTransactionsSyncRequest(accessToken)
		if cursor != nil {
			request.SetCursor(*cursor)
		}
		resp, _, err := client.PlaidApi.TransactionsSync(
			ctx,
		).TransactionsSyncRequest(*request).Execute()
		if err != nil {
			renderError(c, err)
			return
		}

		// Update cursor to the next cursor
		nextCursor := resp.GetNextCursor()
		cursor = &nextCursor

		// If no transactions are available yet, wait and poll the endpoint.
		// Normally, we would listen for a webhook, but the Quickstart doesn't
		// support webhooks. For a webhook example, see
		// https://github.com/plaid/tutorial-resources or
		// https://github.com/plaid/pattern

		if *cursor == "" {
			time.Sleep(2 * time.Second)
			continue
		}

		// Add this page of results
		added = append(added, resp.GetAdded()...)
		modified = append(modified, resp.GetModified()...)
		removed = append(removed, resp.GetRemoved()...)
		hasMore = resp.GetHasMore()
	}

	sort.Slice(added, func(i, j int) bool {
		return added[i].GetDate() < added[j].GetDate()
	})
	latestTransactions := added[len(added)-9:]

	c.JSON(http.StatusOK, gin.H{
		"latest_transactions": latestTransactions,
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
// Create Transfer for a specified Authorization ID

func transferAuthorize(c *gin.Context) {
	ctx := context.Background()
	accountsGetResp, _, err := client.PlaidApi.AccountsGet(ctx).AccountsGetRequest(
		*plaid.NewAccountsGetRequest(accessToken),
	).Execute()

	if err != nil {
		renderError(c, err)
		return
	}

	accountID = accountsGetResp.GetAccounts()[0].AccountId
	transferType, err := plaid.NewTransferTypeFromValue("debit")
	transferNetwork, err := plaid.NewTransferNetworkFromValue("ach")
	ACHClass, err := plaid.NewACHClassFromValue("ppd")

	transferAuthorizationCreateUser := plaid.NewTransferAuthorizationUserInRequest("FirstName LastName")
	transferAuthorizationCreateRequest := plaid.NewTransferAuthorizationCreateRequest(
		accessToken,
		accountID,
		*transferType,
		*transferNetwork,
		"1.00",
		*transferAuthorizationCreateUser)

	transferAuthorizationCreateRequest.SetAchClass(*ACHClass)
	transferAuthorizationCreateResp, _, err := client.PlaidApi.TransferAuthorizationCreate(ctx).TransferAuthorizationCreateRequest(*transferAuthorizationCreateRequest).Execute()

	if err != nil {
		renderError(c, err)
		return
	}

	authorizationID = transferAuthorizationCreateResp.GetAuthorization().Id

	c.JSON(http.StatusOK, transferAuthorizationCreateResp)
}

func transferCreate(c *gin.Context) {
	ctx := context.Background()

	transferCreateRequest := plaid.NewTransferCreateRequest(
		accessToken,
		accountID,
		authorizationID,
		"Debit",
	)

	transferCreateResp, _, err := client.PlaidApi.TransferCreate(ctx).TransferCreateRequest(*transferCreateRequest).Execute()

	if err != nil {
		renderError(c, err)
		return
	}

	c.JSON(http.StatusOK, transferCreateResp)
}

func signalEvaluate(c *gin.Context) {
	ctx := context.Background()
	accountsGetResp, _, err := client.PlaidApi.AccountsGet(ctx).AccountsGetRequest(
		*plaid.NewAccountsGetRequest(accessToken),
	).Execute()

	if err != nil {
		renderError(c, err)
		return
	}

	accountID = accountsGetResp.GetAccounts()[0].AccountId

	signalEvaluateRequest := plaid.NewSignalEvaluateRequest(
		accessToken,
		accountID,
		"txn1234",
		100.00)

	signalEvaluateResp, _, err := client.PlaidApi.SignalEvaluate(ctx).SignalEvaluateRequest(*signalEvaluateRequest).Execute()

	if err != nil {
		renderError(c, err)
		return
	}

	c.JSON(http.StatusOK, signalEvaluateResp)
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
		"investments_transactions": invTxResp,
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

func createUserToken(c *gin.Context) {
	userToken, err := userTokenCreate()
	if err != nil {
		renderError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"user_token": userToken})
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
	user := plaid.LinkTokenCreateRequestUser{
		ClientUserId: time.Now().String(),
	}

	request := plaid.NewLinkTokenCreateRequest(
		"Plaid Quickstart",
		"en",
		countryCodes,
		user,
	)

	products := convertProducts(strings.Split(PLAID_PRODUCTS, ","))
	if paymentInitiation != nil {
		request.SetPaymentInitiation(*paymentInitiation)
		// The 'payment_initiation' product has to be the only element in the 'products' list.
		request.SetProducts([]plaid.Products{plaid.PRODUCTS_PAYMENT_INITIATION})
	} else {
		request.SetProducts(products)
	}

	if containsProduct(products, plaid.PRODUCTS_STATEMENTS) {
		statementConfig := plaid.NewLinkTokenCreateRequestStatements(
			time.Now().Local().Add(-30*24*time.Hour).Format("2006-01-02"),
			time.Now().Local().Format("2006-01-02"),
		)
		request.SetStatements(*statementConfig)
	}

	if containsProduct(products, plaid.PRODUCTS_CRA_BASE_REPORT) ||
		containsProduct(products, plaid.PRODUCTS_CRA_INCOME_INSIGHTS) ||
		containsProduct(products, plaid.PRODUCTS_CRA_PARTNER_INSIGHTS) {
		request.SetUserToken(userToken)
		request.SetConsumerReportPermissiblePurpose(plaid.CONSUMERREPORTPERMISSIBLEPURPOSE_ACCOUNT_REVIEW_CREDIT)
		request.SetCraOptions(*plaid.NewLinkTokenCreateRequestCraOptions(60))
	}

	if redirectURI != "" {
		request.SetRedirectUri(redirectURI)
	}

	linkTokenCreateResp, _, err := client.PlaidApi.LinkTokenCreate(ctx).LinkTokenCreateRequest(*request).Execute()

	if err != nil {
		return "", err
	}

	return linkTokenCreateResp.GetLinkToken(), nil
}

// Create a user token which can be used for Plaid Check, Income, or Multi-Item link flows
// https://plaid.com/docs/api/users/#usercreate
func userTokenCreate() (string, error) {
	ctx := context.Background()

	request := plaid.NewUserCreateRequest(
		// Typically this will be a user ID number from your application.
		time.Now().String(),
	)

	products := convertProducts(strings.Split(PLAID_PRODUCTS, ","))
	if containsProduct(products, plaid.PRODUCTS_CRA_BASE_REPORT) ||
		containsProduct(products, plaid.PRODUCTS_CRA_INCOME_INSIGHTS) ||
		containsProduct(products, plaid.PRODUCTS_CRA_PARTNER_INSIGHTS) {
		city := "New York"
		region := "NY"
		street := "4 Privet Drive"
		postalCode := "11111"
		country := "US"
		addressData := plaid.AddressData{
			City:       *plaid.NewNullableString(&city),
			Region:     *plaid.NewNullableString(&region),
			Street:     street,
			PostalCode: *plaid.NewNullableString(&postalCode),
			Country:    *plaid.NewNullableString(&country),
		}

		request.SetConsumerReportUserIdentity(*plaid.NewConsumerReportUserIdentity(
			"Harry",
			"Potter",
			[]string{"+16174567890"},
			[]string{"harrypotter@example.com"},
			addressData,
		))
	}

	userCreateResp, _, err := client.PlaidApi.UserCreate(ctx).UserCreateRequest(*request).Execute()

	if err != nil {
		return "", err
	}

	userToken = userCreateResp.GetUserToken()

	return userCreateResp.GetUserToken(), nil
}

func statements(c *gin.Context) {
	ctx := context.Background()
	statementsListResp, _, err := client.PlaidApi.StatementsList(ctx).StatementsListRequest(
		*plaid.NewStatementsListRequest(accessToken),
	).Execute()
	statementId := statementsListResp.GetAccounts()[0].GetStatements()[0].StatementId

	statementsDownloadResp, _, err := client.PlaidApi.StatementsDownload(ctx).StatementsDownloadRequest(
		*plaid.NewStatementsDownloadRequest(accessToken, statementId),
	).Execute()
	if err != nil {
		renderError(c, err)
		return
	}

	reader := bufio.NewReader(statementsDownloadResp)
	content, err := io.ReadAll(reader)
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

	createRequest := plaid.NewAssetReportCreateRequest(10)
	createRequest.SetAccessTokens([]string{accessToken})

	// create the asset report
	assetReportCreateResp, _, err := client.PlaidApi.AssetReportCreate(ctx).AssetReportCreateRequest(
		*createRequest,
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
	content, err := io.ReadAll(reader)
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
	return pollWithRetries(func() (*plaid.AssetReportGetResponse, error) {
		request := plaid.NewAssetReportGetRequest()
		request.SetAssetReportToken(assetReportToken)
		response, _, err := client.PlaidApi.AssetReportGet(ctx).AssetReportGetRequest(*request).Execute()
		return &response, err
	}, 1000, 20)
}

// Retrieve CRA Base Report and PDF
// Base report: https://plaid.com/docs/check/api/#cracheck_reportbase_reportget
// PDF: https://plaid.com/docs/check/api/#cracheck_reportpdfget
func getCraBaseReportHandler(c *gin.Context) {
	ctx := context.Background()
	getResponse, err := getCraBaseReportWithRetries(ctx, userToken)
	if err != nil {
		renderError(c, err)
		return
	}

	pdfRequest := plaid.NewCraCheckReportPDFGetRequest()
	pdfRequest.SetUserToken(userToken)
	pdfResponse, _, err := client.PlaidApi.CraCheckReportPdfGet(ctx).CraCheckReportPDFGetRequest(*pdfRequest).Execute()
	if err != nil {
		renderError(c, err)
		return
	}

	reader := bufio.NewReader(pdfResponse)
	content, err := io.ReadAll(reader)
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

func getCraBaseReportWithRetries(ctx context.Context, userToken string) (*plaid.CraCheckReportBaseReportGetResponse, error) {
	return pollWithRetries(func() (*plaid.CraCheckReportBaseReportGetResponse, error) {
		request := plaid.NewCraCheckReportBaseReportGetRequest()
		request.SetUserToken(userToken)
		response, _, err := client.PlaidApi.CraCheckReportBaseReportGet(ctx).CraCheckReportBaseReportGetRequest(*request).Execute()
		return &response, err
	}, 1000, 20)
}

// Retrieve CRA Income Insights and PDF with Insights
// Income insights: https://plaid.com/docs/check/api/#cracheck_reportincome_insightsget
// PDF w/ income insights: https://plaid.com/docs/check/api/#cracheck_reportpdfget
func getCraIncomeInsightsHandler(c *gin.Context) {
	ctx := context.Background()
	getResponse, err := getCraIncomeInsightsWithRetries(ctx, userToken)
	if err != nil {
		renderError(c, err)
		return
	}

	pdfRequest := plaid.NewCraCheckReportPDFGetRequest()
	pdfRequest.SetUserToken(userToken)
	pdfRequest.SetAddOns([]plaid.CraPDFAddOns{plaid.CRAPDFADDONS_CRA_INCOME_INSIGHTS})
	pdfResponse, _, err := client.PlaidApi.CraCheckReportPdfGet(ctx).CraCheckReportPDFGetRequest(*pdfRequest).Execute()
	if err != nil {
		renderError(c, err)
		return
	}

	reader := bufio.NewReader(pdfResponse)
	content, err := io.ReadAll(reader)
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

func getCraIncomeInsightsWithRetries(ctx context.Context, userToken string) (*plaid.CraCheckReportIncomeInsightsGetResponse, error) {
	return pollWithRetries(func() (*plaid.CraCheckReportIncomeInsightsGetResponse, error) {
		request := plaid.NewCraCheckReportIncomeInsightsGetRequest()
		request.SetUserToken(userToken)
		response, _, err := client.PlaidApi.CraCheckReportIncomeInsightsGet(ctx).CraCheckReportIncomeInsightsGetRequest(*request).Execute()
		return &response, err
	}, 1000, 20)
}

// Retrieve CRA Partner Insights
// https://plaid.com/docs/check/api/#cracheck_reportpartner_insightsget
func getCraPartnerInsightsHandler(c *gin.Context) {
	ctx := context.Background()
	getResponse, err := getCraPartnerInsightsWithRetries(ctx, userToken)
	if err != nil {
		renderError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"report": getResponse.Report,
	})
}

func getCraPartnerInsightsWithRetries(ctx context.Context, userToken string) (*plaid.CraCheckReportPartnerInsightsGetResponse, error) {
	return pollWithRetries(func() (*plaid.CraCheckReportPartnerInsightsGetResponse, error) {
		request := plaid.NewCraCheckReportPartnerInsightsGetRequest()
		request.SetUserToken(userToken)
		response, _, err := client.PlaidApi.CraCheckReportPartnerInsightsGet(ctx).CraCheckReportPartnerInsightsGetRequest(*request).Execute()
		return &response, err
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
		plaidErr, err := plaid.ToPlaidError(err)
		if plaidErr.ErrorCode != "PRODUCT_NOT_READY" {
			return zero, err
		}
		time.Sleep(time.Duration(ms) * time.Millisecond)
		return pollWithRetries[T](requestCallback, ms, retriesLeft-1)
	}
	return response, nil
}
