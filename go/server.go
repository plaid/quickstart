package main

import (
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/plaid/plaid-go/plaid"
)

// Fill with your Plaid API keys - https://dashboard.plaid.com/account/keys
var (
	PLAID_CLIENT_ID  = os.Getenv("PLAID_CLIENT_ID")
	PLAID_SECRET     = os.Getenv("PLAID_SECRET")
	PLAID_PUBLIC_KEY = os.Getenv("PLAID_PUBLIC_KEY")
	// Use 'sandbox' to test with fake credentials in Plaid's Sandbox environment
	// Use `development` to test with real credentials while developing
	// Use `production` to go live with real users
	APP_PORT = os.Getenv("APP_PORT")
)

var clientOptions = plaid.ClientOptions{
	PLAID_CLIENT_ID,
	PLAID_SECRET,
	PLAID_PUBLIC_KEY,
	plaid.Sandbox, // Available environments are Sandbox, Development, and Production
	&http.Client{},
}

var client, err = plaid.NewClient(clientOptions)

var accessToken string
var itemID string

func getAccessToken(c *gin.Context) {
	publicToken := c.PostForm("public_token")
	response, err := client.ExchangePublicToken(publicToken)
	accessToken = response.AccessToken
	itemID = response.ItemID

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	fmt.Println("public token: " + publicToken)
	fmt.Println("access token: " + accessToken)
	fmt.Println("item ID: " + itemID)

	c.JSON(http.StatusOK, gin.H{
		"access_token": accessToken,
		"item_id":      itemID,
	})
}

func auth(c *gin.Context) {
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
		"item":        item,
		"institution": institution,
	})
}

func transactions(c *gin.Context) {
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

func createPublicToken(c *gin.Context) {
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

func main() {
	if APP_PORT == "" {
		APP_PORT = "8000"
	}

	r := gin.Default()
	r.LoadHTMLFiles("templates/index.tmpl")
	r.Static("/static", "./static")

	r.GET("/", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.tmpl", gin.H{
			"plaid_environment": plaid.Sandbox,
			"plaid_public_key":  PLAID_PUBLIC_KEY,
		})
	})

	// Setup our internal API routes
	api := r.Group("/api")

	api.POST("/get_access_token", getAccessToken)
	api.GET("/auth", auth)
	api.GET("/accounts", accounts)
	api.GET("/balance", balance)
	api.GET("/item", item)
	api.POST("/item", item)
	api.GET("/transactions", transactions)
	api.POST("/transactions", transactions)
	api.GET("/create_public_token", createPublicToken)

	r.Run(":" + APP_PORT)
}
