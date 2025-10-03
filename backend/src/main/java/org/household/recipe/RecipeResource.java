package org.household.recipe;

import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import lombok.extern.slf4j.Slf4j;
import org.bson.types.ObjectId;
import org.household.common.ApiResponse;
import org.household.common.ValidationException;
import org.jboss.logging.Logger;
import org.jboss.resteasy.reactive.RestResponse;

import io.smallrye.mutiny.Uni;

@Path("/api/recipes")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Slf4j
public class RecipeResource {

    private static final Logger LOG = Logger.getLogger(RecipeResource.class);

    @Inject
    RecipeService recipeService;


    @GET
    public Uni<RestResponse<ApiResponse>> getAllRecipes() {
        return recipeService.getAllRecipes()
                .onItem()
                .transform(recipes -> RestResponse.ok(ApiResponse.success("recipes", recipes)));
    }

    @POST
    public Uni<RestResponse<ApiResponse>> createRecipe(@Valid Recipe recipe) {
        return recipeService.createRecipe(recipe)
                .onItem()
                .transform(createdRecipe -> RestResponse.status(RestResponse.Status.CREATED,
                        ApiResponse.success("recipe", createdRecipe)))
                .onFailure(ValidationException.class)
                .recoverWithItem(ex -> {
                    log.warn("Validation error creating recipe: {}", ex.getMessage());
                    return RestResponse.status(RestResponse.Status.BAD_REQUEST, ApiResponse.error("Invalid recipe data",
                            400, ((ValidationException) ex).getValidationIssues()));
                });
    }

    @GET
    @Path("/{id}")
    public Uni<RestResponse<ApiResponse>> getRecipeById(@PathParam("id") String id) {
        if (!ObjectId.isValid(id)) {
            return Uni.createFrom().item(RestResponse.status(RestResponse.Status.BAD_REQUEST,
                    ApiResponse.error("Invalid recipe ID format", 400)));
        }

        return recipeService.getRecipeById(new ObjectId(id))
                .onItem()
                .transform(recipe -> {
                    if (recipe == null) {
                        return RestResponse.status(RestResponse.Status.NOT_FOUND,
                                ApiResponse.error("Recipe not found", 404));
                    }
                    return RestResponse.ok(ApiResponse.success("recipe", recipe));
                });
    }

    @PUT
    @Path("/{id}")
    public Uni<RestResponse<ApiResponse>> updateRecipe(@PathParam("id") String id, @Valid Recipe recipe) {
        if (!ObjectId.isValid(id)) {
            return Uni.createFrom().item(RestResponse.status(RestResponse.Status.BAD_REQUEST,
                    ApiResponse.error("Invalid recipe ID format", 400)));
        }

        return recipeService.updateRecipe(new ObjectId(id), recipe)
                .onItem()
                .transform(updatedRecipe -> {
                    if (updatedRecipe == null) {
                        return RestResponse.status(RestResponse.Status.NOT_FOUND,
                                ApiResponse.error("Recipe not found", 404));
                    }
                    return RestResponse.ok(ApiResponse.success("recipe", updatedRecipe));
                })
                .onFailure(ValidationException.class)
                .recoverWithItem(ex -> {
                    LOG.warnf("Validation error updating recipe: %s", ex.getMessage());
                    return RestResponse.status(RestResponse.Status.BAD_REQUEST, ApiResponse.error("Invalid recipe data",
                            400, ((ValidationException) ex).getValidationIssues()));
                });
    }

    @DELETE
    @Path("/{id}")
    public Uni<RestResponse<ApiResponse>> deleteRecipe(@PathParam("id") String id) {

        if (!ObjectId.isValid(id)) {
            return Uni.createFrom().item(RestResponse.status(RestResponse.Status.BAD_REQUEST,
                    ApiResponse.error("Invalid recipe ID format", 400)));
        }

        return recipeService.deleteRecipe(new ObjectId(id))
                .onItem()
                .transform(deleted -> {
                    if (!deleted) {
                        return RestResponse.status(RestResponse.Status.NOT_FOUND,
                                ApiResponse.error("Recipe not found", 404));
                    }
                    return RestResponse.ok(ApiResponse.success("message", "Recipe deleted successfully"));
                });

    }

    @GET
    @Path("/search")
    public Uni<RestResponse<ApiResponse>> searchRecipes(@QueryParam("name") String name) {
        if (name == null || name.trim().isEmpty()) {
            return Uni.createFrom().item(RestResponse.status(RestResponse.Status.BAD_REQUEST,
                    ApiResponse.error("Search name parameter is required", 400)));
        }

        return recipeService.searchRecipesByName(name)
                .onItem()
                .transform(recipes -> RestResponse.ok(ApiResponse.success("recipes", recipes)));
    }
}
