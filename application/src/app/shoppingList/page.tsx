import { PageHeader } from "@/components/layout/PageHeader";
import { ShoppingListClient } from "@/components/shoppingList/ShoppingListClient";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { getApiBaseUrl } from "@/lib/utils/url-helpers";
import { ShoppingListSkeleton } from "@/components/shoppingList/ShoppingListSkeleton";
import { EmptyShoppingListState } from "@/components/shoppingList/EmptyShoppingListState";

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
        <ShoppingListClient
          data={data}
          emptyShoppingList={<EmptyShoppingListState />}
        />
      </Suspense>
    </div>
  );
}

async function fetchShoppingLists() {
  const response = await fetch(`${getApiBaseUrl()}/api/shoppingList`, {
    cache: "no-store",
  });
  const { data } = await response.json();
  return data.shoppingLists;
}
