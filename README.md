# ChatVault

Store AI conversations from ChatGPT, Claude, Gemini, and more — then export them as Obsidian-ready Markdown with metadata and tags.

![Stack](https://img.shields.io/badge/Stack-Express%20%2B%20React%20%2B%20PostgreSQL-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

- **Multi-Platform Support**: Archive chats from ChatGPT, Claude, Gemini, Llama, or any AI assistant
- **Obsidian Export**: Download conversations as Markdown files with YAML frontmatter
- **Tagging System**: Organize with tags that integrate with Obsidian's linking
- **Role Block Formatting**: Optional export with `## User` / `## Assistant` headers
- **Secure by Design**: User-isolated data with Replit Auth (OIDC)

## Export Format

Exported files are fully compatible with Obsidian:

```markdown
---
title: "React Hooks Tutorial"
agent: "claude"
date: "2026-02-02 14:30"
tags:
  - "coding"
  - "react"
---

# React Hooks Tutorial

User: How do I use useEffect properly?
```

## Tech Stack

- **Frontend**: React + Vite + TanStack Query + Tailwind CSS + shadcn/ui
- **Backend**: Express + Drizzle ORM
- **Database**: PostgreSQL
- **Auth**: Replit Auth (OIDC)

## Getting Started

### On Replit

1. Fork this project
2. The app will auto-start with `npm run dev`
3. Login with your Replit account
4. Start archiving your AI chats!

### Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL and SESSION_SECRET

# Push database schema
npm run db:push

# Start development server
npm run dev
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chats` | List all user's chats |
| GET | `/api/chats/:id` | Get a single chat |
| POST | `/api/chats` | Create a new chat |
| PUT | `/api/chats/:id` | Update a chat |
| DELETE | `/api/chats/:id` | Delete a chat |

## Security

- All database queries are user-scoped (WHERE userId = currentUser)
- Input validation via Zod schemas
- Agent field constrained to enum values
- Tags: trimmed, deduplicated, max 50 chars each
- ReactMarkdown v10 (XSS-safe by default)
- YAML-safe frontmatter export

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

Built with [Replit](https://replit.com) and designed for [Obsidian](https://obsidian.md) users who want to preserve their AI conversations.
