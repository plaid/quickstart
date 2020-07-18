package com.plaid.quickstart.resources;

import java.io.IOException;

import com.fasterxml.jackson.annotation.JsonProperty;

import com.plaid.client.PlaidClient;
import com.plaid.client.request.ItemGetRequest;
import com.plaid.client.request.InstitutionsGetByIdRequest;
import com.plaid.client.response.ItemGetResponse;
import com.plaid.client.response.Institution;
import com.plaid.client.response.ItemStatus;
import com.plaid.client.response.InstitutionsGetByIdResponse;
import com.plaid.quickstart.QuickstartApplication;

import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import retrofit2.Response;

@Path("/item")
@Produces(MediaType.APPLICATION_JSON)
public class ItemResource {
  private final PlaidClient plaidClient;

  public ItemResource(PlaidClient plaidClient) {
    this.plaidClient = plaidClient;
  }

  @GET
  public ItemResponse getItem() throws IOException {
    Response<ItemGetResponse> itemResponse = plaidClient.service()
      .itemGet(new ItemGetRequest(QuickstartApplication.accessToken))
      .execute();

    Response<InstitutionsGetByIdResponse> institutionsResponse = plaidClient.service()
      .institutionsGetById(
        new InstitutionsGetByIdRequest(itemResponse.body().getItem().getInstitutionId()))
      .execute();

    return new ItemResponse(
      itemResponse.body().getItem(),
      institutionsResponse.body().getInstitution()
    );
  }

  public static class ItemResponse {
    @JsonProperty
    public ItemStatus item;

    @JsonProperty
    public Institution institution;

    public ItemResponse(ItemStatus item, Institution institution) {
      this.item = item;
      this.institution = institution;
    }
  }
}
