package com.plaid.quickstart.resources;

import com.fasterxml.jackson.annotation.JsonProperty;


import com.plaid.client.request.PlaidApi;
import com.plaid.client.model.InvestmentsTransactionsGetRequest;
import com.plaid.client.model.InvestmentsTransactionsGetResponse;
import com.plaid.client.model.InvestmentsTransactionsGetRequestOptions;
import com.plaid.quickstart.QuickstartApplication;

import java.io.IOException;
import java.time.LocalDate;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import retrofit2.Response;

@Path("/investments_transactions")
@Produces(MediaType.APPLICATION_JSON)
public class InvestmentTransactionsResource {
  private final PlaidApi plaidClient;

  public InvestmentTransactionsResource(PlaidApi plaidClient) {
    this.plaidClient = plaidClient;
  }

  @GET
  public InvestmentTransactionsResponse getAccounts() throws IOException {
    LocalDate startDate = LocalDate.now().minusDays(30);
    LocalDate endDate = LocalDate.now();
    InvestmentsTransactionsGetRequestOptions options = new InvestmentsTransactionsGetRequestOptions()
    .count(100);

    InvestmentsTransactionsGetRequest request = new InvestmentsTransactionsGetRequest()
      .accessToken(QuickstartApplication.accessToken)
      .startDate(startDate)
      .endDate(endDate)
      .options(options);

    Response<InvestmentsTransactionsGetResponse> response = plaidClient
      .investmentsTransactionsGet(request)
      .execute();
    return new InvestmentTransactionsResponse(response.body());
  }

  private static class InvestmentTransactionsResponse {
    @JsonProperty
    private InvestmentsTransactionsGetResponse investmentsTransactions;

    public InvestmentTransactionsResponse(InvestmentsTransactionsGetResponse investmentTransactions) {
      this.investmentsTransactions = investmentTransactions;
    }
  }
}
