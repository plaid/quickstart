package com.plaid.quickstart.resources;

import java.io.IOException;
import java.util.Date;

import com.fasterxml.jackson.annotation.JsonProperty;

import com.plaid.client.PlaidClient;
import com.plaid.client.request.TransactionsGetRequest;
import com.plaid.client.response.ErrorResponse;
import com.plaid.client.response.ItemStatus;
import com.plaid.client.response.TransactionsGetResponse;
import com.plaid.quickstart.QuickstartApplication;

import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import jersey.repackaged.com.google.common.base.Throwables;
import retrofit2.Response;

@Path("/transactions")
@Produces(MediaType.APPLICATION_JSON)
public class TransactionsResource {
  private final PlaidClient plaidClient;

  public TransactionsResource(PlaidClient plaidClient) {
    this.plaidClient = plaidClient;
  }

  @GET
  public TransactionsGetResponse getTransactions() throws IOException {
    String accessToken = QuickstartApplication.accessToken;
    Date startDate = new Date(System.currentTimeMillis() - 86400000L * 100);
    Date endDate = new Date();

    TransactionsGetRequest request =
      new TransactionsGetRequest(accessToken, startDate, endDate)
        .withCount(100);

    Response<TransactionsGetResponse> response = null;
    for (int i = 0; i < 5; i++) {
      response = plaidClient.service().transactionsGet(request).execute();
      if (response.isSuccessful()) {
        break;
      } else {
        try {
          ErrorResponse errorResponse = plaidClient.parseError(response);
          Thread.sleep(3000);
        } catch (InterruptedException e) {
          throw Throwables.propagate(e);
        }
      }
    }

    return response.body();
  }
}
