"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RecipeCardProps {
  id: string;
  name: string;
  description?: string;
  prepTime: number;
  cookTime: number;
}

export function RecipeCard({
  id,
  name,
  description,
  prepTime,
  cookTime,
}: RecipeCardProps) {
  const t = useTranslations("recipes.card");

  return (
    <Card className="h-full flex flex-col">
      <Link
        href={`/recipes/${id}`}
        className="flex-grow hover:opacity-90 transition-opacity"
      >
        <CardHeader>
          <CardTitle>{name}</CardTitle>
          {description && (
            <CardDescription className="line-clamp-2">
              {description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-2">
            <Badge variant="outline">
              {t("prep")}: {prepTime}
              {t("minutes")}
            </Badge>
            <Badge variant="outline">
              {t("cook")}: {cookTime}
              {t("minutes")}
            </Badge>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
