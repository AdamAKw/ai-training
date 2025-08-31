package org.household.recipe;

import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.bson.types.ObjectId;
import org.household.common.ApiResponse;
import org.household.common.ValidationException;
import org.jboss.logging.Logger;

import java.util.List;


@Path("/api/recipes")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class RecipeResource {

    private static final Logger LOG = Logger.getLogger(RecipeResource.class);

    @Inject
    RecipeService recipeService;

    /**
     * GET /api/recipes
     * Fetch all recipes
     */
    @GET
    public Response getAllRecipes() {
            List<Recipe> recipes = recipeService.getAllRecipes();
            return Response.ok(ApiResponse.success("recipes", recipes)).build();
    }


    @POST
    public Response createRecipe(@Valid Recipe recipe) {
        try {
            Recipe createdRecipe = recipeService.createRecipe(recipe);
            return Response.status(Response.Status.CREATED)
                    .entity(ApiResponse.success("recipe", createdRecipe))
                    .build();
        } catch (ValidationException e) {
            LOG.warnf("Validation error creating recipe: %s", e.getMessage());
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(ApiResponse.error("Invalid recipe data", 400, e.getValidationIssues()))
                    .build();
        }
    }

    @GET
    @Path("/{id}")
    public Response getRecipeById(@PathParam("id") String id) {
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
    }

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
            LOG.warnf("Validation error updating recipe: %s", e.getMessage());
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(ApiResponse.error("Invalid recipe data", 400, e.getValidationIssues()))
                    .build();
        } 
    }


    @DELETE
    @Path("/{id}")
    public Response deleteRecipe(@PathParam("id") String id) {
  
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
       
    }


    @GET
    @Path("/search")
    public Response searchRecipes(@QueryParam("name") String name) {
            if (name == null || name.trim().isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(ApiResponse.error("Search name parameter is required", 400))
                        .build();
            }

            List<Recipe> recipes = recipeService.searchRecipesByName(name);
            return Response.ok(ApiResponse.success("recipes", recipes)).build();
    }
}
