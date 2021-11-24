package com.plaid.quickstart.resources;

import java.io.IOException;

import com.plaid.client.request.PlaidApi;
import com.plaid.client.model.ItemPublicTokenExchangeRequest;
import com.plaid.client.model.ItemPublicTokenExchangeResponse;
import com.plaid.client.model.TransferUserInRequest;
import com.plaid.client.model.TransferAuthorizationCreateRequest;
import com.plaid.client.model.TransferAuthorizationCreateResponse;
import com.plaid.client.model.TransferCreateRequest;
import com.plaid.client.model.TransferCreateResponse;
import com.plaid.client.model.TransferType;
import com.plaid.client.model.TransferNetwork;
import com.plaid.client.model.ACHClass;
import com.plaid.client.model.AccountsGetRequest;
import com.plaid.client.model.AccountsGetResponse;
import com.plaid.quickstart.QuickstartApplication;
import com.plaid.client.model.Products;

import java.util.List;
import java.util.Arrays;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.FormParam;
import javax.ws.rs.core.MediaType;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import retrofit2.Response;

@Path("/set_access_token")
@Produces(MediaType.APPLICATION_JSON)
public class AccessTokenResource {
  private static final Logger LOG = LoggerFactory.getLogger(AccessTokenResource.class);
  private final PlaidApi plaidClient;
  private final List<String> plaidProducts;

  public AccessTokenResource(PlaidApi plaidClient, List<String> plaidProducts) {
    this.plaidClient = plaidClient;
    this.plaidProducts = plaidProducts;
  }

  @POST
  public InfoResource.InfoResponse getAccessToken(@FormParam("public_token") String publicToken)
    throws IOException {
      ItemPublicTokenExchangeRequest request = new ItemPublicTokenExchangeRequest()
      .publicToken(publicToken);

    Response<ItemPublicTokenExchangeResponse> response = plaidClient
      .itemPublicTokenExchange(request)
      .execute();

    // Ideally, we would store this somewhere more persistent
    QuickstartApplication.
      accessToken = response.body().getAccessToken();
    QuickstartApplication.itemID = response.body().getItemId();
    LOG.info("public token: " + publicToken);
    LOG.info("access token: " + QuickstartApplication.accessToken);
    LOG.info("item ID: " + response.body().getItemId());

    if (plaidProducts.contains("transfer")) {
      // We call /accounts/get to obtain first account_id - in production,
      // account_id's should be persisted in a data store and retrieved
	    // from there.
      AccountsGetRequest accountsGetRequest = new AccountsGetRequest()
        .accessToken(QuickstartApplication.accessToken);

      Response<AccountsGetResponse> accountsGetResponse = plaidClient
        .accountsGet(accountsGetRequest)
        .execute();

      String accountId = accountsGetResponse.body().getAccounts().get(0).getAccountId();

      TransferUserInRequest user = new TransferUserInRequest()
        .legalName("FirstName LastName");

      TransferAuthorizationCreateRequest transferAuthorizationCreateRequest = new TransferAuthorizationCreateRequest()
        .accessToken(QuickstartApplication.accessToken)
        .accountId(accountId)
        .type(TransferType.CREDIT)
        .network(TransferNetwork.ACH)
        .amount("1.34")
        .achClass(ACHClass.PPD)
        .user(user);

      Response<TransferAuthorizationCreateResponse> transferAuthorizationCreateResponse = plaidClient
        .transferAuthorizationCreate(transferAuthorizationCreateRequest)
        .execute();
  
      String authorizationId = transferAuthorizationCreateResponse.body().getAuthorization().getId();
      
      TransferCreateRequest transferCreateRequest = new TransferCreateRequest()
        .authorizationId(authorizationId)
        .idempotencyKey("1223abc456xyz7890001")
        .accessToken(QuickstartApplication.accessToken)
        .accountId(accountId)
        .type(TransferType.CREDIT)
        .network(TransferNetwork.ACH)
        .amount("1.34")
        .achClass(ACHClass.PPD)
        .description("Payment")
        .user(user);

      Response<TransferCreateResponse> transferCreateResponse = plaidClient
        .transferCreate(transferCreateRequest)
        .execute();

      QuickstartApplication.transferId = transferCreateResponse.body().getTransfer().getId();
    }

    return new InfoResource.InfoResponse(Arrays.asList(), QuickstartApplication.accessToken,
      QuickstartApplication.itemID);
  }

 
}
