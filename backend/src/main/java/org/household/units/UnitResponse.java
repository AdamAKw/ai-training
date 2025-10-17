package org.household.units;

import java.util.List;
public record UnitResponse(List<UniDto> units) {
    public record UniDto(String value, String label) {
    }
}
