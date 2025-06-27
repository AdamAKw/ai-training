"use client";

import { CurrentMealPlan } from "@/components/home/CurrentMealPlan";
import QuickNavigation from "@/components/home/quickNavigation";

export default function Home() {
  return (
    <div className="space-y-6">
      <CurrentMealPlan />
      <div className="mt-8">
        <QuickNavigation />
      </div>
    </div>
  );
}
