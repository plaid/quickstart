package com.plaid.quickstart.resources;

import java.io.IOException;

import com.plaid.client.PlaidClient;
import com.plaid.client.request.AccountsGetRequest;
import com.plaid.client.response.AccountsGetResponse;
import com.plaid.quickstart.QuickstartApplication;

import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import retrofit2.Response;

@Path("/accounts")
@Produces(MediaType.APPLICATION_JSON)
public class AccountsResource {
  private final PlaidClient plaidClient;

  public AccountsResource(PlaidClient plaidClient) {
    this.plaidClient = plaidClient;
  }

  @GET
  public AccountsGetResponse getAccounts() throws IOException {
    Response<AccountsGetResponse> accountsResponse = plaidClient.service()
      .accountsGet(new AccountsGetRequest(QuickstartApplication.accessToken))
      .execute();
    return accountsResponse.body();
  }
}
