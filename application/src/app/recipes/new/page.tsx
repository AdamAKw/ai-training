import { getTranslations } from "next-intl/server";
import { createRecipe } from "@/lib/actions/recipe-actions";
import { ModernRecipeForm } from "@/components/recipes/ModernRecipeForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function NewRecipePage() {
  const t = await getTranslations("recipes.new");

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl">{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ModernRecipeForm createRecipeAction={createRecipe} />
        </CardContent>
      </Card>
    </div>
  );
}
