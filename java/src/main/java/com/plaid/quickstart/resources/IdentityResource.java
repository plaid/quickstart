package com.plaid.quickstart.resources;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.plaid.client.PlaidClient;
import com.plaid.client.request.IdentityGetRequest;
import com.plaid.client.response.IdentityGetResponse;
import com.plaid.quickstart.QuickstartApplication;
import java.io.IOException;
import java.util.List;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import retrofit2.Response;

@Path("/identity")
@Produces(MediaType.APPLICATION_JSON)
public class IdentityResource {
  private final PlaidClient plaidClient;

  public IdentityResource(PlaidClient plaidClient) {
    this.plaidClient = plaidClient;
  }

  @GET
  public IdentityResponse getAccounts() throws IOException {
    Response<IdentityGetResponse> accountsResponse = plaidClient.service()
      .identityGet(new IdentityGetRequest(QuickstartApplication.accessToken))
      .execute();

    return new IdentityResponse(accountsResponse.body());
  }

  private static class IdentityResponse {
    @JsonProperty
    private final List<IdentityGetResponse.AccountWithOwners> identity;

    public IdentityResponse(IdentityGetResponse response) {
      this.identity = response.getAccounts();
    }
  }
}
