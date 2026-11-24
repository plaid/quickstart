# Notes for coding agents

This repo is Plaid's Quickstart: a React frontend and five equivalent backends (Node, Python, Ruby, Java, Go) that link a bank account and call a few Plaid products. Use it as a reference for the flow and the SDK calls.

## The minimum integration

Four pieces. The rest of the backends (Transfer, Plaid Check, Payment Initiation, Signal, Income and others) covers optional products. Leave it out unless the user asks for that product.

1. **Create a link_token** on the server (`/link/token/create`) and return it to the frontend.
2. **Open Link** in the frontend with that token. `onSuccess` gives a `public_token`; send it to the server.
3. **Exchange** the `public_token` for an `access_token` and `item_id` on the server (`/item/public_token/exchange`).
4. **Store** the `access_token` and `item_id` with the user who linked the bank, then pass the token to product calls such as `/accounts/get`.

Where each piece lives:

| Piece | Node `node/index.js` | Python `python/server.py` | Ruby `ruby/app.rb` | Java `java/src/main/java/com/plaid/quickstart/resources/` | Go `go/server.go` |
|---|---|---|---|---|---|
| 1 | `app.post('/api/create_link_token'` | `@app.route('/api/create_link_token'` | `post '/api/create_link_token'` | `LinkTokenResource.java` | `func createLinkToken`, `func linkTokenCreate` |
| 3 | `app.post('/api/set_access_token'` | `@app.route('/api/set_access_token'` | `post '/api/set_access_token'` | `AccessTokenResource.java` | `func getAccessToken` |
| 4 | `app.get('/api/accounts'` | `@app.route('/api/accounts'` | `get '/api/accounts'` | `AccountsResource.java` | `func accounts` |

Piece 2 is `const Link` in `frontend/src/Components/Link/index.tsx` (`react-plaid-link`). For other frontends, follow Plaid's Link guide for that platform: [web](https://plaid.com/docs/link/web/), [iOS](https://plaid.com/docs/link/ios/), [Android](https://plaid.com/docs/link/android/), [React Native](https://plaid.com/docs/link/react-native/). On iOS, LinkKit 7 replaced the handler-based API with `Plaid.createPlaidLinkSession`.

## Don't copy these parts

- **One token per server.** The backends keep the `access_token` in a module-level variable because the Quickstart has one local user and no database. A real app stores one per Item, tied to its user, server-side and encrypted at rest.
- **Returning the token to the browser.** Every backend's `/api/set_access_token` sends the `access_token` back so the demo can display it. Return only what the frontend needs, such as a success flag.
- **Token logging.** Node and Ruby print the whole exchange response, and Java and Go log the `public_token` and `access_token`. Keep tokens out of logs.
- **`.env` in production.** Production secrets belong in the app's secret store.
- **`PLAID_PRODUCTS` from the environment.** Hard-code the products your app needs.

## Keys

Never ask the user to paste a `client_id` or `secret` into chat. Have them install the [Plaid CLI](https://plaid.com/docs/resources/cli/), then run `plaid login` and `plaid agent setup` in their app's repo.

## SDK versions

Install the latest official SDK from the package registry, not a version you remember.

## Docs

Every docs page has a markdown version at its URL plus `index.html.md`, and [llms.txt](https://plaid.com/docs/llms.txt) indexes them. Before building past the four pieces, read:

- [Launch checklist](https://plaid.com/docs/launch-checklist/), including the Dashboard steps only the user can do
- [OAuth](https://plaid.com/docs/link/oauth/)
- [Update mode](https://plaid.com/docs/link/update-mode/)
- [Webhooks](https://plaid.com/docs/api/webhooks/)
- [Vibe coding tips](https://plaid.com/docs/resources/vibe-coding/)
