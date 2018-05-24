package com.plaid;

import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import static spark.Spark.get;
import static spark.Spark.port;
import static spark.Spark.post;
import static spark.Spark.staticFiles;
import spark.ModelAndView;
import spark.ResponseTransformer;
import spark.Route;
import spark.template.velocity.VelocityTemplateEngine;

import com.google.gson.Gson;

import com.plaid.client.PlaidClient;
import com.plaid.client.request.AccountsGetRequest;
import com.plaid.client.request.InstitutionsGetByIdRequest;
import com.plaid.client.request.ItemGetRequest;
import com.plaid.client.request.ItemPublicTokenCreateRequest;
import com.plaid.client.request.ItemPublicTokenExchangeRequest;
import com.plaid.client.request.TransactionsGetRequest;
import com.plaid.client.response.AccountsGetResponse;
import com.plaid.client.response.InstitutionsGetByIdResponse;
import com.plaid.client.response.ItemGetResponse;
import com.plaid.client.response.ItemPublicTokenCreateResponse;
import com.plaid.client.response.ItemPublicTokenExchangeResponse;
import com.plaid.client.response.TransactionsGetResponse;

import retrofit2.Response;

public class App
{
    public static String PLAID_CLIENT_ID = System.getenv("PLAID_CLIENT_ID");
    public static String PLAID_SECRET = System.getenv("PLAID_SECRET");
    public static String PLAID_PUBLIC_KEY = System.getenv("PLAID_PUBLIC_KEY");

    private static String accessToken;

    private static final JsonTransformer jsonTransformer = new JsonTransformer();

    public static void main(String[] args)
    {
        PlaidClient plaidClient = PlaidClient.newBuilder()
            .clientIdAndSecret(PLAID_CLIENT_ID, PLAID_SECRET)
            .publicKey(PLAID_PUBLIC_KEY) // optional. only needed to call endpoints that require a public key
            .sandboxBaseUrl() // or equivalent, depending on which environment you're calling into
            .build();

        port(5000);
        staticFiles.location("/");

        get("/", (req, res) -> {
            Map<String, String> model = new HashMap<>();
            model.put("plaid_public_key", PLAID_PUBLIC_KEY);
            model.put("plaid_environment", "sandbox");
            return new ModelAndView(model, "templates/index.vm");
        }, new VelocityTemplateEngine());

        post("/get_access_token", (req, res) -> {
            String publicToken = req.queryParams("public_token");
            Response<ItemPublicTokenExchangeResponse> itemResponse = plaidClient.service()
                .itemPublicTokenExchange(new ItemPublicTokenExchangeRequest(publicToken))
                .execute();

            accessToken = itemResponse.body().getAccessToken();

            System.out.println("public token: " + publicToken);
            System.out.println("access token: " + accessToken);
            System.out.println("item ID: " + itemResponse.body().getItemId());

            return itemResponse.body();
        });

        get("/accounts", (req, res) -> {
            Response<AccountsGetResponse> accountsResponse = plaidClient.service()
                .accountsGet(new AccountsGetRequest(accessToken))
                .execute();

            res.type("application/json");
            return accountsResponse.body();
        }, jsonTransformer);

        Route item = (req, res) -> {
            Response<ItemGetResponse> itemResponse = plaidClient.service()
                .itemGet(new ItemGetRequest(accessToken))
                .execute();

            Response<InstitutionsGetByIdResponse> institutionsResponse = plaidClient.service()
                .institutionsGetById(new InstitutionsGetByIdRequest(itemResponse.body().getItem().getInstitutionId()))
                .execute();

            res.type("application/json");
            Map<String, Object> responseMap = new HashMap<String, Object>();
            responseMap.put("item", itemResponse.body().getItem());
            responseMap.put("institution", institutionsResponse.body().getInstitution());
            return responseMap;
        };

        get("/item", item, jsonTransformer);
        post("/item", item, jsonTransformer);

        Route transactions = (req, res) -> {
            // Retrieve transactions for the past 30 days
            Date startDate = new Date(System.currentTimeMillis() - 86400 * 30);
            Date endDate = new Date();

            Response<TransactionsGetResponse> transactionsResponse = plaidClient.service().transactionsGet(
                new TransactionsGetRequest(
                    accessToken,
                    startDate,
                    endDate
                )
            ).execute();

            res.type("application/json");
            return transactionsResponse.body();
        };

        get("/transactions", transactions, jsonTransformer);
        post("/transactions", transactions, jsonTransformer);

        get("/create_public_token", (req, res) -> {
            Response<ItemPublicTokenCreateResponse> publicTokenResponse = plaidClient.service()
                .itemPublicTokenCreate(new ItemPublicTokenCreateRequest(accessToken))
                .execute();

            res.type("application/json");
            return publicTokenResponse.body();
        });
    }

    public static class JsonTransformer implements ResponseTransformer {
        private Gson gson = new Gson();

        @Override
        public String render(Object model) {
            return gson.toJson(model);
        }
    }
}
