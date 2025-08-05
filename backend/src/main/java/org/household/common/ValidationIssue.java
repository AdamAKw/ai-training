package org.household.common;

import java.util.List;

/**
 * Represents a validation issue
 * Equivalent to ValidationIssue from Next.js api-helpers
 */
public class ValidationIssue {

    private List<String> path;
    private String message;
    private String code;

    public ValidationIssue() {
    }

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

    // Getters and setters
    public List<String> getPath() {
        return path;
    }

    public void setPath(List<String> path) {
        this.path = path;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}
