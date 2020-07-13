package main

import (
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/plaid/plaid-go/plaid"
)

func init() {
	if PLAID_PRODUCTS == "" {
		PLAID_PRODUCTS = "transactions"
	}
	if PLAID_COUNTRY_CODES == "" {
		PLAID_COUNTRY_CODES = "US"
	}
}

// Fill with your Plaid API keys - https://dashboard.plaid.com/account/keys
var (
	PLAID_CLIENT_ID     = os.Getenv("PLAID_CLIENT_ID")
	PLAID_SECRET        = os.Getenv("PLAID_SECRET")
	PLAID_PRODUCTS      = os.Getenv("PLAID_PRODUCTS")
	PLAID_COUNTRY_CODES = os.Getenv("PLAID_COUNTRY_CODES")
	// Parameters used for the OAuth redirect Link flow.
	//
	// Set PLAID_OAUTH_REDIRECT_URI to 'http://localhost:8000/oauth-response.html'
	// The OAuth redirect flow requires an endpoint on the developer's website
	// that the bank website should redirect to. You will need to configure
	// this redirect URI for your client ID through the Plaid developer dashboard
	// at https://dashboard.plaid.com/team/api.
	PLAID_OAUTH_REDIRECT_URI = os.Getenv("PLAID_OAUTH_REDIRECT_URI")
	// Set PLAID_OAUTH_NONCE to a unique identifier such as a UUID for each Link
	// session. The nonce will be used to re-open Link upon completion of the OAuth
	// redirect. The nonce must be at least 16 characters long.
	PLAID_OAUTH_NONCE = os.Getenv("PLAID_OAUTH_NONCE")

	// Use 'sandbox' to test with fake credentials in Plaid's Sandbox environment
	// Use `development` to test with real credentials while developing
	// Use `production` to go live with real users
	APP_PORT = os.Getenv("APP_PORT")
)

func createClient(environment plaid.Environment) (client *plaid.Client, err error) {
	return plaid.NewClient(plaid.ClientOptions{
		PLAID_CLIENT_ID,
		PLAID_SECRET,
		environment, // Available environments are Sandbox, Development, and Production
		&http.Client{},
	})
}

// We store the access_token in memory - in production, store it in a secure
// persistent data store.
var accessToken string
var itemID string

// The payment_token is only relevant for the UK Payment Initiation product.
// We store the payment_token in memory - in production, store it in a secure
// persistent data store.
var paymentToken string
var paymentID string

func getAccessToken(c *gin.Context) {
	publicToken := c.PostForm("public_token")
	client, err := createClient(plaid.Sandbox)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	response, err := client.ExchangePublicToken(publicToken)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	accessToken = response.AccessToken
	itemID = response.ItemID

	fmt.Println("public token: " + publicToken)
	fmt.Println("access token: " + accessToken)
	fmt.Println("item ID: " + itemID)

	c.JSON(http.StatusOK, gin.H{
		"access_token": accessToken,
		"item_id":      itemID,
	})
}

// This functionality is only relevant for the UK Payment Initiation product.
// Sets the payment token in memory on the server side. We generate a new
// payment token so that the developer is not required to supply one.
// This makes the quickstart easier to use.
func setPaymentToken(c *gin.Context) {
	client, err := createClient(plaid.Sandbox)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	recipientCreateResp, err := client.CreatePaymentRecipient(
		"Harry Potter",
		"GB33BUKB20201555555555",
		&plaid.PaymentRecipientAddress{
			Street:     []string{"4 Privet Drive"},
			City:       "Little Whinging",
			PostalCode: "11111",
			Country:    "GB",
		})
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	recipientID := recipientCreateResp.RecipientID

	paymentCreateResp, err := client.CreatePayment(recipientID, "payment-ref", plaid.PaymentAmount{
		Currency: "GBP",
		Value:    12.34,
	})
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	paymentID = paymentCreateResp.PaymentID

	paymentTokenCreateResp, err := client.CreatePaymentToken(paymentID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	paymentToken = paymentTokenCreateResp.PaymentToken

	fmt.Println("payment token: " + paymentToken)
	fmt.Println("payment id: " + paymentID)

	c.JSON(http.StatusOK, gin.H{
		"payment_token": paymentToken,
	})
}

func auth(c *gin.Context) {
	client, err := createClient(plaid.Sandbox)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	response, err := client.GetAuth(accessToken)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"accounts": response.Accounts,
		"numbers":  response.Numbers,
	})
}

func accounts(c *gin.Context) {
	client, err := createClient(plaid.Sandbox)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	response, err := client.GetAccounts(accessToken)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"accounts": response.Accounts,
	})
}

