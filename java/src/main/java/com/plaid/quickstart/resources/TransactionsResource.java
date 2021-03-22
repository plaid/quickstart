package com.plaid.quickstart.resources;

import java.io.IOException;
import java.time.LocalDate;

import com.plaid.client.request.PlaidApi;
import com.plaid.client.model.TransactionsGetRequest;
import com.plaid.client.model.TransactionsGetRequestOptions;
import com.plaid.client.model.TransactionsGetResponse;
import com.plaid.quickstart.QuickstartApplication;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import retrofit2.Response;

@Path("/transactions")
@Produces(MediaType.APPLICATION_JSON)
public class TransactionsResource {
  private final PlaidApi plaidClient;


  public TransactionsResource(PlaidApi plaidClient) {
    this.plaidClient = plaidClient;
  }

  @GET
  public TransactionsGetResponse getTransactions() throws IOException {
    LocalDate startDate = LocalDate.now().minusDays(365 * 2);
    LocalDate endDate = LocalDate.now();

    TransactionsGetRequestOptions options = new TransactionsGetRequestOptions()
    .count(100);

    TransactionsGetRequest request = new TransactionsGetRequest()
      .accessToken(QuickstartApplication.accessToken)
      .startDate(startDate)
      .endDate(endDate)
      .options(options);

    Response<TransactionsGetResponse> 
      response = plaidClient.transactionsGet(request).execute();
      return response.body();
  }
}
