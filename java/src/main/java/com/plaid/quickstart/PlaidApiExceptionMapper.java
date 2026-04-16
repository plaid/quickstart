package com.plaid.quickstart;

import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;

public class PlaidApiExceptionMapper implements ExceptionMapper<PlaidApiException> {
    @Override
    public Response toResponse(PlaidApiException exception) {
        return Response.ok(exception.getErrorResponse())
            .type(MediaType.APPLICATION_JSON)
            .build();
    }
}
