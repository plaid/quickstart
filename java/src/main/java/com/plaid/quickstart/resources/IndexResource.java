package com.plaid.quickstart.resources;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.dropwizard.views.View;

import javax.ws.rs.GET;
import javax.ws.rs.Path;

@Path("/")
public class IndexResource {
  private final String plaidEnvironment;
  private final String plaidPublicKey;
  private final String plaidProducts;
  private final String plaidCountryCodes;
  private final String plaidOAuthRedirectUri;
  private final String plaidOAuthNonce;

  public IndexResource(String plaidEnvironment, String plaidPublicKey, String plaidProducts, String plaidCountryCodes, String plaidOAuthRedirectUri, String plaidOAuthNonce) {
    this.plaidEnvironment = plaidEnvironment;
    this.plaidPublicKey = plaidPublicKey;
    this.plaidProducts = plaidProducts;
    this.plaidCountryCodes = plaidCountryCodes;
    this.plaidOAuthRedirectUri = plaidOAuthRedirectUri;
    this.plaidOAuthNonce = plaidOAuthNonce;
  }

  @GET
  public IndexView get() {
    return new IndexView(plaidEnvironment, plaidPublicKey, plaidProducts, plaidCountryCodes, plaidOAuthRedirectUri, plaidOAuthNonce);
  }

  public class IndexView extends View {
    @JsonProperty
    private final String plaidEnvironment;

    @JsonProperty
    private final String plaidPublicKey;

    @JsonProperty
    private final String plaidProducts;

    @JsonProperty
    private final String plaidCountryCodes;

    @JsonProperty
    private final String plaidOAuthRedirectUri;

    @JsonProperty
    private final String plaidOAuthNonce;

    public IndexView(String plaidEnvironment, String plaidPublicKey, String plaidProducts, String plaidCountryCodes, String plaidOAuthRedirectUri, String plaidOAuthNonce) {
      super("../../../../templates/index.ftl");
      this.plaidEnvironment = plaidEnvironment;
      this.plaidPublicKey = plaidPublicKey;
      this.plaidProducts = plaidProducts;
      this.plaidCountryCodes = plaidCountryCodes;
      this.plaidOAuthRedirectUri = plaidOAuthRedirectUri;
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

    public String getPlaidOAuthRedirectUri() {
      return plaidOAuthRedirectUri;
    }

    public String getPlaidOAuthNonce() {
      return plaidOAuthNonce;
    }
  }
}
