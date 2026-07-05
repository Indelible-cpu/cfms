# CFMS

Community Forest Management System (CFMS) is a simple bilingual web app for Malawi rural communities, Village Forest Committees, Forestry Officers, NGOs, and local authorities. It uses React, Vite, Tailwind, Firebase, and Vercel serverless APIs with Postgres.

## Features

- Bilingual UI: English + Chichewa
- Firebase Authentication (Email/Password)
- Firestore-backed records for forests, planting, incidents, permits, villages, education content
- Vercel Postgres-backed audit logs and community work registrations
- Easy dashboard with summary cards and charts
- Simple forms for reporting incidents, registering tree planting, requesting permits, and community work
- PWA-ready manifest

## Getting Started

### Prerequisites

- Node.js 18+ / 24
- npm
- Firebase project with Auth and Firestore enabled
- Vercel account with a GitHub connection
- Vercel Postgres instance

### Install

```bash
npm install
```

### Local Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Environment Variables

Create a `.env` file in the root with the following values:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_DATABASE_URL=https://cfms-3e57a-default-rtdb.firebaseio.com
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

VERCEL_POSTGRES_URL=postgres://user:password@host:5432/dbname
```

> On Vercel, add these environment variables in the project settings instead of committing `.env`.

## Firebase Setup

1. Create a Firebase project.
2. Enable Email/Password Authentication.
3. Create Firestore database in production or test mode.
4. Enable Firebase Storage if you want to store photos.
5. (Optional) Use Realtime Database for live features; the URL is already included.

## Vercel Deployment

1. Create a new Vercel project from GitHub repository `https://github.com/Indelible-cpu/cfms.git`.
2. Set the build command to:

```bash
npm run build
```

3. Set the output directory to:

```bash
dist
```

4. Add the environment variables listed above.
5. Provision a Vercel Postgres database and copy the connection URL to `VERCEL_POSTGRES_URL`.
6. Deploy.

### API Endpoints

- `/api/audit` — records audit logs to Postgres
- `/api/work/register` — saves community work registrations to Postgres

## Notes

- The app uses Firestore for main records and Vercel Postgres for audit/work registration tracking.
- `.env` is ignored by `.gitignore`.
- Serverless functions are defined in the `api/` folder for Vercel.

## Useful Commands

```bash
npm install
npm run dev
npm run build
```
