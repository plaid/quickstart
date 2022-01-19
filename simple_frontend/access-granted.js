const HOST = "http://localhost:8000";

async function getAccountList() {
  const accountListResponse = await fetch(`${HOST}/api/accounts`, {
    method: "GET",
  });
  accountData = await accountListResponse.json();
  document.querySelector(
    "#resultText"
  ).textContent = `Here's your account data! ${JSON.stringify(accountData)}`;
}

async function getTransactions() {
  const transactionResponse = await fetch(`${HOST}/api/transactions`, {
    method: "GET",
  });
  const transactionData = await transactionResponse.json();
  document.querySelector(
    "#resultText"
  ).textContent = `Here is your transaction data! ${JSON.stringify(
    transactionData
  )}`;
}

document.querySelector("#seeAccountsBtn").addEventListener("click", (_) => {
  getAccountList();
});

document.querySelector("#seeTransactionsBtn").addEventListener("click", (_) => {
  getTransactions();
});
