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
import com.plaid.quickstart.QuickstartApplication;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import retrofit2.Response;

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

    Response<ItemGetResponse> itemResponse = plaidClient
    .itemGet(request)
    .execute();
    
    InstitutionsGetByIdRequest institutionsRequest = new InstitutionsGetByIdRequest()
    .institutionId(itemResponse.body().getItem().getInstitutionId())
    .addCountryCodesItem(CountryCode.US);

    Response<InstitutionsGetByIdResponse> institutionsResponse = plaidClient
    .institutionsGetById(institutionsRequest)
    .execute();

    return new ItemResponse(
      itemResponse.body().getItem(), 
      institutionsResponse.body().getInstitution()
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
