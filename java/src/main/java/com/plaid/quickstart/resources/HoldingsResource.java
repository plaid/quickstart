package com.plaid.quickstart.resources;

import com.fasterxml.jackson.annotation.JsonProperty;

import com.plaid.client.request.PlaidApi;
// import com.plaid.client.model.InvestmentHoldingsGetRequestOptions;
import com.plaid.client.model.InvestmentsHoldingsGetRequest;
import com.plaid.client.model.InvestmentsHoldingsGetResponse;
// import com.plaid.client.request.InvestmentsHoldingsGetRequest;
// import com.plaid.client.response.InvestmentsHoldingsGetResponse;
import com.plaid.quickstart.QuickstartApplication;
import java.io.IOException;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import retrofit2.Response;

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

    Response<InvestmentsHoldingsGetResponse> accountsResponse = plaidClient
      .investmentsHoldingsGet(request)
      .execute();

    return new HoldingsResponse(accountsResponse.body());
  }

  private static class HoldingsResponse {
    @JsonProperty
    private final InvestmentsHoldingsGetResponse holdings;

    public HoldingsResponse(InvestmentsHoldingsGetResponse response) {
      this.holdings = response;
    }
  }
}
