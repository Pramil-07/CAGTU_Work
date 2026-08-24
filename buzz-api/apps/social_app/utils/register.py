import random
import os
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings


from apps.social_app.models import SocialAuthUser
# from apps.accountapp.models import Customer
from apps.accountapp.utils import get_tokens_for_user
from django.contrib.auth import get_user_model

User = get_user_model()

def generate_username(name):
    """
    Generates username 
    """
    username = "".join(name.split(' ')).lower()
    if not User.objects.filter(username=username).exists():
        return username
    else:
        random_username = username + str(random.randint(0, 1000))
        return generate_username(random_username)


def register_social_user(provider, user_id, email, name, first_name, last_name, profile_url):
    filtered_user_by_email = SocialAuthUser.objects.filter(email=email)

    if filtered_user_by_email.exists():    
        if provider == filtered_user_by_email[0].provider:
            user_obj = User.objects.filter(email=email).first()
            registered_user = authenticate(
                username=user_obj,
                password=settings.TESTPASSWORD,
            )
            return {
                "username": registered_user.username,
                "email": registered_user.email,
                "tokens": get_tokens_for_user(user_obj),
            }
        else: 
            raise AuthenticationFailed(
                detail="Please continue you login using" + filtered_user_by_email[0].auth_provider
            )
    
    else:
        username = generate_username(name)
        social_auth_user = SocialAuthUser.objects.create(
            name=name,
            username=username,
            email=email,
            provider=provider,
        )
        social_auth_user.save()
        user_obj = User.objects.create_user(
            username=username,
            email=email,
            password=settings.TESTPASSWORD, 
            first_name=first_name,
            last_name=last_name,
            is_active=True,  #TODO: make it False  #for test using True
        )

        User.objects.create(
            status="Active",
            user=user_obj,
            phone="",
        )

        new_user = authenticate(
            username=username,
            password=settings.TESTPASSWORD, 
        )
        return {
                "username": new_user.username,
                "email": new_user.email,
                "profile_image": profile_url,
                "tokens": get_tokens_for_user(user_obj),
            }
