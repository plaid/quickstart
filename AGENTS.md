# Notes for coding agents

This repo is Plaid's Quickstart: one React frontend and five equivalent backends (Node, Python, Ruby, Java, Go) that link a bank account and call a few Plaid products. People usually point an agent here to add Plaid to their own app. Use it as a reference for the flow and the SDK calls, not as a template to copy whole.

## The minimum integration

Four pieces. Everything else in the backends (Transfer, Plaid Check, Payment Initiation, Signal, Income and the rest) is optional product coverage. Leave it out unless the user asks for that product.

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

Piece 2 is `const Link` in `frontend/src/Components/Link/index.tsx` (`react-plaid-link`). For other frontends, follow Plaid's Link guide for that platform: [web](https://plaid.com/docs/link/web/), [iOS](https://plaid.com/docs/link/ios/), [Android](https://plaid.com/docs/link/android/), [React Native](https://plaid.com/docs/link/react-native/).

## Don't copy these parts

- **One token per server.** The backends keep the `access_token` in a module-level variable because the Quickstart has one local user and no database. A real app stores one per Item, tied to its user, server-side only, encrypted at rest, and never returns it to the browser.
- **Returning the token to the browser.** Every backend's `/api/set_access_token` sends the `access_token` back so the demo can display it. Return only what the frontend needs, such as a success flag.
- **Token logging.** Node and Ruby print the whole exchange response, and Java and Go log the `public_token` and `access_token`. Keep tokens out of logs.
- **`.env` in production.** `.env` is for local development. Production secrets belong in the app's secret store.
- **`PLAID_PRODUCTS` from the environment.** The Quickstart reads products and country codes from `.env` so one app can demo many products. Hard-code the products your app needs.

## Keys

Never ask the user to paste a `client_id` or `secret` into chat. The [Plaid CLI](https://plaid.com/docs/resources/cli/) already ships guidance for coding agents, so have the user run this once in their own app's repo:

```bash
brew install plaid/plaid-cli/plaid
plaid login          # opens a browser; only the user can do this
plaid agent setup    # installs a Plaid skill into .claude or .cursor
```

That skill covers credentials. In short: `plaid keys write --env sandbox --gitignore` writes keys to `.env`, and `plaid doctor` checks the setup.

## SDK versions

Install the latest version of the official SDK from the package registry instead of a version you remember; Plaid releases often and older versions are missing current endpoints. This repo pins, at the time of writing: `plaid` 51 (Node), `plaid_python` 45, `plaid` gem 54, `plaid-java` 46, `plaid-go/v49`, and `react-plaid-link` 5. LinkKit 7 on iOS replaced the handler-based API with `Plaid.createPlaidLinkSession`.

## Test in Sandbox first

- `plaid sandbox link` creates a Sandbox Item with no UI.
- In Link, the Sandbox credentials are `user_good` / `pass_good`.
- Running this Quickstart with the same keys is a quick way to tell whether a problem is in your app or in your keys and Dashboard setup.

## Steps only the user can do

These happen in the [Plaid Dashboard](https://dashboard.plaid.com). Tell the user when they're needed instead of working around them:

- **Production access.** `plaid trial` applies for a Trial plan.
- **Allowed redirect URIs.** Every `redirect_uri` sent to `/link/token/create` must be registered, and it must be HTTPS in Production. OAuth banks need one.
- **Data Transparency Messaging.** Production Link needs a use case for the products requested, or it won't open.

## Docs

Every docs page has a markdown version: append `index.html.md` to its URL. The index is [plaid.com/docs/llms.txt](https://plaid.com/docs/llms.txt). Read before building past the four pieces above:

- [Launch checklist](https://plaid.com/docs/launch-checklist/)
- [Update mode](https://plaid.com/docs/link/update-mode/), for Items that need the user to sign in again
- [Webhooks](https://plaid.com/docs/api/webhooks/)
- [OAuth](https://plaid.com/docs/link/oauth/)
- [Vibe coding tips](https://plaid.com/docs/resources/vibe-coding/)
