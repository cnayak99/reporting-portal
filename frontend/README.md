# Reporting Portal Frontend

React + TypeScript frontend for the Enfos reporting portal assessment.

## Current phase

Phase 1 uses a local preview data source so the UI can be reviewed before the
Spring Boot report APIs are complete. The data source is isolated in
`src/services/reportDataSource.ts`; later it can be replaced with real calls to:

- `GET /api/reports`
- `GET /api/reports/users`
- `GET /api/reports/departments`
- `GET /api/reports/projects`

## Run locally

```bash
npm install
npm run dev
```

The app starts on Vite's local development server, usually
`http://localhost:5173`.

## Build

```bash
npm run build
```

