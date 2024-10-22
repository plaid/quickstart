import axios from "axios";

// Configure Axios
const apiClient = axios.create({
  baseURL: "http://localhost:8000/api", // Replace with your server's base URL
  timeout: 10000,
});

// Function to test Auth endpoint
const testAuth = async () => {
  try {
    const response = await apiClient.get("/auth", {
      params: {
        access_token: "access-sandbox-e9ae1847-74a3-418b-9e0d-7984853a1bfc",
      },
    });
    console.log("Auth Response:", response.data);
  } catch (error) {
    console.error("Error testing Auth endpoint:", error);
  }
};

// Function to test Transactions endpoint and fetch the latest Zelle transaction
const testTransactions = async () => {
  try {
    const response = await apiClient.get("/transactions", {
      params: {
        access_token: "access-sandbox-e9ae1847-74a3-418b-9e0d-7984853a1bfc",
      },
    });
    console.log("Transactions Response:", response.data);

    // Filter Zelle transactions
    const zelleTransactions = response.data.latest_transactions.filter(
      (transaction) => transaction.name.includes("Zelle")
    );

    // Sort by date and get the latest transaction
    const latestZelleTransaction = zelleTransactions.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    )[0];

    if (latestZelleTransaction) {
      console.log("Latest Zelle Transaction:", latestZelleTransaction);
    } else {
      console.log("No Zelle transactions found.");
    }
  } catch (error) {
    console.error("Error testing Transactions endpoint:", error);
  }
};

// Function to test Balance endpoint
const testBalance = async () => {
  try {
    const response = await apiClient.get("/balance", {
      params: {
        access_token: "access-sandbox-e9ae1847-74a3-418b-9e0d-7984853a1bfc",
      },
    });
    console.log("Balance Response:", response.data);
  } catch (error) {
    console.error("Error testing Balance endpoint:", error);
  }
};

// Function to test Item endpoint
const testItem = async () => {
  try {
    const response = await apiClient.get("/item", {
      params: {
        access_token: "access-sandbox-e9ae1847-74a3-418b-9e0d-7984853a1bfc",
      },
    });
    console.log("Item Response:", response.data);
  } catch (error) {
    console.error("Error testing Item endpoint:", error);
  }
};

// Function to test Accounts endpoint
const testAccounts = async () => {
  try {
    const response = await apiClient.get("/accounts", {
      params: {
        access_token: "access-sandbox-e9ae1847-74a3-418b-9e0d-7984853a1bfc",
      },
    });
    console.log("Accounts Response:", response.data);
  } catch (error) {
    console.error("Error testing Accounts endpoint:", error);
  }
};

// Example usage
const runTests = async () => {
  await testAuth();
  await testTransactions();
};

runTests();
