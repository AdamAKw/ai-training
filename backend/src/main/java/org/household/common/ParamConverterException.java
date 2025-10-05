package org.household.common;

import lombok.NoArgsConstructor;

@NoArgsConstructor
public class ParamConverterException extends IllegalArgumentException {
    public ParamConverterException(String message) {
        super(message);
    }

}
