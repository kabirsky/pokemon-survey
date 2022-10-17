# Pokemon Survey

Quite stupid survey created for self-learning purpose
Most of the code was done by Theo, I've done some modifications for self-learning purpose, go see original repository: https://github.com/TheoBr/roundest-mon


## Getting Started

Prerequisite:

- MySQL local database (or Planetscale connection using PScale CLI)
- npm

Setup

1. Clone repo
1. `npm install`
1. Create `.env` file if one does not already exist
1. Add connection URLs for both database and shadow db to .env
1. Initialize database - `npx prisma migrate dev`
1. Initialize base data set - `npm run ts-node ./scripts/fill-db.ts` or `npm run backfill-db`
1. Run dev server `npm run dev`
