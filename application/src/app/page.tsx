import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
   return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
         <h1 className="text-4xl font-bold mb-6">Welcome to CookingApp</h1>
         <p className="text-xl text-gray-600 mb-8 max-w-2xl">
            Plan your meals, manage your pantry, and generate shopping lists all in one place. Save time and reduce food
            waste with our easy-to-use tools.
         </p>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-4xl">
            <Link href="/recipes" className="w-full">
               <Button className="w-full h-32 text-lg" variant="outline">
                  <div className="flex flex-col items-center">
                     <span className="text-xl mb-2">📝</span>
                     <span>Manage Recipes</span>
                  </div>
               </Button>
            </Link>

            <Link href="/meal-plans" className="w-full">
               <Button className="w-full h-32 text-lg" variant="outline">
                  <div className="flex flex-col items-center">
                     <span className="text-xl mb-2">🗓️</span>
                     <span>Plan Meals</span>
                  </div>
               </Button>
            </Link>

            <Link href="/pantry" className="w-full">
               <Button className="w-full h-32 text-lg" variant="outline">
                  <div className="flex flex-col items-center">
                     <span className="text-xl mb-2">🥫</span>
                     <span>Manage Pantry</span>
                  </div>
               </Button>
            </Link>

            <Link href="/shopping-list" className="w-full">
               <Button className="w-full h-32 text-lg" variant="outline">
                  <div className="flex flex-col items-center">
                     <span className="text-xl mb-2">🛒</span>
                     <span>Shopping Lists</span>
                  </div>
               </Button>
            </Link>
         </div>
      </div>
   );
}
