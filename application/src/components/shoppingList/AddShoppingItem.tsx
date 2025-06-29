import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface AddShoppingItemProps {
  onItemAdded: (item: {
    ingredient: string;
    quantity: number;
    unit: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

export function AddShoppingItem({
  onItemAdded,
  isLoading = false,
}: AddShoppingItemProps) {
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("szt");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = useTranslations("shoppingList.addItem");
  const tUnits = useTranslations("shoppingList.units");

  // Get units from translations
  const unitKeys = [
    "szt",
    "kg",
    "g",
    "l",
    "ml",
    "łyżka",
    "łyżeczka",
    "szklanka",
  ];
  const getUnitDisplay = (unitKey: string) => {
    try {
      return tUnits(unitKey);
    } catch {
      return unitKey; // fallback to key if translation not found
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!itemName.trim()) {
      toast.error(t("itemNameRequired"));
      return;
    }

    if (isNaN(parseFloat(quantity)) || parseFloat(quantity) <= 0) {
      toast.error(t("quantityInvalid"));
      return;
    }

    setIsSubmitting(true);

    try {
      // Call the parent handler with item data
      await onItemAdded({
        ingredient: itemName,
        quantity: parseFloat(quantity),
        unit,
      });

      // Reset form fields only on success
      setItemName("");
      setQuantity("1");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("unexpectedError");
      toast.error(t("addFailedWithMessage", { message: errorMessage }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 ">
      <h3 className="font-medium">{t("title")}</h3>

      <div className="flex flex-col gap-3">
        <div>
          <Input
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder={t("itemNamePlaceholder")}
            required
          />
        </div>

        <div className="flex gap-2">
          <div className="w-1/3">
            <Input
              type="number"
              min="0.01"
              step="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder={t("quantityPlaceholder")}
              required
            />
          </div>

          <div className="w-2/3">
            <Select value={unit} onValueChange={setUnit}>
              <SelectTrigger>
                <SelectValue placeholder={t("unitPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {unitKeys.map((unitKey) => (
                  <SelectItem key={unitKey} value={unitKey}>
                    {getUnitDisplay(unitKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || isLoading}
        className="w-full"
      >
        {isSubmitting || isLoading ? t("adding") : t("addButton")}
      </Button>
    </form>
  );
}
