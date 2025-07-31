package org.household.entity;

import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.junit.TestProfile;
import io.quarkus.test.junit.QuarkusTestProfile;
import org.household.model.Ingredient;
import org.household.model.MealPlanItem;
import org.household.model.ShoppingListItem;
import org.junit.jupiter.api.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration test for MongoDB entities using Quarkus Test framework.
 * This test verifies database connectivity and basic CRUD operations.
 */
@QuarkusTest
@TestProfile(MongoDBEntityTest.TestProfileImpl.class)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class MongoDBEntityTest {

    // Test profile to ensure we use a test database
    public static class TestProfileImpl implements QuarkusTestProfile {
        @Override
        public Map<String, String> getConfigOverrides() {
            return Map.of(
                    "quarkus.mongodb.database", "cooking-app-test",
                    "quarkus.log.level", "INFO");
        }
    }

    @BeforeEach
    void setUp() {
        // Clean up collections before each test
        Recipe.deleteAll();
        PantryItem.deleteAll();
        MealPlan.deleteAll();
        ShoppingList.deleteAll();
    }

    @Test
    @Order(1)
    @DisplayName("Test MongoDB connection and basic operations")
    void testMongoDBConnection() {
        // Test basic connectivity by counting documents
        long recipeCount = Recipe.count();
        long pantryCount = PantryItem.count();
        long mealPlanCount = MealPlan.count();
        long shoppingListCount = ShoppingList.count();

        // All collections should be empty initially
        assertEquals(0, recipeCount, "Recipes collection should be empty");
        assertEquals(0, pantryCount, "PantryItems collection should be empty");
        assertEquals(0, mealPlanCount, "MealPlans collection should be empty");
        assertEquals(0, shoppingListCount, "ShoppingLists collection should be empty");

        System.out.println("✅ MongoDB connection successful - all collections accessible");
    }

    @Test
    @Order(2)
    @DisplayName("Test Recipe entity CRUD operations")
    void testRecipeEntity() {
        // Create test ingredients
        List<Ingredient> ingredients = Arrays.asList(
                new Ingredient("Flour", 2.0, "cups", "Grains"),
                new Ingredient("Sugar", 1.0, "cup", "Sweeteners"),
                new Ingredient("Eggs", 3.0, "pieces", "Dairy"));

        // Create test instructions
        List<String> instructions = Arrays.asList(
                "Mix flour and sugar in a bowl",
                "Add eggs and mix well",
                "Bake for 30 minutes at 350°F");

        // Create and persist recipe
        Recipe recipe = new Recipe(
                "Chocolate Cake",
                ingredients,
                instructions,
                15, // prep time
                30, // cook time
                8 // servings
        );
        recipe.description = "Delicious chocolate cake";
        recipe.tags = Arrays.asList("dessert", "chocolate", "cake");

        recipe.persist();
        assertNotNull(recipe.id, "Recipe should have an ID after persisting");

        // Test finding recipes
        List<Recipe> foundRecipes = Recipe.findByName("Chocolate");
        assertEquals(1, foundRecipes.size(), "Should find one recipe with 'Chocolate' in name");
        assertEquals("Chocolate Cake", foundRecipes.get(0).name);

        // Test finding by tag
        List<Recipe> dessertRecipes = Recipe.findByTag("dessert");
        assertEquals(1, dessertRecipes.size(), "Should find one dessert recipe");

        // Test finding by prep time range
        List<Recipe> quickRecipes = Recipe.findByPrepTimeRange(10, 20);
        assertEquals(1, quickRecipes.size(), "Should find one recipe with prep time 10-20 minutes");

        System.out.println("✅ Recipe entity operations successful");
        System.out.println("   Created recipe: " + recipe.name + " with " + recipe.ingredients.size() + " ingredients");
    }

    @Test
    @Order(3)
    @DisplayName("Test PantryItem entity CRUD operations")
    void testPantryItemEntity() {
        // Create test pantry items
        PantryItem item1 = new PantryItem("Milk", 2.0, "liters", "Dairy", LocalDate.now().plusDays(7));
        PantryItem item2 = new PantryItem("Bread", 1.0, "loaf", "Grains", LocalDate.now().plusDays(3));
        PantryItem item3 = new PantryItem("Apples", 5.0, "pieces", "Fruits", LocalDate.now().minusDays(1)); // Expired

        item1.persist();
        item2.persist();
        item3.persist();

        // Test finding by name
        List<PantryItem> milkItems = PantryItem.findByName("Milk");
        assertEquals(1, milkItems.size(), "Should find one milk item");

        // Test finding by category
        List<PantryItem> dairyItems = PantryItem.findByCategory("Dairy");
        assertEquals(1, dairyItems.size(), "Should find one dairy item");

        // Test finding expired items
        List<PantryItem> expiredItems = PantryItem.findExpiredItems();
        assertEquals(1, expiredItems.size(), "Should find one expired item");
        assertTrue(expiredItems.get(0).isExpired(), "Found item should be expired");

        // Test finding items expiring soon
        List<PantryItem> expiringSoon = PantryItem.findExpiringItems(5);
        assertEquals(1, expiringSoon.size(), "Should find one item expiring within 5 days");

        System.out.println("✅ PantryItem entity operations successful");
        System.out.println("   Created " + PantryItem.count() + " pantry items, " + expiredItems.size() + " expired");
    }

    @Test
    @Order(4)
    @DisplayName("Test MealPlan entity CRUD operations")
    void testMealPlanEntity() {
        // First create a recipe to reference
        Recipe recipe = new Recipe(
                "Test Recipe",
                Arrays.asList(new Ingredient("Test Ingredient", 1.0, "cup")),
                Arrays.asList("Test instruction"),
                10, 20, 4);
        recipe.persist();

        // Create meal plan items
        List<MealPlanItem> meals = Arrays.asList(
                new MealPlanItem(
                        recipe.id,
                        LocalDateTime.now().plusDays(1),
                        MealPlanItem.MealType.BREAKFAST,
                        2),
                new MealPlanItem(
                        recipe.id,
                        LocalDateTime.now().plusDays(1),
                        MealPlanItem.MealType.DINNER,
                        4));

        // Create and persist meal plan
        MealPlan mealPlan = new MealPlan(
                "Weekly Meal Plan",
                LocalDate.now(),
                LocalDate.now().plusDays(7),
                meals);
        mealPlan.persist();
        assertNotNull(mealPlan.id, "MealPlan should have an ID after persisting");

        // Test finding meal plans
        List<MealPlan> foundPlans = MealPlan.findByName("Weekly");
        assertEquals(1, foundPlans.size(), "Should find one meal plan with 'Weekly' in name");

        // Test finding active plans
        List<MealPlan> activePlans = MealPlan.findActivePlans();
        assertEquals(1, activePlans.size(), "Should find one active meal plan");
        assertTrue(activePlans.get(0).isActive(), "Found plan should be active");

        // Test meal plan helper methods
        assertEquals(8, mealPlan.getDurationInDays(), "Meal plan should be 8 days long");
        assertEquals(2, mealPlan.meals.size(), "Meal plan should have 2 meals");

        System.out.println("✅ MealPlan entity operations successful");
        System.out.println("   Created meal plan: " + mealPlan.name + " with " + mealPlan.meals.size() + " meals");
    }

    @Test
    @Order(5)
    @DisplayName("Test ShoppingList entity CRUD operations")
    void testShoppingListEntity() {
        // Create shopping list items
        List<ShoppingListItem> items = Arrays.asList(
                new ShoppingListItem("Milk", 2.0, "liters", false, false, "Pancakes",
                        ShoppingListItem.ItemType.MEAL_PLAN),
                new ShoppingListItem("Eggs", 6.0, "pieces", true, false, "Pancakes",
                        ShoppingListItem.ItemType.MEAL_PLAN),
                new ShoppingListItem("Flour", 1.0, "kg", false, true, null, ShoppingListItem.ItemType.PANTRY_RESTOCK));

        // Create and persist shopping list
        ShoppingList shoppingList = new ShoppingList("Weekly Shopping", items);
        shoppingList.persist();
        assertNotNull(shoppingList.id, "ShoppingList should have an ID after persisting");

        // Test finding shopping lists
        List<ShoppingList> foundLists = ShoppingList.findByName("Weekly");
        assertEquals(1, foundLists.size(), "Should find one shopping list with 'Weekly' in name");

        // Test helper methods
        List<ShoppingListItem> pendingItems = shoppingList.getPendingItems();
        assertEquals(2, pendingItems.size(), "Should have 2 pending items");

        List<ShoppingListItem> purchasedItems = shoppingList.getPurchasedItems();
        assertEquals(1, purchasedItems.size(), "Should have 1 purchased item");

        List<ShoppingListItem> pantryItems = shoppingList.getItemsInPantry();
        assertEquals(1, pantryItems.size(), "Should have 1 item in pantry");

        // Test completion percentage
        double completion = shoppingList.getCompletionPercentage();
        assertEquals(33.3, completion, 0.1, "Completion should be approximately 33.3%");

        // Test marking item as purchased
        boolean marked = shoppingList.markItemAsPurchased("Milk");
        assertTrue(marked, "Should successfully mark milk as purchased");

        // Verify updated completion
        double newCompletion = shoppingList.getCompletionPercentage();
        assertEquals(66.7, newCompletion, 0.1,
                "Completion should be approximately 66.7% after marking milk as purchased");

        System.out.println("✅ ShoppingList entity operations successful");
        System.out.println("   Created shopping list: " + shoppingList.name + " with " +
                shoppingList.getTotalItemsCount() + " items, " +
                String.format("%.1f", shoppingList.getCompletionPercentage()) + "% complete");
    }

    @Test
    @Order(6)
    @DisplayName("Test data retrieval and relationships")
    void testDataRetrievalAndRelationships() {
        // Create some test data first
        Recipe recipe = new Recipe(
                "Integration Test Recipe",
                Arrays.asList(new Ingredient("Test Ingredient", 1.0, "cup")),
                Arrays.asList("Test instruction"),
                5, 10, 2);
        recipe.persist();

        PantryItem pantryItem = new PantryItem("Test Item", 3.0, "pieces", "Test Category",
                LocalDate.now().plusDays(5));
        pantryItem.persist();

        MealPlan mealPlan = new MealPlan(
                "Integration Test Plan",
                LocalDate.now(),
                LocalDate.now().plusDays(3),
                Arrays.asList(
                        new MealPlanItem(recipe.id, LocalDateTime.now().plusDays(1), MealPlanItem.MealType.LUNCH, 2)));
        mealPlan.persist();

        ShoppingList shoppingList = new ShoppingList(
                "Integration Test List",
                mealPlan.id,
                Arrays.asList(new ShoppingListItem("Integration Item", 1.0, "piece")));
        shoppingList.persist();

        // Test that all data was created successfully
        assertEquals(1, Recipe.count(), "Should have 1 recipe");
        assertEquals(1, PantryItem.count(), "Should have 1 pantry item");
        assertEquals(1, MealPlan.count(), "Should have 1 meal plan");
        assertEquals(1, ShoppingList.count(), "Should have 1 shopping list");

        // Test finding shopping list by meal plan
        List<ShoppingList> relatedLists = ShoppingList.findByMealPlan(mealPlan.id);
        assertEquals(1, relatedLists.size(), "Should find shopping list related to meal plan");
        assertEquals(shoppingList.id, relatedLists.get(0).id, "Found shopping list should match created one");

        // Test retrieving all entities
        List<Recipe> allRecipes = Recipe.listAll();
        List<PantryItem> allPantryItems = PantryItem.listAll();
        List<MealPlan> allMealPlans = MealPlan.listAll();
        List<ShoppingList> allShoppingLists = ShoppingList.listAll();

        assertFalse(allRecipes.isEmpty(), "Should retrieve recipes from database");
        assertFalse(allPantryItems.isEmpty(), "Should retrieve pantry items from database");
        assertFalse(allMealPlans.isEmpty(), "Should retrieve meal plans from database");
        assertFalse(allShoppingLists.isEmpty(), "Should retrieve shopping lists from database");

        System.out.println("✅ Data retrieval and relationships test successful");
        System.out.println("   Successfully retrieved and validated all entity types from MongoDB");
        System.out.println("   Recipe: " + allRecipes.get(0).name);
        System.out.println("   PantryItem: " + allPantryItems.get(0).name);
        System.out.println("   MealPlan: " + allMealPlans.get(0).name);
        System.out.println("   ShoppingList: " + allShoppingLists.get(0).name);
    }

    @AfterEach
    void tearDown() {
        // Clean up after each test - handled by @BeforeEach for next test
        System.out.println("Test completed, database cleaned up for next test");
    }
}
