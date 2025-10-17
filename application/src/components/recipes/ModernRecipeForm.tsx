"use client";

import { useState, useTransition } from "react";
import { useFormState } from "react-dom";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
  FieldSeparator,
} from "@/components/ui/field";
import {
  Plus,
  Minus,
  MoveUp,
  MoveDown,
  Clock,
  Users,
  ChefHat,
} from "lucide-react";
import type { RecipeFormState } from "@/lib/actions/recipe-actions";

interface ModernRecipeFormProps {
  createRecipeAction: (
    prevState: RecipeFormState | null,
    formData: FormData
  ) => Promise<RecipeFormState>;
}

interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
}

export function ModernRecipeForm({
  createRecipeAction,
}: ModernRecipeFormProps) {
  const [state, formAction] = useFormState(createRecipeAction, null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const t = useTranslations("recipes.form");
  const tButtons = useTranslations("buttons");

  // Local state for dynamic fields
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: "", quantity: "", unit: "" },
  ]);
  const [instructions, setInstructions] = useState<string[]>([""]);

  const addIngredient = () => {
    setIngredients([...ingredients, { name: "", quantity: "", unit: "" }]);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const updateIngredient = (
    index: number,
    field: keyof Ingredient,
    value: string
  ) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const addInstruction = () => {
    setInstructions([...instructions, ""]);
  };

  const removeInstruction = (index: number) => {
    if (instructions.length > 1) {
      setInstructions(instructions.filter((_, i) => i !== index));
    }
  };

  const updateInstruction = (index: number, value: string) => {
    const updated = [...instructions];
    updated[index] = value;
    setInstructions(updated);
  };

  const moveInstruction = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < instructions.length) {
      const updated = [...instructions];
      [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
      setInstructions(updated);
    }
  };

  const handleSubmit = (formData: FormData) => {
    // Add dynamic fields to FormData
    ingredients.forEach((ingredient, index) => {
      formData.append(`ingredients.${index}.name`, ingredient.name);
      formData.append(`ingredients.${index}.quantity`, ingredient.quantity);
      formData.append(`ingredients.${index}.unit`, ingredient.unit);
    });

    instructions.forEach((instruction, index) => {
      formData.append(`instructions.${index}`, instruction);
    });

    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <form action={handleSubmit} className="space-y-8">
      {/* Display form-level errors */}
      {state?.message && !state.success && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md">
          <p className="font-medium">{state.message}</p>
        </div>
      )}

      {/* Basic Information */}
      <FieldSet>
        <FieldLegend>{t("basicInfo")}</FieldLegend>
        <FieldDescription>{t("basicInfoDescription")}</FieldDescription>

        <FieldGroup className="space-y-6">
          <Field data-invalid={!!state?.errors?.name}>
            <FieldLabel htmlFor="name">{t("name.label")} *</FieldLabel>
            <Input
              id="name"
              name="name"
              disabled={isPending}
              aria-invalid={!!state?.errors?.name}
              placeholder={t("name.placeholder")}
              required
            />
            <FieldDescription>{t("name.description")}</FieldDescription>
            <FieldError
              errors={state?.errors?.name?.map((msg) => ({ message: msg }))}
            />
          </Field>

          <Field data-invalid={!!state?.errors?.description}>
            <FieldLabel htmlFor="description">
              {t("description.label")}
            </FieldLabel>
            <Textarea
              id="description"
              name="description"
              rows={3}
              disabled={isPending}
              placeholder={t("description.placeholder")}
            />
            <FieldDescription>{t("description.description")}</FieldDescription>
            <FieldError
              errors={state?.errors?.description?.map((msg) => ({
                message: msg,
              }))}
            />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Field data-invalid={!!state?.errors?.prepTime}>
              <FieldLabel htmlFor="prepTime">
                <Clock className="w-4 h-4 inline mr-2" />
                {t("prepTime.label")} *
              </FieldLabel>
              <Input
                id="prepTime"
                name="prepTime"
                type="number"
                min="0"
                defaultValue="0"
                disabled={isPending}
                placeholder="30"
              />
              <FieldDescription>{t("prepTime.description")}</FieldDescription>
              <FieldError
                errors={state?.errors?.prepTime?.map((msg) => ({
                  message: msg,
                }))}
              />
            </Field>

            <Field data-invalid={!!state?.errors?.cookTime}>
              <FieldLabel htmlFor="cookTime">
                <ChefHat className="w-4 h-4 inline mr-2" />
                {t("cookTime.label")} *
              </FieldLabel>
              <Input
                id="cookTime"
                name="cookTime"
                type="number"
                min="0"
                defaultValue="0"
                disabled={isPending}
                placeholder="45"
              />
              <FieldDescription>{t("cookTime.description")}</FieldDescription>
              <FieldError
                errors={state?.errors?.cookTime?.map((msg) => ({
                  message: msg,
                }))}
              />
            </Field>

            <Field data-invalid={!!state?.errors?.servings}>
              <FieldLabel htmlFor="servings">
                <Users className="w-4 h-4 inline mr-2" />
                {t("servings.label")} *
              </FieldLabel>
              <Input
                id="servings"
                name="servings"
                type="number"
                min="1"
                defaultValue="4"
                disabled={isPending}
                placeholder="4"
              />
              <FieldDescription>{t("servings.description")}</FieldDescription>
              <FieldError
                errors={state?.errors?.servings?.map((msg) => ({
                  message: msg,
                }))}
              />
            </Field>
          </div>
        </FieldGroup>
      </FieldSet>

      <FieldSeparator />

      {/* Ingredients */}
      <FieldSet>
        <FieldLegend>{t("ingredients.title")}</FieldLegend>
        <FieldDescription>{t("ingredients.description")}</FieldDescription>

        <FieldGroup className="space-y-4">
          {ingredients.map((ingredient, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Field className="md:col-span-2">
                    <FieldLabel htmlFor={`ingredient-name-${index}`}>
                      {t("ingredients.name.label")} *
                    </FieldLabel>
                    <Input
                      id={`ingredient-name-${index}`}
                      value={ingredient.name}
                      onChange={(e) =>
                        updateIngredient(index, "name", e.target.value)
                      }
                      disabled={isPending}
                      placeholder={t("ingredients.name.placeholder")}
                    />
                  </Field>

                  <div className="grid grid-cols-2 gap-2">
                    <Field>
                      <FieldLabel htmlFor={`ingredient-quantity-${index}`}>
                        {t("ingredients.quantity.label")} *
                      </FieldLabel>
                      <Input
                        id={`ingredient-quantity-${index}`}
                        type="number"
                        step="0.01"
                        min="0"
                        value={ingredient.quantity}
                        onChange={(e) =>
                          updateIngredient(index, "quantity", e.target.value)
                        }
                        disabled={isPending}
                        placeholder="2"
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor={`ingredient-unit-${index}`}>
                        {t("ingredients.unit.label")} *
                      </FieldLabel>
                      <Input
                        id={`ingredient-unit-${index}`}
                        value={ingredient.unit}
                        onChange={(e) =>
                          updateIngredient(index, "unit", e.target.value)
                        }
                        disabled={isPending}
                        placeholder={t("ingredients.unit.placeholder")}
                      />
                    </Field>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeIngredient(index)}
                  disabled={isPending || ingredients.length <= 1}
                  className="shrink-0"
                >
                  <Minus className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addIngredient}
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t("ingredients.addButton")}
          </Button>

          <FieldError
            errors={state?.errors?.ingredients?.map((msg) => ({
              message: msg,
            }))}
          />
        </FieldGroup>
      </FieldSet>

      <FieldSeparator />

      {/* Instructions */}
      <FieldSet>
        <FieldLegend>{t("instructions.title")}</FieldLegend>
        <FieldDescription>{t("instructions.description")}</FieldDescription>

        <FieldGroup className="space-y-4">
          {instructions.map((instruction, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>

                <Field className="flex-1">
                  <FieldLabel
                    htmlFor={`instruction-${index}`}
                    className="sr-only"
                  >
                    {t("instructions.step")} {index + 1}
                  </FieldLabel>
                  <Textarea
                    id={`instruction-${index}`}
                    value={instruction}
                    onChange={(e) => updateInstruction(index, e.target.value)}
                    disabled={isPending}
                    placeholder={t("instructions.placeholder")}
                    rows={2}
                  />
                </Field>

                <div className="flex flex-col gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => moveInstruction(index, "up")}
                    disabled={isPending || index === 0}
                    className="h-8 w-8"
                  >
                    <MoveUp className="w-3 h-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => moveInstruction(index, "down")}
                    disabled={isPending || index === instructions.length - 1}
                    className="h-8 w-8"
                  >
                    <MoveDown className="w-3 h-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeInstruction(index)}
                    disabled={isPending || instructions.length <= 1}
                    className="h-8 w-8"
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addInstruction}
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t("instructions.addButton")}
          </Button>

          <FieldError
            errors={state?.errors?.instructions?.map((msg) => ({
              message: msg,
            }))}
          />
        </FieldGroup>
      </FieldSet>

      <FieldSeparator />

      {/* Additional Information */}
      <FieldSet>
        <FieldLegend>{t("additionalInfo.title")}</FieldLegend>
        <FieldDescription>{t("additionalInfo.description")}</FieldDescription>

        <FieldGroup>
          <Field data-invalid={!!state?.errors?.imageUrl}>
            <FieldLabel htmlFor="imageUrl">{t("imageUrl.label")}</FieldLabel>
            <Input
              id="imageUrl"
              name="imageUrl"
              type="url"
              disabled={isPending}
              placeholder={t("imageUrl.placeholder")}
            />
            <FieldDescription>{t("imageUrl.description")}</FieldDescription>
            <FieldError
              errors={state?.errors?.imageUrl?.map((msg) => ({ message: msg }))}
            />
          </Field>
        </FieldGroup>
      </FieldSet>

      {/* Submit Button */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <Button type="submit" disabled={isPending} className="sm:flex-1">
          {isPending ? t("saving") : t("saveButton")}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          className="sm:flex-1"
          onClick={() => router.push("/recipes")}
        >
          {tButtons("cancel")}
        </Button>
      </div>
    </form>
  );
}
