"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { DeleteRecipeDialog } from "./DeleteRecipeDialog";

// ImageWithFallback component for handling image loading errors
interface ImageWithFallbackProps {
  src: string;
  fallbackSrc: string;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
}

function ImageWithFallback({
  src,
  fallbackSrc,
  alt,
  fill = false,
  className = "",
  sizes,
  ...props
}: ImageWithFallbackProps &
  Omit<React.ComponentProps<typeof Image>, "src" | "alt" | "fill">) {
  const [hasError, setHasError] = useState<boolean>(false);
  const t = useTranslations("recipes.detail");

  // Initialize with fallback if the URL is invalid
  useEffect(() => {
    // Check if the image URL is valid and handle domain issues
    const isValidImageDomain = () => {
      try {
        // Check if URL is valid
        new URL(src);

        // If we get here, the URL is valid, so we use the provided src
        return true;
      } catch {
        // URL is not valid, use fallback
        console.warn(`Invalid image URL: ${src}`);
        return false;
      }
    };

    if (!src || !isValidImageDomain()) {
      setHasError(true);
    }
  }, [src, fallbackSrc]);

  const handleError = () => {
    if (!hasError) {
      console.warn(`Failed to load image: ${src}`);
      setHasError(true);
    }
  };

  // If there's an error or no fallbackSrc provided, show text placeholder
  if (hasError || !fallbackSrc) {
    return (
      <div className="h-full bg-muted flex items-center justify-center">
        <span className="text-muted-foreground">{t("noImage")}</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
      onError={handleError}
      {...props}
    />
  );
}

// Define the Recipe interface based on our model
interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface RecipeDetailProps {
  id: string;
  recipe: {
    _id: string;
    name: string;
    description: string;
    ingredients: Ingredient[];
    instructions: string[];
    prepTime: number;
    cookTime: number;
    servings: number;
    imageUrl?: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
  };
}

export function RecipeDetail({ id, recipe }: RecipeDetailProps) {
  // No need for state anymore since delete functionality is handled by the client component
  const [error] = useState<string | null>(null);
  const t = useTranslations("recipes.detail");

  return (
    <div className="max-w-4xl mx-auto p-6">
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Navigation and Actions */}
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" asChild>
          <Link href="/recipes">
            <span className="mr-2">←</span> {t("backToRecipes")}
          </Link>
        </Button>

        <div className="space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/recipes/${id}/edit`}>{t("editRecipe")}</Link>
          </Button>
          <DeleteRecipeDialog recipeId={id} recipeName={recipe.name} />
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Recipe Header */}
      <Card className="mb-8 border-none shadow-none">
        <CardHeader className="px-0">
          <CardTitle className="text-3xl">{recipe.name}</CardTitle>

          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {recipe.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Recipe Image (if available) */}
      <Card className="mb-8 overflow-hidden">
        <CardContent className="p-0">
          <AspectRatio ratio={16 / 9}>
            {recipe.imageUrl ? (
              <ImageWithFallback
                src={recipe.imageUrl}
                alt={recipe.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 800px"
                fallbackSrc=""
              />
            ) : (
              <div className="h-full bg-muted flex items-center justify-center">
                <span className="text-muted-foreground">{t("noImage")}</span>
              </div>
            )}
          </AspectRatio>
        </CardContent>
      </Card>

      {/* Recipe Info */}
      <div className="grid grid-cols-3 gap-4 mb-8 text-center">
        <Card>
          <CardHeader className="py-3">
            <CardDescription className="text-gray-600">
              {t("prepTime")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-medium">
              {recipe.prepTime} {t("minutes")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardDescription className="text-gray-600">
              {t("cookTime")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-medium">
              {recipe.cookTime} {t("minutes")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardDescription className="text-gray-600">
              {t("servings")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-medium">{recipe.servings}</p>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {recipe.description && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t("description")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{recipe.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Ingredients */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{t("ingredients")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  <strong>
                    {ingredient.quantity} {ingredient.unit}
                  </strong>{" "}
                  {ingredient.name}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{t("instructions")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4">
            {recipe.instructions.map((instruction, index) => (
              <li key={index} className="p-4 rounded-lg border">
                <div className="flex">
                  <span className="flex-shrink-0 bg-gray-200 h-6 w-6 rounded-full flex items-center justify-center mr-3">
                    {index + 1}
                  </span>
                  <p>{instruction}</p>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Recipe Metadata */}
      <Card className="border-none shadow-none">
        <CardFooter className="text-sm text-gray-500 border-t pt-4">
          <div>
            <p>
              {t("created")}: {new Date(recipe.createdAt).toLocaleDateString()}
            </p>
            <p>
              {t("lastUpdated")}:{" "}
              {new Date(recipe.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
