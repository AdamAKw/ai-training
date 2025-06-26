import { Card, CardContent } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

export default async function NotFound() {
   const t = await getTranslations("home");

   return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <Link href="/recipes" className="w-full">
            <Card>
               <CardContent className="p-4 flex flex-col items-center justify-center h-24">
                  <span className="text-xl mb-1">📝</span>
                  <span className="text-sm font-medium">{t("navigation.recipes")}</span>
               </CardContent>
            </Card>
         </Link>

         <Link href="/mealPlans" className="w-full">
            <Card>
               <CardContent className="p-4 flex flex-col items-center justify-center h-24">
                  <span className="text-xl mb-1">🗓️</span>
                  <span className="text-sm font-medium">{t("navigation.mealPlans")}</span>
               </CardContent>
            </Card>
         </Link>

         <Link href="/pantry" className="w-full">
            <Card>
               <CardContent className="p-4 flex flex-col items-center justify-center h-24">
                  <span className="text-xl mb-1">🥫</span>
                  <span className="text-sm font-medium">{t("navigation.pantry")}</span>
               </CardContent>
            </Card>
         </Link>

         <Link href="/shoppingList" className="w-full">
            <Card>
               <CardContent className="p-4 flex flex-col items-center justify-center h-24">
                  <span className="text-xl mb-1">🛒</span>
                  <span className="text-sm font-medium">{t("navigation.shoppingLists")}</span>
               </CardContent>
            </Card>
         </Link>
      </div>
   );
}
