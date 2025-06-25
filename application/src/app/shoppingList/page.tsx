import { ShoppingList } from "@/components/shoppingList/ShoppingListClient";

export default function ShoppingListPage() {
   return (
      <div className="container mx-auto px-4 py-8">
         <h1 className="text-3xl font-bold mb-8">Shopping Lists</h1>
         <ShoppingList />
      </div>
   );
}
