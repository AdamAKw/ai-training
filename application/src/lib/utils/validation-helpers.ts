import { ZodIssue } from 'zod';
import { ValidationIssue } from './api-helpers';

/**
 * Converts Zod validation issues to our standard ValidationIssue format
 */
export function convertZodIssuesToValidationIssues(zodIssues: ZodIssue[]): ValidationIssue[] {
  return zodIssues.map(issue => ({
    path: issue.path.map(p => String(p)),
    message: issue.message,
    code: issue.code
  }));
}
