"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function EmptyMealPlan() {
   return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
         <h2 className="text-2xl font-semibold mb-4">Brak aktualnego planu posiłków</h2>
         <p className="text-muted-foreground mb-8">
            Nie znaleziono planu posiłków na dzisiejszy dzień. Utwórz nowy plan, aby zobaczyć go tutaj.
         </p>
         <Button asChild>
            <Link href="/mealPlans/new">Utwórz plan posiłków</Link>
         </Button>
      </div>
   );
}
