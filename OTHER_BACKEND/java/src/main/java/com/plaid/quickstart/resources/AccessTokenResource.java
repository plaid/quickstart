package com.plaid.quickstart.resources;

import java.io.IOException;

import com.plaid.client.request.PlaidApi;
import com.plaid.client.model.ItemPublicTokenExchangeRequest;
import com.plaid.client.model.ItemPublicTokenExchangeResponse;
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
    return new InfoResource.InfoResponse(Arrays.asList(), QuickstartApplication.accessToken,
      QuickstartApplication.itemID);
  }

 
}
