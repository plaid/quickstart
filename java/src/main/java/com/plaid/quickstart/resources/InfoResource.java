package com.plaid.quickstart.resources;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.plaid.quickstart.QuickstartApplication;
import java.io.IOException;
import java.util.List;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

@Path("/info")
@Produces(MediaType.APPLICATION_JSON)
public class InfoResource {
  private final List<String> plaidProducts;

  public InfoResource(List<String> plaidProducts) {
    this.plaidProducts = plaidProducts;
  }

  public static class A {
    @JsonProperty
    public String item_id;
    @JsonProperty
    public String access_token;
    @JsonProperty
    public List<String> products;

    public A(List<String> plaidProducts, String accessToken, String itemID) {
      this.products = plaidProducts;
      this.access_token = accessToken;
      this.item_id = itemID;
    }
  }

  @POST
  public A getInfo() throws IOException {
    return new A(plaidProducts, QuickstartApplication.accessToken, QuickstartApplication.itemID);
  }
}
