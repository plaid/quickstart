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
}
