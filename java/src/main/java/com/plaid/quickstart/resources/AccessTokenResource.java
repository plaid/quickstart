package com.plaid.quickstart.resources;

import java.io.IOException;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.plaid.client.PlaidClient;
import com.plaid.client.request.ItemPublicTokenExchangeRequest;
import com.plaid.client.response.ItemPublicTokenExchangeResponse;
import com.plaid.quickstart.QuickstartApplication;

import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.FormParam;
import javax.ws.rs.core.MediaType;

import retrofit2.Response;

@Path("/")
public class AccessTokenResource {
    private PlaidClient plaidClient;

    public AccessTokenResource(PlaidClient _plaidClient) {
        plaidClient = _plaidClient;
    }

    @POST
    @Path("get_access_token")
    @Produces("application/json")
    public Object getAccessToken(@FormParam("public_token") String publicToken) throws IOException {
        Response<ItemPublicTokenExchangeResponse> itemResponse = plaidClient.service()
            .itemPublicTokenExchange(new ItemPublicTokenExchangeRequest(publicToken))
            .execute();

        QuickstartApplication.accessToken = itemResponse.body().getAccessToken();

        System.out.println("public token: " + publicToken);
        System.out.println("access token: " + QuickstartApplication.accessToken);
        System.out.println("item ID: " + itemResponse.body().getItemId());

        return itemResponse.body();
    }

    public class ItemResponse {
        private String accessToken;
        private String itemId;

        public ItemResponse(String _accessToken, String _itemId) {
            accessToken = _accessToken;
            itemId = _itemId;
        }

        @JsonProperty
        public String getAccessToken() {
            return accessToken;
        }

        @JsonProperty
        public String getItemID() {
            return itemId;
        }
    }
}

