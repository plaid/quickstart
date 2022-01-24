const HOST = "http://localhost:8000";

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

function handleReturningFromOAuth() {
  const link_token = JSON.parse(localStorage.getItem("linkData")).link_token;
  const handler = Plaid.create({
    token: link_token,
    onSuccess: async (public_token, metadata) => {
      console.log(
        `I have a public token: ${public_token} I should exchange this`
      );
      document.querySelector("#userMessage").textContent = "Almost there...";
      await exchangePublicTokenForAccessToken(public_token);
    },
    onExit: (err, metadata) => {
      console.log(
        `I'm all done. Error: ${JSON.stringify(
          err
        )} and metadata ${JSON.stringify(metadata)}`
      );
      if (err !== undefined) {
        document.querySelector("#userMessage").innerHTML =
          'Something went wrong. Please <a href="index.html" class="underline">try again.</a>';
      }
    },
    onEvent: (eventName, metadata) => {
      console.log(`Event ${eventName}: Data ${JSON.stringify(metadata)}`);
    },
    receivedRedirectUri: window.location.href,
  });
  handler.open();
}

handleReturningFromOAuth();
