# Plaid quickstart

This repository accompanies Plaid's [**quickstart guide**][quickstart].

Here you'll find full example integration apps using our [**client libraries**][libraries].

This Quickstart is designed to show as many products and configurations as possible, including all five officially supported backends and multiple Plaid APIs, against a React frontend. 

If you prefer a non-React frontend platform, or a more minimal backend in one language with one endpoint, see the [Tiny Quickstart](https://github.com/plaid/tiny-quickstart), which shows a simpler backend and is available for JavaScript, Next.js, React, and React Native frontends.

For Identity Verification, see the [Identity Verification Quickstart](https://github.com/plaid/idv-quickstart). 

For Income, see the [Income sample app](https://github.com/plaid/income-sample). 


![Plaid quickstart app](/assets/quickstart.jpeg)

## Table of contents

<!-- toc -->

- [1. Clone the repository](#1-clone-the-repository)
  - [Special instructions for Windows](#special-instructions-for-windows)
- [2. Set up your environment variables](#2-set-up-your-environment-variables)
- [3. Run the quickstart](#3-run-the-quickstart)
  - [Run without Docker](#run-without-docker)
    - [Pre-requisites](#pre-requisites)
    - [1. Running the backend](#1-running-the-backend)
      - [Node](#node)
      - [Python](#python)
      - [Ruby](#ruby)
      - [Go](#go)
      - [Java](#java)
      - [.NET](#net) (community support only)
    - [2. Running the frontend](#2-running-the-frontend)
  - [Run with Docker](#run-with-docker)
    - [Pre-requisites](#pre-requisites-1)
    - [Running](#running-1)
      - [Start the container](#start-the-container)
      - [View the logs](#view-the-logs)
      - [Stop the container](#stop-the-container)
- [Test credentials](#test-credentials)
- [Troubleshooting](#troubleshooting)
- [Testing OAuth](#testing-oauth)

<!-- tocstop -->

## 1. Clone the repository

Using https:

```bash
git clone https://github.com/plaid/quickstart
cd quickstart
```

Alternatively, if you use ssh:

```bash
git clone git@github.com:plaid/quickstart.git
cd quickstart
```

#### Special instructions for Windows

Note - because this repository makes use of symbolic links, to run this on a Windows machine, make sure you have checked the "enable symbolic links" box when you download Git to your local machine. Then you can run the above commands to clone the quickstart. Otherwise, you may open your Git Bash terminal as an administrator and use the following command when cloning the project

```bash
git clone -c core.symlinks=true https://github.com/plaid/quickstart
```

## 2. Set up your environment variables

```bash
cp .env.example .env
```

Copy `.env.example` to a new file called `.env` and fill out the environment variables inside. At
minimum `PLAID_CLIENT_ID` and `PLAID_SECRET` must be filled out. Get your Client ID and secrets from
the dashboard: [https://dashboard.plaid.com/developers/keys](https://dashboard.plaid.com/developers/keys)

> NOTE: `.env` files are a convenient local development tool. Never run a production application
> using an environment file with secrets in it.

## 3. Run the Quickstart

There are two ways to run the various language quickstarts in this repository. You can choose to run the
code directly or you can run it in Docker. If you would like to run the code via Docker, skip to the
[Run with Docker](#run-with-docker) section.

### Run without Docker

#### Pre-requisites

- The language you intend to use is installed on your machine and available at your command line.
  This repo should generally work with active LTS versions of each language such as node >= 14,
  python >= 3.8, ruby >= 2.6, etc.
- Your environment variables populated in `.env`
- [npm](https://www.npmjs.com/get-npm)
- If using Windows, a command line utility capable of running basic Unix shell commands

#### 1. Running the backend

Once started with one of the commands below, the quickstart will be running on http://localhost:8000 for the backend. Enter the additional commands in step 2 to run the frontend which will run on http://localhost:3000.

##### Node

```bash
$ cd ./node
$ npm install
$ ./start.sh
```

##### Python

**:warning: As `python2` has reached its end of life, only `python3` is supported.**

```bash
cd ./python

# If you use virtualenv
# virtualenv venv
# source venv/bin/activate

pip3 install -r requirements.txt
./start.sh
```

If you get this error message:

```txt
ssl.SSLError: [SSL: CERTIFICATE_VERIFY_FAILED] certificate verify failed (_ssl.c:749)
```

You may need to run the following command in your terminal for your particular version of python in order to install SSL certificates:

```bash
# examples:
open /Applications/Python\ 3.9/Install\ Certificates.command
# or
open /Applications/Python\ 3.6/Install\ Certificates.command
```

##### Ruby

```bash
cd ./ruby
bundle
./start.sh
```

##### Go

```bash
cd ./go
go build
./start.sh
```

##### Java

```bash
cd ./java
mvn clean package
./start.sh
```

##### .NET

A community-supported implementation of the Plaid Quickstart using the [Going.Plaid](https://github.com/viceroypenguin/Going.Plaid) client library can be found at [PlaidQuickstartBlazor](https://github.com/jcoliz/PlaidQuickstartBlazor). Note that Plaid does not provide first-party support for .NET client libraries and that this Quickstart and client library are not created, reviewed, or supported by Plaid. 

#### 2. Running the frontend

```bash
$ cd ./frontend
$ npm ci
$ npm start
```

### Run with Docker

#### Pre-requisites

- `make` available at your command line
- Docker installed and running on your machine: https://docs.docker.com/get-docker/
- Your environment variables populated in `.env`
- If using Windows, a working Linux installation on Windows 10. If you are using Windows and do not already have WSL or Cygwin configured, we recommend [running without Docker](#run-without-docker).

#### Running

There are three basic `make` commands available

- `up`: builds and starts the container
- `logs`: tails logs
- `stop`: stops the container

Each of these should be used with a `language` argument, which is one of `node`, `python`, `ruby`,
`java`, or `go`. If unspecified, the default is `node`.

##### Start the container

```bash
make up language=node
```

The quickstart backend is now running on http://localhost:8000 and frontend on http://localhost:3000.

If you make changes to one of the server files such as `index.js`, `server.go`, etc, or to the
`.env` file, simply run `make up language=node` again to rebuild and restart the container.

If you experience a Docker connection error when running the command above, try the following:

- Make sure Docker is running
- Try running the command prefixed with `sudo`

##### View the logs

```bash
make logs language=node
```

##### Stop the container

```bash
make stop language=node
```

## Test credentials

In Sandbox, you can log in to any supported institution (except Capital One) using `user_good` as the username and `pass_good` as the password. If prompted to enter a 2-factor authentication code, enter `1234`.

In Development or Production, use real-life credentials.

## Troubleshooting

### Can't get a link token, or API calls are 400ing

View the server logs to see the associated error message with detailed troubleshooting instructions. If you can't view logs locally, view them via the [Dashboard activity logs](https://dashboard.plaid.com/activity/logs). 

### Works only when `PLAID_REDIRECT_URI` is not specified
Make sure to add the redirect URI to the Allowed Redirect URIs list in the [Plaid Dashboard](https://dashboard.plaid.com/team/api).

### "Connectivity not supported"

If you get a "Connectivity not supported" error after selecting a financial institution in Link, you probably specified some products in your .env file that the target financial institution doesn't support. Remove the unsupported products and try again.

### "You need to update your app" or "institution not supported"

If you get a "You need to update your app" or "institution not supported" error after selecting a financial institution in Link, you're probably running the Quickstart in Development (or Production) and attempting to link an institution, such as Chase or Wells Fargo, that requires an OAuth-based connection. In order to make OAuth connections to US-based institutions in Development or Production, you must have Production access approval, and certain institutions may also require additional approvals before you can be enabled. To use this institution, [apply for Production access](https://dashboard.plaid.com/overview/production) and see the [OAuth insitutions page](https://dashboard.plaid.com/team/oauth-institutions) for any other required steps and to track your OAuth enablement status.

### "oauth uri does not contain a valid oauth_state_id query parameter"

If you get the console error "oauth uri does not contain a valid oauth_state_id query parameter", you are attempting to initialize Link with a redirect uri when it is not necessary to do so. The `receivedRedirectUri` should not be set when initializing Link for the first time. It is used when initializing Link for the second time, after returning from the OAuth redirect.

## Testing OAuth 

Some institutions require an OAuth redirect
authentication flow, where the end user is redirected to the bank’s website or mobile app to
authenticate. 

To test the OAuth flow in Sandbox, select any institution that uses an OAuth connection with Plaid (a partial list can be found on the [Dashboard OAuth Institutions page](https://dashboard.plaid.com/team/oauth-institutions)), or choose 'Platypus OAuth Bank' from the list of financial institutions in Plaid Link.

### Testing OAuth with a redirect URI (optional)

To test the OAuth flow in Sandbox with a [redirect URI](https://www.plaid.com/docs/link/oauth/#create-and-register-a-redirect-uri), you should set `PLAID_REDIRECT_URI=http://localhost:3000/` in `.env`. You will also need to register this localhost redirect URI in the
[Plaid dashboard under Developers > API > Allowed redirect URIs][dashboard-api-section]. It is not required to configure a redirect URI in the .env file to use OAuth with the Quickstart. 

#### Instructions for using https with localhost

If you want to test OAuth in development with a redirect URI, you need to use https and set `PLAID_REDIRECT_URI=https://localhost:3000/` in `.env`. In order to run your localhost on https, you will need to create a self-signed certificate and add it to the frontend root folder. You can use the following instructions to do this. Note that self-signed certificates should be used for testing purposes only, never for actual deployments.

In your terminal, change to the frontend folder:

```bash
cd frontend
```

Use homebrew to install mkcert:

```bash
brew install mkcert
```

Then create your certificate for localhost:

```bash
mkcert -install
mkcert localhost
```

This will create a certificate file localhost.pem and a key file localhost-key.pem inside your client folder.

Then in the package.json file in the frontend folder, replace this line on line 28

```bash
"start": "react-scripts start",
```

with this line instead:

```bash
"start": "HTTPS=true SSL_CRT_FILE=localhost.pem SSL_KEY_FILE=localhost-key.pem react-scripts start",
```

After starting up the Quickstart, you can now view it at https://localhost:3000. If you are on Windows, you
may still get an invalid certificate warning on your browser. If so, click on "advanced" and proceed. Also on Windows, the frontend may still try to load http://localhost:3000 and you may have to access https://localhost:3000 manually.

[quickstart]: https://plaid.com/docs/quickstart
[libraries]: https://plaid.com/docs/api/libraries
[payment-initiation]: https://plaid.com/docs/payment-initiation/
[node-example]: /node
[ruby-example]: /ruby
[python-example]: /python
[java-example]: /java
[go-example]: /go
[docker]: https://www.docker.com
[dashboard-api-section]: https://dashboard.plaid.com/developers/api
[contact-sales]: https://plaid.com/contact
