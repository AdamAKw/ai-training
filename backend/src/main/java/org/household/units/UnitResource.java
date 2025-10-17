package org.household.units;

import io.smallrye.mutiny.Uni;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import java.util.Arrays;
import org.household.common.ApiResponse;
import org.jboss.resteasy.reactive.RestResponse;
import org.jboss.resteasy.reactive.RestResponse.Status;

@Path("/api/units")
@Produces(MediaType.APPLICATION_JSON)
public class UnitResource {


    @GET
    public Uni<RestResponse<ApiResponse>> getAllUnits() {
        return Uni.createFrom().item(Unit.values()).onItem().transform(Arrays::asList).onItem()
            .transform(units ->
                units.stream()
                    .map(unit -> new UnitResponse.UniDto(unit.getValue(), unit.getLabel())).toList()
            ).onItem().transform(UnitResponse::new).onItem()
            .transform(response -> ApiResponse.success("units", response))
            .onItem().transform(response -> RestResponse.status(Status.OK, response));
    }
}
