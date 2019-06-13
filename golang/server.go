package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/plaid/plaid-go/plaid"
)

// this can be moved out of main...
type UserCredentials struct {
	Client      *plaid.Client
	PublicToken string
	AccessToken string
	ItemID      string
}

//Loads .env file
//Creates new plaid client based on these options
func CreateNewClient() *plaid.Client {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	clientOptions := plaid.ClientOptions{
		os.Getenv("PLAID_CLIENT_ID"),
		os.Getenv("PLAID_SECRET"),
		os.Getenv("PLAID_PUBLIC_KEY"),
		plaid.Sandbox,  // Available environments are Sandbox, Development, and Production
		&http.Client{}, // This parameter is optional
	}
	client, err := plaid.NewClient(clientOptions)
	handleError(err)
	return client
}

// Gets Public Token from request body of /set-access-token
// Passed into ExchangePublicToken
func GetPublicToken(c *gin.Context) string {
	c.Header("Content-Type", "application/json")
	c.JSON(http.StatusOK, gin.H{
		"message": "acesss token",
	})
	buf := new(bytes.Buffer)
	buf.ReadFrom(c.Request.Body)
	public_token := buf.String()
	return public_token
}

// Exchanges public token for user credentials
// Returns these credentials into UserCredentials Struct with NewUserCredentials
// (These struct values are then used for all the other routes)
func (uc *UserCredentials) ExchangePublicToken(c *gin.Context, cl *plaid.Client) {
	public_token := GetPublicToken(c)

	// POST /item/public_token/exchange
	accessTokenResp, err := cl.ExchangePublicToken(public_token)
	handleError(err)

	uc.Client = cl
	uc.PublicToken = public_token
	uc.AccessToken = accessTokenResp.AccessToken
	uc.ItemID = accessTokenResp.ItemID
}

func (uc UserCredentials) GetBalances(c *gin.Context, cl *plaid.Client) {
	// POST /acounts/balances/get
	balanceResp, err := cl.GetBalances(uc.AccessToken)
	handleError(err)

	c.Header("Content-Type", "application/json")
	c.JSON(http.StatusOK, map[string]interface{}{
		"Account Name:":    balanceResp.Accounts[0].Name,
		"Account Balance:": balanceResp.Accounts[0].Balances.Available,
	})
}

func (uc UserCredentials) GetAccounts(c *gin.Context, cl *plaid.Client) {
	// POST /accounts/get
	accountsResp, err := cl.GetAccounts(uc.AccessToken)
	handleError(err)
	c.JSON(http.StatusOK, map[string]interface{}{
		"Accounts:": accountsResp.Accounts,
	})
}

func (uc UserCredentials) GetAuth(c *gin.Context, cl *plaid.Client) {
	// POST /auth/get
	authResp, err := cl.GetAuth(uc.AccessToken)
	handleError(err)
	c.JSON(http.StatusOK, map[string]interface{}{
		"Account Number:": authResp.Numbers.ACH[0].Account,
	})
}

func (uc UserCredentials) GetTransactions(c *gin.Context, cl *plaid.Client) {
	// POST /transactions/get
	transactionsResp, err := cl.GetTransactions(uc.AccessToken, "2010-01-01", "2018-01-01")
	if plaidErr, ok := err.(plaid.Error); ok {
		// Poll until transactions are ready
		for ok && plaidErr.ErrorCode == "PRODUCT_NOT_READY" {
			time.Sleep(5 * time.Second)
			transactionsResp, err = cl.GetTransactions(uc.AccessToken, "2010-01-01", "2018-01-01")
			plaidErr, ok = err.(plaid.Error)
		}
		handleError(err)
	}
	c.JSON(http.StatusOK, map[string]interface{}{
		"Transactions:": transactionsResp.Transactions,
	})
	t, err := json.MarshalIndent(transactionsResp.Transactions, "", "    ")
	if err != nil {
		fmt.Println("error", err)
	}
	os.Stdout.Write(t)
}

func main() {
	cl := CreateNewClient()
	uc := UserCredentials{}

	router := gin.Default()
	api := router.Group("/api")

	api.POST("/set_access_token", func(c *gin.Context) { uc.ExchangePublicToken(c, cl) })

	api.GET("/auth", func(c *gin.Context) { uc.GetAuth(c, cl) })
	api.GET("/accounts", func(c *gin.Context) { uc.GetAccounts(c, cl) })
	api.GET("/balances", func(c *gin.Context) { uc.GetBalances(c, cl) })
	api.GET("/transactions", func(c *gin.Context) { uc.GetTransactions(c, cl) })
	// Start and run the server
	router.Run(":8080")
}

func handleError(err error) {
	if err != nil {
		panic(err)
	}
}
