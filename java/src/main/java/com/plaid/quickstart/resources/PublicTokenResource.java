package com.plaid.quickstart.resources;

import java.io.IOException;

import com.plaid.client.PlaidClient;
import com.plaid.client.request.ItemPublicTokenCreateRequest;
import com.plaid.client.response.ItemPublicTokenCreateResponse;
import com.plaid.quickstart.QuickstartApplication;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import retrofit2.Response;

@Path("/create_public_token")
@Produces(MediaType.APPLICATION_JSON)
public class PublicTokenResource {
  private final PlaidClient plaidClient;

  public PublicTokenResource(PlaidClient plaidClient) {
    this.plaidClient = plaidClient;
  }

  @GET
  public ItemPublicTokenCreateResponse createPublicToken() throws IOException {
    Response<ItemPublicTokenCreateResponse> publicTokenResponse = plaidClient.service()
      .itemPublicTokenCreate(new ItemPublicTokenCreateRequest(QuickstartApplication.accessToken))
      .execute();

    return publicTokenResponse.body();
  }
}
