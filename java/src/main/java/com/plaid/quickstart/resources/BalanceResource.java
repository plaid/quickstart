package com.plaid.quickstart.resources;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.plaid.client.request.PlaidApi;
import com.plaid.client.model.AccountBase;
import com.plaid.client.model.AccountsGetRequest;
import com.plaid.client.model.AccountsGetResponse;
import com.plaid.client.model.SignalEvaluateRequest;
import com.plaid.client.model.SignalEvaluateResponse;
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
  private final String signalRulesetKey;

  public BalanceResource(PlaidApi plaidClient, String signalRulesetKey) {
    this.plaidClient = plaidClient;
    this.signalRulesetKey = signalRulesetKey;
  }

  @GET
  public Map<String, Object> getAccounts() throws IOException {
    // Get accounts
    AccountsGetRequest accountsGetRequest = new AccountsGetRequest()
      .accessToken(QuickstartApplication.accessToken);

    Response<AccountsGetResponse> accountsGetResponse = plaidClient
      .accountsGet(accountsGetRequest)
      .execute();

    QuickstartApplication.accountId = accountsGetResponse.body().getAccounts().get(0).getAccountId();

    // Call signal evaluate
    SignalEvaluateRequest signalEvaluateRequest = new SignalEvaluateRequest()
      .accessToken(QuickstartApplication.accessToken)
      .accountId(QuickstartApplication.accountId)
      .clientTransactionId("txn1234")
      .amount(100.00);

    if (signalRulesetKey != null && !signalRulesetKey.isEmpty()) {
      signalEvaluateRequest.rulesetKey(signalRulesetKey);
    }

    Response<SignalEvaluateResponse> signalEvaluateResponse = plaidClient
      .signalEvaluate(signalEvaluateRequest)
      .execute();

    // Transform signal response to match balance response format
    List<AccountBase> accounts = accountsGetResponse.body().getAccounts().stream()
      .map(account -> {
        if (signalEvaluateResponse.body().getCoreAttributes() != null) {
          if (signalEvaluateResponse.body().getCoreAttributes().getAvailableBalance() != null) {
            account.getBalances().setAvailable(signalEvaluateResponse.body().getCoreAttributes().getAvailableBalance());
          }
          if (signalEvaluateResponse.body().getCoreAttributes().getCurrentBalance() != null) {
            account.getBalances().setCurrent(signalEvaluateResponse.body().getCoreAttributes().getCurrentBalance());
          }
        }
        return account;
      })
      .collect(Collectors.toList());

    // Create signal ruleset data
    Map<String, String> signalRuleset = new HashMap<>();
    signalRuleset.put("ruleset_key",
      signalEvaluateResponse.body().getRuleset() != null ? signalEvaluateResponse.body().getRuleset().getRulesetKey() : null);
    signalRuleset.put("outcome",
      signalEvaluateResponse.body().getRuleset() != null ? signalEvaluateResponse.body().getRuleset().getOutcome() : null);

    // Create response with accounts and signal ruleset data
    Map<String, Object> balanceResponse = new HashMap<>();
    balanceResponse.put("accounts", accounts);
    balanceResponse.put("signal_ruleset", signalRuleset);

    return balanceResponse;
  }
}
