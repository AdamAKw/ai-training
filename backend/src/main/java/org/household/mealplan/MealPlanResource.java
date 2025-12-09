package org.household.mealplan;

import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import lombok.extern.slf4j.Slf4j;

import org.bson.types.ObjectId;
import org.household.common.ApiResponse;
import org.household.common.ValidationException;
import org.jboss.resteasy.reactive.RestResponse;

import io.smallrye.mutiny.Uni;

import java.time.LocalDate;

@Path("/api/mealPlans")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Slf4j
public class MealPlanResource {

    @Inject
    MealPlanService mealPlanService;

    @GET
    public Uni<RestResponse<ApiResponse>> getAllMealPlans(@QueryParam("date") LocalDate date) {
        if (date != null) {
            return mealPlanService.findMealPlansIncludeDate(date)
                    .onItem()
                    .transform(plans -> RestResponse.ok(ApiResponse.success("mealPlans", plans)));
        }

        return mealPlanService.getAllMealPlans()
                .onItem()
                .transform(mealPlans -> RestResponse.ok(ApiResponse.success("mealPlans", mealPlans)));
    }

    /**
     * POST /api/mealPlans
     * Create a new meal plan
     */
    @POST
    public Uni<RestResponse<ApiResponse>> createMealPlan(@Valid MealPlan mealPlan) {
        try {
            return mealPlanService.createMealPlan(mealPlan)
                    .onItem()
                    .transform(createdMealPlan -> RestResponse.status(RestResponse.Status.CREATED,
                            ApiResponse.success("mealPlan", createdMealPlan)))
                    .onFailure()
                    .recoverWithItem(throwable -> RestResponse.status(
                            RestResponse.Status.BAD_REQUEST,
                            ApiResponse.error("Failed to create meal plan", 400)));
        } catch (ValidationException e) {
            log.warn("Validation error creating meal plan: %s", e.getMessage());
            return Uni.createFrom().item(RestResponse.status(RestResponse.Status.BAD_REQUEST,
                    ApiResponse.error("Invalid meal plan data", 400, e.getValidationIssues())));
        }
    }

    /**
     * GET /api/mealPlans/{id}
     * Fetch a specific meal plan by ID
     */
    @GET
    @Path("/{id}")
    public Uni<RestResponse<ApiResponse>> getMealPlanById(@PathParam("id") String id) {

        if (!ObjectId.isValid(id)) {
            return Uni.createFrom().item(RestResponse.status(RestResponse.Status.BAD_REQUEST,
                    ApiResponse.error("Invalid meal plan ID format", 400)));
        }

        return mealPlanService.getMealPlanById(new ObjectId(id))
                .onItem().transform(mealPlanWithRecipes -> {
                    if (mealPlanWithRecipes == null) {
                        return RestResponse.status(RestResponse.Status.NOT_FOUND,
                                ApiResponse.error("Meal plan not found", 404));
                    }
                    return RestResponse.ok(ApiResponse.success("mealPlan", mealPlanWithRecipes));
                });
    }

    /**
     * PUT /api/mealPlans/{id}
     * Update an existing meal plan
     */
    @PUT
    @Path("/{id}")
    public Uni<RestResponse<ApiResponse>> updateMealPlan(@PathParam("id") String id, @Valid MealPlan mealPlan) {
        try {
            if (!ObjectId.isValid(id)) {
                return Uni.createFrom().item(RestResponse.status(RestResponse.Status.BAD_REQUEST,
                        ApiResponse.error("Invalid meal plan ID format", 400)));
            }

            return mealPlanService.updateMealPlan(new ObjectId(id), mealPlan)
                    .onItem()
                    .transform(updatedMealPlan -> RestResponse
                            .ok(ApiResponse.success("mealPlan", updatedMealPlan)))
                    .onFailure(NotFoundException.class).recoverWithItem(
                            RestResponse.status(RestResponse.Status.NOT_FOUND,
                                    ApiResponse.error("Meal plan not found", 404)));
        } catch (ValidationException e) {
            log.warn("Validation error updating meal plan: %s", e.getMessage());
            return Uni.createFrom().item(RestResponse.status(RestResponse.Status.BAD_REQUEST,
                    ApiResponse.error("Invalid meal plan data", 400, e.getValidationIssues())));
        }
    }

    /**
     * DELETE /api/mealPlans/{id}
     * Delete a meal plan
     */
    @DELETE
    @Path("/{id}")
    public Uni<RestResponse<ApiResponse>> deleteMealPlan(@PathParam("id") String id) {

        if (!ObjectId.isValid(id)) {
            return Uni.createFrom().item(RestResponse.status(RestResponse.Status.BAD_REQUEST,
                    ApiResponse.error("Invalid meal plan ID format", 400)));
        }

        return mealPlanService.deleteMealPlan(new ObjectId(id))
                .onItem().transform(deleted -> {
                    if (!deleted) {
                        return RestResponse.status(RestResponse.Status.NOT_FOUND,
                                ApiResponse.error("Meal plan not found", 404));
                    }
                    return RestResponse.ok(ApiResponse.success("message", "Meal plan deleted successfully"));
                });
    }

