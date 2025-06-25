import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navigation() {
   return (
      <nav className="flex items-center justify-between p-4 bg-white shadow-sm">
         <Link href="/" className="text-2xl font-bold text-gray-800">
            CookingApp
         </Link>

         <div className="flex items-center space-x-2">
            <Link href="/recipes">
               <Button variant="ghost">Przepisy</Button>
            </Link>
            <Link href="/mealPlans">
               <Button variant="ghost">Plany posiłków</Button>
            </Link>
            <Link href="/pantry">
               <Button variant="ghost">Spiżarka</Button>
            </Link>
            <Link href="/shoppingList">
               <Button variant="ghost">Lista zakupów</Button>
            </Link>
         </div>
      </nav>
   );
}
