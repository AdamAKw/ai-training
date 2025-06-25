"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RecipeCardProps {
   id: string;
   name: string;
   description?: string;
   prepTime: number;
   cookTime: number;
}

export function RecipeCard({ id, name, description, prepTime, cookTime }: RecipeCardProps) {
   return (
      <Link href={`/recipes/${id}`} className="block hover:opacity-90 transition-opacity">
         <Card className="h-full">
            <CardHeader>
               <CardTitle>{name}</CardTitle>
               {description && <CardDescription className="line-clamp-2">{description}</CardDescription>}
            </CardHeader>
            <CardFooter className="pt-2">
               <div className="flex gap-2">
                  <Badge variant="outline">Prep: {prepTime}min</Badge>
                  <Badge variant="outline">Cook: {cookTime}min</Badge>
               </div>
            </CardFooter>
         </Card>
      </Link>
   );
}
