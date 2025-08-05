import { getApiBaseUrl } from "@/lib/utils/url-helpers";
import ClientPage from "./page.client";

async function getRecipes() {
  try {
    const res = await fetch(`${getApiBaseUrl()}/api/recipes`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Nie udało się pobrać przepisów");
    }

    const data = await res.json();
    return data.recipes;
  } catch (error) {
    console.error("Błąd podczas pobierania przepisów:", error);
    return [];
  }
}

export default async function NewMealPlanPage() {
  const recipes = await getRecipes();

  return (
    <div>
      <ClientPage recipes={recipes} />
    </div>
  );
}
