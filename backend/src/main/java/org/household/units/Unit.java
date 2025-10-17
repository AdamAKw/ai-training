package org.household.units;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public enum Unit {
    PIECE("piece", "pantry.units.piece"),

    G("g", "label.units.g"),

    KG("kg", "pantry.units.kg"),

    ML("ml", "pantry.units.ml"),

    L("l", "pantry.units.l"),

    SPOON("spoon", "pantry.units.spoon"),

    TEASPOON("teaspoon", "pantry.units.teaspoon"),

    GLASS("glass", "pantry.units.glass"),

    PACKAGE("package", "pantry.units.package"),
    ;
    private final String value;
    private final String label;
}
