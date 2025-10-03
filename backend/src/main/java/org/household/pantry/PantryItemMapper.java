package org.household.pantry;

import org.household.ApplicationMapperConfig;
import org.mapstruct.Mapper;

@Mapper(config = ApplicationMapperConfig.class)
public interface PantryItemMapper {

    PantryItem createToPantryItem(CreateItemRequest pantryItem);
}
