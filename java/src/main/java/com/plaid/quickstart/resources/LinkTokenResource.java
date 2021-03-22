package com.plaid.quickstart.resources;


// package com.plaid.client.integration;

// import static org.junit.Assert.assertNotNull;
// import static org.junit.Assert.assertTrue;
import com.plaid.client.request.PlaidApi;
import com.plaid.client.model.AccountSubtype;
import com.plaid.client.model.CountryCode;
import com.plaid.client.model.DepositoryFilter;
import com.plaid.client.model.LinkTokenAccountFilters;
import com.plaid.client.model.LinkTokenCreateRequest;
import com.plaid.client.model.LinkTokenCreateRequestAccountSubtypes;
import com.plaid.client.model.LinkTokenCreateRequestUser;
import com.plaid.client.model.LinkTokenCreateResponse;
import com.plaid.client.model.Products;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
// import org.junit.Test;
import retrofit2.Response;
import com.fasterxml.jackson.annotation.JsonProperty;
// import com.plaid.client.PlaidClient;
// import com.plaid.client.request.LinkTokenCreateRequest;
// import com.plaid.client.response.LinkTokenCreateResponse;
import java.io.IOException;
// import java.util.List;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
// import retrofit2.Response;


@Path("/create_link_token")
@Produces(MediaType.APPLICATION_JSON)
public class LinkTokenResource {
  private final PlaidApi plaidClient;
  private final List<String> plaidProducts;
  private final List<String> countryCodes;
  private final String redirectUri;

  public LinkTokenResource(PlaidApi plaidClient, List<String> plaidProducts,
    List<String> countryCodes, String redirectUri) {
    this.plaidClient = plaidClient;
    this.plaidProducts = plaidProducts;
    this.countryCodes = countryCodes;
    this.redirectUri = redirectUri;
  }

  public static class LinkToken {
    @JsonProperty
    private String linkToken;

    public LinkToken(String linkToken) {
      this.linkToken = linkToken;
    }
  }

  @POST public LinkToken getLinkToken() throws IOException {

    String clientUserId = Long.toString((new Date()).getTime());

		LinkTokenCreateRequestUser user = new LinkTokenCreateRequestUser()
		.clientUserId(clientUserId);

		LinkTokenCreateRequest request = new LinkTokenCreateRequest()
			.user(user)
			.clientName("very nice client name")
			.products(Arrays.asList(Products.AUTH))
			.countryCodes(Arrays.asList(CountryCode.US))
			.language("en")
      .redirectUri(this.redirectUri);

    	Response<LinkTokenCreateResponse> response =plaidClient
			.linkTokenCreate(request)
			.execute();
    return new LinkToken(response.body().getLinkToken());
  }
}
