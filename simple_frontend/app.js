const HOST = "http://localhost:8000";

async function getConnectedStatus() {
  const connectedStatusResponse = await fetch(`${HOST}/api/is_user_connected`, {
    method: "GET",
  });
  connectedData = await connectedStatusResponse.json();
  console.log(JSON.stringify(connectedData));
  if (connectedData.connected === true) {
    document.querySelector("#connectedUI").classList.remove("hidden");
  } else {
    document.querySelector("#disconnectedUI").classList.remove("hidden");
  }
}

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

getConnectedStatus();
