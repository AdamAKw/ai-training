import { getBaseUrl } from "@/lib/utils/url-helpers";
import ClientPage from "./page.client";

async function getRecipes() {
   try {
      const res = await fetch(`${getBaseUrl()}/api/recipes`, {
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
      <div className="container py-10 max-w-7xl">
         <ClientPage recipes={recipes} />
      </div>
   );
}
