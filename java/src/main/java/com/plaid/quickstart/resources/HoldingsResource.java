package com.plaid.quickstart.resources;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.plaid.client.PlaidClient;
import com.plaid.client.request.InvestmentsHoldingsGetRequest;
import com.plaid.client.response.InvestmentsHoldingsGetResponse;
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
  private final PlaidClient plaidClient;

  public HoldingsResource(PlaidClient plaidClient) {
    this.plaidClient = plaidClient;
  }

  @GET
  public HoldingsResponse getAccounts() throws IOException {
    Response<InvestmentsHoldingsGetResponse> accountsResponse = plaidClient.service()
      .investmentsHoldingsGet(new InvestmentsHoldingsGetRequest(QuickstartApplication.accessToken))
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
