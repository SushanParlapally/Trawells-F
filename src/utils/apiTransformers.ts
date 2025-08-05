/**
 * Utility functions for API data transformations
 * Handles conversion between frontend camelCase and backend PascalCase
 */

/**
 * Transform camelCase object properties to PascalCase for C# backend compatibility
 */
export const toPascalCase = (obj: Record<string, any>): Record<string, any> => {
  const transformed: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
    // Skip undefined and empty string values to avoid sending them to the backend
    if (value !== undefined && value !== '') {
      transformed[pascalKey] = value;
    }
  }
  return transformed;
};

/**
 * Transform PascalCase object properties to camelCase for frontend compatibility
 */
export const toCamelCase = (obj: Record<string, any>): Record<string, any> => {
  const transformed: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
    transformed[camelKey] = value;
  }
  return transformed;
};
