import json
import requests as send_request
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.generics import GenericAPIView
from drf_spectacular.utils import extend_schema
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.db import transaction
from django.utils.http import urlsafe_base64_decode
from google.oauth2 import id_token
from google.auth.transport import requests
from social_django.models import UserSocialAuth
from django.contrib.auth.models import update_last_login
from apps.core.utils import generate_random_password
import re
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

from .serializers import GoogleSocialAuthSerializer

from cagtubuzz import settings


class GoogleSocialAuthView(GenericAPIView):
    serializer_class = GoogleSocialAuthSerializer

    @extend_schema(tags=["Social Auth"])
    def post(self, request):
        """
        POST with "auth_token"

        Send an idtoken received from google to Google to get user information ; idtoken to be received from frontend
        """
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = (serializer.validated_data)["auth_token"]
        return Response(data, status=status.HTTP_200_OK)


class SocialLoginAPI(APIView):
    authentication_classes = []
    permission_classes = (AllowAny,)
    @transaction.atomic
    def post(self, request, backend, *args, **kwargs):
        print("POST hit SocialLoginAPI")
        method = getattr(self, f"social_{backend}".replace("-", "_"))
        user = method(*args, **kwargs)
        if user:
            user.is_active = True
            user.is_verified = True
            user.is_email_verified = True
            user.is_customer_verified = True
            user.save()

            refresh: RefreshToken = RefreshToken.for_user(user)

            has_profile = False
            return Response(
                {
                    # **serializer.data,
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                    "has_profile": False,
                },
                200,
            )
        else:
            return Response(
                {"errors": {"token": "Invalid token"}},
                status=status.HTTP_400_BAD_REQUEST,
            )

    def social_google_oauth2(self, *args, **kwargs):
        print("Starting Google OAuth2 login")
        data = json.loads(
            urlsafe_base64_decode(
                self.request.data["credential"].split(".")[1]
            ).decode()
        )
        try:
            idinfo = id_token.verify_oauth2_token(
                self.request.data["credential"],
                requests.Request(),
                settings.SOCIAL_AUTH_GOOGLE_OAUTH2_KEY,
            )
            print(f"Verified token: {idinfo}")
        except ValueError as err:
            print(f"Token verification error: {str(err)}")
            raise ValidationError(f"Invalid token: {str(err)}")
        email = data["email"]
        print(f"Email: {email}")


        if self.request.user.is_authenticated:
            user = self.request.user
            print("Using authenticated user")
        else:
            print("Attempting to get or create user")
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                user , created = User.objects.get_or_create(
                email=data['email'],
                defaults={
                    'first_name': data.get('given_name'),
                    'last_name': data.get('family_name'),
                    'password': data.get('jti') or generate_random_password(),
                    'is_verified': True,
                    'is_email_verified': True,
                    "is_customer": True,
                    'username': re.sub(r'[\s@.]', '_', email),
                    'social_only': True
                 }
                 )
                if created:
                    user.set_password(data.get('jti') or generate_random_password())
                    user.save()
                    print("User saved with password")

        print("Checking UserSocialAuth")
        try:
            social = UserSocialAuth.objects.get(
                uid=email, provider="google-oauth2", user=user
            )
            print("Found existing UserSocialAuth")
        except UserSocialAuth.DoesNotExist:
            print("No existing UserSocialAuth, checking for duplicates")
            if (
                UserSocialAuth.objects.filter(
                    uid=email, provider="google-oauth2"
                ).count()
                > 0
            ):
                raise ValidationError("Email has already been linked to other account.")
            elif user.email and email != user.email:
                raise ValidationError(
                    """The account email address is different from social account email address.
                    Please try with the email address used in the homaale account."""
                )
            UserSocialAuth.objects.create(
                uid=email, provider="google-oauth2", user=user, extra_data=data
            )
            print("Created new UserSocialAuth")
        update_last_login(user, user)
        print("Returning user")
        return user

    def social_facebook(self, *args, **kwargs):
        data = self.request.data
        response = send_request.post(
            f"https://graph.facebook.com/me?access_token={data.get('accessToken')}"
        )
        if response.status_code != 200:
            raise ValidationError("Invalid token.")
        username = data["userID"]
        full_name = data["name"].split(" ")
        if self.request.user.is_authenticated:
            user = self.request.user
        else:
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    "first_name": full_name[0],
                    "last_name": full_name[-1],
                    "password": data["signedRequest"],
                    "is_verified": True,
                    "is_email_verified": True,
                    "social_only": True,
                },
            )
            if created:
                user.set_password(data["signedRequest"])
                user.save()

        try:
            user_social = UserSocialAuth.objects.get(uid=username, user=user)
            user = user_social.user
            user_social.extra_data = data
            user_social.save()

        except UserSocialAuth.DoesNotExist:
            if (
                UserSocialAuth.objects.filter(uid=username, provider="facebook").count()
                > 0
            ):
                raise ValidationError(
                    "Facebook has already been linked to other account."
                )
            UserSocialAuth.objects.create(
                uid=username, provider="facebook", user=user, extra_data=data
            )
            # user.social_only = True
            user.save()

        update_last_login(user, user)
        return user
