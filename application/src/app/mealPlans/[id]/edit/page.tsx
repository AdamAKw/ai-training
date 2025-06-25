import { notFound } from "next/navigation";

async function getMealPlan(id: string) {
   try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/mealPlans/${id}`, {
         cache: "no-store",
      });

      if (!res.ok) {
         if (res.status === 404) return null;
         throw new Error("Nie udało się pobrać planu posiłków");
      }

      const data = await res.json();
      return data.mealPlan;
   } catch (error) {
      console.error("Błąd podczas pobierania planu posiłków:", error);
      return null;
   }
}

async function getRecipes() {
   try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/recipes`, {
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

export default async function EditMealPlanPage({ params }: { params: Promise<{ id: string }> }) {
   const { id } = await params;
   const [mealPlan, recipes] = await Promise.all([getMealPlan(id), getRecipes()]);

   if (!mealPlan) {
      notFound();
   }

   return (
      <div className="container py-10 max-w-7xl">
         <ClientPage mealPlan={mealPlan} recipes={recipes} />
      </div>
   );
}

import ClientPage from "./page.client";
