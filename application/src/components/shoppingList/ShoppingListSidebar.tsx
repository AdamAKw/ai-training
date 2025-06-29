import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ShoppingListType } from "./ShoppingListClient";

interface ShoppingListSidebarProps {
  lists: ShoppingListType[];
  activeList: ShoppingListType | null;
  onSelectList: (list: ShoppingListType) => void;
}

export function ShoppingListSidebar({
  lists,
  activeList,
  onSelectList,
}: ShoppingListSidebarProps) {
  const router = useRouter();
  const t = useTranslations("shoppingList");

  return (
    <div className="lg:col-span-1">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium">{t("yourLists")}</h2>
        <Button
          onClick={() => router.push("/shoppingList/new")}
          size="sm"
          className="text-sm"
        >
          {t("newListButton")}
        </Button>
      </div>
      <div className="space-y-2">
        {lists.map((list) => (
          <ShoppingListCard
            key={list._id}
            list={list}
            isActive={activeList?._id === list._id}
            onClick={() => onSelectList(list)}
          />
        ))}
      </div>
    </div>
  );
}

interface ShoppingListCardProps {
  list: ShoppingListType;
  isActive: boolean;
  onClick: () => void;
}

function ShoppingListCard({ list, isActive, onClick }: ShoppingListCardProps) {
  const t = useTranslations("shoppingList");

  return (
    <div
      className={`p-3 rounded-md cursor-pointer transition-colors border
        ${isActive ? "bg-gray-100" : "bg-white hover:bg-gray-200"}`}
      onClick={onClick}
    >
      <h3 className="font-medium">{list.name}</h3>
      <p className="text-sm text-muted-foreground">
        {typeof list.mealPlan === "object" ? list.mealPlan.name : t("mealPlan")}
      </p>
      <p className="text-sm text-muted-foreground mt-1">
        {list.items.length} {t("items")} •{" "}
        {list.items.filter((i) => i.purchased).length} {t("purchased")}
      </p>
    </div>
  );
}
