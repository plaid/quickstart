package com.plaid.quickstart.resources;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.dropwizard.views.View;

import javax.ws.rs.GET;
import javax.ws.rs.Path;

@Path("/")
public class IndexResource {
    private final String plaidEnvironment;
    private final String plaidPublicKey;

    public IndexResource(String _plaidEnvironment, String _plaidPublicKey) {
        plaidEnvironment = _plaidEnvironment;
        plaidPublicKey = _plaidPublicKey;
    }

    @GET
    public IndexView get() {
        return new IndexView(plaidEnvironment, plaidPublicKey);
    }

    public class IndexView extends View {
        @JsonProperty
        private final String plaidEnvironment;

        @JsonProperty
        private final String plaidPublicKey;

        public IndexView(String _plaidEnvironment, String _plaidPublicKey) {
            super("../../../../templates/index.ftl");
            plaidEnvironment = _plaidEnvironment;
            plaidPublicKey = _plaidPublicKey;
        }

        public String getPlaidEnvironment() {
            return plaidEnvironment;
        }

        public String getPlaidPublicKey() {
            return plaidPublicKey;
        }
    }
}
