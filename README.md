# ChatVault

ChatVault is a small, open-source tool to archive AI conversations and export them as Obsidian-compatible Markdown notes.

This project started as a personal tool to treat AI chats as reusable knowledge rather than disposable text.

## What it does
- Stores AI chat content with metadata (title, agent, tags, timestamp)
- Keeps chats isolated per user
- Exports clean Markdown with YAML frontmatter for Obsidian
- Produces portable, local-first files you fully own

## What it is NOT
- Not a commercial SaaS
- Not an AI chatbot
- Not a replacement for Obsidian plugins

This is a **public beta / personal infrastructure tool**.

## Why this exists
AI conversations often contain reasoning worth revisiting later.
Most platforms treat them as ephemeral.

ChatVault treats them like notes.

## Tech stack
- Backend: Express, PostgreSQL, Drizzle ORM
- Frontend: React
- Auth: Replit Auth (OIDC)
- Export: Plain Markdown + YAML frontmatter

## Security notes
- Chats are scoped per user at the database level
- Input is validated with Zod
- Markdown rendering does not allow raw HTML
- Exported files are static and portable

⚠️ Avoid storing sensitive or regulated data.

## Status
Public beta. Expect rough edges.

## License
MIT
