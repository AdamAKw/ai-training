import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IMealPlan } from "@/models/mealPlan";
import { IRecipe } from "@/models/recipe";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MealPlanFormProps {
   initialData?: Partial<IMealPlan>;
   recipes: IRecipe[];
   onSubmit: (data: MealPlanFormData) => Promise<void>;
   isSubmitting: boolean;
}

interface MealPlanFormData {
   name: string;
   startDate: string;
   endDate: string;
   meals: Array<{
      recipe: string;
      date: string;
      mealType: string;
      servings: number;
   }>;
}

type MealItemFormData = {
   recipe: string;
   date: string;
   mealType: string;
   servings: number;
};

export function MealPlanForm({ initialData, recipes, onSubmit, isSubmitting }: MealPlanFormProps) {
   const router = useRouter();

   // Form state
   const [name, setName] = useState(initialData?.name || "");
   const [startDate, setStartDate] = useState(
      initialData?.startDate
         ? new Date(initialData.startDate).toISOString().split("T")[0]
         : new Date().toISOString().split("T")[0]
   );
   const [endDate, setEndDate] = useState(
      initialData?.endDate
         ? new Date(initialData.endDate).toISOString().split("T")[0]
         : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
   );
   const [meals, setMeals] = useState<MealItemFormData[]>([]);
   const [errors, setErrors] = useState<Record<string, string>>({});

   // Inicjalizacja posiłków z danych początkowych
   useEffect(() => {
      if (initialData?.meals && initialData.meals.length > 0) {
         const formattedMeals = initialData.meals.map((meal) => ({
            recipe:
               typeof meal.recipe === "object" && meal.recipe._id ? meal.recipe._id.toString() : meal.recipe.toString(),
            date: new Date(meal.date).toISOString().split("T")[0],
            mealType: meal.mealType,
            servings: meal.servings,
         }));
         setMeals(formattedMeals);
      }
   }, [initialData]);

   // Form handlers
   const validate = () => {
      const newErrors: Record<string, string> = {};

      if (!name.trim()) newErrors.name = "Nazwa jest wymagana";
      if (!startDate) newErrors.startDate = "Data rozpoczęcia jest wymagana";
      if (!endDate) newErrors.endDate = "Data zakończenia jest wymagana";
      if (new Date(endDate) <= new Date(startDate)) {
         newErrors.endDate = "Data zakończenia musi być późniejsza niż data rozpoczęcia";
      }

      if (meals.length === 0) {
         newErrors.meals = "Dodaj przynajmniej jeden posiłek";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validate()) return;

      const formData = {
         name,
         startDate: new Date(startDate).toISOString(),
         endDate: new Date(endDate).toISOString(),
         meals: meals.map((meal) => ({
            ...meal,
            date: new Date(meal.date).toISOString(),
         })),
      };

      try {
         await onSubmit(formData);
      } catch (error) {
         console.error("Błąd podczas zapisywania planu posiłków:", error);
      }
   };

   const addMeal = () => {
      setMeals([
         ...meals,
         {
            recipe: "",
            date: startDate,
            mealType: "lunch",
            servings: 1,
         },
      ]);
   };

   const updateMeal = (index: number, field: keyof MealItemFormData, value: string | number) => {
      const updatedMeals = [...meals];
      updatedMeals[index] = {
         ...updatedMeals[index],
         [field]: value,
      };
      setMeals(updatedMeals);
   };

   const removeMeal = (index: number) => {
      setMeals(meals.filter((_, i) => i !== index));
   };

   const mealTypeOptions = [
      { value: "breakfast", label: "Śniadanie" },
      { value: "lunch", label: "Lunch" },
      { value: "dinner", label: "Obiad" },
      { value: "snack", label: "Przekąska" },
      { value: "other", label: "Inne" },
   ];

   // Funkcja pomocnicza do sprawdzania, czy data jest w zakresie planu
   const isDateInRange = (date: string) => {
      return date >= startDate && date <= endDate;
   };

   return (
      <form onSubmit={handleSubmit}>
         <Card>
            <CardHeader>
               <CardTitle>{initialData?._id ? "Edytuj plan posiłków" : "Nowy plan posiłków"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
               {/* Główne informacje o planie */}
               <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                     <div className="space-y-2">
                        <Label htmlFor="name">Nazwa planu</Label>
                        <Input
                           id="name"
                           value={name}
                           onChange={(e) => setName(e.target.value)}
                           placeholder="Podaj nazwę planu posiłków"
                           className={errors.name ? "border-destructive" : ""}
                        />
                        {errors.name && <p className="text-sm font-medium text-destructive">{errors.name}</p>}
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label htmlFor="startDate">Data rozpoczęcia</Label>
                        <Input
                           id="startDate"
                           type="date"
                           value={startDate}
                           onChange={(e) => setStartDate(e.target.value)}
                           className={errors.startDate ? "border-destructive" : ""}
                        />
                        {errors.startDate && <p className="text-sm font-medium text-destructive">{errors.startDate}</p>}
                     </div>

                     <div className="space-y-2">
                        <Label htmlFor="endDate">Data zakończenia</Label>
                        <Input
                           id="endDate"
                           type="date"
                           value={endDate}
                           onChange={(e) => setEndDate(e.target.value)}
                           className={errors.endDate ? "border-destructive" : ""}
                        />
                        {errors.endDate && <p className="text-sm font-medium text-destructive">{errors.endDate}</p>}
                     </div>
                  </div>
               </div>

               {/* Lista posiłków */}
               <div className="space-y-4">
                  <div className="flex items-center justify-between">
                     <h3 className="text-lg font-medium">Posiłki</h3>
                     <Button type="button" variant="outline" onClick={addMeal}>
                        Dodaj posiłek
                     </Button>
                  </div>

                  {errors.meals && <p className="text-sm font-medium text-destructive">{errors.meals}</p>}

                  <div className="space-y-4">
                     {meals.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Brak dodanych posiłków.</p>
                     ) : (
                        meals.map((meal, index) => (
                           <Card key={index} className="overflow-hidden">
                              <CardContent className="p-4 space-y-4">
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                       <Label>Przepis</Label>
                                       <Select
                                          value={meal.recipe}
                                          onValueChange={(value: string) => updateMeal(index, "recipe", value)}
                                       >
                                          <SelectTrigger>
                                             <SelectValue placeholder="Wybierz przepis" />
                                          </SelectTrigger>
                                          <SelectContent>
                                             {recipes.map((recipe) => (
                                                <SelectItem key={recipe._id as string} value={recipe._id as string}>
                                                   {recipe.name}
                                                </SelectItem>
                                             ))}
                                          </SelectContent>
                                       </Select>
                                    </div>

                                    <div className="space-y-2">
                                       <Label>Rodzaj posiłku</Label>
                                       <Select
                                          value={meal.mealType}
                                          onValueChange={(value: string) => updateMeal(index, "mealType", value)}
                                       >
                                          <SelectTrigger>
                                             <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                             {mealTypeOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                   {option.label}
                                                </SelectItem>
                                             ))}
                                          </SelectContent>
                                       </Select>
                                    </div>
                                 </div>

                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                       <Label>Data</Label>
                                       <Input
                                          type="date"
                                          value={meal.date}
                                          onChange={(e) => updateMeal(index, "date", e.target.value)}
                                          min={startDate}
                                          max={endDate}
                                          className={!isDateInRange(meal.date) ? "border-destructive" : ""}
                                       />
                                       {!isDateInRange(meal.date) && (
                                          <p className="text-sm font-medium text-destructive">
                                             Data musi być w zakresie planu
                                          </p>
                                       )}
                                    </div>

                                    <div className="space-y-2">
                                       <Label>Liczba porcji</Label>
                                       <Input
                                          type="number"
                                          min={1}
                                          value={meal.servings}
                                          onChange={(e) => updateMeal(index, "servings", parseInt(e.target.value))}
                                       />
                                    </div>
                                 </div>

                                 <div className="flex justify-end">
                                    <Button
                                       type="button"
                                       variant="destructive"
                                       size="sm"
                                       onClick={() => removeMeal(index)}
                                    >
                                       Usuń
                                    </Button>
                                 </div>
                              </CardContent>
                           </Card>
                        ))
                     )}
                  </div>
               </div>
            </CardContent>
            <CardFooter className="flex justify-between">
               <Button type="button" variant="outline" onClick={() => router.back()}>
                  Anuluj
               </Button>
               <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Zapisywanie..." : "Zapisz plan"}
               </Button>
            </CardFooter>
         </Card>
      </form>
   );
}

export default MealPlanForm;
