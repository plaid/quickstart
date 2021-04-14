package com.plaid.quickstart.resources;

import java.io.IOException;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.plaid.client.request.PlaidApi;
import com.plaid.client.model.AccountIdentity;
import com.plaid.client.model.IdentityGetRequest;
import com.plaid.client.model.IdentityGetResponse;
import com.plaid.quickstart.QuickstartApplication;

import java.util.List;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import retrofit2.Response;

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
    Response<IdentityGetResponse> response = plaidClient 
    .identityGet(request)
    .execute();
    return new IdentityResponse(response.body());
  }

  private static class IdentityResponse {
    @JsonProperty
    private final List<AccountIdentity> identity;

    public IdentityResponse(IdentityGetResponse response) {
      this.identity = response.getAccounts();
    }
  }
}
