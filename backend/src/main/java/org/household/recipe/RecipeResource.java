package org.household.recipe;

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
 * REST Resource for Recipe management
 * Equivalent to Next.js /api/recipes endpoints
 */
@Path("/api/recipes")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class RecipeResource {

    @Inject
    RecipeService recipeService;

    /**
     * GET /api/recipes
     * Fetch all recipes
     */
    @GET
    public Response getAllRecipes() {
        try {
            List<Recipe> recipes = recipeService.getAllRecipes();
            return Response.ok(ApiResponse.success("recipes", recipes)).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(ApiResponse.error("Failed to fetch recipes", 500))
                    .build();
        }
    }

    /**
     * POST /api/recipes
     * Create a new recipe
     */
    @POST
    public Response createRecipe(@Valid Recipe recipe) {
        try {
            Recipe createdRecipe = recipeService.createRecipe(recipe);
            return Response.status(Response.Status.CREATED)
                    .entity(ApiResponse.success("recipe", createdRecipe))
                    .build();
        } catch (ValidationException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(ApiResponse.error("Invalid recipe data", 400, e.getValidationIssues()))
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(ApiResponse.error("Failed to create recipe", 500))
                    .build();
        }
    }

    /**
     * GET /api/recipes/{id}
     * Fetch a specific recipe by ID
     */
    @GET
    @Path("/{id}")
    public Response getRecipeById(@PathParam("id") String id) {
        try {
            if (!ObjectId.isValid(id)) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(ApiResponse.error("Invalid recipe ID format", 400))
                        .build();
            }

            Recipe recipe = recipeService.getRecipeById(new ObjectId(id));
            if (recipe == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(ApiResponse.error("Recipe not found", 404))
                        .build();
            }

            return Response.ok(ApiResponse.success("recipe", recipe)).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(ApiResponse.error("Failed to fetch recipe", 500))
                    .build();
        }
    }

    /**
     * PUT /api/recipes/{id}
     * Update an existing recipe
     */
    @PUT
    @Path("/{id}")
    public Response updateRecipe(@PathParam("id") String id, @Valid Recipe recipe) {
        try {
            if (!ObjectId.isValid(id)) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(ApiResponse.error("Invalid recipe ID format", 400))
                        .build();
            }

            Recipe updatedRecipe = recipeService.updateRecipe(new ObjectId(id), recipe);
            if (updatedRecipe == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(ApiResponse.error("Recipe not found", 404))
                        .build();
            }

            return Response.ok(ApiResponse.success("recipe", updatedRecipe)).build();
        } catch (ValidationException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(ApiResponse.error("Invalid recipe data", 400, e.getValidationIssues()))
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(ApiResponse.error("Failed to update recipe", 500))
                    .build();
        }
    }

    /**
     * DELETE /api/recipes/{id}
     * Delete a recipe
     */
    @DELETE
    @Path("/{id}")
    public Response deleteRecipe(@PathParam("id") String id) {
        try {
            if (!ObjectId.isValid(id)) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(ApiResponse.error("Invalid recipe ID format", 400))
                        .build();
            }

            boolean deleted = recipeService.deleteRecipe(new ObjectId(id));
            if (!deleted) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(ApiResponse.error("Recipe not found", 404))
                        .build();
            }

            return Response.ok(ApiResponse.success("message", "Recipe deleted successfully")).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(ApiResponse.error("Failed to delete recipe", 500))
                    .build();
        }
    }

    /**
     * GET /api/recipes/search
     * Search recipes by name
     */
    @GET
    @Path("/search")
    public Response searchRecipes(@QueryParam("name") String name) {
        try {
            if (name == null || name.trim().isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(ApiResponse.error("Search name parameter is required", 400))
                        .build();
            }

            List<Recipe> recipes = recipeService.searchRecipesByName(name);
            return Response.ok(ApiResponse.success("recipes", recipes)).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(ApiResponse.error("Failed to search recipes", 500))
                    .build();
        }
    }
}
