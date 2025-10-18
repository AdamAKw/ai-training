// Common units for pantry items
import { useTranslations } from "next-intl";

export enum Units {
    PIECE = "piece",
    G = "g",
    KG = "kg",
    ML = "ml",
    L = "l",
    TABLESPOON = "tablespoon",
    TEASPOON = "teaspoon",
    CUP = "cup",
    PACKAGE = "package"
};

export interface Unit {
    value: string,
    label: string
}

export function useUnitsWithTranslations(): Unit[] {
    const t = useTranslations("pantry");
    return Object.values(Units).map((unit) => {
        return {
            value: unit,
            label: t(`units.${unit}`)
        };
    });
}




