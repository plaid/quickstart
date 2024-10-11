package com.plaid.quickstart;

import io.dropwizard.Configuration;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.hibernate.validator.constraints.*;

public class QuickstartConfiguration extends Configuration {
  @NotEmpty
  private String plaidClientID;

  @NotEmpty
  private String plaidSecret;

  @NotEmpty
  private String plaidEnv;

  @NotEmpty
  private String plaidProducts;

  @NotEmpty
  private String plaidCountryCodes;

  // Parameters used for the OAuth redirect Link flow.

  // Set PLAID_REDIRECT_URI to 'http://localhost:3000/'
  // The OAuth redirect flow requires an endpoint on the developer's website
  // that the bank website should redirect to. You will need to configure
  // this redirect URI for your client ID through the Plaid developer dashboard
  // at https://dashboard.plaid.com/team/api.
  private String plaidRedirectUri;

  @JsonProperty
  public String getPlaidClientID() {
    return plaidClientID;
  }

  @JsonProperty
  public String getPlaidSecret() {
    return plaidSecret;
  }

  @JsonProperty
  public String getPlaidEnv() {
    return plaidEnv;
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
  public String getPlaidRedirectUri() {
    return plaidRedirectUri;
  }
}
