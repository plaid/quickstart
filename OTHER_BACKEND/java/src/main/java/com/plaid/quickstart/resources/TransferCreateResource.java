package com.plaid.quickstart.resources;

import java.io.IOException;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.plaid.client.request.PlaidApi;
import com.plaid.client.model.Transfer;
import com.plaid.quickstart.QuickstartApplication;
import com.plaid.client.model.TransferCreateRequest;
import com.plaid.client.model.TransferCreateResponse;

import java.util.List;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import retrofit2.Response;

@Path("/transfer_create")
@Produces(MediaType.APPLICATION_JSON)
public class TransferCreateResource {
  private final PlaidApi plaidClient;

  public TransferCreateResource(PlaidApi plaidClient) {
    this.plaidClient = plaidClient;
  }

  @GET
  public TransferCreateResponse createTransfer() throws IOException {
    TransferCreateRequest request = new TransferCreateRequest()
        .authorizationId(QuickstartApplication.authorizationId)
        .accessToken(QuickstartApplication.accessToken)
        .accountId(QuickstartApplication.accountId)
        .description("Debit");
    Response<TransferCreateResponse> transferCreateResponse = plaidClient 
      .transferCreate(request)
      .execute();
    return transferCreateResponse.body();
  }
}
