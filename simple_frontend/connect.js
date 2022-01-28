console.log(`Hello there world!`);

const HOST = "http://localhost:8000";
let linkData;

async function requestLinkToken(isPopup) {
  const linkTokenResponse = await fetch(`${HOST}/api/create_link_token`, {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({ forcePopup: isPopup }),
  });
  linkData = await linkTokenResponse.json();
  localStorage.setItem("linkData", JSON.stringify(linkData));

  console.log(`Link token created: ${JSON.stringify(linkData)}`);
  document.querySelector("#startLinkBtn").classList.remove("invisible");
}

async function exchangePublicTokenForAccessToken(public_token) {
  const tokenExchangeResponse = await fetch(`${HOST}/api/set_access_token`, {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({ public_token: public_token }),
  });
  tokenData = await tokenExchangeResponse.json();
  console.log(
    `This is already stored server-side, but here's your access token ${JSON.stringify(
      tokenData
    )}`
  );
  //TODO: We probably shouldn't redirect if we get back an error
  window.location.href = "index.html";
}

function startLinkProcess() {
  const handler = Plaid.create({
    token: linkData.link_token,
    onSuccess: (public_token, metadata) => {
      console.log(
        `I have a public token: ${public_token} I should exchange this`
      );
      exchangePublicTokenForAccessToken(public_token);
    },
    onExit: (err, metadata) => {
      console.log(`I'm all done. Here's your metadata ${metadata}`);
    },
    onEvent: (eventName, metadata) => {
      console.log(`Event ${eventName}`);
    },
  });
  handler.open();
}

document
  .querySelector("#initiateLinkBtn")
  .addEventListener("click", async () => {
    await requestLinkToken(false);
  });

document
  .querySelector("#initiateLinkBtnPopup")
  .addEventListener("click", async () => {
    await requestLinkToken(true);
  });

document.querySelector("#startLinkBtn").addEventListener("click", () => {
  startLinkProcess();
});
