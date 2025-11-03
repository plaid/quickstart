package com.plaid.quickstart.resources;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

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

  public BalanceResource(PlaidApi plaidClient, String signalRulesetKey) {
    this.plaidClient = plaidClient;
  }

  @GET
  public Map<String, Object> getAccounts() throws IOException {
    AccountsBalanceGetRequest balanceRequest = new AccountsBalanceGetRequest()
      .accessToken(QuickstartApplication.accessToken);

    Response<AccountsGetResponse> balanceResponse = plaidClient
      .accountsBalanceGet(balanceRequest)
      .execute();

    Map<String, Object> response = new HashMap<>();
    response.put("accounts", balanceResponse.body().getAccounts());

    return response;
  }
}
