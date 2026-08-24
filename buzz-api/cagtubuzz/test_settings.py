"""
Minimal Django settings used for running tests with pytest.
This file is standalone and DOES NOT import `cagtubuzz.settings` to avoid
executing production-only initialization (Firebase, S3, etc.).

Only include the settings required to run the test suite.
"""
from pathlib import Path
import os
from cryptography.fernet import Fernet

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = "test-secret-key"

# Encryption key required by `encrypted_model_fields` used in `accountapp` models.
# Generate a valid, url-safe base64 32-byte Fernet key for tests.
# Using a generated key is fine here since tests use an in-memory DB.
FIELD_ENCRYPTION_KEY = Fernet.generate_key().decode()

DEBUG = True

# Apps required for tests. Keep this list minimal but include apps under test.
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "ckeditor",
    "ckeditor_uploader",
    # project apps used by tests
    "apps.core",
    "apps.accountapp",
    "apps.checkoutapp",
    "apps.productapp",
    "apps.blogapp",
    "apps.locales",
    "apps.paymentapp",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
]

ROOT_URLCONF = "cagtubuzz.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {"context_processors": [
            "django.template.context_processors.debug",
            "django.template.context_processors.request",
            "django.contrib.auth.context_processors.auth",
            "django.contrib.messages.context_processors.messages",
        ]},
    }
]

WSGI_APPLICATION = "cagtubuzz.wsgi.application"

# Use in-memory sqlite3 DB for speed
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
    }
}

AUTH_PASSWORD_VALIDATORS = []

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_L10N = True
USE_TZ = True

STATIC_URL = "/static/"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Use accountapp's custom user model
AUTH_USER_MODEL = "accountapp.User"

# Testing conveniences
EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.MD5PasswordHasher",
]

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (),
    "DEFAULT_PERMISSION_CLASSES": (),
}

# Required by django-ckeditor uploader used in product models
CKEDITOR_UPLOAD_PATH = "uploads/"

# Keep migrations isolated in tests if needed (optional)
# MIGRATION_MODULES = {}

os.environ.setdefault("DJANGO_ALLOW_ASYNC_UNSAFE", "true")
