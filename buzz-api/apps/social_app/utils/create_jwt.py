# apps/accounts/utils.py
from rest_framework_simplejwt.tokens import RefreshToken

def create_jwt_for_user(user):
    """
    Generate access and refresh JWT tokens for a user.
    Returns: (access_token, refresh_token)
    """
    refresh = RefreshToken.for_user(user)
    return str(refresh.access_token), str(refresh)
