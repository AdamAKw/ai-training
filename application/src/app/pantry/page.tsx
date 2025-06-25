import { Suspense } from "react";
import { IPantryItem } from "@/models/pantryItem";
import { connectToDatabase } from "@/lib/db/mongoose";
import PantryClient from "@/components/pantry/PantryClient";

// Fetch pantry items from database
async function getPantryItems(): Promise<IPantryItem[]> {
   try {
      await connectToDatabase();
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/pantry`, {
         cache: "no-store",
      });

      if (!response.ok) {
         throw new Error("Failed to fetch pantry items");
      }

      const { pantryItems } = await response.json();
      return pantryItems;
   } catch (error) {
      console.error("Error fetching pantry items:", error);
      return [];
   }
}

export default async function PantryPage() {
   const pantryItems = await getPantryItems();

   return (
      <div className="container py-6">
         <Suspense fallback={<div>Ładowanie spiżarki...</div>}>
            <PantryClient initialItems={pantryItems} />
         </Suspense>
      </div>
   );
}
