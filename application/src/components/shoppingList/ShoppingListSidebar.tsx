import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ShoppingListType } from "./ShoppingListClient";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { MoreVertical, Copy, Trash2, ArrowUp } from "lucide-react";
import { useState } from "react";

interface ShoppingListSidebarProps {
  lists: ShoppingListType[];
  activeList: ShoppingListType | null;
  onSelectList: (list: ShoppingListType) => void;
  onCopyList: (listId: string) => Promise<void>;
  onDeleteList: (listId: string) => Promise<void>;
  onTransferToPantry: (listId: string) => Promise<void>;
  loadingStates?: {
    copyList: boolean;
    deleteList: boolean;
    transferToPantry: boolean;
  };
}

export function ShoppingListSidebar({
  lists,
  activeList,
  onSelectList,
  onCopyList,
  onDeleteList,
  onTransferToPantry,
  loadingStates = {
    copyList: false,
    deleteList: false,
    transferToPantry: false,
  },
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
            onCopyList={onCopyList}
            onDeleteList={onDeleteList}
            onTransferToPantry={onTransferToPantry}
            loadingStates={loadingStates}
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
  onCopyList: (listId: string) => Promise<void>;
  onDeleteList: (listId: string) => Promise<void>;
  onTransferToPantry: (listId: string) => Promise<void>;
  loadingStates?: {
    copyList: boolean;
    deleteList: boolean;
    transferToPantry: boolean;
  };
}

function ShoppingListCard({
  list,
  isActive,
  onClick,
  onCopyList,
  onDeleteList,
  onTransferToPantry,
  loadingStates = {
    copyList: false,
    deleteList: false,
    transferToPantry: false,
  },
}: ShoppingListCardProps) {
  const t = useTranslations("shoppingList");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleCopyList = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await onCopyList(list._id);
    setIsDropdownOpen(false);
  };

  const handleDeleteList = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await onDeleteList(list._id);
    setIsDropdownOpen(false);
  };

  const handleTransferToPantry = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await onTransferToPantry(list._id);
    setIsDropdownOpen(false);
  };

  const purchasedItemsCount = list.items.filter((i) => i.purchased).length;

  return (
    <div
      className={`p-3 rounded-md cursor-pointer transition-colors border relative
        ${isActive ? "bg-gray-100" : "bg-white hover:bg-gray-200"}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-medium">{list.name}</h3>
          <p className="text-sm text-muted-foreground">
            {typeof list.mealPlan === "object"
              ? list.mealPlan.name
              : t("mealPlan")}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {list.items.length} {t("items")} • {purchasedItemsCount}{" "}
            {t("purchased")}
          </p>
        </div>

        {/* Dropdown Menu */}
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-300"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={handleCopyList}
              disabled={loadingStates.copyList}
            >
              <Copy className="h-4 w-4 mr-2" />
              {loadingStates.copyList
                ? t("detail.copyingList")
                : t("detail.copyList")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleTransferToPantry}
              disabled={
                purchasedItemsCount === 0 || loadingStates.transferToPantry
              }
            >
              <ArrowUp className="h-4 w-4 mr-2" />
              {loadingStates.transferToPantry
                ? t("detail.transferringToPantry")
                : t("detail.transferToPantry")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  onSelect={(e: Event) => e.preventDefault()}
                  disabled={loadingStates.deleteList}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {loadingStates.deleteList
                    ? t("detail.deletingList")
                    : t("detail.deleteList")}
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t("detail.deleteConfirm")}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("detail.deleteConfirmDescription")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("detail.cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteList}
                    disabled={loadingStates.deleteList}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {loadingStates.deleteList
                      ? t("detail.deletingList")
                      : t("detail.deleteList")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
