from django.contrib import admin

from apps.security.models import MultiFactorAuthenticationCode

admin.site.register(MultiFactorAuthenticationCode)
