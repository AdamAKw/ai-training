package org.household.common;

import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
@Provider
public class ParameterConverterExceptionMapper  implements ExceptionMapper<ParamConverterException> {
    @Override
    public Response toResponse(ParamConverterException exception) {
        return Response.status(Response.Status.BAD_REQUEST)
            .entity(ApiResponse.error(exception.getMessage(), 400))
            .build();
    }
}
