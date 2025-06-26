"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
// Define a form-specific schema that matches our form structure
const formValidationSchema = z.object({
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
   instructions: z
      .array(
         z.object({
            value: z.string().min(1, "Instruction cannot be empty"),
         })
      )
      .min(1, "At least one instruction is required"),
   prepTime: z.coerce.number().min(0, "Prep time cannot be negative"),
   cookTime: z.coerce.number().min(0, "Cook time cannot be negative"),
   servings: z.coerce.number().positive("Servings must be positive"),
   imageUrl: z.string().url("Image URL must be valid").optional().or(z.literal("")),
   tags: z.array(z.string()).default([]),
});

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

// We don't need a separate type since we're using zod schema directly

export const RecipeForm = ({ initialData, onSubmit, isLoading = false }: RecipeFormProps) => {
   const [instructionInput, setInstructionInput] = useState("");
   const t = useTranslations("recipe");
   const tCommon = useTranslations("common");

   // Initialize the form with safe defaults
   const defaultValues = {
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

   // Initialize the form with zod validation
   const form = useForm({
      resolver: zodResolver(formValidationSchema),
      defaultValues,
   });

   // Get what we need from form
   const {
      control,
      register,
      formState: { errors },
   } = form;

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
   const onFormSubmit = (data: z.infer<typeof formValidationSchema>) => {
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
   };

   return (
      <Form {...form}>
         <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-4">
               <h2 className="text-xl font-semibold">{t("basicInfo")}</h2>
               <Separator className="my-4" />

               <FormField
                  control={control}
                  name="name"
                  render={({ field }) => (
                     <FormItem>
                        <FormLabel>{t("name.label")} *</FormLabel>
                        <FormControl>
                           <Input {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                     </FormItem>
                  )}
               />

               <FormField
                  control={control}
                  name="description"
                  render={({ field }) => (
                     <FormItem>
                        <FormLabel>{t("description.label")}</FormLabel>
                        <FormControl>
                           <Textarea rows={3} {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                     </FormItem>
                  )}
               />

               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                     control={control}
                     name="prepTime"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>{t("prepTime.label")} *</FormLabel>
                           <FormControl>
                              <Input
                                 type="number"
                                 {...field}
                                 onChange={(e) => field.onChange(Number(e.target.value))}
                                 disabled={isLoading}
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />

                  <FormField
                     control={control}
                     name="cookTime"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>{t("cookTime.label")} *</FormLabel>
                           <FormControl>
                              <Input
                                 type="number"
                                 {...field}
                                 onChange={(e) => field.onChange(Number(e.target.value))}
                                 disabled={isLoading}
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />

                  <FormField
                     control={control}
                     name="servings"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>{t("servings.label")} *</FormLabel>
                           <FormControl>
                              <Input
                                 type="number"
                                 {...field}
                                 onChange={(e) => field.onChange(Number(e.target.value))}
                                 disabled={isLoading}
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
               </div>
            </div>

            {/* Ingredients */}
            <div className="space-y-4">
               <h2 className="text-xl font-semibold">{t("ingredients.title")}</h2>
               <Separator className="my-4" />

               {ingredientFields.map((field, index) => (
                  <div key={field.id} className="flex items-end gap-2">
                     <div className="flex-grow">
                        <Label className="mb-1">{t("ingredients.name.label")} *</Label>
                        <Input {...register(`ingredients.${index}.name`)} className="w-full" disabled={isLoading} />
                        {errors.ingredients?.[index]?.name && (
                           <p className="mt-1 text-sm text-red-600">
                              {errors.ingredients?.[index]?.name?.message as string}
                           </p>
                        )}
                     </div>

                     <div className="w-24">
                        <Label className="mb-1">{t("ingredients.quantity.label")} *</Label>
                        <Input
                           type="number"
                           step="0.01"
                           {...register(`ingredients.${index}.quantity`)}
                           className="w-full"
                           disabled={isLoading}
                        />
                        {errors.ingredients?.[index]?.quantity && (
                           <p className="mt-1 text-sm text-red-600">
                              {errors.ingredients?.[index]?.quantity?.message as string}
                           </p>
                        )}
                     </div>

                     <div className="w-32">
                        <Label className="mb-1">{t("ingredients.unit.label")} *</Label>
                        <Input {...register(`ingredients.${index}.unit`)} className="w-full" disabled={isLoading} />
                        {errors.ingredients?.[index]?.unit && (
                           <p className="mt-1 text-sm text-red-600">
                              {errors.ingredients?.[index]?.unit?.message as string}
                           </p>
                        )}
                     </div>

                     <Button
                        type="button"
                        variant="ghost"
                        className="text-red-500 h-10 mb-[1px]"
                        onClick={() => removeIngredient(index)}
                        disabled={isLoading || ingredientFields.length <= 1}
                     >
                        {tCommon("remove")}
                     </Button>
                  </div>
               ))}

               <Button
                  type="button"
                  variant="outline"
                  onClick={() => appendIngredient({ name: "", quantity: 1, unit: "" })}
                  disabled={isLoading}
               >
                  {t("ingredients.addButton")}
               </Button>

               {errors.ingredients?.root && (
                  <p className="mt-1 text-sm text-red-600">{errors.ingredients.root.message}</p>
               )}
            </div>

            {/* Instructions */}
            <div className="space-y-4">
               <h2 className="text-xl font-semibold">{t("instructions.title")}</h2>
               <Separator className="my-4" />

               <div>
                  <Label className="mb-1">{t("instructions.label")}</Label>
                  <div className="flex gap-2">
                     <Input
                        value={instructionInput}
                        onChange={(e) => setInstructionInput(e.target.value)}
                        className="flex-grow"
                        placeholder={t("instructions.placeholder")}
                        disabled={isLoading}
                     />
                     <Button
                        type="button"
                        onClick={handleAddInstruction}
                        disabled={isLoading || !instructionInput.trim()}
                     >
                        {t("instructions.addButton")}
                     </Button>
                  </div>
               </div>

               {instructionFields.length > 0 && (
                  <div className="space-y-2 mt-4">
                     <h3 className="text-md font-medium">{t("instructions.steps")}:</h3>
                     <ul className="space-y-2">
                        {instructionFields.map((field, index) => (
                           <li key={field.id} className="flex items-center gap-2">
                              <span className="font-medium">{index + 1}.</span>
                              <Input
                                 {...register(`instructions.${index}.value`)}
                                 className="flex-grow"
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
            <div className="space-y-4">
               <h2 className="text-xl font-semibold">Additional Information</h2>
               <Separator className="my-4" />

               <FormField
                  control={control}
                  name="imageUrl"
                  render={({ field }) => (
                     <FormItem>
                        <FormLabel>{t("imageUrl.label")}</FormLabel>
                        <FormControl>
                           <Input type="url" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                     </FormItem>
                  )}
               />
            </div>

            {/* Submit Button */}
            <div>
               <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
                  {isLoading ? t("saving") : t("saveButton")}
               </Button>
            </div>
         </form>
      </Form>
   );
};
