from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.tokens import PasswordResetTokenGenerator

import six


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    refresh['username'] = user.username
    refresh['isAdmin'] = user.is_superuser
    refresh['email'] = user.email
    try:
        role = user.staff.role
    except:
        try:
            role = user.customer
            role = "customer"
        except:
            try:
                role = user.merchant
                role = "merchant"
            except:
                role = user.merchantstaff
                role = "MerchantStaff"

    refresh["role"] = role
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


def get_tokens_for_staff(user) -> dict:
    refresh = RefreshToken.for_user(user)
    refresh['username'] = user.username
    refresh['is_superuser'] = user.is_superuser
    refresh['email'] = user.email
    refresh['phone'] = user.phone
    refresh['full_name'] = user.full_name
    # refresh['groups'] = user.groups.values('id')
    refresh['loggedin_as'] = 'staff'
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class PasswordResetTokenGenerator(PasswordResetTokenGenerator):
    def _make_hash_value(self, user, timestamp):
        return (
                six.text_type(user.pk) + six.text_type(timestamp)
        )


password_reset_token = PasswordResetTokenGenerator()
