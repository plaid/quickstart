package com.plaid.quickstart;

import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;

public class PlaidApiExceptionMapper implements ExceptionMapper<PlaidApiException> {
    @Override
    public Response toResponse(PlaidApiException exception) {
        System.out.println(exception.getErrorResponse());
        int statusCode = exception.getStatusCode();
        return Response.status(statusCode)
            .entity(exception.getErrorResponse())
            .type(MediaType.APPLICATION_JSON)
            .build();
    }
}
