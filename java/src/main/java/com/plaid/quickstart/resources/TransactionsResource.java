package com.plaid.quickstart.resources;

import java.io.IOException;
import java.util.Date;

import com.fasterxml.jackson.annotation.JsonProperty;

import com.plaid.client.request.PlaidApi;
import com.google.gson.Gson;
import com.plaid.client.model.AccountsGetRequest;
import com.plaid.client.model.AccountsGetResponse;
import com.plaid.client.model.Error;
import com.plaid.client.model.ItemPublicTokenExchangeRequest;
import com.plaid.client.model.ItemPublicTokenExchangeResponse;
import com.plaid.client.model.Products;
import com.plaid.client.model.SandboxPublicTokenCreateRequest;
import com.plaid.client.model.SandboxPublicTokenCreateResponse;
import com.plaid.client.model.Transaction;
import com.plaid.client.model.TransactionsGetRequest;
import com.plaid.client.model.TransactionsGetRequestOptions;
import com.plaid.client.model.TransactionsGetResponse;
import com.plaid.quickstart.QuickstartApplication;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
// import org.junit.Before;
// import org.junit.Ignore;
// import org.junit.Test;

import retrofit2.Response;

// import com.plaid.client.PlaidClient;
// import com.plaid.client.request.TransactionsGetRequest;
// import com.plaid.client.response.ErrorResponse;
// import com.plaid.client.response.ItemStatus;
// import com.plaid.client.response.TransactionsGetResponse;
// import com.plaid.quickstart.QuickstartApplication;

import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

// import jersey.repackaged.com.google.common.base.Throwables;
// import retrofit2.Response;

@Path("/transactions")
@Produces(MediaType.APPLICATION_JSON)
public class TransactionsResource {
  private final PlaidApi plaidClient;
  // private String accessToken;
  // private LocalDate startDate;
  // private LocalDate endDate;

  public TransactionsResource(PlaidApi plaidClient) {
    this.plaidClient = plaidClient;
  }

  @GET
  public TransactionsGetResponse getTransactions() throws IOException {
    String accessToken = QuickstartApplication.accessToken;
    LocalDate startDate = LocalDate.now().minusDays(365 * 2);
    LocalDate endDate = LocalDate.now();

    TransactionsGetRequestOptions options = new TransactionsGetRequestOptions()
    .count(100);

    TransactionsGetRequest request = new TransactionsGetRequest()
      .accessToken(QuickstartApplication.accessToken)
      .startDate(startDate)
      .endDate(endDate)
      .options(options);

    Response<TransactionsGetResponse> response = null;
    for (int i = 0; i < 5; i++) {
      response = plaidClient.transactionsGet(request).execute();
      if (response.isSuccessful()) {
        break;
      } else {
        try {
          Gson gson = new Gson();
          Error errorResponse = gson.fromJson(response.errorBody().string(), Error.class);
          Thread.sleep(3000);
        } catch (Exception e) {
          // throw new Exception(
          //   String.format("Failed converting from API Response Error Body to Error %f", response.errorBody().string()));
          
        }
      }
      
    }

    return response.body();
  }
}