    /**
     * GET /api/mealPlans/active
     * Get active meal plans
     */
    @GET
    @Path("/active")
    public Uni<RestResponse<ApiResponse>> getActiveMealPlans() {

        return mealPlanService.findActiveMealPlans()
                .onItem()
                .transform(activeMealPlans -> RestResponse.ok(ApiResponse.success("mealPlans", activeMealPlans)));
    }

    /**
     * GET /api/mealPlans/search
     * Search meal plans by date range
     */
    @GET
    @Path("/search")
    public Uni<RestResponse<ApiResponse>> searchMealPlansByDateRange(
            @QueryParam("startDate") String startDateStr,
            @QueryParam("endDate") String endDateStr) {

        if (startDateStr == null || endDateStr == null) {
            return Uni.createFrom().item(RestResponse.status(RestResponse.Status.BAD_REQUEST,
                    ApiResponse.error("Start date and end date parameters are required", 400)));
        }

        LocalDate startDate = LocalDate.parse(startDateStr);
        LocalDate endDate = LocalDate.parse(endDateStr);

        return mealPlanService.findMealPlansByDateRange(startDate, endDate)
                .onItem()
                .transform(mealPlans -> RestResponse.ok(ApiResponse.success("mealPlans", mealPlans)));
    }

    /**
     * POST /api/mealPlans/{id}/meals/{mealIndex}/complete
     * Mark a meal as completed and remove ingredients from pantry
     */
    @POST
    @Path("/{id}/meals/{mealIndex}/complete")
    public Uni<RestResponse<ApiResponse>> completeMeal(@PathParam("id") String id,
            @PathParam("mealIndex") int mealIndex) {
        try {
            if (!ObjectId.isValid(id)) {
                return Uni.createFrom().item(RestResponse.status(RestResponse.Status.BAD_REQUEST,
                        ApiResponse.error("Invalid meal plan ID format", 400)));
            }

            if (mealIndex < 0) {
                return Uni.createFrom().item(RestResponse.status(RestResponse.Status.BAD_REQUEST,
                        ApiResponse.error("Invalid meal index", 400)));
            }

            return mealPlanService.completeMeal(new ObjectId(id), mealIndex)
                    .onItem()
                    .transform(mealPlan -> RestResponse.ok(ApiResponse.success("message", "Meal marked as completed")))
                    .onFailure()
                    .recoverWithItem(throwable -> RestResponse.status(
                            RestResponse.Status.BAD_REQUEST,
                            ApiResponse.error(throwable.getMessage(), 400)));
        } catch (ValidationException e) {
            log.warn("Validation error completing meal: %s", e.getMessage());
            return Uni.createFrom().item(RestResponse.status(RestResponse.Status.BAD_REQUEST,
                    ApiResponse.error(e.getMessage(), 400, e.getValidationIssues())));
        }
    }

    /**
     * DELETE /api/mealPlans/{id}/meals/{mealIndex}/complete
     * Mark a meal as uncompleted and restore ingredients to pantry
     */
    @DELETE
    @Path("/{id}/meals/{mealIndex}/complete")
    public Uni<RestResponse<ApiResponse>> uncompleteMeal(@PathParam("id") String id,
            @PathParam("mealIndex") int mealIndex) {
        try {
            if (!ObjectId.isValid(id)) {
                return Uni.createFrom().item(RestResponse.status(RestResponse.Status.BAD_REQUEST,
                        ApiResponse.error("Invalid meal plan ID format", 400)));
            }

            if (mealIndex < 0) {
                return Uni.createFrom().item(RestResponse.status(RestResponse.Status.BAD_REQUEST,
                        ApiResponse.error("Invalid meal index", 400)));
            }

            return mealPlanService.uncompleteMeal(new ObjectId(id), mealIndex)
                    .onItem()
                    .transform(mealPlan -> RestResponse
                            .ok(ApiResponse.success("message",
                                    "Meal marked as uncompleted and ingredients restored to pantry")))
                    .onFailure()
                    .recoverWithItem(throwable -> RestResponse.status(
                            RestResponse.Status.BAD_REQUEST,
                            ApiResponse.error(throwable.getMessage(), 400)));
        } catch (ValidationException e) {
            log.warn("Validation error uncompleting meal: %s", e.getMessage());
            return Uni.createFrom().item(RestResponse.status(RestResponse.Status.BAD_REQUEST,
                    ApiResponse.error(e.getMessage(), 400, e.getValidationIssues())));
        }
    }
}
