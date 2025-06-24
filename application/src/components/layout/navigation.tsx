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
               <Button variant="ghost">Recipes</Button>
            </Link>
            <Link href="/meal-plans">
               <Button variant="ghost">Meal Plans</Button>
            </Link>
            <Link href="/pantry">
               <Button variant="ghost">Pantry</Button>
            </Link>
            <Link href="/shopping-list">
               <Button variant="ghost">Shopping List</Button>
            </Link>
         </div>
      </nav>
   );
}
