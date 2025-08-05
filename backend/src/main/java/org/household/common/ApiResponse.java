package org.household.common;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;
import java.util.Map;

/**
 * Standard API response format
 * Equivalent to Next.js api-helpers createSuccessResponse/createErrorResponse
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse {

    private boolean success;
    private String message;
    private Object data;
    private Integer statusCode;
    private List<ValidationIssue> validationIssues;

    // Private constructor to enforce factory methods
    private ApiResponse() {
    }

    /**
     * Create a successful response with data
     */
    public static ApiResponse success(String dataKey, Object data) {
        ApiResponse response = new ApiResponse();
        response.success = true;
        response.data = Map.of(dataKey, data);
        return response;
    }

    /**
     * Create a successful response with message
     */
    public static ApiResponse success(String message) {
        ApiResponse response = new ApiResponse();
        response.success = true;
        response.message = message;
        return response;
    }

    /**
     * Create an error response
     */
    public static ApiResponse error(String message, int statusCode) {
        ApiResponse response = new ApiResponse();
        response.success = false;
        response.message = message;
        response.statusCode = statusCode;
        return response;
    }

    /**
     * Create an error response with validation issues
     */
    public static ApiResponse error(String message, int statusCode, List<ValidationIssue> validationIssues) {
        ApiResponse response = error(message, statusCode);
        response.validationIssues = validationIssues;
        return response;
    }

    // Getters and setters
    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Object getData() {
        return data;
    }

    public void setData(Object data) {
        this.data = data;
    }

    public Integer getStatusCode() {
        return statusCode;
    }

    public void setStatusCode(Integer statusCode) {
        this.statusCode = statusCode;
    }

    public List<ValidationIssue> getValidationIssues() {
        return validationIssues;
    }

    public void setValidationIssues(List<ValidationIssue> validationIssues) {
        this.validationIssues = validationIssues;
    }
}
