"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Recipe } from "@/models/recipe";
import { getTranslations } from "next-intl/server";

// Define the schema for recipe validation
const recipeSchema = z.object({
    name: z.string().min(2, "Recipe name must be at least 2 characters"),
    description: z.string().optional(),
    ingredients: z
        .array(
            z.object({
                name: z.string().min(1, "Ingredient name is required"),
                quantity: z.coerce.number().positive("Quantity must be positive"),
                unit: z.string().min(1, "Unit is required"),
            })
        )
        .min(1, "At least one ingredient is required"),
    instructions: z.array(z.string().min(1)).min(1, "At least one instruction is required"),
    prepTime: z.coerce.number().min(0, "Prep time cannot be negative"),
    cookTime: z.coerce.number().min(0, "Cook time cannot be negative"),
    servings: z.coerce.number().positive("Servings must be positive"),
    imageUrl: z.string().url("Image URL must be valid").optional().or(z.literal("")),
    tags: z.array(z.string()).default([]),
});

export type RecipeFormState = {
    message: string;
    errors?: Record<string, string[]>;
    success?: boolean;
};

export async function createRecipe(
    prevState: RecipeFormState | null,
    formData: FormData
): Promise<RecipeFormState> {
    const t = await getTranslations("recipes.new");

    try {
        // Extract form data
        const ingredients = [];
        const instructions = [];

        // Parse ingredients
        let i = 0;
        while (formData.get(`ingredients.${i}.name`)) {
            const name = formData.get(`ingredients.${i}.name`) as string;
            const quantity = parseFloat(formData.get(`ingredients.${i}.quantity`) as string);
            const unit = formData.get(`ingredients.${i}.unit`) as string;

            if (name && !isNaN(quantity) && unit) {
                ingredients.push({ name, quantity, unit });
            }
            i++;
        }

        // Parse instructions
        let j = 0;
        while (formData.get(`instructions.${j}`)) {
            const instruction = formData.get(`instructions.${j}`) as string;
            if (instruction) {
                instructions.push(instruction);
            }
            j++;
        }

        const rawData = {
            name: formData.get("name") as string,
            description: formData.get("description") as string,
            ingredients,
            instructions,
            prepTime: parseInt(formData.get("prepTime") as string) || 0,
            cookTime: parseInt(formData.get("cookTime") as string) || 0,
            servings: parseInt(formData.get("servings") as string) || 1,
            imageUrl: formData.get("imageUrl") as string,
            tags: [],
        };

        // Validate the data
        const validatedFields = recipeSchema.safeParse(rawData);

        if (!validatedFields.success) {
            const errors: Record<string, string[]> = {};
            validatedFields.error.issues.forEach((issue) => {
                const path = issue.path.join(".");
                if (!errors[path]) {
                    errors[path] = [];
                }
                errors[path].push(issue.message);
            });

            return {
                message: t("validationFailed"),
                errors,
            };
        }

        // Connect to database and save recipe
        await connectToDatabase();

        const recipe = new Recipe({
            ...validatedFields.data,
            imageUrl: validatedFields.data.imageUrl || undefined,
        });

        await recipe.save();

        // Revalidate the recipes page to show the new recipe
        revalidatePath("/recipes");

    } catch (error) {
        console.error("Failed to create recipe:", error);
        return {
            message: t("createFailed"),
        };
    }

    // Redirect to recipes page on success
    redirect("/recipes");
}