package com.plaid.quickstart.resources;

import java.io.IOException;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.plaid.client.request.PlaidApi;
import com.plaid.client.model.Transfer;
import com.plaid.client.model.TransferGetRequest;
import com.plaid.client.model.TransferGetResponse;
import com.plaid.quickstart.QuickstartApplication;

import java.util.List;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import retrofit2.Response;

@Path("/transfer")
@Produces(MediaType.APPLICATION_JSON)
public class TransferResource {
  private final PlaidApi plaidClient;

  public TransferResource(PlaidApi plaidClient) {
    this.plaidClient = plaidClient;
  }

  @GET
  public TransferGetResponse getTransfer() throws IOException {
    
    TransferGetRequest request = new TransferGetRequest()
      .transferId(QuickstartApplication.transferId);
    Response<TransferGetResponse> response = plaidClient 
      .transferGet(request)
      .execute();
    return response.body();
  }
}
