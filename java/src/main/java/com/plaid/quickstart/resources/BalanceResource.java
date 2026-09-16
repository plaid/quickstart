package com.plaid.quickstart.resources;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import com.plaid.client.request.PlaidApi;
import com.plaid.client.model.AccountsBalanceGetRequest;
import com.plaid.client.model.AccountsGetResponse;
import com.plaid.quickstart.PlaidApiHelper;
import com.plaid.quickstart.QuickstartApplication;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

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

    AccountsGetResponse balanceResponse = PlaidApiHelper.callPlaid(
      plaidClient.accountsBalanceGet(balanceRequest));

    Map<String, Object> response = new HashMap<>();
    response.put("accounts", balanceResponse.getAccounts());

    return response;
  }
}
