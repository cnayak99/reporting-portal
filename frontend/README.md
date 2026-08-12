# Reporting Portal Frontend

React + TypeScript frontend for the Enfos reporting portal assessment.

## Current phase

Phase 1 provides the React application shell, typed API client, report metadata
catalog route, report route placeholders, and test/build setup.

Browser API requests use relative `/api` URLs. During local development, Vite
proxies those requests to the Spring Boot backend at `http://localhost:8080`.

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

## Test

```bash
npm test
```
