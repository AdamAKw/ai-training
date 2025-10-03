package org.household.common;

import java.lang.annotation.Annotation;
import java.lang.reflect.Type;
import java.time.LocalDate;

import jakarta.ws.rs.ext.ParamConverter;
import jakarta.ws.rs.ext.ParamConverterProvider;
import jakarta.ws.rs.ext.Provider;

@Provider
public class LocalDateParamConverterProvider implements ParamConverterProvider {

    @Override
    @SuppressWarnings("unchecked")
    public <T> ParamConverter<T> getConverter(Class<T> rawType, Type genericType, Annotation[] annotations) {
        if (LocalDate.class.isAssignableFrom(rawType)) {
            return (ParamConverter<T>) new LocalDateParamConverter();
        }
        return null;
    }

    public static class LocalDateParamConverter implements ParamConverter<LocalDate> {

        @Override
        public LocalDate fromString(String value) {
            if (value == null || value.isEmpty()) {
                return null;
            }
            return LocalDate.parse(value);
        }

        @Override
        public String toString(LocalDate value) {
            if (value == null) {
                return null;
            }
            return value.toString();
        }
    }
}

