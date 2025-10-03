package org.household.pantry;

import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import lombok.extern.slf4j.Slf4j;

import org.bson.types.ObjectId;
import org.household.common.ApiResponse;
import org.household.common.ValidationException;
import org.jboss.resteasy.reactive.RestResponse;

import io.smallrye.mutiny.Uni;


@Path("/api/pantry")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Slf4j
public class PantryResource {

        @Inject
        PantryItemMapper mapper;
        @Inject
        PantryService pantryService;

        @GET
        public Uni<RestResponse<ApiResponse>> getAllPantryItems() {
                return pantryService.getAllPantryItems()
                                .onItem()
                                .transform(items -> RestResponse.ok(ApiResponse.success("pantryItems", items)));
        }

        @POST
        public Uni<RestResponse<ApiResponse>> createPantryItem(@Valid @NotNull CreateItemRequest pantryItem) {
                try {
                        return pantryService.createPantryItem(mapper.createToPantryItem(pantryItem))
                                        .onItem()
                                        .transform(createdItem -> RestResponse.status(RestResponse.Status.CREATED,
                                                        ApiResponse.success("pantryItem", createdItem)))
                                        .onFailure()
                                        .recoverWithItem(throwable -> RestResponse.status(
                                                        RestResponse.Status.BAD_REQUEST,
                                                        ApiResponse.error("Failed to create pantry item", 400)));
                } catch (ValidationException e) {
                        return Uni.createFrom().item(RestResponse.status(RestResponse.Status.BAD_REQUEST,
                                        ApiResponse.error("Invalid pantry item data", 400, e.getValidationIssues())));
                }
        }

        @GET
        @Path("/{id}")
        public Uni<RestResponse<ApiResponse>> getPantryItemById(@PathParam("id") String id) {
                if (!ObjectId.isValid(id)) {
                        return Uni.createFrom().item(RestResponse.status(RestResponse.Status.BAD_REQUEST,
                                        ApiResponse.error("Invalid pantry item ID format", 400)));
                }

                return pantryService.getPantryItemById(new ObjectId(id))
                                .onItem().transform(pantryItem -> {
                                        if (pantryItem == null) {
                                                return RestResponse.status(RestResponse.Status.NOT_FOUND,
                                                                ApiResponse.error("Pantry item not found", 404));
                                        }
                                        return RestResponse.ok(ApiResponse.success("pantryItem", pantryItem));
                                });
        }

        @PUT
        @Path("/{id}")
        public Uni<RestResponse<ApiResponse>> updatePantryItem(@PathParam("id") String id,
                        @Valid PantryItem pantryItem) {
                try {
                        if (!ObjectId.isValid(id)) {
                                return Uni.createFrom().item(RestResponse.status(RestResponse.Status.BAD_REQUEST,
                                                ApiResponse.error("Invalid pantry item ID format", 400)));
                        }

                        return pantryService.updatePantryItem(new ObjectId(id), pantryItem)
                                        .onItem()
                                        .transform(updatedItem -> RestResponse
                                                        .ok(ApiResponse.success("pantryItem", updatedItem)))
                                        .onFailure(NotFoundException.class).recoverWithItem(
                                                        RestResponse.status(RestResponse.Status.NOT_FOUND,
                                                                        ApiResponse.error("Pantry item not found",
                                                                                        404)));
                } catch (ValidationException e) {
                        return Uni.createFrom().item(RestResponse.status(RestResponse.Status.BAD_REQUEST,
                                        ApiResponse.error("Invalid pantry item data", 400, e.getValidationIssues())));
                }
        }

        @DELETE
        @Path("/{id}")
        public Uni<RestResponse<ApiResponse>> deletePantryItem(@PathParam("id") String id) {
                if (!ObjectId.isValid(id)) {
                        return Uni.createFrom().item(RestResponse.status(RestResponse.Status.BAD_REQUEST,
                                        ApiResponse.error("Invalid pantry item ID format", 400)));
                }

                return pantryService.deletePantryItem(new ObjectId(id))
                                .onItem().transform(deleted -> {
                                        if (!deleted) {
                                                return RestResponse.status(RestResponse.Status.NOT_FOUND,
                                                                ApiResponse.error("Pantry item not found", 404));
                                        }
                                        return RestResponse.ok(ApiResponse.success("message",
                                                        "Pantry item deleted successfully"));
                                });
        }

        @GET
        @Path("/search")
        public Uni<RestResponse<ApiResponse>> searchPantryItems(@QueryParam("name") String name) {
                if (name == null || name.trim().isEmpty()) {
                        return Uni.createFrom().item(RestResponse.status(RestResponse.Status.BAD_REQUEST,
                                        ApiResponse.error("Search name parameter is required", 400)));
                }

                return pantryService.searchPantryItemsByName(name)
                                .onItem()
                                .transform(items -> RestResponse.ok(ApiResponse.success("pantryItems", items)));
        }

        /**
         * GET /api/pantry/expiring
         * Get pantry items expiring within the specified number of days
         */
        @GET
        @Path("/expiring")
        public Uni<RestResponse<ApiResponse>> getExpiringItems(@QueryParam("days") @DefaultValue("7") int days) {
                if (days < 0) {
                        return Uni.createFrom().item(RestResponse.status(RestResponse.Status.BAD_REQUEST,
                                        ApiResponse.error("Days parameter must be non-negative", 400)));
                }

                return pantryService.getItemsExpiringSoon(days)
                                .onItem()
                                .transform(items -> RestResponse.ok(ApiResponse.success("pantryItems", items)));
        }
}
