// This is a simplified version to get the app working
// We'll just create a basic card component for our recipes

"use client";

import Link from "next/link";

interface RecipeCardProps {
   id: string;
   name: string;
   description?: string;
   prepTime: number;
   cookTime: number;
}

export function RecipeCard({ id, name, description, prepTime, cookTime }: RecipeCardProps) {
   return (
      <Link href={`/recipes/${id}`} className="block border rounded-lg p-4 hover:shadow-md transition-shadow">
         <h2 className="text-xl font-semibold">{name}</h2>
         {description && <p className="text-gray-600 mt-2 line-clamp-2">{description}</p>}
         <p className="text-sm text-gray-500 mt-2">
            Prep: {prepTime}min | Cook: {cookTime}min
         </p>
      </Link>
   );
}
