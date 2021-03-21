package com.plaid.quickstart.resources;

import java.io.IOException;

import com.plaid.client.request.PlaidApi;
import com.plaid.client.model.AuthGetRequest;
import com.plaid.client.model.AuthGetResponse;
import com.plaid.quickstart.QuickstartApplication;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import retrofit2.Response;

@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
public class AuthResource {
  private final PlaidApi plaidClient;

  public AuthResource(PlaidApi plaidClient) {
    this.plaidClient = plaidClient;
  }

  @GET
  public AuthGetResponse getAccounts() throws IOException {

    AuthGetRequest authGetRequest = new AuthGetRequest()
    .accessToken(QuickstartApplication.accessToken);
    Response<AuthGetResponse> accountsResponse = plaidClient
      .authGet(authGetRequest)
      .execute();

    return accountsResponse.body();
  }
}
