import { NextResponse } from 'next/server';

// Define types for validation issues
export type ValidationIssue = {
  path: string[];
  message: string;
  code?: string;
  [key: string]: unknown;
};

// Standardize API error responses
export function createErrorResponse(
  message: string, 
  status: number = 500, 
  validationIssues?: ValidationIssue[]
) {
  const errorBody: Record<string, unknown> = { error: message };
  
  if (validationIssues) {
    errorBody.issues = validationIssues;
  }
  
  return NextResponse.json(errorBody, { status });
}

// Standardize API success responses
export function createSuccessResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(data, { status });
}

// Helper to validate ObjectId format without database connection
export function isValidId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}
