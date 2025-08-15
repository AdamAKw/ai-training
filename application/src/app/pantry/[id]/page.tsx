import { notFound } from "next/navigation";
import { getTranslations, getFormatter } from "next-intl/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import { IPantryItem } from "@/models/pantryItem";
import { getApiBaseUrl } from "@/lib/utils/url-helpers";

// Fetch pantry item from database
async function getPantryItem(id: string): Promise<IPantryItem | null> {
  try {
    await connectToDatabase();
    const response = await fetch(`${getApiBaseUrl()}/api/pantry/${id}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error("Failed to fetch pantry item");
    }

    const { data } = await response.json();
    console.log(data);
    return data.pantryItem;
  } catch (error) {
    console.error(`Error fetching pantry item ${id}:`, error);
    return null;
  }
}

export default async function PantryItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("pantry.detail");
  const format = await getFormatter();
  const pantryItem = await getPantryItem(id);
console.log(pantryItem);
  if (!pantryItem) {
    notFound();
  }

  return (
    <div className="container py-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-4">
          {pantryItem.name}
        </h1>

        <div className="bg-card rounded-lg border p-6 shadow-sm">
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-muted-foreground">{t("quantity")}</dt>
              <dd className="text-lg font-medium">
                {pantryItem.quantity} {pantryItem.unit}
              </dd>
            </div>

            {pantryItem.category && (
              <div>
                <dt className="text-sm text-muted-foreground">
                  {t("category")}
                </dt>
                <dd className="text-lg font-medium">{pantryItem.category}</dd>
              </div>
            )}

            {pantryItem.expiryDate && (
              <div>
                <dt className="text-sm text-muted-foreground">
                  {t("expiryDate")}
                </dt>
                <dd className="text-lg font-medium">
                  {format.dateTime(new Date(pantryItem.expiryDate), "dateOnly")}
                </dd>
              </div>
            )}

            <div>
              <dt className="text-sm text-muted-foreground">
                {t("dateAdded")}
              </dt>
              <dd className="text-lg font-medium">
                {format.dateTime(new Date(pantryItem.createdAt), "dateOnly")}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
