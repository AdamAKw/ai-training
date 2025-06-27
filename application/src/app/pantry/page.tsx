import { Suspense } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { IPantryItem } from "@/models/pantryItem";
import { connectToDatabase } from "@/lib/db/mongoose";
import PantryClient from "@/components/pantry/PantryClient";
import { getBaseUrl } from "@/lib/utils/url-helpers";

// Fetch pantry items from database
async function getPantryItems(): Promise<IPantryItem[]> {
  try {
    await connectToDatabase();
    const response = await fetch(`${getBaseUrl()}/api/pantry`, {
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
    <div>
      <PageHeader
        title="Spiżarnia"
        description="Zarządzaj produktami w swojej spiżarni"
        action={{
          label: "Dodaj nowy produkt",
          href: "/pantry/new",
        }}
      />
      <Suspense fallback={<div>Ładowanie spiżarki...</div>}>
        <PantryClient initialItems={pantryItems} />
      </Suspense>
    </div>
  );
}
