package com.plaid.quickstart.resources;

import java.io.IOException;

import com.fasterxml.jackson.annotation.JsonProperty;

import com.plaid.client.request.PlaidApi;
import com.plaid.client.model.CountryCode;
import com.plaid.client.model.ItemGetRequest;
import com.plaid.client.model.ItemGetResponse;
import com.plaid.client.model.InstitutionsGetByIdRequest;
import com.plaid.client.model.InstitutionsGetByIdResponse;
import com.plaid.client.model.Institution;
import com.plaid.client.model.ItemWithConsentFields;
import com.plaid.quickstart.PlaidApiHelper;
import com.plaid.quickstart.QuickstartApplication;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

@Path("/item")
@Produces(MediaType.APPLICATION_JSON)
public class ItemResource {
  private final PlaidApi plaidClient;

  public ItemResource(PlaidApi plaidClient) {
    this.plaidClient = plaidClient;
  }

  @GET
  public ItemResponse getItem() throws IOException {
    ItemGetRequest request = new ItemGetRequest()
      .accessToken(QuickstartApplication.accessToken);

    ItemGetResponse itemResponseBody = PlaidApiHelper.callPlaid(
      plaidClient.itemGet(request));

    InstitutionsGetByIdRequest institutionsRequest = new InstitutionsGetByIdRequest()
    .institutionId(itemResponseBody.getItem().getInstitutionId())
    .addCountryCodesItem(CountryCode.US);

    InstitutionsGetByIdResponse institutionsResponseBody = PlaidApiHelper.callPlaid(
      plaidClient.institutionsGetById(institutionsRequest));

    return new ItemResponse(
      itemResponseBody.getItem(),
      institutionsResponseBody.getInstitution()
    );
  }

  public static class ItemResponse {
    @JsonProperty
    public ItemWithConsentFields item;

    @JsonProperty
    public Institution institution;

    public ItemResponse(ItemWithConsentFields item, Institution institution) {
      this.item = item;
      this.institution = institution;
    }
  }
}
