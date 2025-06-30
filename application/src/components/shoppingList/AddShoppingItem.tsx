import React from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
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
  const t = useTranslations("shoppingList.addItem");
  const tUnits = useTranslations("shoppingList.units");

  // Create schema with translated error messages
  const formSchema = z.object({
    ingredient: z.string().min(1, t("itemNameRequired")).trim(),
    quantity: z
      .string()
      .min(1, t("quantityInvalid"))
      .refine((val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num > 0;
      }, t("quantityInvalid")),
    unit: z.string().min(1, "Unit is required"), // Keep basic message for unit as it's less likely to fail
  });

  type FormData = z.infer<typeof formSchema>;

  // Initialize form with react-hook-form and zod resolver
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ingredient: "",
      quantity: "1",
      unit: "szt",
    },
  });

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

  const onSubmit = async (data: FormData) => {
    try {
      // Call the parent handler with item data
      await onItemAdded({
        ingredient: data.ingredient,
        quantity: parseFloat(data.quantity),
        unit: data.unit,
      });

      // Reset form fields only on success
      form.reset();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("unexpectedError");
      toast.error(t("addFailedWithMessage", { message: errorMessage }));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <h3 className="font-medium">{t("title")}</h3>

        <div className="flex flex-col gap-3">
          <FormField
            control={form.control}
            name="ingredient"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder={t("itemNamePlaceholder")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-2">
            <div className="w-1/3">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder={t("quantityPlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="w-2/3">
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={form.formState.isSubmitting || isLoading}
          className="w-full"
        >
          {form.formState.isSubmitting || isLoading
            ? t("adding")
            : t("addButton")}
        </Button>
      </form>
    </Form>
  );
}
