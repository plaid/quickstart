package com.plaid.quickstart.resources;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.dropwizard.views.View;

import javax.ws.rs.GET;
import javax.ws.rs.Path;

@Path("/oauth-response.html")
public class OauthResource {
  private final String plaidEnvironment;
  private final String plaidPublicKey;
  private final String plaidProducts;
  private final String plaidCountryCodes;
  private final String plaidOauthNonce;

  public OauthResource(String plaidEnvironment, String plaidPublicKey, String plaidProducts, String plaidCountryCodes, String plaidOauthNonce) {
    this.plaidEnvironment = plaidEnvironment;
    this.plaidPublicKey = plaidPublicKey;
    this.plaidProducts = plaidProducts;
    this.plaidCountryCodes = plaidCountryCodes;
    this.plaidOauthNonce = plaidOauthNonce;
  }

  @GET
  public OauthView get() {
    return new OauthView(plaidEnvironment, plaidPublicKey, plaidProducts, plaidCountryCodes, plaidOauthNonce);
  }

  public class OauthView extends View {
    @JsonProperty
    private final String plaidEnvironment;

    @JsonProperty
    private final String plaidPublicKey;

    @JsonProperty
    private final String plaidProducts;

    @JsonProperty
    private final String plaidCountryCodes;

    @JsonProperty
    private final String plaidOauthNonce;

    public OauthView(String plaidEnvironment, String plaidPublicKey, String plaidProducts, String plaidCountryCodes, String plaidOauthNonce) {
      super("../../../../templates/oauth-response.ftl");
      this.plaidEnvironment = plaidEnvironment;
      this.plaidPublicKey = plaidPublicKey;
      this.plaidProducts = plaidProducts;
      this.plaidCountryCodes = plaidCountryCodes;
      this.plaidOauthNonce = plaidOauthNonce;
    }

    public String getPlaidEnvironment() {
      return plaidEnvironment;
    }

    public String getPlaidPublicKey() {
      return plaidPublicKey;
    }

    public String getPlaidProducts() {
      return plaidProducts;
    }

    public String getPlaidCountryCodes() {
      return plaidCountryCodes;
    }

    public String getPlaidOauthNonce() {
      return plaidOauthNonce;
    }
  }
}
