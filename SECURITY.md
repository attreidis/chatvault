# Security

This is a **public beta** project intended for personal use.

## What we do
- User data is isolated at the database level
- Input is validated with Zod schemas
- Markdown rendering does not allow raw HTML (XSS-safe)
- Exported files are static Markdown with no executable code

## What you should NOT do
- Do not store sensitive, regulated, or confidential data
- Do not use this for healthcare, legal, or financial records
- Do not assume enterprise-grade security guarantees

## Reporting issues
If you find a security issue, please open a GitHub issue or contact the maintainer directly.

This project is provided as-is, without warranty.
