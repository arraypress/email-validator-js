/**
 * @arraypress/email-validator — TypeScript definitions.
 */

/** Validate an email address. */
export function isEmail(email: string): boolean;

/** Normalize an email (lowercase domain, trim whitespace). Returns null if invalid. */
export function normalizeEmail(email: string): string | null;

/** Extract the domain part (after @, lowercased). Returns null if invalid. */
export function getDomain(email: string): string | null;

/** Detect the email provider name. Returns null if not recognized. */
export function getProvider(email: string): string | null;
