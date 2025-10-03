package org.household.pantry;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;

public record CreateItemRequest(@NotBlank(message = "Item name is required")
                                String name, @NotNull @Positive(message = "Quantity must be positive")
                                Double quantity, @NotBlank(message = "Unit is required")
                                String unit, String category, LocalDate expiryDate) {

}
