package org.household.common;

import lombok.NoArgsConstructor;
import org.jboss.resteasy.reactive.server.UnwrapException;

@NoArgsConstructor
@UnwrapException
public class ParamConverterException extends RuntimeException {
    public ParamConverterException(String message) {
        super(message);
    }

}
