import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface AddShoppingItemProps {
   listId: string;
   onItemAdded: () => void;
}

export function AddShoppingItem({ listId, onItemAdded }: AddShoppingItemProps) {
   const [itemName, setItemName] = useState("");
   const [quantity, setQuantity] = useState("1");
   const [unit, setUnit] = useState("szt");
   const [isSubmitting, setIsSubmitting] = useState(false);

   // Common units for cooking
   const commonUnits = ["szt", "kg", "g", "l", "ml", "łyżka", "łyżeczka", "szklanka"];

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      // Basic validation
      if (!itemName.trim()) {
         toast.error("Please enter an item name");
         return;
      }

      if (isNaN(parseFloat(quantity)) || parseFloat(quantity) <= 0) {
         toast.error("Please enter a valid quantity");
         return;
      }

      setIsSubmitting(true);

      try {
         // Add the new item to the shopping list
         const response = await fetch(`/api/shoppingList/${listId}`, {
            method: "PATCH",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify({
               operation: "add-item",
               item: {
                  ingredient: itemName,
                  quantity: parseFloat(quantity),
                  unit,
                  purchased: false,
                  itemType: "pantry-restock",
               },
            }),
         });

         if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to add item to shopping list");
         }

         // Reset form fields
         setItemName("");
         setQuantity("1");

         // Notify parent component that an item was added
         onItemAdded();
         toast.success("Item added to shopping list");
      } catch (error) {
         const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
         toast.error(`Failed to add item: ${errorMessage}`);
      } finally {
         setIsSubmitting(false);
      }
   };

   return (
      <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded-md">
         <h3 className="font-medium">Add New Item</h3>

         <div className="flex flex-col gap-3">
            <div>
               <Input value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="Item name" required />
            </div>

            <div className="flex gap-2">
               <div className="w-1/3">
                  <Input
                     type="number"
                     min="0.01"
                     step="0.01"
                     value={quantity}
                     onChange={(e) => setQuantity(e.target.value)}
                     placeholder="Quantity"
                     required
                  />
               </div>

               <div className="w-2/3">
                  <Select value={unit} onValueChange={setUnit}>
                     <SelectTrigger>
                        <SelectValue placeholder="Unit" />
                     </SelectTrigger>
                     <SelectContent>
                        {commonUnits.map((unit) => (
                           <SelectItem key={unit} value={unit}>
                              {unit}
                           </SelectItem>
                        ))}
                     </SelectContent>
                  </Select>
               </div>
            </div>
         </div>

         <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Adding..." : "Add Item"}
         </Button>
      </form>
   );
}
