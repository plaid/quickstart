# Plaid quickstart

This repository accompanies Plaid's [**quickstart guide**][quickstart].

Here you'll find full example integration apps using our [**client libraries**][libraries]:

## Table of contents

<!-- toc -->

- [1. Clone the repository](#1-clone-the-repository)
  - [Special instructions for Windows](#special-instructions-for-windows)
- [2. Set up your environment variables](#2-set-up-your-environment-variables)
- [3. Run the quickstart](#3-run-the-quickstart)
  - [Run with Docker](#run-with-docker)
    - [Pre-requisites](#pre-requisites)
    - [Running](#running)
  - [Run without Docker](#run-without-docker)
    - [Pre-requisites](#pre-requisites-1)
    - [Running](#running-1)
      - [Node](#node)
      - [Python](#python)
      - [Ruby](#ruby)
      - [Go](#go)
      - [Java](#java)
- [Testing OAuth](#testing-oauth)

<!-- tocstop -->

## 1. Clone the repository

Using https:

```
$ git clone https://github.com/plaid/quickstart
$ cd quickstart
```

Alternatively, if you use ssh:

```
$ git clone git@github.com:plaid/quickstart.git
$ cd quickstart
```

#### Special instructions for Windows

Note - because this repository makes use of symlinks, to run this on a windows machine please use the following command when cloning the project

```
$ git clone -c core.symlinks=true https://github.com/plaid/quickstart
```

## 2. Set up your environment variables

```
$ cp .env.example .env
```

Copy `.env.example` to a new file called `.env` and fill out the environment variables inside. At minimum `PLAID_CLIENT_ID` and `PLAID_SECRET` must be filled out. Get your Client ID and secrets from the dashboard: https://dashboard.plaid.com/account/keys

> NOTE: `.env` files are a convenient local development tool. Never run a production application using an environment file with secrets in it.

## 3. Run the quickstart

There are two ways to run the various language quickstarts in this repository. You can choose to use Docker, or if that is not familiar to you, you can simply run the quickstart code directly on your machine and skip to the [Run without Docker](#run-without-docker) section.

If you are using Windows and choose not to use Docker, this quickstart assumes you are using some sort of Unix-like environment on Windows, such as Cygwin or WSL. Scripts in this repo may rely on things such as `bash`, `grep`, `cat`, etc.

### Run with Docker

#### Pre-requisites

- `make` available at your command line
- Docker installed on your machine: https://docs.docker.com/get-docker/
- Your environment variables populated in `.env`

#### Running

```
make QUICKSTART=node up
```

The quickstart is now running on http://localhost:8000

Replace `node` in the command above with the name of the quickstart language you want to start, e.g. `python`, `ruby`, `go`, or `java`.

To further adjust the quickstart to your use-case, you can define `PLAID_PRODUCTS`, `PLAID_COUNTRY_CODES`,
`PLAID_REDIRECT_URI`, etc in the `.env` file.

### Run without Docker

#### Pre-requisites

- The language you intend to use is installed on your machine, e.g. `node`, or `ruby` is available at your command line.
- Your environment variables populated in `.env`

#### Running

###### Node

```
cd ./node
npm install
node index.js
```

Open http://localhost:8000

###### Python

```
$ cd ./python

# If you use virtualenv
# virtualenv venv
# source venv/bin/activate

$ pip install -r requirements.txt
$ python server.py
```

Open http://localhost:8000

###### Ruby

```
$ cd ./ruby
$ bundle
$ bundle exec ruby app.rb
```

Open http://localhost:8000

###### Go

```
$ cd ./go
$ go build
$ go run server.go
```

Open http://localhost:8000

###### Java

```
$ cd ./java
$ mvn clean package
$ ./start.sh
```

Open http://localhost:8000

## Testing OAuth

Some European institutions require an OAuth redirect authentication flow, where the end user is redirected to the bank’s website or mobile app to authenticate. For this flow, you should define an additional environment variable, `PLAID_REDIRECT_URI` in `.env`. You will also need to make sure that you register this `PLAID_REDIRECT_URI` in the [Plaid dashboard][dashboard-api-section].

If you are testing out the OAuth flow, you will need to register your
`PLAID_REDIRECT_URI` in the [Plaid dashboard][dashboard-api-section]. OAuth flows are only testable in the `sandbox`
environment in this quickstart app due to an https `redirect_uri` being required in other environments. Additionally, if you want to use
the [Payment Initiation][payment-initiation] product, you will need to [contact Sales][contact-sales] to get this product enabled.

Note - If you want to use the [payment_initiation][payment-initiation] product, you
will need to [contact Sales][contact-sales] to get this product enabled.

![Plaid quickstart app](/assets/quickstart-screenshot.png)

[quickstart]: https://plaid.com/docs/quickstart
[libraries]: https://plaid.com/docs/api/libraries
[payment-initiation]: https://plaid.com/docs/payment-initiation/
[node-example]: /node
[ruby-example]: /ruby
[python-example]: /python
[java-example]: /java
[go-example]: /go
[docker]: https://www.docker.com
[dashboard-api-section]: https://dashboard.plaid.com/team/api
[contact-sales]: https://plaid.com/contact

[run-docker]: Run the quickstart with Docker
[run-no-docker]: Run the quickstart without Docker

```

```
