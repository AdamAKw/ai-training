
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";

export async function Navigation() {
   const t = await getTranslations("navigation");

   return (
      <nav className="flex items-center justify-between p-4 bg-white shadow-sm">
         <Link href="/" className="text-2xl font-bold text-gray-800">
            {t("appName")}
         </Link>

         <div className="flex items-center space-x-2">
            <Link href="/recipes">
               <Button variant="ghost">{t("recipes")}</Button>
            </Link>
            <Link href="/mealPlans">
               <Button variant="ghost">{t("mealPlans")}</Button>
            </Link>
            <Link href="/pantry">
               <Button variant="ghost">{t("pantry")}</Button>
            </Link>
            <Link href="/shoppingList">
               <Button variant="ghost">{t("shoppingList")}</Button>
            </Link>
         </div>
      </nav>
   );
}
