<!--
Guidance for AI coding agents working on the Buzz API Django monolith.
Keep this short, concrete and codebase-specific. Update when workflows change.
-->

# Copilot / AI agent instructions (concise)

This repo is a Django monolith (project package: `cagtubuzz`) composed of many small Django apps under `apps/` (e.g. `apps.productapp`, `apps.accountapp`). Use the notes below to be productive quickly.

- **Big picture:** Django + DRF backend serving APIs used by a separate frontend. Key infra pieces:

  - `cagtubuzz/settings.py` — single canonical settings file (uses `python-decouple` env vars).
  - Redis for cache/Celery broker (`REDIS_SERVER` env var).
  - Postgres for production (configured via env vars); sqlite is used when `DB_ENGINE` is set to sqlite.
  - Optional S3-backed static/media when `USE_S3` is set.
  - Firebase (server) via `credentials.json` and `firebase_admin` initialization in settings.
  - Payments: Stripe + PayPal + Khalti configured in settings.

- **Project structure & patterns:**

  - Domain apps live under `apps/`. Each app may contain `views.py`, `serializers.py`, `models.py`, `urls.py`, `management/` and `api/` submodules.
  - API behavior: DRF is used (`REST_FRAMEWORK` in `settings.py`), JWT auth via `djangorestframework_simplejwt` and custom pagination at `apps.core.pagination.CustomPagination`.
  - Custom user model: `AUTH_USER_MODEL = 'accountapp.User'` — always reference `get_user_model()` when writing auth code.
  - Background tasks: Celery configuration reads `REDIS_SERVER` from env; use JSON serializers.
  - Cron jobs: `django-crontab` entries exist (see `CRONJOBS` in `settings.py`).

- **Developer workflows (commands & examples):**

  - Local dev (without Docker):
    - Create env and install: `python -m venv .venv; .\.venv\Scripts\Activate.ps1; pip install -r requirements.txt`
    - Set env vars (or create `.env`) - `python-decouple` reads from env or `.env`.
    - Migrate and run server: `py manage.py migrate; py manage.py runserver 0.0.0.0:8005`
  - With Docker (docker-compose):
    - `docker-compose up --build` (the compose file configures `postgres` and `cache-server`).
    - Note: `docker-compose.yml` runs `gunicorn buzzapi.wsgi:application` but the project package is `cagtubuzz`; confirm the WSGI import when editing deployment scripts.
  - Running tests: `py manage.py test` (tests live per-app in `apps/*/tests.py`).
  - Managing migrations: use `py manage.py makemigrations` then `py manage.py migrate`.
  - Clearing cache/redis and other maintenance tasks are done via management commands found in `apps/*/management/commands`.

- **Conventions & gotchas (project-specific):**

  - Environment-driven behavior: many features toggle with `USE_S3`, `DEBUG`, `REDIS_SERVER`. Prefer reading `settings.py` to discover behavior.
  - Logging & Gunicorn: `gunicorn.conf.py` uses `cagtubuzz.wsgi:application`; match this when creating containers or CI tasks.
  - Firebase: project expects `credentials.json` at `BASE_DIR` — do not hardcode credentials in code changes.
  - Pagination and schema: DRF schema is served with `drf-spectacular` and `drf-spectacular-sidecar` for UI assets.
  - CORS is permissive in settings (`CORS_ALLOW_ALL_ORIGINS = True`) — be cautious proposing CORS-wide changes without tests.

- **Where to look for examples / authoritative implementations:**

  - `cagtubuzz/settings.py` — central configuration and feature toggles.
  - `manage.py` — canonical command entrypoint used by CI and Docker.
  - `requirements.txt` — library versions (Celery, Redis, DRF, Stripe, Firebase, etc.).
  - `docker-compose.yml` & `Dockerfile` — local container dev setup and common service names (`cache-server`, `postgres`).
  - `gunicorn.conf.py` — recommended Gunicorn config for production.

- **When changing code or adding features:**
  - Preserve existing app boundaries under `apps/`. Add new endpoints inside the app that owns the domain, add `serializers.py`/`views.py` and register `urls.py` in the app and include at project `urls.py`.
  - For migrations: always run `makemigrations` and include migration files in the PR.
  - For background work: prefer Celery tasks (broker uses `REDIS_SERVER`).

If anything above is unclear or you'd like more detail (examples of a particular app, common test failures, or CI steps), tell me which area to expand. Thank you!
