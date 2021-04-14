package com.plaid.quickstart.resources;

import java.io.IOException;
import java.time.LocalDate;

import com.plaid.client.request.PlaidApi;
import com.plaid.client.model.TransactionsGetRequest;
import com.plaid.client.model.TransactionsGetRequestOptions;
import com.plaid.client.model.TransactionsGetResponse;
import com.plaid.client.model.Error;
import com.plaid.quickstart.QuickstartApplication;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import jersey.repackaged.com.google.common.base.Throwables;
import retrofit2.Response;

import com.google.gson.Gson;

@Path("/transactions")
@Produces(MediaType.APPLICATION_JSON)
public class TransactionsResource {
  private final PlaidApi plaidClient;


  public TransactionsResource(PlaidApi plaidClient) {
    this.plaidClient = plaidClient;
  }

  @GET
  public TransactionsGetResponse getTransactions() throws IOException {
    LocalDate startDate = LocalDate.now().minusDays(30);
    LocalDate endDate = LocalDate.now();

    TransactionsGetRequestOptions options = new TransactionsGetRequestOptions()
    .count(100);

    TransactionsGetRequest request = new TransactionsGetRequest()
      .accessToken(QuickstartApplication.accessToken)
      .startDate(startDate)
      .endDate(endDate)
      .options(options);

    Response<TransactionsGetResponse> response = null;
    for (int i = 0; i < 5; i++){
      response = plaidClient.transactionsGet(request).execute();
      if (response.isSuccessful()){
        break;
      } else {
        try {
          Gson gson = new Gson();
          Error error = gson.fromJson(response.errorBody().string(), Error.class);
          error.getErrorType().equals(Error.ErrorTypeEnum.ITEM_ERROR);
          error.getErrorCode().equals("PRODUCT_NOT_READY");
          Thread.sleep(3000);
        } catch (Exception e) {
          throw Throwables.propagate(e);
        }
      }
    }
    return response.body();
  }
}
