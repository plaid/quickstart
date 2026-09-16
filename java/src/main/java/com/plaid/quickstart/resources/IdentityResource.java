package com.plaid.quickstart.resources;

import java.io.IOException;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.plaid.client.request.PlaidApi;
import com.plaid.client.model.AccountIdentity;
import com.plaid.client.model.IdentityGetRequest;
import com.plaid.client.model.IdentityGetResponse;
import com.plaid.quickstart.PlaidApiHelper;
import com.plaid.quickstart.QuickstartApplication;

import java.util.List;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@Path("/identity")
@Produces(MediaType.APPLICATION_JSON)
public class IdentityResource {
  private final PlaidApi plaidClient;

  public IdentityResource(PlaidApi plaidClient) {
    this.plaidClient = plaidClient;
  }

  @GET
  public IdentityResponse getAccounts() throws IOException {
    IdentityGetRequest request = new IdentityGetRequest()
      .accessToken(QuickstartApplication.accessToken);
    IdentityGetResponse responseBody = PlaidApiHelper.callPlaid(
      plaidClient.identityGet(request));
    return new IdentityResponse(responseBody);
  }

  private static class IdentityResponse {
    @JsonProperty
    private final List<AccountIdentity> identity;

    public IdentityResponse(IdentityGetResponse response) {
      this.identity = response.getAccounts();
    }
  }
}
