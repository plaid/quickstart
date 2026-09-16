package com.plaid.quickstart.resources;

import java.io.IOException;

import com.fasterxml.jackson.annotation.JsonProperty;

import com.plaid.client.request.PlaidApi;
import com.plaid.client.model.InvestmentsHoldingsGetRequest;
import com.plaid.client.model.InvestmentsHoldingsGetResponse;
import com.plaid.quickstart.PlaidApiHelper;
import com.plaid.quickstart.QuickstartApplication;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@Path("/holdings")
@Produces(MediaType.APPLICATION_JSON)
public class HoldingsResource {
  private final PlaidApi plaidClient;

  public HoldingsResource(PlaidApi plaidClient) {
    this.plaidClient = plaidClient;
  }

  @GET
  public HoldingsResponse getAccounts() throws IOException {

    InvestmentsHoldingsGetRequest request = new InvestmentsHoldingsGetRequest()
    .accessToken(QuickstartApplication.accessToken);

    InvestmentsHoldingsGetResponse responseBody = PlaidApiHelper.callPlaid(
      plaidClient.investmentsHoldingsGet(request));

    return new HoldingsResponse(responseBody);
  }

  private static class HoldingsResponse {
    @JsonProperty
    private final InvestmentsHoldingsGetResponse holdings;

    public HoldingsResponse(InvestmentsHoldingsGetResponse response) {
      this.holdings = response;
    }
  }
}
