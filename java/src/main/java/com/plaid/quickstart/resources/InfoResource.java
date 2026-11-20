package com.plaid.quickstart.resources;

import com.fasterxml.jackson.annotation.JsonProperty;

import com.plaid.quickstart.QuickstartApplication;

import java.util.List;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@Path("/info")
@Produces(MediaType.APPLICATION_JSON)
public class InfoResource {
  private final List<String> plaidProducts;

  public InfoResource(List<String> plaidProducts) {
    this.plaidProducts = plaidProducts;
  }

  public static class InfoResponse {
    @JsonProperty
    private final String itemId;
    @JsonProperty
    private final String accessToken;
    @JsonProperty
    private final List<String> products;
    @JsonProperty
    private final boolean itemPreloaded;

    public InfoResponse(List<String> plaidProducts, String accessToken, String itemId) {
      this(plaidProducts, accessToken, itemId, false);
    }

    public InfoResponse(List<String> plaidProducts, String accessToken, String itemId,
      boolean itemPreloaded) {
      this.products = plaidProducts;
      this.accessToken = accessToken;
      this.itemId = itemId;
      this.itemPreloaded = itemPreloaded;
    }
  }

  @POST
  public InfoResponse getInfo() {
    return new InfoResponse(plaidProducts, QuickstartApplication.accessToken,
      QuickstartApplication.itemId, QuickstartApplication.itemPreloaded);
  }
}
