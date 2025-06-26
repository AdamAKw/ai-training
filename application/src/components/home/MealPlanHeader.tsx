"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { IMealPlan } from "@/models/mealPlan";

interface MealPlanHeaderProps {
   mealPlan: IMealPlan & { _id: string };
}

export function MealPlanHeader({ mealPlan }: MealPlanHeaderProps) {
   return (
      <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:space-y-0">
         <div>
            <h1 className="text-3xl font-bold tracking-tight">Aktualny plan posiłków: {mealPlan.name}</h1>
            <p className="text-muted-foreground">
               {formatDate(new Date(mealPlan.startDate))} - {formatDate(new Date(mealPlan.endDate))}
            </p>
         </div>
         <div className="space-x-2">
            <Button variant="outline" asChild>
               <Link href={`/mealPlans/${mealPlan._id}`}>Szczegóły planu</Link>
            </Button>
            <Button variant="outline" asChild>
               <Link href={`/mealPlans/${mealPlan._id}/edit`}>Edytuj plan</Link>
            </Button>
            <Button variant="default" asChild>
               <Link href={`/shoppingList/new?mealPlanId=${mealPlan._id}`}>Utwórz listę zakupów</Link>
            </Button>
         </div>
      </div>
   );
}
