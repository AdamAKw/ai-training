"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { IPantryItem } from "@/models/pantryItem";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface PantryFormProps {
  initialData?: Partial<IPantryItem>;
  onSubmit: (data: PantryFormData) => Promise<void>;
  isSubmitting: boolean;
}

export interface PantryFormData {
  name: string;
  quantity: number;
  unit: string;
  category?: string;
  expiryDate?: string;
}

export function PantryForm({
  initialData,
  onSubmit,
  isSubmitting,
}: PantryFormProps) {
  const router = useRouter();
  const t = useTranslations();

  // Form state
  const [name, setName] = useState(initialData?.name || "");
  const [quantity, setQuantity] = useState(initialData?.quantity || 1);
  const [unit, setUnit] = useState(initialData?.unit || "szt.");
  const [category, setCategory] = useState(initialData?.category || "");
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(
    initialData?.expiryDate ? new Date(initialData.expiryDate) : undefined
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Common units for pantry items
  const unitOptions = [
    { value: "szt.", label: t("pantry.units.szt") },
    { value: "g", label: t("pantry.units.g") },
    { value: "kg", label: t("pantry.units.kg") },
    { value: "ml", label: t("pantry.units.ml") },
    { value: "l", label: t("pantry.units.l") },
    { value: "łyżka", label: t("pantry.units.łyżka") },
    { value: "łyżeczka", label: t("pantry.units.łyżeczka") },
    { value: "szklanka", label: t("pantry.units.szklanka") },
    { value: "opakowanie", label: t("pantry.units.opakowanie") },
  ];

  // Common categories for pantry items
  const categoryOptions = [
    { value: "warzywa", label: t("pantry.categories.warzywa") },
    { value: "owoce", label: t("pantry.categories.owoce") },
    { value: "mięso", label: t("pantry.categories.mięso") },
    { value: "nabiał", label: t("pantry.categories.nabiał") },
    { value: "pieczywo", label: t("pantry.categories.pieczywo") },
    { value: "przyprawy", label: t("pantry.categories.przyprawy") },
    { value: "napoje", label: t("pantry.categories.napoje") },
    { value: "mrożonki", label: t("pantry.categories.mrożonki") },
    { value: "słodycze", label: t("pantry.categories.słodycze") },
    { value: "konserwy", label: t("pantry.categories.konserwy") },
    { value: "inne", label: t("pantry.categories.inne") },
  ];

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = t("pantry.item.name.required");
    }

    if (quantity <= 0) {
      newErrors.quantity = t("pantry.item.quantity.positive");
    }

    if (!unit.trim()) {
      newErrors.unit = t("pantry.item.unit.required");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const formData: PantryFormData = {
      name,
      quantity,
      unit,
      category: category || undefined,
      expiryDate: expiryDate ? expiryDate.toISOString() : undefined,
    };

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Błąd podczas zapisywania produktu w spiżarce:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>
            {initialData?.id
              ? t("pantry.form.editTitle")
              : t("pantry.form.addTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name field */}
          <div className="space-y-2">
            <Label htmlFor="name">{t("pantry.item.name.label")}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Podaj nazwę produktu"
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-sm font-medium text-destructive">
                {errors.name}
              </p>
            )}
          </div>

          {/* Quantity and Unit fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">
                {t("pantry.item.quantity.label")}
              </Label>
              <Input
                id="quantity"
                type="number"
                min="0.01"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value))}
                className={errors.quantity ? "border-destructive" : ""}
              />
              {errors.quantity && (
                <p className="text-sm font-medium text-destructive">
                  {errors.quantity}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">{t("pantry.item.unit.label")}</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger
                  id="unit"
                  className={errors.unit ? "border-destructive" : ""}
                >
                  <SelectValue placeholder={t("pantry.item.unit.label")} />
                </SelectTrigger>
                <SelectContent>
                  {unitOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.unit && (
                <p className="text-sm font-medium text-destructive">
                  {errors.unit}
                </p>
              )}
            </div>
          </div>

          {/* Category field */}
          <div className="space-y-2">
            <Label htmlFor="category">{t("pantry.item.category.label")}</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder={t("pantry.item.category.label")} />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Expiry date field */}
          <div className="space-y-2">
            <Label htmlFor="expiryDate">
              {t("pantry.item.expiryDate.label")}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="expiryDate"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !expiryDate && "text-muted-foreground"
                  )}
                >
                  {expiryDate
                    ? format(expiryDate, "dd.MM.yyyy", { locale: pl })
                    : "Wybierz datę"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-2 border-b">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-sm font-normal"
                    onClick={() => setExpiryDate(undefined)}
                  >
                    Wyczyść datę
                  </Button>
                </div>
                <Calendar
                  mode="single"
                  selected={expiryDate}
                  onSelect={setExpiryDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            {t("buttons.cancel")}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t("status.saving") : t("pantry.form.saveButton")}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

export default PantryForm;
