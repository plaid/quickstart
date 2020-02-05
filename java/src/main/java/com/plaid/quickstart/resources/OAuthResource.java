package com.plaid.quickstart.resources;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.dropwizard.views.View;

import javax.ws.rs.GET;
import javax.ws.rs.Path;

@Path("/oauth-response.html")
public class OAuthResource {
  private final String plaidEnvironment;
  private final String plaidPublicKey;
  private final String plaidProducts;
  private final String plaidCountryCodes;
  private final String plaidOAuthNonce;

  public OAuthResource(String plaidEnvironment, String plaidPublicKey, String plaidProducts, String plaidCountryCodes, String plaidOAuthNonce) {
    this.plaidEnvironment = plaidEnvironment;
    this.plaidPublicKey = plaidPublicKey;
    this.plaidProducts = plaidProducts;
    this.plaidCountryCodes = plaidCountryCodes;
    this.plaidOAuthNonce = plaidOAuthNonce;
  }

  @GET
  public OAuthView get() {
    return new OAuthView(plaidEnvironment, plaidPublicKey, plaidProducts, plaidCountryCodes, plaidOAuthNonce);
  }

  public class OAuthView extends View {
    @JsonProperty
    private final String plaidEnvironment;

    @JsonProperty
    private final String plaidPublicKey;

    @JsonProperty
    private final String plaidProducts;

    @JsonProperty
    private final String plaidCountryCodes;

    @JsonProperty
    private final String plaidOAuthNonce;

    public OAuthView(String plaidEnvironment, String plaidPublicKey, String plaidProducts, String plaidCountryCodes, String plaidOAuthNonce) {
      super("../../../../templates/oauth-response.ftl");
      this.plaidEnvironment = plaidEnvironment;
      this.plaidPublicKey = plaidPublicKey;
      this.plaidProducts = plaidProducts;
      this.plaidCountryCodes = plaidCountryCodes;
      this.plaidOAuthNonce = plaidOAuthNonce;
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

    public String getPlaidOAuthNonce() {
      return plaidOAuthNonce;
    }
  }
}
