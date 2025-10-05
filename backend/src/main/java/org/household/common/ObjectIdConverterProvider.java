package org.household.common;

import jakarta.ws.rs.ext.ParamConverter;
import jakarta.ws.rs.ext.ParamConverterProvider;
import jakarta.ws.rs.ext.Provider;
import java.lang.annotation.Annotation;
import java.lang.reflect.Type;
import org.bson.types.ObjectId;

@Provider
public class ObjectIdConverterProvider implements ParamConverterProvider {

    @Override
    @SuppressWarnings("unchecked")
    public <T> ParamConverter<T> getConverter(Class<T> rawType, Type genericType,
        Annotation[] annotations) {
        if (rawType == ObjectId.class) {
            return (ParamConverter<T>) new ObjectIdParamConverter();
        }
        return null;
    }

    public static class ObjectIdParamConverter implements ParamConverter<ObjectId> {

        // TODO dodać swój typ błędu
        @Override
        public ObjectId fromString(String value) {
            if (value == null || value.isBlank()) {
                throw new ParamConverterException();
            }
            if (!ObjectId.isValid(value)) {
                throw new ParamConverterException();
            }
            return new ObjectId(value);
        }

        @Override
        public String toString(ObjectId value) {
            return value.toString();
        }
    }
}
