import { PageHeader } from "@/components/layout/PageHeader";
import { ShoppingList } from "@/components/shoppingList/ShoppingListClient";
import { ShoppingListTest } from "@/components/shoppingList/ShoppingListClientCopy";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { getBaseUrl } from "@/lib/utils/url-helpers";
import { ShoppingListSkeleton } from "@/components/shoppingList/ShoppingListSkeleton";

export default async function ShoppingListPage() {
  const t = await getTranslations("shoppingList");
  const data = fetchShoppingLists();

  return (
    <div>
      <PageHeader
        title={t("title")}
        action={{ href: "/shoppingList/new", label: t("createEmptyList") }}
      />
      <Suspense fallback={<ShoppingListSkeleton />}>
        <ShoppingListTest data={data} />
      </Suspense>
      <div className="mt-8" />
      <ShoppingList />
    </div>
  );
}
async function fetchShoppingLists() {
  const response = await fetch(`${getBaseUrl()}/api/shoppingList`, {
    cache: "no-store",
  });
  return await response.json();
}
