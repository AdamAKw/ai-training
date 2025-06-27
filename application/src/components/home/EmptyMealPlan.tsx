"use client";

import { EmptyState } from "@/components/layout/EmptyState";

export function EmptyMealPlan() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center ">
      <h2 className="text-2xl font-semibold mb-4">
        Brak aktualnego planu posiłków
      </h2>

      <EmptyState
        description="Nie znaleziono planu posiłków na dzisiejszy dzień. Utwórz nowy plan, aby zobaczyć go tutaj."
        actionLabel="Utwórz plan posiłków"
        actionHref="/mealPlans/new"
      />
    </div>
  );
}
