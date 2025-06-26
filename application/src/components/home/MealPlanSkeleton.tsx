"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function MealPlanSkeleton() {
   return (
      <div className="space-y-8">
         <Skeleton className="h-12 w-3/4" />
         <div className="space-y-4">
            <Skeleton className="h-8 w-1/2" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-40 w-full" />
               ))}
            </div>
         </div>
      </div>
   );
}
