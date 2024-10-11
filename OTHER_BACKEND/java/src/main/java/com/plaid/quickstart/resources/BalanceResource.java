package com.plaid.quickstart.resources;

import java.io.IOException;

import com.plaid.client.request.PlaidApi;
import com.plaid.client.model.AccountsBalanceGetRequest;
import com.plaid.client.model.AccountsGetResponse;
import com.plaid.quickstart.QuickstartApplication;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import retrofit2.Response;

@Path("/balance")
@Produces(MediaType.APPLICATION_JSON)
public class BalanceResource {
  private final PlaidApi plaidClient;

  public BalanceResource(PlaidApi plaidClient) {
    this.plaidClient = plaidClient;
  }

  @GET
  public AccountsGetResponse getAccounts() throws IOException {
    AccountsBalanceGetRequest request = new AccountsBalanceGetRequest()
      .accessToken(QuickstartApplication.accessToken);

    Response<AccountsGetResponse> response = plaidClient
      .accountsBalanceGet(request)
      .execute();
    return response.body();
  }
}
