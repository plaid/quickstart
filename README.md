# Plaid quickstart

This repository accompanies Plaid's [**quickstart guide**][quickstart].

Here you'll find full example integration apps using our [**client libraries**][libraries]:

- [Go][go-example]
- [Node][node-example]
- [Ruby][ruby-example]
- [Python][python-example]
- [Java][java-example]

If [docker][docker] is available to you, you can quickly spin up an example using: `% make QUICKSTART=go up`.
Be sure to have `PLAID_CLIENT_ID` and `PLAID_SECRET` defined in your environment or
replace the respective `${VARIABLES}` in the `x-environment` section in
[`docker-compose.yml`](/docker-compose.yml) directly.

To further adjust the quickstart to your use-case, you can define `PLAID_PRODUCTS`, `PLAID_COUNTRY_CODES`,
`PLAID_REDIRECT_URI` in your environment or set the respective `${VARIABLES}` in in the `x-environment`
section in [`docker-compose.yml`](/docker-compose.yml) directly.

Note - If you are attempting to test out the OAuth flow, you will need to register your
`PLAID_REDIRECT_URI` in the [Plaid dashboard][dashboard-api-section]. OAuth flows are only testable in the `sandbox`
environment in this quickstart app due to an https `redirect_uri` being required in other environments. Additionally, if you want to use
the [Payment Initiation][payment-initiation] product, you will need to [contact Sales][contact-sales] to get this product enabled.

## Special instructions for Windows

Note - To run this on a windows machine please use the following command when cloning the project

```
git clone -c core.symlinks=true https://github.com/plaid/quickstart
```

## Further instructions
To see the log output of the quickstart run: `% make QUICKSTART=go logs` (when done, quit using `CTRL-C`).

To stop the quickstart use: `% make QUICKSTART=go stop`

Replace `go` in the command examples above with the name of the quickstart you want to start, e.g. `python`.

![Plaid quickstart app](/assets/quickstart-screenshot.png)

[quickstart]: https://plaid.com/docs/quickstart
[libraries]: https://plaid.com/docs/libraries
[payment-initiation]: https://plaid.com/docs/#payment-initiation
[node-example]: /node
[ruby-example]: /ruby
[python-example]: /python
[java-example]: /java
[go-example]: /go
[docker]: https://www.docker.com
[dashboard-api-section]: https://dashboard.plaid.com/team/api
[contact-sales]: https://plaid.com/contact
