/**
 * @arraypress/email-validator
 *
 * Practical email validation with provider detection.
 * WordPress-inspired validation logic, originally ported from Swift.
 *
 * @module @arraypress/email-validator
 */

import { providers } from './providers.js';

// ── RFC 5321/5322 Limits ────────────────────

const MAX_EMAIL_LENGTH = 254;
const MIN_EMAIL_LENGTH = 6;
const MAX_LOCAL_LENGTH = 64;
const MAX_DOMAIN_LENGTH = 253;
const MAX_SUBDOMAIN_LENGTH = 63;
const MIN_TLD_LENGTH = 2;
const MAX_SUBDOMAINS = 10;

// ── Character Sets ──────────────────────────

const LOCAL_CHARS = /^[a-zA-Z0-9!#$%&'*+\-/=?^_`{|}~.]+$/;
const SUBDOMAIN_CHARS = /^[a-zA-Z0-9-]+$/;
const TLD_CHARS = /^[a-zA-Z]+$/;

// ── Internal Validation ─────────────────────

function isValidLocal(local) {
  if (!local || local.length === 0) return false;
  if (local.length > MAX_LOCAL_LENGTH) return false;
  if (local.startsWith('.') || local.endsWith('.')) return false;
  if (local.includes('..')) return false;
  return LOCAL_CHARS.test(local);
}

function isValidSubdomain(sub, isTopLevel) {
  if (!sub || sub.length === 0) return false;
  if (sub.length > MAX_SUBDOMAIN_LENGTH) return false;
  if (sub.startsWith('-') || sub.endsWith('-')) return false;

  if (isTopLevel) {
    if (sub.length < MIN_TLD_LENGTH) return false;
    return TLD_CHARS.test(sub);
  }

  return SUBDOMAIN_CHARS.test(sub);
}

function isValidDomain(domain) {
  if (!domain || domain.length === 0) return false;
  if (domain.length > MAX_DOMAIN_LENGTH) return false;
  if (domain.includes('..')) return false;
  if (domain.startsWith('.') || domain.endsWith('.')) return false;
  if (domain !== domain.trim()) return false;

  const subs = domain.split('.');
  if (subs.length < 2 || subs.length > MAX_SUBDOMAINS) return false;

  for (let i = 0; i < subs.length; i++) {
    if (!isValidSubdomain(subs[i], i === subs.length - 1)) return false;
  }

  return true;
}

function parse(email) {
  if (typeof email !== 'string') return null;

  const trimmed = email.trim();
  if (trimmed.length < MIN_EMAIL_LENGTH || trimmed.length > MAX_EMAIL_LENGTH) return null;

  const atIdx = trimmed.indexOf('@');
  if (atIdx < 1 || trimmed.lastIndexOf('@') !== atIdx) return null;

  const local = trimmed.slice(0, atIdx);
  const domain = trimmed.slice(atIdx + 1);

  if (!isValidLocal(local) || !isValidDomain(domain)) return null;

  return { local, domain: domain.toLowerCase() };
}

// ── Public API ──────────────────────────────

/**
 * Check if a string is a valid email address.
 *
 * @param {string} email
 * @returns {boolean}
 *
 * @example
 * isEmail('user@example.com')     // true
 * isEmail('bad..dots@test.com')   // false
 */
export function isEmail(email) {
  return parse(email) !== null;
}

/**
 * Normalize an email address. Lowercases the domain, trims whitespace.
 * The local part preserves its original case per RFC.
 * Returns null if invalid.
 *
 * @param {string} email
 * @returns {string|null}
 *
 * @example
 * normalizeEmail('User@EXAMPLE.COM')  // 'User@example.com'
 * normalizeEmail('invalid')           // null
 */
export function normalizeEmail(email) {
  const result = parse(email);
  return result ? `${result.local}@${result.domain}` : null;
}

/**
 * Extract the domain part (after @, lowercased).
 * Returns null if invalid.
 *
 * @param {string} email
 * @returns {string|null}
 *
 * @example
 * getDomain('user@SUB.EXAMPLE.COM')  // 'sub.example.com'
 */
export function getDomain(email) {
  return parse(email)?.domain ?? null;
}

/**
 * Detect the email provider name from the domain.
 * Returns null if not a recognized provider.
 *
 * @param {string} email
 * @returns {string|null}
 *
 * @example
 * getProvider('user@gmail.com')    // 'Gmail'
 * getProvider('user@company.com')  // null
 */
export function getProvider(email) {
  const domain = getDomain(email);
  return domain ? (providers[domain] || null) : null;
}
