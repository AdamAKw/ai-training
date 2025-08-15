package org.household.shoppinglist;

import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lombok.extern.slf4j.Slf4j;

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
@Slf4j
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
     * Update shopping list with various operations (for compatibility with Next.js)
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

            ObjectId shoppingListId = new ObjectId(id);

            // Handle different operations
            if ("toggle-purchased".equals(request.operation)) {
                ShoppingList updatedList = shoppingListService.toggleItemPurchasedById(
                        shoppingListId,
                        request.itemId,
                        request.purchased != null ? request.purchased : true,
                        request.autoAddToPantry != null ? request.autoAddToPantry : false);
                return Response.ok(ApiResponse.success("shoppingList", updatedList)).build();

            } else if ("remove-item".equals(request.operation)) {
                ShoppingList updatedList = shoppingListService.removeItemById(shoppingListId, request.itemId);
                return Response.ok(ApiResponse.success("shoppingList", updatedList)).build();

            } else if ("transfer-to-pantry".equals(request.operation)) {
                ShoppingList updatedList = shoppingListService.transferItemsToPantry(
                        shoppingListId,
                        request.itemIds);
                return Response.ok(ApiResponse.success("shoppingList", updatedList)).build();

            } else if ("add-item".equals(request.operation)) {
                if (request.item == null || request.item.ingredient == null || request.item.quantity == null
                        || request.item.unit == null) {
                    return Response.status(Response.Status.BAD_REQUEST)
                            .entity(ApiResponse.error("Invalid item data - ingredient, quantity, and unit are required",
                                    400))
                            .build();
                }

                ShoppingList updatedList = shoppingListService.addItemToShoppingList(shoppingListId, request.item);
                return Response.ok(ApiResponse.success("shoppingList", updatedList)).build();

            } else if (request.itemIndex != null) {
                // Legacy support: Toggle item purchased status by index
                shoppingListService.toggleItemPurchased(shoppingListId, request.itemIndex);
                return Response.ok(ApiResponse.success("message", "Item status toggled successfully")).build();

            } else if (request.isCompleted != null && request.isCompleted) {
                // Legacy support: Complete shopping list
                boolean addToPantry = request.addToPantry != null ? request.addToPantry : true;
                shoppingListService.completeShoppingList(shoppingListId, addToPantry);
                return Response.ok(ApiResponse.success("message", "Shopping list completed successfully")).build();

            } else {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(ApiResponse.error("Invalid patch request - operation is required", 400))
                        .build();
            }
        } catch (ValidationException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(ApiResponse.error(e.getMessage(), 400, e.getValidationIssues()))
                    .build();
        } catch (Exception e) {
            log.error("Error", e);
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
        public String operation; // The operation to perform

        // For toggle-purchased operation
        public String itemId; // Item ID for specific operations
        public Boolean purchased; // New purchased status
        public Boolean autoAddToPantry; // Whether to auto-add to pantry when purchased

        // For remove-item operation
        // Uses itemId from above

        // For transfer-to-pantry operation
        public List<String> itemIds; // List of item IDs to transfer (optional, if null transfers all purchased
                                     // items)

        // For add-item operation
        public AddItemData item; // The item to add

        // Legacy fields for backward compatibility
        public Integer itemIndex; // For toggling item purchased status
        public Boolean isCompleted; // For marking as completed
        public Boolean addToPantry; // Whether to add completed items to pantry
    }

    /**
     * Request class for adding items to shopping list
     */
    public static class AddItemData {
        public String ingredient;
        public Double quantity;
        public String unit;
        public String category;
        public String notes;
    }
}
