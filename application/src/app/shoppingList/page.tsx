import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/layout/PageHeader";
import { ShoppingList } from "@/components/shoppingList/ShoppingListClient";

export default function ShoppingListPage() {
  const t = useTranslations("shoppingList");

  return (
    <div>
      <PageHeader title={t("title")} action={{href:"/shoppingList/new", label:t("createEmptyList")}}/>
      <ShoppingList />
    </div>
  );
}
