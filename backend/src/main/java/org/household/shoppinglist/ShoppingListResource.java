package org.household.shoppinglist;

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
 * REST Resource for ShoppingList management
 * Equivalent to Next.js /api/shoppingList endpoints
 */
@Path("/api/shoppingList")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ShoppingListResource {

    @Inject
    ShoppingListService shoppingListService;

    /**
     * GET /api/shoppingList
     * Fetch all shopping lists
     */
    @GET
    public Response getAllShoppingLists() {
        try {
            List<ShoppingList> shoppingLists = shoppingListService.getAllShoppingLists();
            return Response.ok(ApiResponse.success("shoppingLists", shoppingLists)).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(ApiResponse.error("Failed to fetch shopping lists", 500))
                    .build();
        }
    }

    /**
     * POST /api/shoppingList
     * Create a new shopping list (either from scratch or from meal plan)
     */
    @POST
    public Response createShoppingList(@Valid ShoppingList shoppingList) {
        try {
            ShoppingList createdList = shoppingListService.createShoppingList(shoppingList);
            return Response.status(Response.Status.CREATED)
                    .entity(ApiResponse.success("shoppingList", createdList))
                    .build();
        } catch (ValidationException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(ApiResponse.error("Invalid shopping list data", 400, e.getValidationIssues()))
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(ApiResponse.error("Failed to create shopping list", 500))
                    .build();
        }
    }

    /**
     * POST /api/shoppingList/fromMealPlan
     * Create shopping list from meal plan
     */
    @POST
    @Path("/fromMealPlan")
    public Response createShoppingListFromMealPlan(
            @QueryParam("mealPlanId") String mealPlanId,
            @QueryParam("name") String name) {
        try {
            if (mealPlanId == null || !ObjectId.isValid(mealPlanId)) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(ApiResponse.error("Valid meal plan ID is required", 400))
                        .build();
            }

            ShoppingList createdList = shoppingListService.createShoppingListFromMealPlan(
                    new ObjectId(mealPlanId), name);

            return Response.status(Response.Status.CREATED)
                    .entity(ApiResponse.success("shoppingList", createdList))
                    .build();
        } catch (ValidationException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(ApiResponse.error(e.getMessage(), 400, e.getValidationIssues()))
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(ApiResponse.error("Failed to create shopping list from meal plan", 500))
                    .build();
        }
    }

    /**
     * GET /api/shoppingList/{id}
     * Fetch a specific shopping list by ID
     */
    @GET
    @Path("/{id}")
    public Response getShoppingListById(@PathParam("id") String id) {
        try {
            if (!ObjectId.isValid(id)) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(ApiResponse.error("Invalid shopping list ID format", 400))
                        .build();
            }

            ShoppingList shoppingList = shoppingListService.getShoppingListById(new ObjectId(id));
            if (shoppingList == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(ApiResponse.error("Shopping list not found", 404))
                        .build();
            }

            return Response.ok(ApiResponse.success("shoppingList", shoppingList)).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(ApiResponse.error("Failed to fetch shopping list", 500))
                    .build();
        }
    }

    /**
     * PUT /api/shoppingList/{id}
     * Update an existing shopping list
     */
    @PUT
    @Path("/{id}")
    public Response updateShoppingList(@PathParam("id") String id, @Valid ShoppingList shoppingList) {
        try {
            if (!ObjectId.isValid(id)) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(ApiResponse.error("Invalid shopping list ID format", 400))
                        .build();
            }

            ShoppingList updatedList = shoppingListService.updateShoppingList(new ObjectId(id), shoppingList);
            if (updatedList == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(ApiResponse.error("Shopping list not found", 404))
                        .build();
            }

            return Response.ok(ApiResponse.success("shoppingList", updatedList)).build();
        } catch (ValidationException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(ApiResponse.error("Invalid shopping list data", 400, e.getValidationIssues()))
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(ApiResponse.error("Failed to update shopping list", 500))
                    .build();
        }
    }

    /**
     * DELETE /api/shoppingList/{id}
     * Delete a shopping list
     */
    @DELETE
    @Path("/{id}")
    public Response deleteShoppingList(@PathParam("id") String id) {
        try {
            if (!ObjectId.isValid(id)) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(ApiResponse.error("Invalid shopping list ID format", 400))
                        .build();
            }

            boolean deleted = shoppingListService.deleteShoppingList(new ObjectId(id));
            if (!deleted) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(ApiResponse.error("Shopping list not found", 404))
                        .build();
            }

            return Response.ok(ApiResponse.success("message", "Shopping list deleted successfully")).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(ApiResponse.error("Failed to delete shopping list", 500))
                    .build();
        }
    }

    /**
     * POST /api/shoppingList/{id}/complete
     * Complete shopping list and optionally add items to pantry
     */
    @POST
    @Path("/{id}/complete")
    public Response completeShoppingList(
            @PathParam("id") String id,
            @QueryParam("addToPantry") @DefaultValue("true") boolean addToPantry) {
        try {
            if (!ObjectId.isValid(id)) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(ApiResponse.error("Invalid shopping list ID format", 400))
                        .build();
            }

            shoppingListService.completeShoppingList(
                    new ObjectId(id), addToPantry);

            return Response.ok(ApiResponse.success("message", "Shopping list completed successfully")).build();
        } catch (ValidationException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(ApiResponse.error(e.getMessage(), 400, e.getValidationIssues()))
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(ApiResponse.error("Failed to complete shopping list", 500))
                    .build();
        }
    }

    /**
     * POST /api/shoppingList/{id}/items/{itemIndex}/toggle
     * Toggle item purchased status
     */
    @POST
    @Path("/{id}/items/{itemIndex}/toggle")
    public Response toggleItemPurchased(@PathParam("id") String id, @PathParam("itemIndex") int itemIndex) {
        try {
            if (!ObjectId.isValid(id)) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(ApiResponse.error("Invalid shopping list ID format", 400))
                        .build();
            }

            if (itemIndex < 0) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(ApiResponse.error("Invalid item index", 400))
                        .build();
            }

            shoppingListService.toggleItemPurchased(
                    new ObjectId(id), itemIndex);

            return Response.ok(ApiResponse.success("message", "Item status toggled successfully")).build();
        } catch (ValidationException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(ApiResponse.error(e.getMessage(), 400, e.getValidationIssues()))
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(ApiResponse.error("Failed to toggle item status", 500))
                    .build();
        }
    }

    /**
     * GET /api/shoppingList/pending
     * Get all pending (uncompleted) shopping lists
     */
    @GET
    @Path("/pending")
    public Response getPendingShoppingLists() {
        try {
            List<ShoppingList> pendingLists = shoppingListService.findPendingShoppingLists();
            return Response.ok(ApiResponse.success("shoppingLists", pendingLists)).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(ApiResponse.error("Failed to fetch pending shopping lists", 500))
                    .build();
        }
    }

    /**
     * GET /api/shoppingList/completed
     * Get all completed shopping lists
     */
    @GET
    @Path("/completed")
    public Response getCompletedShoppingLists() {
        try {
            List<ShoppingList> completedLists = shoppingListService.findCompletedShoppingLists();
            return Response.ok(ApiResponse.success("shoppingLists", completedLists)).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(ApiResponse.error("Failed to fetch completed shopping lists", 500))
                    .build();
        }
    }

    /**
     * GET /api/shoppingList/byMealPlan/{mealPlanId}
     * Get shopping lists by meal plan ID
     */
    @GET
    @Path("/byMealPlan/{mealPlanId}")
    public Response getShoppingListsByMealPlan(@PathParam("mealPlanId") String mealPlanId) {
        try {
            if (!ObjectId.isValid(mealPlanId)) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(ApiResponse.error("Invalid meal plan ID format", 400))
                        .build();
            }

            List<ShoppingList> shoppingLists = shoppingListService.findShoppingListsByMealPlan(
                    new ObjectId(mealPlanId));

            return Response.ok(ApiResponse.success("shoppingLists", shoppingLists)).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(ApiResponse.error("Failed to fetch shopping lists by meal plan", 500))
                    .build();
        }
    }
}
