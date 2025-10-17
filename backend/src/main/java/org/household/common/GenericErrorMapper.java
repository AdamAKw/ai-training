package org.household.common;

import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import lombok.extern.slf4j.Slf4j;

//@Provider
@Slf4j
public class GenericErrorMapper implements ExceptionMapper<Exception> {

    @Override
    public Response toResponse(Exception exception) {
        log.error("Failed to execute request", exception);
        var errorStatus = Response.Status.INTERNAL_SERVER_ERROR;
        return Response.status(errorStatus)
                .entity(ApiResponse.error("Failed to execute request",
                        errorStatus.getStatusCode()))
                .build();
    }

}
