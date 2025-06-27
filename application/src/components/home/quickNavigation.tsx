"use client";

import Link from "next/link";
import { Card, CardContent } from "../ui/card";
import { useTranslations } from "next-intl";



export default function QuickNavigation() {
   const t = useTranslations("home");
   return (
      <div className="w-full">
         <h2 className="text-2xl font-semibold mb-4">{t("quickNavigation")}</h2>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickNavigationCard
               href="/mealPlans"
               icon="🗓️"
               label={t("navigation.mealPlans")}
            />

            <QuickNavigationCard
               href="/recipes"
               icon="📝"
               label={t("navigation.recipes")}
            />

            <QuickNavigationCard
               href="/pantry"
               icon="🥫"
               label={t("navigation.pantry")}
            />

            <QuickNavigationCard
               href="/shoppingList"
               icon="🛒"
               label={t("navigation.shoppingLists")}
            />
         </div>
      </div>
   );

   type QuickNavigationCardProps = {
      href: string;
      icon: string;
      label: string;
   };

   function QuickNavigationCard({ href, icon, label }: QuickNavigationCardProps) {
      return <Link href={href} className="w-full">
         <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center h-24">
               <span className="text-xl mb-1">{icon}</span>
               <span className="text-sm font-medium">{label}</span>
            </CardContent>
         </Card>
      </Link>;
   }
}
