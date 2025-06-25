import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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

export function PantryForm({ initialData, onSubmit, isSubmitting }: PantryFormProps) {
   const router = useRouter();

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
      { value: "szt.", label: "Sztuka" },
      { value: "g", label: "Gram" },
      { value: "kg", label: "Kilogram" },
      { value: "ml", label: "Mililitr" },
      { value: "l", label: "Litr" },
      { value: "łyżka", label: "Łyżka" },
      { value: "łyżeczka", label: "Łyżeczka" },
      { value: "szklanka", label: "Szklanka" },
      { value: "opakowanie", label: "Opakowanie" },
   ];

   // Common categories for pantry items
   const categoryOptions = [
      { value: "warzywa", label: "Warzywa" },
      { value: "owoce", label: "Owoce" },
      { value: "mięso", label: "Mięso" },
      { value: "nabiał", label: "Nabiał" },
      { value: "pieczywo", label: "Pieczywo" },
      { value: "przyprawy", label: "Przyprawy" },
      { value: "napoje", label: "Napoje" },
      { value: "mrożonki", label: "Mrożonki" },
      { value: "słodycze", label: "Słodycze" },
      { value: "konserwy", label: "Konserwy" },
      { value: "inne", label: "Inne" },
   ];

   const validate = () => {
      const newErrors: Record<string, string> = {};

      if (!name.trim()) {
         newErrors.name = "Nazwa produktu jest wymagana";
      }

      if (quantity <= 0) {
         newErrors.quantity = "Ilość musi być większa od 0";
      }

      if (!unit.trim()) {
         newErrors.unit = "Jednostka jest wymagana";
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
               <CardTitle>{initialData?._id ? "Edytuj produkt" : "Dodaj nowy produkt"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               {/* Name field */}
               <div className="space-y-2">
                  <Label htmlFor="name">Nazwa produktu</Label>
                  <Input
                     id="name"
                     value={name}
                     onChange={(e) => setName(e.target.value)}
                     placeholder="Podaj nazwę produktu"
                     className={errors.name ? "border-destructive" : ""}
                  />
                  {errors.name && <p className="text-sm font-medium text-destructive">{errors.name}</p>}
               </div>

               {/* Quantity and Unit fields */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <Label htmlFor="quantity">Ilość</Label>
                     <Input
                        id="quantity"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={quantity}
                        onChange={(e) => setQuantity(parseFloat(e.target.value))}
                        className={errors.quantity ? "border-destructive" : ""}
                     />
                     {errors.quantity && <p className="text-sm font-medium text-destructive">{errors.quantity}</p>}
                  </div>

                  <div className="space-y-2">
                     <Label htmlFor="unit">Jednostka</Label>
                     <Select value={unit} onValueChange={setUnit}>
                        <SelectTrigger id="unit" className={errors.unit ? "border-destructive" : ""}>
                           <SelectValue placeholder="Wybierz jednostkę" />
                        </SelectTrigger>
                        <SelectContent>
                           {unitOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                 {option.label}
                              </SelectItem>
                           ))}
                        </SelectContent>
                     </Select>
                     {errors.unit && <p className="text-sm font-medium text-destructive">{errors.unit}</p>}
                  </div>
               </div>

               {/* Category field */}
               <div className="space-y-2">
                  <Label htmlFor="category">Kategoria (opcjonalna)</Label>
                  <Select value={category} onValueChange={setCategory}>
                     <SelectTrigger id="category">
                        <SelectValue placeholder="Wybierz kategorię" />
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
                  <Label htmlFor="expiryDate">Data ważności (opcjonalna)</Label>
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
                           {expiryDate ? format(expiryDate, "dd.MM.yyyy", { locale: pl }) : "Wybierz datę"}
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
                        <Calendar mode="single" selected={expiryDate} onSelect={setExpiryDate} initialFocus />
                     </PopoverContent>
                  </Popover>
               </div>
            </CardContent>

            <CardFooter className="flex justify-between">
               <Button type="button" variant="outline" onClick={() => router.back()}>
                  Anuluj
               </Button>
               <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Zapisywanie..." : "Zapisz produkt"}
               </Button>
            </CardFooter>
         </Card>
      </form>
   );
}

export default PantryForm;
