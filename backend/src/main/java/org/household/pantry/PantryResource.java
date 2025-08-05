package org.household.pantry;

import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.bson.types.ObjectId;
import org.household.common.ApiResponse;
import org.household.common.ValidationException;

import java.util.List;

/**
 * REST Resource for PantryItem management
 * Equivalent to Next.js /api/pantry endpoints
 */
@Path("/api/pantry")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PantryResource {

    @Inject
    PantryService pantryService;

    /**
     * GET /api/pantry
     * Fetch all pantry items
     */
    @GET
    public Response getAllPantryItems() {
        try {
            List<PantryItem> pantryItems = pantryService.getAllPantryItems();
            return Response.ok(ApiResponse.success("pantryItems", pantryItems)).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(ApiResponse.error("Failed to fetch pantry items", 500))
                    .build();
        }
    }

    /**
     * POST /api/pantry
     * Create a new pantry item
     */
    @POST
    public Response createPantryItem(@Valid PantryItem pantryItem) {
        try {
            PantryItem createdItem = pantryService.createPantryItem(pantryItem);
            return Response.status(Response.Status.CREATED)
                    .entity(ApiResponse.success("pantryItem", createdItem))
                    .build();
        } catch (ValidationException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(ApiResponse.error("Invalid pantry item data", 400, e.getValidationIssues()))
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(ApiResponse.error("Failed to create pantry item", 500))
                    .build();
        }
    }

    /**
     * GET /api/pantry/{id}
     * Fetch a specific pantry item by ID
     */
    @GET
    @Path("/{id}")
    public Response getPantryItemById(@PathParam("id") String id) {
        try {
            if (!ObjectId.isValid(id)) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(ApiResponse.error("Invalid pantry item ID format", 400))
                        .build();
            }

            PantryItem pantryItem = pantryService.getPantryItemById(new ObjectId(id));
            if (pantryItem == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(ApiResponse.error("Pantry item not found", 404))
                        .build();
            }

            return Response.ok(ApiResponse.success("pantryItem", pantryItem)).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(ApiResponse.error("Failed to fetch pantry item", 500))
                    .build();
        }
    }

    /**
     * PUT /api/pantry/{id}
     * Update an existing pantry item
     */
    @PUT
    @Path("/{id}")
    public Response updatePantryItem(@PathParam("id") String id, @Valid PantryItem pantryItem) {
        try {
            if (!ObjectId.isValid(id)) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(ApiResponse.error("Invalid pantry item ID format", 400))
                        .build();
            }

            PantryItem updatedItem = pantryService.updatePantryItem(new ObjectId(id), pantryItem);
            if (updatedItem == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(ApiResponse.error("Pantry item not found", 404))
                        .build();
            }

            return Response.ok(ApiResponse.success("pantryItem", updatedItem)).build();
        } catch (ValidationException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(ApiResponse.error("Invalid pantry item data", 400, e.getValidationIssues()))
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(ApiResponse.error("Failed to update pantry item", 500))
                    .build();
        }
    }

    /**
     * DELETE /api/pantry/{id}
     * Delete a pantry item
     */
    @DELETE
    @Path("/{id}")
    public Response deletePantryItem(@PathParam("id") String id) {
        try {
            if (!ObjectId.isValid(id)) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(ApiResponse.error("Invalid pantry item ID format", 400))
                        .build();
            }

            boolean deleted = pantryService.deletePantryItem(new ObjectId(id));
            if (!deleted) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(ApiResponse.error("Pantry item not found", 404))
                        .build();
            }

            return Response.ok(ApiResponse.success("message", "Pantry item deleted successfully")).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(ApiResponse.error("Failed to delete pantry item", 500))
                    .build();
        }
    }

    /**
     * GET /api/pantry/search
     * Search pantry items by name
     */
    @GET
    @Path("/search")
    public Response searchPantryItems(@QueryParam("name") String name) {
        try {
            if (name == null || name.trim().isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(ApiResponse.error("Search name parameter is required", 400))
                        .build();
            }

            List<PantryItem> items = pantryService.searchPantryItemsByName(name);
            return Response.ok(ApiResponse.success("pantryItems", items)).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(ApiResponse.error("Failed to search pantry items", 500))
                    .build();
        }
    }

    /**
     * GET /api/pantry/expiring
     * Get pantry items expiring within the specified number of days
     */
    @GET
    @Path("/expiring")
    public Response getExpiringItems(@QueryParam("days") @DefaultValue("7") int days) {
        try {
            if (days < 0) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(ApiResponse.error("Days parameter must be non-negative", 400))
                        .build();
            }

            List<PantryItem> items = pantryService.getItemsExpiringSoon(days);
            return Response.ok(ApiResponse.success("pantryItems", items)).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(ApiResponse.error("Failed to fetch expiring items", 500))
                    .build();
        }
    }
}
