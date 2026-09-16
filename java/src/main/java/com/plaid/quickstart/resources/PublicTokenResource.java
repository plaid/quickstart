package com.plaid.quickstart.resources;

import java.io.IOException;


import com.plaid.client.request.PlaidApi;
import com.plaid.client.model.ItemPublicTokenCreateRequest;
import com.plaid.client.model.ItemPublicTokenCreateResponse;
import com.plaid.quickstart.PlaidApiHelper;
import com.plaid.quickstart.QuickstartApplication;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

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

    return PlaidApiHelper.callPlaid(plaidClient.itemCreatePublicToken(request));
  }
}
