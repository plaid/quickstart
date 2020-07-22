package com.plaid.quickstart.resources;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.plaid.client.PlaidClient;
import com.plaid.client.request.InvestmentsTransactionsGetRequest;
import com.plaid.client.response.InvestmentsTransactionsGetResponse;
import com.plaid.quickstart.QuickstartApplication;
import java.io.IOException;
import java.util.Date;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import retrofit2.Response;

@Path("/investment_transactions")
@Produces(MediaType.APPLICATION_JSON)
public class InvestmentTransactionsResource {
  private final PlaidClient plaidClient;

  public InvestmentTransactionsResource(PlaidClient plaidClient) {
    this.plaidClient = plaidClient;
  }

  @GET
  public InvestmentTransactionsResponse getAccounts() throws IOException {
    Date startDate = new Date(System.currentTimeMillis() - 86400000L * 100);
    Date endDate = new Date();
    Response<InvestmentsTransactionsGetResponse> accountsResponse = plaidClient.service()
      .investmentsTransactionsGet(
        new InvestmentsTransactionsGetRequest(QuickstartApplication.accessToken, startDate,
          endDate))
      .execute();
    return new InvestmentTransactionsResponse(accountsResponse.body());
  }

  private static class InvestmentTransactionsResponse {
    @JsonProperty
    private InvestmentsTransactionsGetResponse investmentTransactions;

    public InvestmentTransactionsResponse(InvestmentsTransactionsGetResponse investmentTransactions) {
      this.investmentTransactions = investmentTransactions;
    }
  }
}
