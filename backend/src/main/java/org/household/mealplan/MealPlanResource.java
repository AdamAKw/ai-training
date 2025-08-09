package org.household.mealplan;

import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lombok.extern.slf4j.Slf4j;

import org.bson.types.ObjectId;
import org.household.common.ApiResponse;
import org.household.common.ValidationException;

import java.time.LocalDate;
import java.util.List;

@Path("/api/mealPlans")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Slf4j
public class MealPlanResource {

    @Inject
    MealPlanService mealPlanService;

    @GET
    public Response getAllMealPlans(@QueryParam("date") LocalDate date) {
        try {
            if (date != null) {
                List<MealPlan> plans = mealPlanService.findMealPlansIncludeDate(date);
                return Response.ok(ApiResponse.success("mealPlans", plans)).build();
            }

            List<MealPlan> mealPlans = mealPlanService.getAllMealPlans();
            return Response.ok(ApiResponse.success("mealPlans", mealPlans)).build();
        } catch (Exception e) {
            log.error("Failed to fetch meal plans", e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(ApiResponse.error("Failed to fetch meal plans", 500))
                    .build();
        }
    }

    /**
     * POST /api/mealPlans
     * Create a new meal plan
     */
    @POST
    public Response createMealPlan(@Valid MealPlan mealPlan) {
        try {
            MealPlan createdMealPlan = mealPlanService.createMealPlan(mealPlan);
            return Response.status(Response.Status.CREATED)
                    .entity(ApiResponse.success("mealPlan", createdMealPlan))
                    .build();
        } catch (ValidationException e) {
            log.warn("Validation error creating meal plan: %s", e.getMessage());
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(ApiResponse.error("Invalid meal plan data", 400, e.getValidationIssues()))
                    .build();
        } catch (Exception e) {
            log.error("Failed to create meal plan", e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(ApiResponse.error("Failed to create meal plan", 500))
                    .build();
        }
    }

    /**
     * GET /api/mealPlans/{id}
     * Fetch a specific meal plan by ID
     */
    @GET
    @Path("/{id}")
    public Response getMealPlanById(@PathParam("id") String id) {
        try {
            if (!ObjectId.isValid(id)) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(ApiResponse.error("Invalid meal plan ID format", 400))
                        .build();
            }

            MealPlan mealPlan = mealPlanService.getMealPlanById(new ObjectId(id));
            if (mealPlan == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(ApiResponse.error("Meal plan not found", 404))
                        .build();
            }

            return Response.ok(ApiResponse.success("mealPlan", mealPlan)).build();
        } catch (Exception e) {
            log.error("Failed to fetch meal plan", e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(ApiResponse.error("Failed to fetch meal plan", 500))
                    .build();
        }
    }

    /**
     * PUT /api/mealPlans/{id}
     * Update an existing meal plan
     */
    @PUT
    @Path("/{id}")
    public Response updateMealPlan(@PathParam("id") String id, @Valid MealPlan mealPlan) {
        try {
            if (!ObjectId.isValid(id)) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(ApiResponse.error("Invalid meal plan ID format", 400))
                        .build();
            }

            MealPlan updatedMealPlan = mealPlanService.updateMealPlan(new ObjectId(id), mealPlan);
            if (updatedMealPlan == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(ApiResponse.error("Meal plan not found", 404))
                        .build();
            }

            return Response.ok(ApiResponse.success("mealPlan", updatedMealPlan)).build();
        } catch (ValidationException e) {
            log.warn("Validation error updating meal plan: %s", e.getMessage());
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(ApiResponse.error("Invalid meal plan data", 400, e.getValidationIssues()))
                    .build();
        } catch (Exception e) {
            log.error("Failed to update meal plan", e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(ApiResponse.error("Failed to update meal plan", 500))
                    .build();
        }
    }

    /**
     * DELETE /api/mealPlans/{id}
     * Delete a meal plan
     */
    @DELETE
    @Path("/{id}")
    public Response deleteMealPlan(@PathParam("id") String id) {
        try {
            if (!ObjectId.isValid(id)) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(ApiResponse.error("Invalid meal plan ID format", 400))
                        .build();
            }

            boolean deleted = mealPlanService.deleteMealPlan(new ObjectId(id));
            if (!deleted) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(ApiResponse.error("Meal plan not found", 404))
                        .build();
            }

            return Response.ok(ApiResponse.success("message", "Meal plan deleted successfully")).build();
        } catch (Exception e) {
            log.error("Failed to delete meal plan", e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(ApiResponse.error("Failed to delete meal plan", 500))
                    .build();
        }
    }

    /**
     * GET /api/mealPlans/active
     * Get active meal plans
     */
    @GET
    @Path("/active")
    public Response getActiveMealPlans() {
        try {
            List<MealPlan> activeMealPlans = mealPlanService.findActiveMealPlans();
            return Response.ok(ApiResponse.success("mealPlans", activeMealPlans)).build();
        } catch (Exception e) {
            log.error("Failed to fetch active meal plans", e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(ApiResponse.error("Failed to fetch active meal plans", 500))
                    .build();
        }
    }

    /**
     * GET /api/mealPlans/search
     * Search meal plans by date range
     */
    @GET
    @Path("/search")
    public Response searchMealPlansByDateRange(
            @QueryParam("startDate") String startDateStr,
            @QueryParam("endDate") String endDateStr) {
        try {
            if (startDateStr == null || endDateStr == null) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(ApiResponse.error("Start date and end date parameters are required", 400))
                        .build();
            }

            LocalDate startDate = LocalDate.parse(startDateStr);
            LocalDate endDate = LocalDate.parse(endDateStr);

            List<MealPlan> mealPlans = mealPlanService.findMealPlansByDateRange(startDate, endDate);
            return Response.ok(ApiResponse.success("mealPlans", mealPlans)).build();
        } catch (Exception e) {
            log.error("Failed to search meal plans by date range", e);
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(ApiResponse.error("Invalid date format or search failed", 400))
                    .build();
        }
    }

    /**
     * POST /api/mealPlans/{id}/meals/{mealIndex}/complete
     * Mark a meal as completed and remove ingredients from pantry
     */
    @POST
    @Path("/{id}/meals/{mealIndex}/complete")
    public Response completeMeal(@PathParam("id") String id, @PathParam("mealIndex") int mealIndex) {
        try {
            if (!ObjectId.isValid(id)) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(ApiResponse.error("Invalid meal plan ID format", 400))
                        .build();
            }

            if (mealIndex < 0) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(ApiResponse.error("Invalid meal index", 400))
                        .build();
            }

            mealPlanService.completeMeal(new ObjectId(id), mealIndex);

            return Response.ok(ApiResponse.success("message", "Meal marked as completed")).build();
        } catch (ValidationException e) {
            log.warn("Validation error completing meal: %s", e.getMessage());
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(ApiResponse.error(e.getMessage(), 400, e.getValidationIssues()))
                    .build();
        } catch (Exception e) {
            log.error("Failed to complete meal", e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(ApiResponse.error("Failed to complete meal", 500))
                    .build();
        }
    }

    /**
     * DELETE /api/mealPlans/{id}/meals/{mealIndex}/complete
     * Mark a meal as uncompleted and restore ingredients to pantry
     */
    @DELETE
    @Path("/{id}/meals/{mealIndex}/complete")
    public Response uncompleteMeal(@PathParam("id") String id, @PathParam("mealIndex") int mealIndex) {
        try {
            if (!ObjectId.isValid(id)) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(ApiResponse.error("Invalid meal plan ID format", 400))
                        .build();
            }

            if (mealIndex < 0) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(ApiResponse.error("Invalid meal index", 400))
                        .build();
            }

            mealPlanService.uncompleteMeal(new ObjectId(id), mealIndex);

            return Response
                    .ok(ApiResponse.success("message", "Meal marked as uncompleted and ingredients restored to pantry"))
                    .build();
        } catch (ValidationException e) {
            log.warn("Validation error uncompleting meal: %s", e.getMessage());
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(ApiResponse.error(e.getMessage(), 400, e.getValidationIssues()))
                    .build();
        } catch (Exception e) {
            log.error("Failed to uncomplete meal", e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(ApiResponse.error("Failed to uncomplete meal", 500))
                    .build();
        }
    }
}
