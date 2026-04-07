# Todo App

A personal MVP todo app built with Next.js App Router, Neon Postgres, and Drizzle ORM.

## Stack

- Next.js
- TypeScript
- Neon Postgres
- Drizzle ORM

## Features

- Create todos
- Edit titles
- Mark complete or incomplete
- Delete todos
- Persist data in Neon

## Environment

Create `.env.local` with:

```bash
DATABASE_URL=postgresql://USERNAME:PASSWORD@HOST/neondb?sslmode=require
```

This workspace already has a local `.env.local` configured for the newly created Neon project. Do not commit it.

## Local Setup

1. Install Node.js `20.9` or later.
2. Install dependencies:

```bash
npm install
```

3. Start the app:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Drizzle Commands

Generate migrations:

```bash
npm run db:generate
```

Apply migrations:

```bash
npm run db:migrate
```

The app also bootstraps the `todos` table at runtime if it does not exist yet, which keeps first-run deployment smoother.

## Neon

A Neon project was created for this app:

- Project name: `todo-app`
- Project ID: `plain-rain-57216060`
- Region: `aws-us-east-1`
- Default database: `neondb`

## GitHub

GitHub repo:

- Owner: `Tushar-codes`
- Repo: `to-do`
- Visibility: public

This machine currently cannot run git because macOS Command Line Tools are missing. If you need to push future local changes with git after installing Command Line Tools, run:

```bash
git init
git add .
git commit -m "Initial todo app"
git branch -M main
git remote add origin git@github.com:Tushar-codes/to-do.git
git push -u origin main
```

## Vercel

Deploy this project to Vercel after the repo exists or by direct upload.

Important production setup:

1. Create or import the project in Vercel under `tushmail-4008's projects`.
2. Add the `DATABASE_URL` environment variable.
3. Deploy.

If `DATABASE_URL` is missing in Vercel, the app still deploys but will show a configuration warning until the env var is added.
