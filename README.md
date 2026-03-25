# @arraypress/email-validator

Practical email validation with provider detection for JavaScript and TypeScript. WordPress-inspired validation logic — catches real-world issues without being pedantic about obscure RFC edge cases.

Zero dependencies. Works in Node.js, Cloudflare Workers, Deno, Bun, and browsers.

## Installation

```bash
npm install @arraypress/email-validator
```

## Usage

```js
import { isEmail, normalizeEmail, getDomain, getProvider } from '@arraypress/email-validator';

// Validate
isEmail('user@example.com');     // true
isEmail('bad..dots@test.com');   // false
isEmail('.leading@test.com');    // false
isEmail('user@@double.com');     // false

// Normalize (lowercase domain, preserve local case)
normalizeEmail('User@EXAMPLE.COM');  // 'User@example.com'
normalizeEmail('invalid');           // null

// Extract domain
getDomain('user@sub.example.com');   // 'sub.example.com'
getDomain('test@GOOGLE.COM');        // 'google.com'

// Detect provider
getProvider('user@gmail.com');       // 'Gmail'
getProvider('user@hotmail.co.uk');   // 'Outlook'
getProvider('user@proton.me');       // 'ProtonMail'
getProvider('user@company.com');     // null (custom domain)
```

## API

### `isEmail(email: string): boolean`

Returns `true` if the email is valid. Checks:

- Length limits (6–254 characters total, 64 max local, 253 max domain)
- Single `@` symbol with content on both sides
- No leading/trailing/consecutive dots in local part
- Valid ASCII characters only in local part (RFC 5322 atext + dot)
- Domain has at least two labels (e.g. `example.com`)
- No leading/trailing hyphens in domain labels
- TLD is at least 2 characters, letters only
- Trims surrounding whitespace before validating

### `normalizeEmail(email: string): string | null`

Returns the normalized email with the domain lowercased. The local part preserves its original case per RFC standards. Returns `null` if the email is invalid.

### `getDomain(email: string): string | null`

Extracts and lowercases the domain part. Returns `null` if the email is invalid.

### `getProvider(email: string): string | null`

Detects the email provider from 70+ known domains. Returns `null` for custom/business domains.

Recognized providers: Gmail, Outlook (includes Hotmail, Live, MSN), Yahoo, iCloud (includes me.com, mac.com), AOL, ProtonMail, Tutanota, Hey, Yandex, Mail.Ru, GMX, Web.de, Orange, Free, La Poste, Naver, Daum, NetEase, QQ Mail, Zoho.

## TypeScript

Full type definitions are included. No additional `@types` package needed.

```ts
import { isEmail, getProvider } from '@arraypress/email-validator';

const email: string = 'user@gmail.com';
const valid: boolean = isEmail(email);
const provider: string | null = getProvider(email);
```

## License

MIT
