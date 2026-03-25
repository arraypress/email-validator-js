/**
 * @arraypress/email-validator — Test suite.
 * Run: node --test tests/email-validator.test.js
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isEmail, normalizeEmail, getDomain, getProvider } from '../src/index.js';

// ── isEmail: valid ──────────────────────────

describe('isEmail — valid', () => {
  const valid = [
    'test@example.com',
    'user.name@domain.co.uk',
    'first.last@subdomain.example.org',
    'user+tag@example.com',
    'test123@example123.com',
    'a@b.co',
    'very.long.email.address@very.long.domain.name.com',
    'user_name@example-domain.com',
    'test.email+tag@example.org',
    'simple@example.museum',
    'test@example-site.com',
    'user@sub.domain.example.com',
  ];

  for (const email of valid) {
    it(`accepts "${email}"`, () => assert.equal(isEmail(email), true));
  }
});

describe('isEmail — special characters', () => {
  const special = [
    'test!@example.com', 'user#test@example.com', 'test$@example.com',
    'user%test@example.com', 'test&user@example.com', "user'test@example.com",
    'test*user@example.com', 'user+tag@example.com', 'test-user@example.com',
    'user/test@example.com', 'test=user@example.com', 'user?test@example.com',
    'test^user@example.com', 'user_test@example.com', 'test`user@example.com',
    'user{test}@example.com', 'test|user@example.com', 'user~test@example.com',
  ];

  for (const email of special) {
    it(`accepts "${email}"`, () => assert.equal(isEmail(email), true));
  }
});

// ── isEmail: invalid ────────────────────────

describe('isEmail — invalid', () => {
  const invalid = [
    ['', 'empty string'],
    ['short', 'too short'],
    ['no-at-symbol.com', 'no @ symbol'],
    ['@example.com', 'no local part'],
    ['user@', 'no domain'],
    ['user@@example.com', 'double @'],
    ['user@.com', 'domain starts with dot'],
    ['user@com.', 'domain ends with dot'],
    ['user@com', 'no TLD'],
    ['.user@example.com', 'local starts with dot'],
    ['user.@example.com', 'local ends with dot'],
    ['us..er@example.com', 'consecutive dots in local'],
    ['user@exam..ple.com', 'consecutive dots in domain'],
    ['user name@example.com', 'space in local'],
    ['user@exam ple.com', 'space in domain'],
    ['user@example.c', 'TLD too short'],
    ['user@-example.com', 'domain starts with hyphen'],
    ['user@example-.com', 'domain ends with hyphen'],
    ['a'.repeat(65) + '@example.com', 'local too long'],
    ['user@' + 'a'.repeat(250) + '.com', 'domain too long'],
    ['plainaddress', 'no structure'],
    ['missing@domain@extra.com', 'double @'],
    ['email@domain,com', 'comma in domain'],
  ];

  for (const [email, reason] of invalid) {
    it(`rejects: ${reason}`, () => assert.equal(isEmail(email), false));
  }
});

describe('isEmail — length limits', () => {
  it('accepts minimum (6 chars)', () => assert.equal(isEmail('a@b.co'), true));
  it('rejects below minimum', () => assert.equal(isEmail('a@b.c'), false));
  it('accepts 64-char local', () => assert.equal(isEmail('a'.repeat(64) + '@example.com'), true));
  it('rejects 65-char local', () => assert.equal(isEmail('a'.repeat(65) + '@example.com'), false));
});

describe('isEmail — edge cases', () => {
  it('rejects undefined', () => assert.equal(isEmail(undefined), false));
  it('rejects null', () => assert.equal(isEmail(null), false));
  it('rejects number', () => assert.equal(isEmail(123), false));
  it('rejects object', () => assert.equal(isEmail({}), false));
});

describe('isEmail — whitespace', () => {
  it('trims leading/trailing spaces', () => assert.equal(isEmail('  test@example.com  '), true));
  it('trims tabs', () => assert.equal(isEmail('\tuser@domain.org\t'), true));
  it('rejects space in local', () => assert.equal(isEmail('test @example.com'), false));
  it('rejects space in domain', () => assert.equal(isEmail('test@example .com'), false));
});

describe('isEmail — unicode (not supported)', () => {
  it('rejects unicode in local', () => assert.equal(isEmail('tëst@example.com'), false));
  it('rejects unicode in domain', () => assert.equal(isEmail('test@ëxample.com'), false));
});

describe('isEmail — case insensitive', () => {
  for (const email of ['Test@Example.Com', 'TEST@EXAMPLE.COM', 'test@example.com']) {
    it(`accepts "${email}"`, () => assert.equal(isEmail(email), true));
  }
});

// ── normalizeEmail ──────────────────────────

describe('normalizeEmail', () => {
  const cases = [
    ['Test@EXAMPLE.COM', 'Test@example.com'],
    ['user@DOMAIN.ORG', 'user@domain.org'],
    ['MixedCase@MixedDomain.NET', 'MixedCase@mixeddomain.net'],
    ['local@SUB.DOMAIN.COM', 'local@sub.domain.com'],
    ['  user@EXAMPLE.COM  ', 'user@example.com'],
  ];

  for (const [input, expected] of cases) {
    it(`"${input}" → "${expected}"`, () => assert.equal(normalizeEmail(input), expected));
  }

  it('returns null for invalid', () => assert.equal(normalizeEmail('invalid'), null));
  it('returns null for empty', () => assert.equal(normalizeEmail(''), null));
});

// ── getDomain ───────────────────────────────

describe('getDomain', () => {
  const cases = [
    ['user@example.com', 'example.com'],
    ['test@SUB.DOMAIN.ORG', 'sub.domain.org'],
    ['test@multi.sub.example.co.uk', 'multi.sub.example.co.uk'],
    ['invalid', null],
    ['user@', null],
    ['@example.com', null],
  ];

  for (const [input, expected] of cases) {
    it(`"${input}" → ${JSON.stringify(expected)}`, () => assert.equal(getDomain(input), expected));
  }
});

// ── getProvider ─────────────────────────────

describe('getProvider', () => {
  const cases = [
    ['user@gmail.com', 'Gmail'],
    ['test@googlemail.com', 'Gmail'],
    ['person@outlook.com', 'Outlook'],
    ['user@hotmail.com', 'Outlook'],
    ['test@yahoo.com', 'Yahoo'],
    ['user@yahoo.co.uk', 'Yahoo'],
    ['person@icloud.com', 'iCloud'],
    ['user@me.com', 'iCloud'],
    ['test@aol.com', 'AOL'],
    ['person@protonmail.com', 'ProtonMail'],
    ['user@proton.me', 'ProtonMail'],
    ['user@tutanota.com', 'Tutanota'],
    ['test@yandex.com', 'Yandex'],
    ['user@mail.ru', 'Mail.Ru'],
    ['test@163.com', 'NetEase'],
    ['person@qq.com', 'QQ Mail'],
    ['user@hey.com', 'Hey'],
    ['user@company.com', null],
    ['invalid', null],
  ];

  for (const [email, expected] of cases) {
    it(`"${email}" → ${JSON.stringify(expected)}`, () => assert.equal(getProvider(email), expected));
  }
});

// ── Real-world ──────────────────────────────

describe('isEmail — real-world', () => {
  const realWorld = [
    'user@gmail.com', 'test@yahoo.com', 'example@outlook.com',
    'support@company.co.uk', 'info@business.org', 'contact@startup.io',
    'user@example.de', 'test@domain.fr', 'api@mail.example.com',
    'noreply@newsletter.company.org',
  ];

  for (const email of realWorld) {
    it(`accepts "${email}"`, () => assert.equal(isEmail(email), true));
  }
});
