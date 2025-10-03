package org.household.common;

import java.util.List;
import lombok.Getter;
import lombok.Setter;

/**
 * Custom exception for validation errors
 * Used to handle validation failures in services
 */
@Setter
@Getter
public class ValidationException extends Exception {

    private List<ValidationIssue> validationIssues;

    public ValidationException(String message) {
        super(message);
        this.validationIssues = List.of(new ValidationIssue(List.of(), message, "validation_error"));
    }

    public ValidationException(String message, List<ValidationIssue> validationIssues) {
        super(message);
        this.validationIssues = validationIssues;
    }

    public ValidationException(String field, String message, String code) {
        super(message);
        this.validationIssues = List.of(new ValidationIssue(field, message, code));
    }

}
