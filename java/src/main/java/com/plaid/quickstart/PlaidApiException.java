package com.plaid.quickstart;

import java.util.Map;

public class PlaidApiException extends RuntimeException {
    private final Map<String, Object> errorResponse;

    public PlaidApiException(Map<String, Object> errorResponse) {
        super(errorResponse.toString());
        this.errorResponse = errorResponse;
    }

    public Map<String, Object> getErrorResponse() {
        return errorResponse;
    }
}
