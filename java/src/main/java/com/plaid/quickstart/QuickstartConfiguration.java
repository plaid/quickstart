package com.plaid.quickstart;

import io.dropwizard.Configuration;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.hibernate.validator.constraints.*;
import javax.validation.constraints.*;

public class QuickstartConfiguration extends Configuration {
  @NotEmpty
  private String plaidClientID;

  @NotEmpty
  private String plaidSecret;

  @NotEmpty
  private String plaidPublicKey;

  @NotEmpty
  private String plaidProducts;

  @NotEmpty
  private String plaidCountryCodes;

  // Parameters used for the OAuth redirect Link flow.

  // Set PLAID_OAUTH_REDIRECT_URI to 'http://localhost:8000/oauth-response.html'
  // The OAuth redirect flow requires an endpoint on the developer's website
  // that the bank website should redirect to. You will need to whitelist
  // this redirect URI for your client ID through the Plaid developer dashboard
  // at https://dashboard.plaid.com/team/api.
  private String plaidOAuthRedirectUri;

  // Set PLAID_OAUTH_NONCE to a unique identifier such as a UUID for each Link
  // session. The nonce will be used to re-open Link upon completion of the OAuth
  // redirect. The nonce must be at least 16 characters long.
  private String plaidOAuthNonce;

  @JsonProperty
  public String getPlaidClientID() {
    return plaidClientID;
  }

  @JsonProperty
  public String getPlaidSecret() {
    return plaidSecret;
  }

  @JsonProperty
  public String getPlaidPublicKey() {
    return plaidPublicKey;
  }

  @JsonProperty
  public String getPlaidProducts() {
    return plaidProducts;
  }

  @JsonProperty
  public String getPlaidCountryCodes() {
    return plaidCountryCodes;
  }

  @JsonProperty
  public String getPlaidOAuthRedirectUri() {
    return plaidOAuthRedirectUri;
  }

  @JsonProperty
  public String getPlaidOAuthNonce() {
    return plaidOAuthNonce;
  }
}
