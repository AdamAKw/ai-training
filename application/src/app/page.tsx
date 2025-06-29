import { CurrentMealPlan } from "@/components/home/CurrentMealPlan";
import { EmptyMealPlan } from "@/components/home/EmptyMealPlan";
import { MealPlanSkeleton } from "@/components/home/MealPlanSkeleton";
import QuickNavigation from "@/components/home/quickNavigation";

export default function Home() {
  return (
    <div className="space-y-6">
      <CurrentMealPlan
        currentMealPlanSkeleton={<MealPlanSkeleton />}
        emptyMealPlan={<EmptyMealPlan />}
      />
      <div className="mt-8">
        <QuickNavigation />
      </div>
    </div>
  );
}
