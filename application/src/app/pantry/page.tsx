import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { IPantryItem } from "@/models/pantryItem";
import PantryClient from "@/components/pantry/PantryClient";
import { getApiBaseUrl } from "@/lib/utils/url-helpers";

// Fetch pantry items from database
async function getPantryItems(): Promise<IPantryItem[]> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/pantry`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch pantry items");
    }

    const { data } = await response.json();
    return data.pantryItems;
  } catch (error) {
    console.error("Error fetching pantry items:", error);
    return [];
  }
}

export default async function PantryPage() {
  const t = await getTranslations("pantry");
  const pantryItems = getPantryItems();
  return (
    <div>
      <PageHeader
        title={t("title")}
        description={t("description")}
        action={{
          label: t("addNewButton"),
          href: "/pantry/new",
        }}
      />
      <Suspense fallback={<div>{t("loading")}</div>}>
        <PantryClient initialItems={pantryItems} />
      </Suspense>
    </div>
  );
}
