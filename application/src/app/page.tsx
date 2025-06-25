import Link from "next/link";
import { CurrentMealPlan } from "@/components/home/CurrentMealPlan";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
   return (
      <div className="space-y-6">
         <CurrentMealPlan />

         <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Szybka nawigacja</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <Link href="/recipes" className="w-full">
                  <Card>
                     <CardContent className="p-4 flex flex-col items-center justify-center h-24">
                        <span className="text-xl mb-1">📝</span>
                        <span className="text-sm font-medium">Przepisy</span>
                     </CardContent>
                  </Card>
               </Link>

               <Link href="/mealPlans" className="w-full">
                  <Card>
                     <CardContent className="p-4 flex flex-col items-center justify-center h-24">
                        <span className="text-xl mb-1">🗓️</span>
                        <span className="text-sm font-medium">Plany posiłków</span>
                     </CardContent>
                  </Card>
               </Link>

               <Link href="/pantry" className="w-full">
                  <Card>
                     <CardContent className="p-4 flex flex-col items-center justify-center h-24">
                        <span className="text-xl mb-1">🥫</span>
                        <span className="text-sm font-medium">Spiżarnia</span>
                     </CardContent>
                  </Card>
               </Link>

               <Link href="/shoppingList" className="w-full">
                  <Card>
                     <CardContent className="p-4 flex flex-col items-center justify-center h-24">
                        <span className="text-xl mb-1">🛒</span>
                        <span className="text-sm font-medium">Listy zakupów</span>
                     </CardContent>
                  </Card>
               </Link>
            </div>
         </div>
      </div>
   );
}
