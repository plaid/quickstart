package main

import (
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/plaid/plaid-go/plaid"
)

// Fill in your Plaid API keys - https://dashboard.plaid.com/account/keys
var (
	PLAID_CLIENT_ID  = os.Getenv("PLAID_CLIENT_ID")
	PLAID_SECRET     = os.Getenv("PLAID_SECRET")
	PLAID_PUBLIC_KEY = os.Getenv("PLAID_PUBLIC_KEY")
	// Use 'sandbox' to test with Plaid's Sandbox environment (username: user_good,
	// password: pass_good)
	// Use `development` to test with live users and credentials and `production`
	// to go live
	PLAID_ENV = os.Getenv("PLAID_ENV")

	APP_PORT = os.Getenv("APP_PORT")
)

var client = plaid.NewClient(PLAID_CLIENT_ID, PLAID_SECRET, PLAID_PUBLIC_KEY, PLAID_ENV)
var accessToken string

func getAccessToken(c *gin.Context) {
	publicToken := c.PostForm("public_token")
	token, itemID, err := client.ExchangePublicToken(publicToken)
	accessToken = token

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

func accounts(c *gin.Context) {
	accounts, _, err := client.GetAuth(accessToken)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"accounts": accounts,
	})
}

func item(c *gin.Context) {
	item, err := client.GetItem(accessToken)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	institution, err := client.GetInstitutionByID(item.InstitutionID)

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

	accounts, transactions, err := client.GetTransactions(accessToken, startDate, endDate)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"accounts":     accounts,
		"transactions": transactions,
	})
}

func createPublicToken(c *gin.Context) {
	// Create a one-time use public_token for the Item. This public_token can be used to
	// initialize Link in update mode for the user.
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
	// Assign default values if environment variables are not set
	if PLAID_ENV == "" {
		PLAID_ENV = "sandbox"
	}
	if APP_PORT == "" {
		APP_PORT = "5000"
	}

	r := gin.Default()
	r.LoadHTMLFiles("templates/index.tmpl")
	r.Static("/static", "./static")

	r.GET("/", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.tmpl", gin.H{
			"plaid_environment": PLAID_ENV,
			"plaid_public_key":  PLAID_PUBLIC_KEY,
		})
	})
	r.POST("/get_access_token", getAccessToken)
	r.GET("/accounts", accounts)
	r.GET("/item", item)
	r.POST("/item", item)
	r.GET("/transactions", transactions)
	r.POST("/transactions", transactions)
	r.GET("/create_public_token", createPublicToken)

	r.Run(":" + APP_PORT)
}
