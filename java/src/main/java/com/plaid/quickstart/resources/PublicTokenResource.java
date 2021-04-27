package com.plaid.quickstart.resources;

import java.io.IOException;


import com.plaid.client.request.PlaidApi;
import com.plaid.client.model.ItemPublicTokenCreateRequest;
import com.plaid.client.model.ItemPublicTokenCreateResponse;
import com.plaid.quickstart.QuickstartApplication;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import retrofit2.Response;

@Path("/create_public_token")
@Produces(MediaType.APPLICATION_JSON)
public class PublicTokenResource {
  private final PlaidApi plaidClient;

  public PublicTokenResource(PlaidApi plaidClient) {
    this.plaidClient = plaidClient;
  }

  @GET
  public ItemPublicTokenCreateResponse createPublicToken() throws IOException {

    ItemPublicTokenCreateRequest request = new ItemPublicTokenCreateRequest() 
    .accessToken(QuickstartApplication.accessToken);

    Response<ItemPublicTokenCreateResponse> response = plaidClient
      .itemCreatePublicToken(request)
      .execute();

    return response.body();
  }
}
