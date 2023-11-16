package com.plaid.quickstart.resources;

import java.io.IOException;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.plaid.client.request.PlaidApi;
import com.plaid.client.model.Transfer;
import com.plaid.quickstart.QuickstartApplication;
import com.plaid.client.model.TransferAuthorizationUserInRequest;
import com.plaid.client.model.TransferAuthorizationCreateRequest;
import com.plaid.client.model.TransferAuthorizationCreateResponse;
import com.plaid.client.model.TransferType;
import com.plaid.client.model.TransferNetwork;
import com.plaid.client.model.ACHClass;
import com.plaid.client.model.AccountsGetRequest;
import com.plaid.client.model.AccountsGetResponse;

import java.util.List;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import retrofit2.Response;

@Path("/transfer_authorize")
@Produces(MediaType.APPLICATION_JSON)
public class TransferAuthorizeResource {
  private final PlaidApi plaidClient;

  public TransferAuthorizeResource(PlaidApi plaidClient) {
    this.plaidClient = plaidClient;
  }

  @GET
  public TransferAuthorizationCreateResponse authorizeTransfer() throws IOException {
      AccountsGetRequest accountsGetRequest = new AccountsGetRequest()
        .accessToken(QuickstartApplication.accessToken);

      Response<AccountsGetResponse> accountsGetResponse = plaidClient
        .accountsGet(accountsGetRequest)
        .execute();

      QuickstartApplication.accountId = accountsGetResponse.body().getAccounts().get(0).getAccountId();

      TransferAuthorizationUserInRequest user = new TransferAuthorizationUserInRequest()
        .legalName("FirstName LastName");

      TransferAuthorizationCreateRequest transferAuthorizationCreateRequest = new TransferAuthorizationCreateRequest()
        .accessToken(QuickstartApplication.accessToken)
        .accountId(QuickstartApplication.accountId)
        .type(TransferType.DEBIT)
        .network(TransferNetwork.ACH)
        .amount("1.00")
        .achClass(ACHClass.PPD)
        .user(user);

      Response<TransferAuthorizationCreateResponse> transferAuthorizationCreateResponse = plaidClient
        .transferAuthorizationCreate(transferAuthorizationCreateRequest)
        .execute();

      QuickstartApplication.authorizationId = transferAuthorizationCreateResponse.body().getAuthorization().getId();    
      return transferAuthorizationCreateResponse.body();
  }
}
