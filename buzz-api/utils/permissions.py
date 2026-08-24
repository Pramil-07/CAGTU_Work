from typing import Callable

from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model
from rest_framework.exceptions import PermissionDenied, NotFound

User = get_user_model()


def check_permissions(
    *permissions,
    error_message: str = _('You do not have permission to proceed')
):
    def generator(method: Callable):
        def _inner(self, *args, **kwargs):
            user: User = self.request.user
            if user.is_authenticated and user.is_active and (
                user.is_superuser or user.has_perms(permissions)
            ):
                return method(self, *args, **kwargs)
            else:
                raise PermissionDenied({'detail': error_message})
        return _inner
    return generator

