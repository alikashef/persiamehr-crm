# Persiamehr CRM Deployment Notes

## Current separation contract

This project is the CRM frontend app only. It must stay separate from the main Persiamehr website.

### Main app: do not touch

- Path: `/srv/apps/persiamehr-main`
- Frontend process: `persiamehr-frontend`
- Frontend port: `127.0.0.1:3000`
- Backend port: `127.0.0.1:8000`
- Public route: `/`
- Public API/admin routes: `/api/` and `/admin/`

Do not overwrite, stop, restart, or redeploy `persiamehr-main` when deploying this CRM app unless explicitly requested.

### CRM app

- Path: `/srv/apps/persiamehr-crm`
- Frontend process: `persiamehr-crm`
- Frontend port: `127.0.0.1:3001`
- Public route: `/crm`
- Current state: frontend-only

The CRM frontend is built with Next.js `basePath=/crm`.

## Future CRM backend plan

When adding or deploying a backend for this CRM, it must be independent from the main app backend.

Recommended backend separation:

- CRM backend path: `/srv/apps/persiamehr-crm/backend`
- CRM backend process/service name: `persiamehr-crm-backend`
- CRM backend port: `127.0.0.1:8001`
- CRM public API route: `/crm-api/`
- Optional CRM admin route: `/crm-admin/`

The CRM frontend API URL should be changed to `/crm-api/` when the CRM backend exists.

## Nginx routing target

Keep routing separated like this:

- `/` -> `127.0.0.1:3000` for `persiamehr-main`
- `/api/` -> `127.0.0.1:8000` for main backend
- `/admin/` -> `127.0.0.1:8000` for main backend admin
- `/crm` and `/crm/` -> `127.0.0.1:3001` for CRM frontend
- Future `/crm-api/` -> `127.0.0.1:8001` for CRM backend
- Future `/crm-admin/` -> `127.0.0.1:8001` for CRM backend admin

## Deployment safety checklist

Before deploying CRM changes:

1. Confirm `persiamehr-main` is still running on `127.0.0.1:3000`.
2. Confirm main backend is still running on `127.0.0.1:8000`.
3. Do not change `/srv/apps/persiamehr-main`.
4. Do not reuse port `3000` or `8000` for CRM.
5. Do not point CRM API calls at `/api/` once CRM has its own backend.
6. Validate Nginx with `nginx -t` before reload.
7. After reload, verify:
   - `http://127.0.0.1/`
   - `http://127.0.0.1/crm`
   - `http://127.0.0.1:3000/`
   - `http://127.0.0.1:3001/crm`
   - future `http://127.0.0.1:8001/`

