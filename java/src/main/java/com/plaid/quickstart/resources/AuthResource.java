package com.plaid.quickstart.resources;

import com.plaid.client.PlaidClient;
import com.plaid.client.request.AccountsGetRequest;
import com.plaid.client.request.AuthGetRequest;
import com.plaid.client.response.AccountsGetResponse;
import com.plaid.client.response.AuthGetResponse;
import com.plaid.quickstart.QuickstartApplication;
import java.io.IOException;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import retrofit2.Response;

@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
public class AuthResource {
  private final PlaidClient plaidClient;

  public AuthResource(PlaidClient plaidClient) {
    this.plaidClient = plaidClient;
  }

  @GET
  public AuthGetResponse getAccounts() throws IOException {
    Response<AuthGetResponse> accountsResponse = plaidClient.service()
      .authGet(new AuthGetRequest(QuickstartApplication.accessToken))
      .execute();

    return accountsResponse.body();
  }
}
