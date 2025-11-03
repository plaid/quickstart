package com.plaid.quickstart.resources;

import java.io.IOException;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.plaid.client.request.PlaidApi;
import com.plaid.client.model.AccountsGetRequest;
import com.plaid.client.model.AccountsGetResponse;
import com.plaid.client.model.AccountIdentity;
import com.plaid.client.model.SignalEvaluateRequest;
import com.plaid.client.model.SignalEvaluateResponse;
import com.plaid.quickstart.QuickstartApplication;

import java.util.List;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import retrofit2.Response;

@Path("/signal_evaluate")
@Produces(MediaType.APPLICATION_JSON)
public class SignalResource {
  private final PlaidApi plaidClient;
  private final String signalRulesetKey;

  public SignalResource(PlaidApi plaidClient, String signalRulesetKey) {
    this.plaidClient = plaidClient;
    this.signalRulesetKey = signalRulesetKey;
  }

  @GET
  public SignalEvaluateResponse signalEvaluate() throws IOException {
      AccountsGetRequest accountsGetRequest = new AccountsGetRequest()
        .accessToken(QuickstartApplication.accessToken);

      Response<AccountsGetResponse> accountsGetResponse = plaidClient
        .accountsGet(accountsGetRequest)
        .execute();

      QuickstartApplication.accountId = accountsGetResponse.body().getAccounts().get(0).getAccountId();

      // Generate unique transaction ID using timestamp and random component
      String clientTransactionId = String.format("txn-%d-%s",
        System.currentTimeMillis(),
        java.util.UUID.randomUUID().toString().substring(0, 8));

      SignalEvaluateRequest signalEvaluateRequest = new SignalEvaluateRequest()
        .accessToken(QuickstartApplication.accessToken)
        .accountId(QuickstartApplication.accountId)
        .clientTransactionId(clientTransactionId)
        .amount(100.00);

      if (signalRulesetKey != null && !signalRulesetKey.isEmpty()) {
        signalEvaluateRequest.rulesetKey(signalRulesetKey);
      }

      Response<SignalEvaluateResponse> signalEvaluateResponse = plaidClient
        .signalEvaluate(signalEvaluateRequest)
        .execute();

      return signalEvaluateResponse.body();

  }
}
