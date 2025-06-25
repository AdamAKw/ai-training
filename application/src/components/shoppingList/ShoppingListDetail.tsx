"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingListType } from "./ShoppingListClient";
import { ShoppingListItem } from "./ShoppingListItem";
import { AddShoppingItem } from "./AddShoppingItem";

interface ShoppingListDetailProps {
   list: ShoppingListType;
   onTogglePurchased: (itemId: string, purchased: boolean) => Promise<void>;
   onRemoveItem: (itemId: string) => Promise<void>;
   onTransferToPantry: () => Promise<void>;
}

export function ShoppingListDetail({
   list,
   onTogglePurchased,
   onRemoveItem,
   onTransferToPantry,
}: ShoppingListDetailProps) {
   const [activeFilter, setActiveFilter] = useState<"all" | "remaining" | "purchased" | "in-pantry">("all");
   const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
   const [showAddItem, setShowAddItem] = useState(false);

   // Get unique categories from items (using recipe names)
   const categories = Array.from(
      new Set(
         list.items.filter((item) => item.recipe).map((item) => (typeof item.recipe === "string" ? item.recipe : ""))
      )
   ).filter(Boolean);

   // Filter items based on active filter and category filter
   const filteredItems = list.items.filter((item) => {
      // First, apply the primary filter
      if (activeFilter === "remaining" && item.purchased) return false;
      if (activeFilter === "purchased" && !item.purchased) return false;
      if (activeFilter === "in-pantry" && !item.inPantry) return false;

      // Then, apply the category filter if set
      if (categoryFilter && item.recipe !== categoryFilter) return false;

      return true;
   });

   // Count items by status
   const totalItems = list.items.length;
   const purchasedItems = list.items.filter((item) => item.purchased).length;
   const inPantryItems = list.items.filter((item) => item.inPantry).length;

   return (
      <div className="bg-white rounded-md shadow-sm border p-4">
         <div className="flex justify-between items-start mb-6">
            <div>
               <h2 className="text-2xl font-bold">{list.name}</h2>
               <p className="text-gray-600">{typeof list.mealPlan === "object" ? list.mealPlan.name : "Custom List"}</p>
            </div>
            <div className="space-x-2">
               <Button variant="outline" onClick={onTransferToPantry} disabled={purchasedItems === 0}>
                  Transfer to Pantry
               </Button>
               <Button variant="outline" onClick={() => setShowAddItem(!showAddItem)}>
                  {showAddItem ? "Hide Form" : "Add Item"}
               </Button>
            </div>
         </div>

         <div className="flex justify-between items-center mb-4">
            <div className="space-x-2">
               <Badge
                  variant={activeFilter === "all" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setActiveFilter("all")}
               >
                  All ({totalItems})
               </Badge>
               <Badge
                  variant={activeFilter === "remaining" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setActiveFilter("remaining")}
               >
                  Remaining ({totalItems - purchasedItems})
               </Badge>
               <Badge
                  variant={activeFilter === "purchased" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setActiveFilter("purchased")}
               >
                  Purchased ({purchasedItems})
               </Badge>
               <Badge
                  variant={activeFilter === "in-pantry" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setActiveFilter("in-pantry")}
               >
                  In Pantry ({inPantryItems})
               </Badge>
            </div>
         </div>

         {categories.length > 0 && (
            <div className="mb-4 flex gap-2 flex-wrap">
               <Badge
                  variant={categoryFilter === null ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setCategoryFilter(null)}
               >
                  All Categories
               </Badge>
               {categories.map((category) => (
                  <Badge
                     key={category}
                     variant={categoryFilter === category ? "default" : "outline"}
                     className="cursor-pointer"
                     onClick={() => setCategoryFilter(category)}
                  >
                     {category}
                  </Badge>
               ))}
            </div>
         )}

         {showAddItem && (
            <div className="my-4">
               <AddShoppingItem
                  listId={list._id}
                  onItemAdded={() => {
                     // Set a visual indicator here if needed
                     setShowAddItem(false); // Optionally hide the form after adding
                  }}
               />
            </div>
         )}

         <div className="mt-6 space-y-2">
            {filteredItems.length > 0 ? (
               filteredItems.map((item) => (
                  <ShoppingListItem
                     key={item._id}
                     item={item}
                     onTogglePurchased={onTogglePurchased}
                     onRemoveItem={onRemoveItem}
                  />
               ))
            ) : (
               <div className="text-center py-8 text-gray-500">No items match the current filters</div>
            )}
         </div>

         <div className="mt-6">
            <Button onClick={() => setShowAddItem((prev) => !prev)} className="w-full">
               {showAddItem ? "Cancel" : "Add Shopping Item"}
            </Button>
            {showAddItem && (
               <div className="mt-4">
                  <AddShoppingItem listId={list._id} onItemAdded={() => setShowAddItem(false)} />
               </div>
            )}
         </div>
      </div>
   );
}
