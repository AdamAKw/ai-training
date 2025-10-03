package org.household.common;

import java.util.List;
import lombok.Getter;
import lombok.Setter;

/**
 * Represents a validation issue
 * Equivalent to ValidationIssue from Next.js api-helpers
 */
@Setter
@Getter
public class ValidationIssue {

    // Getters and setters
    private List<String> path;
    private String message;
    private String code;

    public ValidationIssue(List<String> path, String message, String code) {
        this.path = path;
        this.message = message;
        this.code = code;
    }

    public ValidationIssue(String field, String message, String code) {
        this.path = List.of(field);
        this.message = message;
        this.code = code;
    }

}
