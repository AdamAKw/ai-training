import React from "react";
import { IPantryItem } from "@/models/pantryItem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

interface PantryItemProps {
   item: IPantryItem;
   onEdit: (item: IPantryItem) => void;
   onDelete: (id: string) => void;
}

export function PantryItem({ item, onEdit, onDelete }: PantryItemProps) {
   // Format expiry date if exists
   const formattedExpiryDate = item.expiryDate ? format(new Date(item.expiryDate), "dd.MM.yyyy", { locale: pl }) : null;

   // Determine if item is expired or close to expiry (within 3 days)
   const isExpired = item.expiryDate && new Date(item.expiryDate) < new Date();
   const isCloseToExpiry =
      item.expiryDate &&
      new Date(item.expiryDate) > new Date() &&
      new Date(item.expiryDate) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

   return (
      <Card className="h-full">
         <CardContent className="pt-6 pb-4">
            <div className="flex justify-between items-start mb-2">
               <h3 className="text-lg font-medium leading-tight">{item.name}</h3>
               {item.category && <span className="text-xs px-2 py-1 bg-muted rounded-full">{item.category}</span>}
            </div>

            <div className="flex items-center mt-3">
               <span className="font-semibold text-lg">{item.quantity}</span>
               <span className="ml-1 text-muted-foreground">{item.unit}</span>
            </div>

            {formattedExpiryDate && (
               <div
                  className={`mt-2 text-sm ${
                     isExpired
                        ? "text-destructive font-medium"
                        : isCloseToExpiry
                        ? "text-amber-500 font-medium"
                        : "text-muted-foreground"
                  }`}
               >
                  {isExpired
                     ? "Przeterminowane: "
                     : isCloseToExpiry
                     ? "Wkrótce się przeterminuje: "
                     : "Termin ważności: "}
                  {formattedExpiryDate}
               </div>
            )}
         </CardContent>

         <CardFooter className="pt-0 pb-4 flex justify-end space-x-2">
            <Button variant="ghost" size="sm" onClick={() => onEdit(item)}>
               Edytuj
            </Button>
            <Button variant="destructive" size="sm" onClick={() => onDelete(item._id as string)}>
               Usuń
            </Button>
         </CardFooter>
      </Card>
   );
}

export default PantryItem;
