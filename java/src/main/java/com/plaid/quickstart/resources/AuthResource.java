package com.plaid.quickstart.resources;

import java.io.IOException;

import com.plaid.client.request.PlaidApi;
import com.plaid.client.model.AuthGetRequest;
import com.plaid.client.model.AuthGetResponse;
import com.plaid.quickstart.PlaidApiHelper;
import com.plaid.quickstart.QuickstartApplication;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
public class AuthResource {
  private final PlaidApi plaidClient;

  public AuthResource(PlaidApi plaidClient) {
    this.plaidClient = plaidClient;
  }

  @GET
  public AuthGetResponse getAccounts() throws IOException {

    AuthGetRequest request = new AuthGetRequest()
    .accessToken(QuickstartApplication.accessToken);
    return PlaidApiHelper.callPlaid(plaidClient.authGet(request));
  }
}
