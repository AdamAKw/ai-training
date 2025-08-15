package org.household.shoppinglist;

import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.bson.types.ObjectId;
import org.household.common.ApiResponse;
import org.household.common.ValidationException;

import java.util.ArrayList;
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
    public Response createShoppingList(CreateShoppingListRequest request) {
        try {
            ShoppingList createdList;

            if (request.mealPlanId != null && ObjectId.isValid(request.mealPlanId)) {
                // Create from meal plan
                createdList = shoppingListService.createShoppingListFromMealPlan(
                        new ObjectId(request.mealPlanId),
                        request.name);
            } else {
                // Create from scratch
                ShoppingList shoppingList = new ShoppingList();
                shoppingList.name = request.name;
                shoppingList.description = request.description;
                shoppingList.items = request.items != null ? request.items : new ArrayList<>();

                createdList = shoppingListService.createShoppingList(shoppingList);
            }

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
     * PATCH /api/shoppingList/{id}
     * Update shopping list with partial data (for compatibility with Next.js)
     */
    @PATCH
    @Path("/{id}")
    public Response patchShoppingList(@PathParam("id") String id, PatchShoppingListRequest request) {
        try {
            if (!ObjectId.isValid(id)) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(ApiResponse.error("Invalid shopping list ID format", 400))
                        .build();
            }

            if (request.itemIndex != null) {
                // Toggle item purchased status
                shoppingListService.toggleItemPurchased(new ObjectId(id), request.itemIndex);
                return Response.ok(ApiResponse.success("message", "Item status toggled successfully")).build();
            } else if (request.isCompleted != null && request.isCompleted) {
                // Complete shopping list
                boolean addToPantry = request.addToPantry != null ? request.addToPantry : true;
                shoppingListService.completeShoppingList(new ObjectId(id), addToPantry);
                return Response.ok(ApiResponse.success("message", "Shopping list completed successfully")).build();
            } else {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(ApiResponse.error("Invalid patch request", 400))
                        .build();
            }
        } catch (ValidationException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(ApiResponse.error(e.getMessage(), 400, e.getValidationIssues()))
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(ApiResponse.error("Failed to update shopping list", 500))
                    .build();
        }
    }

    /**
     * Request class for creating shopping list
     */
    public static class CreateShoppingListRequest {
        public String name;
        public String description;
        public String mealPlanId; // Optional - if provided, create from meal plan
        public List<ShoppingList.ShoppingListItem> items; // Optional - for manual creation
    }

    /**
     * Request class for copying shopping list
     */
    public static class CopyShoppingListRequest {
        public String name;
    }

    /**
     * Request class for patching shopping list
     */
    public static class PatchShoppingListRequest {
        public Integer itemIndex; // For toggling item purchased status
        public Boolean isCompleted; // For marking as completed
        public Boolean addToPantry; // Whether to add completed items to pantry
    }
}
