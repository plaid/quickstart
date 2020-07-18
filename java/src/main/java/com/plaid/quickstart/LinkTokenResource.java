package com.plaid.quickstart;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.plaid.client.PlaidClient;
import com.plaid.client.request.LinkTokenCreateRequest;
import com.plaid.client.response.LinkTokenCreateResponse;
import java.io.IOException;
import java.util.List;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import retrofit2.Response;

@Path("/create_link_token")
@Produces(MediaType.APPLICATION_JSON)
public class LinkTokenResource {
  private final PlaidClient plaidClient;
  private final List<String> plaidProducts;
  private final List<String> countryCodes;

  public LinkTokenResource(PlaidClient plaidClient, List<String> plaidProducts,
    List<String> countryCodes) {
    this.plaidClient = plaidClient;
    this.plaidProducts = plaidProducts;
    this.countryCodes = countryCodes;
  }

  public static class LinkToken {
    @JsonProperty
    private String linkToken;

    public LinkToken(String linkToken) {
      this.linkToken = linkToken;
    }
  }

  @POST public LinkToken getLinkToken() throws IOException {
    Response<LinkTokenCreateResponse> response =
      plaidClient.service().linkTokenCreate(new LinkTokenCreateRequest(
        new LinkTokenCreateRequest.User("user-id"),
        "my client name",
        plaidProducts,
        this.countryCodes,
        "en"
      )).execute();
    return new LinkToken(response.body().getLinkToken());
  }
}
