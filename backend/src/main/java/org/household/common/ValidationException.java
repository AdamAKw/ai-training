package org.household.common;

import java.util.List;

/**
 * Custom exception for validation errors
 * Used to handle validation failures in services
 */
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

    public List<ValidationIssue> getValidationIssues() {
        return validationIssues;
    }

    public void setValidationIssues(List<ValidationIssue> validationIssues) {
        this.validationIssues = validationIssues;
    }
}
