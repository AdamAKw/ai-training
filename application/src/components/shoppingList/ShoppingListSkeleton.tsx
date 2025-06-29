import { Skeleton } from "@/components/ui/skeleton";

export function ShoppingListSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left column - Lists sidebar */}
      <div className="lg:col-span-1">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-7 w-24" /> {/* "Your Lists" title */}
          <Skeleton className="h-9 w-20" /> {/* New List button */}
        </div>
        <div className="space-y-2">
          {/* Shopping list items skeleton */}
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="p-3 rounded-md bg-gray-100 space-y-2">
              <Skeleton className="h-5 w-32" /> {/* List name */}
              <Skeleton className="h-4 w-24" /> {/* Meal plan name */}
              <Skeleton className="h-4 w-28" /> {/* Items count */}
            </div>
          ))}
        </div>
      </div>

      {/* Right column - Shopping list detail */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-md border p-4">
          {/* Header section */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <Skeleton className="h-8 w-48 mb-2" /> {/* List title */}
              <Skeleton className="h-4 w-36" /> {/* Meal plan info */}
            </div>
            <div className="space-x-2 flex">
              <Skeleton className="h-9 w-32" />{" "}
              {/* Transfer to Pantry button */}
              <Skeleton className="h-9 w-20" /> {/* Add Item button */}
              <Skeleton className="h-9 w-20" /> {/* Delete List button */}
            </div>
          </div>

          {/* Filter badges section */}
          <div className="flex justify-between items-center mb-4">
            <div className="space-x-2 flex">
              <Skeleton className="h-6 w-16" /> {/* All filter */}
              <Skeleton className="h-6 w-20" /> {/* Remaining filter */}
              <Skeleton className="h-6 w-20" /> {/* Purchased filter */}
              <Skeleton className="h-6 w-18" /> {/* In Pantry filter */}
            </div>
          </div>

          {/* Category filters section */}
          <div className="mb-4 flex gap-2 flex-wrap">
            <Skeleton className="h-6 w-24" /> {/* All Categories */}
            <Skeleton className="h-6 w-20" /> {/* Category 1 */}
            <Skeleton className="h-6 w-18" /> {/* Category 2 */}
          </div>

          {/* Shopping items list */}
          <div className="mt-6 space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-2 p-3 rounded-md bg-white border"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Skeleton className="w-6 h-6 rounded-full" /> {/* Checkbox */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Skeleton className="h-4 w-32" /> {/* Ingredient name */}
                      <Skeleton className="h-4 w-16" /> {/* In Pantry badge */}
                    </div>
                    <Skeleton className="h-3 w-28" />{" "}
                    {/* Quantity and recipe */}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded" /> {/* Remove button */}
                </div>
              </div>
            ))}
          </div>

          {/* Add item button */}
          <div className="mt-6">
            <Skeleton className="h-10 w-full" />{" "}
            {/* Add Shopping Item button */}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ShoppingListEmptySkeleton() {
  return (
    <div className="text-center space-y-4">
      <Skeleton className="h-7 w-48 mx-auto" /> {/* "No lists yet" title */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-64 mx-auto" /> {/* Description line 1 */}
        <Skeleton className="h-4 w-56 mx-auto" /> {/* Description line 2 */}
      </div>
      <div className="flex justify-center gap-3 mt-6">
        <Skeleton className="h-10 w-32" /> {/* Primary button */}
        <Skeleton className="h-10 w-28" /> {/* Secondary button */}
      </div>
    </div>
  );
}
