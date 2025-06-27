import React, { useState } from "react";
import { MealPlanCard } from "./MealPlanCard";
import { IMealPlan } from "@/models/mealPlan";
import { EmptyState } from "@/components/layout/EmptyState";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface MealPlanListProps {
  mealPlans: IMealPlan[];
  onDelete: (id: string) => Promise<void>;
}

export function MealPlanList({ mealPlans, onDelete }: MealPlanListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [mealPlanToDelete, setMealPlanToDelete] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setMealPlanToDelete(id);
    setIsDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (mealPlanToDelete) {
      await onDelete(mealPlanToDelete);
      setMealPlanToDelete(null);
    }
    setIsDialogOpen(false);
  };

  if (mealPlans.length === 0) {
    return (
      <EmptyState
        description="Nie masz jeszcze żadnych planów posiłków."
        actionLabel="Utwórz pierwszy plan"
        actionHref="/mealPlans/new"
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mealPlans.map((mealPlan) => (
          <MealPlanCard
            key={mealPlan._id as string}
            mealPlan={mealPlan}
            onDelete={handleDeleteClick}
          />
        ))}
      </div>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Czy na pewno chcesz usunąć ten plan posiłków?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Ta akcja jest nieodwracalna. Spowoduje trwałe usunięcie planu
              posiłków.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Usuń
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default MealPlanList;
