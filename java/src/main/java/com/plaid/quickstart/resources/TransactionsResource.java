package com.plaid.quickstart.resources;

import java.io.IOException;
import java.util.Date;

import com.plaid.client.PlaidClient;
import com.plaid.client.request.TransactionsGetRequest;
import com.plaid.client.response.TransactionsGetResponse;
import com.plaid.quickstart.QuickstartApplication;

import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import retrofit2.Response;

@Path("/transactions")
@Produces(MediaType.APPLICATION_JSON)
public class TransactionsResource {
  private PlaidClient plaidClient;

  public TransactionsResource(PlaidClient plaidClient) {
    this.plaidClient = plaidClient;
  }

  @POST
  public TransactionsGetResponse getTransactions() throws IOException {
    Date startDate = new Date(System.currentTimeMillis() - 86400 * 30 * 1000);
    Date endDate = new Date();

    Response<TransactionsGetResponse> transactionsResponse = plaidClient.service().transactionsGet(
      new TransactionsGetRequest(
        QuickstartApplication.accessToken,
        startDate,
        endDate
      )
    ).execute();

    return transactionsResponse.body();
  }
}
