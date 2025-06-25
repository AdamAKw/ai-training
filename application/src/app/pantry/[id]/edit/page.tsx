import { notFound } from "next/navigation";
import { connectToDatabase } from "@/lib/db/mongoose";
import { IPantryItem } from "@/models/pantryItem";
import { getBaseUrl } from "@/lib/utils/url-helpers";
import EditPantryClient from "./page.client";

// Fetch pantry item from database
async function getPantryItem(id: string): Promise<IPantryItem | null> {
   try {
      await connectToDatabase();
      const response = await fetch(`${getBaseUrl()}/api/pantry/${id}`, {
         cache: "no-store",
      });

      if (!response.ok) {
         if (response.status === 404) return null;
         throw new Error("Failed to fetch pantry item");
      }

      const { pantryItem } = await response.json();
      return pantryItem;
   } catch (error) {
      console.error(`Error fetching pantry item ${id}:`, error);
      return null;
   }
}

export default async function EditPantryItemPage({ params }: { params: Promise<{ id: string }> }) {
   const { id } = await params;
   const pantryItem = await getPantryItem(id);

   if (!pantryItem) {
      notFound();
   }

   return (
      <div className="container py-6 max-w-3xl">
         <EditPantryClient pantryItem={pantryItem} />
      </div>
   );
}
