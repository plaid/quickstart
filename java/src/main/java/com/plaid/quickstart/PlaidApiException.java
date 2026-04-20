package com.plaid.quickstart;

import java.util.Map;

public class PlaidApiException extends RuntimeException {
    private final Map<String, Object> errorResponse;
    private final int statusCode;

    public PlaidApiException(Map<String, Object> errorResponse, int statusCode) {
        super(errorResponse.toString());
        this.errorResponse = errorResponse;
        this.statusCode = statusCode;
    }

    public Map<String, Object> getErrorResponse() {
        return errorResponse;
    }

    public int getStatusCode() {
        return statusCode;
    }
}
