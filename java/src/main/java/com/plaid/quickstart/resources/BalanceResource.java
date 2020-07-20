package com.plaid.quickstart.resources;

import com.plaid.client.PlaidClient;
import com.plaid.client.request.AccountsBalanceGetRequest;
import com.plaid.client.response.AccountsBalanceGetResponse;
import com.plaid.quickstart.QuickstartApplication;
import java.io.IOException;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import retrofit2.Response;

@Path("/balance")
@Produces(MediaType.APPLICATION_JSON)
public class BalanceResource {
  private final PlaidClient plaidClient;

  public BalanceResource(PlaidClient plaidClient) {
    this.plaidClient = plaidClient;
  }

  @GET
  public AccountsBalanceGetResponse getAccounts() throws IOException {
    Response<AccountsBalanceGetResponse> accountsResponse = plaidClient.service()
      .accountsBalanceGet(new AccountsBalanceGetRequest(QuickstartApplication.accessToken))
      .execute();
    return accountsResponse.body();
  }
}
