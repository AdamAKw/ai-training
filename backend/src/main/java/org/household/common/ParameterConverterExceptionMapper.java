package org.household.pantry;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import org.household.common.ApiResponse;
import org.household.common.ParamConverterException;
import org.jboss.resteasy.reactive.RestResponse;
import org.jboss.resteasy.reactive.server.ServerExceptionMapper;
@ApplicationScoped
public class ParameterConverterExceptionMapper  {

    @ServerExceptionMapper
    public Uni<RestResponse<ApiResponse>> mapException(ParamConverterException exception) {
        return Uni.createFrom().item(RestResponse.status(
            RestResponse.Status.BAD_REQUEST,
            ApiResponse.error(exception.getMessage(), 400)));
    }
}
