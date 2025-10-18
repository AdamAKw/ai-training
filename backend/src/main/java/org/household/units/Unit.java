package org.household.units;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public enum Unit {
    PIECE("piece"),

    G("g"),

    KG("kg"),

    ML("ml"),

    L("l"),

    TABLESPOON("tablespoon"),

    TEASPOON("teaspoon"),

    CUP("cup"),

    PACKAGE("package"),
    ;
    private final String value;
}
