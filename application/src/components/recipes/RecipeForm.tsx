"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
   Form,
   FormControl,
   FormDescription,
   FormField,
   FormItem,
   FormLabel,
   FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Define interfaces for our data structure
export interface Ingredient {
   name: string;
   quantity: number;
   unit: string;
}

export interface RecipeFormValues {
   name: string;
   description?: string;
   ingredients: Ingredient[];
   instructions: string[];
   prepTime: number;
   cookTime: number;
   servings: number;
   imageUrl?: string;
   tags: string[];
}

// Define the schema for form validation
export const recipeValidationSchema = z.object({
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

// Define props for the component
interface RecipeFormProps {
   initialData?: Partial<RecipeFormValues>;
   onSubmit: (data: RecipeFormValues) => void;
   isLoading?: boolean;
}

// Define a type for our form setup to help with TypeScript issues
type RecipeFormType = {
   name: string;
   description: string;
   ingredients: {
      name: string;
      quantity: number;
      unit: string;
      id?: string;
   }[];
   instructions: {
      value: string;
      id?: string;
   }[];
   prepTime: number;
   cookTime: number;
   servings: number;
   imageUrl: string;
   tags: string[];
};

export const RecipeForm = ({ initialData, onSubmit, isLoading = false }: RecipeFormProps) => {
   const [instructionInput, setInstructionInput] = useState("");

   // Initialize the form with safe defaults
   const defaultValues: RecipeFormType = {
      name: initialData?.name || "",
      description: initialData?.description || "",
      ingredients: initialData?.ingredients || [{ name: "", quantity: 1, unit: "" }],
      instructions: initialData?.instructions?.map((instruction) => ({ value: instruction })) || [{ value: "" }],
      prepTime: initialData?.prepTime || 0,
      cookTime: initialData?.cookTime || 0,
      servings: initialData?.servings || 1,
      imageUrl: initialData?.imageUrl || "",
      tags: initialData?.tags || [],
   };

   // Initialize the form
   const {
      register,
      handleSubmit,
      control,
      formState: { errors },
   } = useForm<RecipeFormType>({
      defaultValues,
   });

   // Set up field arrays for ingredients and instructions
   const {
      fields: ingredientFields,
      append: appendIngredient,
      remove: removeIngredient,
   } = useFieldArray({
      control,
      name: "ingredients",
   });

   const {
      fields: instructionFields,
      append: appendInstruction,
      remove: removeInstruction,
      swap: swapInstructions,
   } = useFieldArray({
      control,
      name: "instructions",
   });

   // Handle adding a new instruction
   const handleAddInstruction = () => {
      if (instructionInput.trim()) {
         appendInstruction({ value: instructionInput.trim() });
         setInstructionInput("");
      }
   };

   // Convert the form data to the expected RecipeFormValues type
   const handleFormSubmit = handleSubmit((data: RecipeFormType) => {
      const formattedData: RecipeFormValues = {
         ...data,
         // Ensure numeric fields are actually numbers
         prepTime: Number(data.prepTime),
         cookTime: Number(data.cookTime),
         servings: Number(data.servings),
         // Convert instructions array of objects to array of strings
         instructions: data.instructions.map((instruction) => instruction.value),
         // Handle ingredients to ensure quantities are numbers
         ingredients: data.ingredients.map((ingredient) => ({
            ...ingredient,
            quantity: Number(ingredient.quantity),
         })),
         // If imageUrl is empty, set to undefined so it's properly handled by validation
         imageUrl: data.imageUrl?.trim() === "" ? undefined : data.imageUrl,
      };
      onSubmit(formattedData);
   });

   return (
      <form onSubmit={handleFormSubmit} className="space-y-8">
         {/* Basic Information */}
         <div className="space-y-4">
            <h2 className="text-xl font-semibold">Basic Information</h2>

            <div>
               <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Recipe Name *
               </label>
               <input
                  id="name"
                  type="text"
                  {...register("name")}
                  className="w-full p-2 border rounded-md"
                  disabled={isLoading}
               />
               {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
               <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
               </label>
               <textarea
                  id="description"
                  rows={3}
                  {...register("description")}
                  className="w-full p-2 border rounded-md"
                  disabled={isLoading}
               />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div>
                  <label htmlFor="prepTime" className="block text-sm font-medium text-gray-700 mb-1">
                     Prep Time (minutes) *
                  </label>
                  <input
                     id="prepTime"
                     type="number"
                     {...register("prepTime")}
                     className="w-full p-2 border rounded-md"
                     disabled={isLoading}
                  />
                  {errors.prepTime && <p className="mt-1 text-sm text-red-600">{errors.prepTime.message}</p>}
               </div>

               <div>
                  <label htmlFor="cookTime" className="block text-sm font-medium text-gray-700 mb-1">
                     Cook Time (minutes) *
                  </label>
                  <input
                     id="cookTime"
                     type="number"
                     {...register("cookTime")}
                     className="w-full p-2 border rounded-md"
                     disabled={isLoading}
                  />
                  {errors.cookTime && <p className="mt-1 text-sm text-red-600">{errors.cookTime.message}</p>}
               </div>

               <div>
                  <label htmlFor="servings" className="block text-sm font-medium text-gray-700 mb-1">
                     Servings *
                  </label>
                  <input
                     id="servings"
                     type="number"
                     {...register("servings")}
                     className="w-full p-2 border rounded-md"
                     disabled={isLoading}
                  />
                  {errors.servings && <p className="mt-1 text-sm text-red-600">{errors.servings.message}</p>}
               </div>
            </div>
         </div>

         {/* Ingredients */}
         <div className="space-y-4">
            <h2 className="text-xl font-semibold">Ingredients</h2>

            {ingredientFields.map((field, index) => (
               <div key={field.id} className="flex items-end gap-2">
                  <div className="flex-grow">
                     <label className="block text-sm font-medium text-gray-700 mb-1">Ingredient Name *</label>
                     <input
                        {...register(`ingredients.${index}.name`)}
                        className="w-full p-2 border rounded-md"
                        disabled={isLoading}
                     />
                     {errors.ingredients?.[index]?.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.ingredients[index]?.name?.message}</p>
                     )}
                  </div>

                  <div className="w-24">
                     <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                     <input
                        type="number"
                        step="0.01"
                        {...register(`ingredients.${index}.quantity`)}
                        className="w-full p-2 border rounded-md"
                        disabled={isLoading}
                     />
                     {errors.ingredients?.[index]?.quantity && (
                        <p className="mt-1 text-sm text-red-600">{errors.ingredients[index]?.quantity?.message}</p>
                     )}
                  </div>

                  <div className="w-32">
                     <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
                     <input
                        {...register(`ingredients.${index}.unit`)}
                        className="w-full p-2 border rounded-md"
                        disabled={isLoading}
                     />
                     {errors.ingredients?.[index]?.unit && (
                        <p className="mt-1 text-sm text-red-600">{errors.ingredients[index]?.unit?.message}</p>
                     )}
                  </div>

                  <Button
                     type="button"
                     variant="ghost"
                     className="text-red-500 h-10 mb-[1px]"
                     onClick={() => removeIngredient(index)}
                     disabled={isLoading || ingredientFields.length <= 1}
                  >
                     Remove
                  </Button>
               </div>
            ))}

            <Button
               type="button"
               variant="outline"
               onClick={() => appendIngredient({ name: "", quantity: 1, unit: "" })}
               disabled={isLoading}
            >
               Add Ingredient
            </Button>

            {errors.ingredients?.root && <p className="mt-1 text-sm text-red-600">{errors.ingredients.root.message}</p>}
         </div>

         {/* Instructions */}
         <div className="space-y-4">
            <h2 className="text-xl font-semibold">Instructions</h2>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Add instruction steps one by one</label>
               <div className="flex gap-2">
                  <input
                     type="text"
                     value={instructionInput}
                     onChange={(e) => setInstructionInput(e.target.value)}
                     className="flex-grow p-2 border rounded-md"
                     placeholder="Enter an instruction step"
                     disabled={isLoading}
                  />
                  <Button type="button" onClick={handleAddInstruction} disabled={isLoading || !instructionInput.trim()}>
                     Add
                  </Button>
               </div>
            </div>

            {instructionFields.length > 0 && (
               <div className="space-y-2">
                  <h3 className="text-md font-medium">Steps:</h3>
                  <ul className="space-y-2">
                     {instructionFields.map((field, index) => (
                        <li key={field.id} className="flex items-center gap-2">
                           <span className="font-medium">{index + 1}.</span>
                           <input
                              {...register(`instructions.${index}.value`)}
                              className="flex-grow p-2 border rounded-md"
                              disabled={isLoading}
                           />
                           <div className="flex gap-1">
                              <Button
                                 type="button"
                                 variant="ghost"
                                 className="h-8 w-8 p-0"
                                 onClick={() => index > 0 && swapInstructions(index, index - 1)}
                                 disabled={isLoading || index === 0}
                              >
                                 ↑
                              </Button>
                              <Button
                                 type="button"
                                 variant="ghost"
                                 className="h-8 w-8 p-0"
                                 onClick={() =>
                                    index < instructionFields.length - 1 && swapInstructions(index, index + 1)
                                 }
                                 disabled={isLoading || index === instructionFields.length - 1}
                              >
                                 ↓
                              </Button>
                              <Button
                                 type="button"
                                 variant="ghost"
                                 className="text-red-500 h-8 w-8 p-0"
                                 onClick={() => removeInstruction(index)}
                                 disabled={isLoading}
                              >
                                 ×
                              </Button>
                           </div>
                        </li>
                     ))}
                  </ul>
               </div>
            )}

            {errors.instructions?.root && (
               <p className="mt-1 text-sm text-red-600">{errors.instructions.root.message}</p>
            )}
         </div>

         {/* Image URL */}
         <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
               Image URL (optional)
            </label>
            <input
               id="imageUrl"
               type="url"
               {...register("imageUrl")}
               className="w-full p-2 border rounded-md"
               disabled={isLoading}
            />
            {errors.imageUrl && <p className="mt-1 text-sm text-red-600">{errors.imageUrl.message}</p>}
         </div>

         {/* Submit Button */}
         <div>
            <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
               {isLoading ? "Saving..." : "Save Recipe"}
            </Button>
         </div>
      </form>
   );
};
