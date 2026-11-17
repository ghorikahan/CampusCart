import mongoose from "mongoose";

/**
 * Escapes characters with special meaning in regex to prevent regex injection (ReDoS).
 */
export function escapeRegex(text: string): string {
  if (!text) return "";
  return String(text).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

/**
 * Checks recursively if an input object or array contains keys starting with '$' or '.'
 * or prototype pollution keys.
 */
export function containsNoSqlOperator(val: unknown): boolean {
  if (!val || typeof val !== "object") {
    return false;
  }

  if (Array.isArray(val)) {
    return val.some(containsNoSqlOperator);
  }

  for (const key of Object.keys(val as Record<string, unknown>)) {
    if (
      key.startsWith("$") ||
      key.includes(".") ||
      key === "__proto__" ||
      key === "constructor" ||
      key === "prototype"
    ) {
      return true;
    }

    if (containsNoSqlOperator((val as Record<string, unknown>)[key])) {
      return true;
    }
  }

  return false;
}

/**
 * Asserts that an input does not contain NoSQL injection operators.
 * Throws an Error if an operator is detected.
 */
export function assertNoSqlSafe(val: unknown, fieldName: string = "Input"): void {
  if (containsNoSqlOperator(val)) {
    throw new Error(`Security Violation: ${fieldName} contains forbidden operators ($ or .).`);
  }
}

/**
 * Strips HTML tags, script blocks, and null bytes to prevent stored XSS attacks.
 */
export function sanitizeText(text: string): string {
  if (!text) return "";
  return String(text)
    .replace(/\0/g, "") // Null bytes
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Script tags
    .replace(/<[^>]+>/g, "") // Any HTML tag
    .trim();
}

/**
 * Applies Mongoose sanitizeFilter to prevent NoSQL operator injection in query objects.
 */
export function sanitizeMongooseFilter<T extends object>(filter: T): T {
  if (!filter || typeof filter !== "object") return filter;
  return mongoose.sanitizeFilter(filter) as T;
}
