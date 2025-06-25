"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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
      <Card className="h-full flex flex-col">
         <Link href={`/recipes/${id}`} className="flex-grow hover:opacity-90 transition-opacity">
            <CardHeader>
               <CardTitle>{name}</CardTitle>
               {description && <CardDescription className="line-clamp-2">{description}</CardDescription>}
            </CardHeader>
            <CardContent className="pt-0">
               <div className="flex gap-2">
                  <Badge variant="outline">Prep: {prepTime}min</Badge>
                  <Badge variant="outline">Cook: {cookTime}min</Badge>
               </div>
            </CardContent>
         </Link>
      </Card>
   );
}