func balance(c *gin.Context) {
	client, err := createClient(plaid.Sandbox)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	response, err := client.GetBalances(accessToken)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"accounts": response.Accounts,
	})
}

func item(c *gin.Context) {
	client, err := createClient(plaid.Sandbox)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	response, err := client.GetItem(accessToken)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	institution, err := client.GetInstitutionByID(response.Item.InstitutionID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"item":        response.Item,
		"institution": institution.Institution,
	})
}

func identity(c *gin.Context) {
	client, err := createClient(plaid.Sandbox)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	response, err := client.GetIdentity(accessToken)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"identity": response.Accounts,
	})
}

func transactions(c *gin.Context) {
	client, err := createClient(plaid.Sandbox)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	// pull transactions for the past 30 days
	endDate := time.Now().Local().Format("2006-01-02")
	startDate := time.Now().Local().Add(-30 * 24 * time.Hour).Format("2006-01-02")

	response, err := client.GetTransactions(accessToken, startDate, endDate)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"accounts":     response.Accounts,
		"transactions": response.Transactions,
	})
}

// This functionality is only relevant for the UK Payment Initiation product.
// Retrieve Payment for a specified Payment ID
func payment(c *gin.Context) {
	client, err := createClient(plaid.Sandbox)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	response, err := client.GetPayment(paymentID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"payment": response.Payment,
	})
}

func createPublicToken(c *gin.Context) {
	client, err := createClient(plaid.Sandbox)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	// Create a one-time use public_token for the Item.
	// This public_token can be used to initialize Link in update mode for a user
	publicToken, err := client.CreatePublicToken(accessToken)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"public_token": publicToken,
	})
}

var envMapping = map[string]plaid.Environment{
	"sandbox":     plaid.Sandbox,
	"production":  plaid.Production,
	"development": plaid.Development,
}

func createLinkToken(c *gin.Context) {
	isOAuthParam := c.PostForm("is_oauth")
	isOAuth := false
	if isOAuthParam == "true" {
		isOAuth = true
	}

	env := "sandbox"
	countryCodes := strings.Split(PLAID_COUNTRY_CODES, ",")
	products := strings.Split(PLAID_PRODUCTS, ",")
	oAuthRedirectURI := ""
	if isOAuth {
		oAuthRedirectURI = PLAID_OAUTH_REDIRECT_URI
	}
	fmt.Println("args", map[string]interface{}{
		"env":          env,
		"countryCodes": countryCodes,
		"products":     products,
		"redirectURI":  PLAID_OAUTH_REDIRECT_URI,
	})
	// TODO: oauthNonce
	mappedEnv, ok := envMapping[env]
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid environment. Valid environments are sandbox, production, an development"})
	}
	client, err := createClient(mappedEnv)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	resp, err := client.CreateLinkToken(plaid.LinkTokenConfigs{
		User: &plaid.LinkTokenUser{
			ClientUserID: "user-id",
		},
		ClientName:   "Plaid Quickstart",
		Products:     products,
		CountryCodes: countryCodes,
		// Webhook:               "https://example.com/webhook",
		Language:           "en",
		RedirectUri:        oAuthRedirectURI,
		AndroidPackageName: "",
	})
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"link_token": resp.LinkToken,
	})
}

func main() {
	if APP_PORT == "" {
		APP_PORT = "8000"
	}

	r := gin.Default()
	r.LoadHTMLFiles("templates/index.tmpl", "templates/oauth-response.tmpl")
	r.Static("/static", "./static")

	r.GET("/", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.tmpl", gin.H{
			//"plaid_oauth_redirect_uri": PLAID_OAUTH_REDIRECT_URI,
			//"plaid_oauth_nonce":        PLAID_OAUTH_NONCE,
			"item_id":      itemID,
			"access_token": accessToken,
		})
	})

	r.GET("/oauth-response.html", func(c *gin.Context) {
		c.HTML(http.StatusOK, "oauth-response.tmpl", gin.H{
			"plaid_environment":   "sandbox", // Switch this environment
			"plaid_products":      PLAID_PRODUCTS,
			"plaid_country_codes": PLAID_COUNTRY_CODES,
			"plaid_oauth_nonce":   PLAID_OAUTH_NONCE,
		})
	})

	r.POST("/set_access_token", getAccessToken)
	r.POST("/set_payment_token", setPaymentToken)
	r.GET("/auth", auth)
	r.GET("/accounts", accounts)
	r.GET("/balance", balance)
	r.GET("/item", item)
	r.POST("/item", item)
	r.GET("/identity", identity)
	r.GET("/transactions", transactions)
	r.POST("/transactions", transactions)
	r.GET("/payment", payment)
	r.GET("/create_public_token", createPublicToken)
	r.POST("/create_link_token", createLinkToken)

	r.Run(":" + APP_PORT)
}
