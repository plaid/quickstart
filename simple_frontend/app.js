console.log(`Hello there world!`);

const HOST = "http://localhost:8000";
let linkData;

async function requestLinkToken() {
  const linkTokenResponse = await fetch(`${HOST}/api/create_link_token`, {
    method: "POST",
  });
  linkData = await linkTokenResponse.json();
  localStorage.setItem("linkData", JSON.stringify(linkData));

  console.log(`Link token created: ${JSON.stringify(linkData)}`);
  document.querySelector("#startLinkBtn").classList.remove("invisible");
}

function startLinkProcess() {
  const handler = Plaid.create({
    token: linkData.link_token,
    onSuccess: (public_token, metadata) => {
      console.log(
        `I have a public token: ${public_token} I should exchange this`
      );
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
    await requestLinkToken();
  });

document.querySelector("#startLinkBtn").addEventListener("click", async () => {
  await startLinkProcess();
});
