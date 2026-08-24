from django.contrib.auth import authenticate
from django.contrib.auth.models import update_last_login
from django.template.loader import render_to_string
from django.core.mail import send_mail

from apps.activity.views import add_activity_log
from apps.core.mixins.serializer import DynamicSerializerClassMixin
from utils.permissions import check_permissions
from .serializers import *
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import FormParser, MultiPartParser
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample

from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import encoding
from rest_framework import status, generics, filters
from django_filters.rest_framework import DjangoFilterBackend
from django.core.exceptions import ObjectDoesNotExist
import random
from django.http import Http404
from twilio.rest import Client
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from dj_rest_auth.registration.views import SocialLoginView
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from django.conf import settings
from django.views.generic import TemplateView
from collections import OrderedDict
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q, QuerySet
from apps.accountapp.utils import *
from apps.core.permissions import *
from apps.core.pagination import *
from apps.core.utils import *
from ...filters import StaffFilterSet


@extend_schema(tags=['staff'])
class StaffRegistrationAPIView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = StaffRegistrationSerializer

    # permission_classes = [AdminOnlyPermission]
    # parser_classes = (FormParser, MultiPartParser)
    # @extend_schema(request=StaffRegistrationSerializer)
    # def post(self, request, *args, **kwargs):
    #     """
    #     **Staff Registeration**
    #
    #     Parameters:
    #     ---------------
    #         request : form_data
    #                 username : string
    #                 email  : string
    #                 password : string
    #                 confirm_password : string
    #                 first_name : string
    #                 last_name : string
    #                 phone : string
    #                 role : string
    #                 profile_img : string
    #
    #     Requirements Password:
    #     ------------------------
    #         SpecialSym =['$', '@', '#', '%', '!', '^', '&', '*']
    #         - The new password must be at least 8 characters long.
    #         - The new password should not be greater than 12 characters long.
    #         - The new password must contain at least one letter and at least one digit or punctuation character.
    #         - The new password must contain at least one Uppercase Letter. The New password must contain at least one Special Symbols.
    #
    #
    #
    #     Returns:
    #     -------------
    #         json_data : Success or Failure Messages
    # """
    #     serializer = StaffRegistrationSerializer(data=request.data)
    #     if serializer.is_valid(raise_exception=True):
    #         # For validation purposes
    #         username = serializer.validated_data.get("username")
    #         email = serializer.validated_data.get("email")
    #         password = serializer.validated_data.get("password")
    #         first_name = serializer.validated_data.get("first_name")
    #         last_name = serializer.validated_data.get("last_name")
    #         phone = serializer.validated_data.get("phone")
    #         profile_image = serializer.validated_data.get("profile_image")
    #         groups = serializer.validated_data.get("role")
    #         #  Staff roll
    #         if role == "admin":
    #             user = User.objects.create_user(
    #                 username=username, email=email, password=password, first_name=first_name, last_name=last_name,
    #                 is_superuser=True, is_staff=True)
    #         elif role == "maintainer":
    #             user = User.objects.create_user(
    #                 username=username, email=email, password=password, first_name=first_name, last_name=last_name,
    #                 is_superuser=False, is_staff=True)
    #         else:
    #             user = User.objects.create_user(
    #                 username=username, email=email, password=password, first_name=first_name, last_name=last_name,
    #                 is_superuser=False, is_staff=False)
    #         staff = User.objects.create(status="Active", user=user, phone=phone, role=role,
    #                                     profile_image=profile_image)
    #         resp = {
    #             "status": "success",
    #             "message": "Staff is Registered Succesfully",
    #         }
    #     else:
    #         resp = {
    #             "status": "failure",
    #             "message": serializer.errors
    #         }
    #     return Response(resp)
    #


@extend_schema(tags=['staff'])
class StaffLoginAPIView(generics.CreateAPIView):
    serializer_class = StaffLoginSerializer
    permission_classes = (AllowAny,)

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer: StaffLoginSerializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # refresh: RefreshToken = RefreshToken.for_user(user)
        refresh: dict = get_tokens_for_staff(user)
        headers = self.get_success_headers(serializer.data)
        update_last_login(user, user)
        # add_activity_log(
        #     self, user=user, action='login'
        # )
        # actor_content_type = ContentType.objects.get_for_model(User)
        # actor_object_id = user.id
        # activity = create_activity(actor_content_type, actor_object_id, None, None, action="Login")
        return Response({
            **serializer.data,
            **refresh
            # 'access': str(refresh.access_token),
            # 'refresh': str(refresh),
        }, 200, headers=headers)

    # @extend_schema(request=StaffLoginSerializer)
    # def post(self, request, *args, **kwargs):
    #     """ Staff login Api
    #
    #     Parameters:
    #     ---------------
    #         Json_data
    #             email : string
    #             password : string
    #
    #     Returns:
    #     ------------
    #         JSON Response : Success or Failure Messages
    #     """
    #     serializer = StaffLoginSerializer(data=request.data)
    #     if serializer.is_valid():
    #         username = serializer.validated_data.get("username")
    #         password = serializer.validated_data.get("password")
    #         try:
    #             staff_obj = User.objects.get(Q(username=username) | Q(email=username) | Q(phone=username))
    #             user = authenticate(username=staff_obj.user.username, password=password)
    #             if staff_obj.status == "Active" and staff_obj.user.is_active == True:
    #                 resp = get_tokens_for_user(user)
    #
    #                 actor_content_type = ContentType.objects.get_for_model(User)
    #                 actor_object_id = staff_obj.id
    #                 activity = create_activity(actor_content_type, actor_object_id, None, None, action="Login")
    #             else:
    #                 resp = {
    #                     "message": "Pending or Suspended account..."
    #                 }
    #             return Response(resp)
    #         except Exception as e:
    #             resp = {
    #                 "message": "Invalid Credentials of the Operator"
    #             }
    #     else:
    #         resp = {
    #             "message": "Missing Information"
    #         }
    #     return Response(resp)


@extend_schema(tags=['staff'])
class StaffListAPIView(generics.ListAPIView):
    """This class represents a list of staff"""
    serializer_class = StaffListSerializer
    queryset = User.objects.filter(is_staff=True)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ('id', 'email', 'username', 'phone', 'first_name', 'last_name', 'middle_name',)
    ordering_fields = ('email', 'username', 'created_at', 'updated_at',)
    filterset_class = StaffFilterSet

    @check_permissions('accountapp.view_user')
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)


@extend_schema(tags=['staff'])
class StaffRetrieveUpdateDestroyAPIView(DynamicSerializerClassMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.filter(is_staff=True)
    serializer_class = StaffUpdateSerializer
    serializer_action_classes = {
        'GET': StaffRetrieveSerializer
    }

    @check_permissions('accountapp.view_user')
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @check_permissions('accountapp.delete_user')
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)

    @check_permissions('accountapp.change_user')
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)


# @extend_schema(tags=['staff'])
# class ChangeStaffStatusAPIView(APIView):
#     permission_classes = [MaintainerOnlyPermission]
#
#     # Forn maintainer only has access to change staff status
#     @extend_schema(request=StaffStatusSerializer)
#     def get_object(self, id):
#         """ Change staff status
#
#         Path Parameter:
#             id : string
#
#         Returns:
#             JSON Response : Success or Failure
#         """
#         try:
#             return User.objects.get(id=id)
#         except User.DoesNotExist:
#             raise Http404
#
#     @extend_schema(request=StaffStatusSerializer)
#     def patch(self, request, id, *args, **kwargs):
#         """ **Update a staff status**
#         -----------------------------------
#
#         Path Parameter:
#         ---------------------------
#             form_data:
#                 id : string
#
#         Returns:
#         ---------------------------------
#         JSON Response: Success or Failure Messages
#         """
#         # For update staff status
#         staff_obj = self.get_object(id)
#         serializer = StaffStatusSerializer(staff_obj, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             resp = {
#                 "status": "Success",
#                 "data": serializer.data
#             }
#         else:
#             resp = {
#                 "status": "Failure",
#                 "message": serializer.errors
#             }
#         return Response(resp)


@extend_schema(tags=['staff'])
class StaffForgotPasswordAPIView(APIView):
    """This class is used for staff if they forgot their password

    Args:
        APIView (StaffForgotPasswordAPIView): For forgot password

    Returns:
        JSON Response : Success or Failure
    """

    @extend_schema(request=UserForgotPasswordSerializer)
    def post(self, request, *args, **kwargs):
        """ **User Forgot Password**

        Path Parameters:
        -----------------
            json_data
                email : string

        Returns:
        -----------
            JSON Response : Sucess or Failure Messages
        """
        serializer = UserForgotPasswordSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            email = serializer.validated_data.get("email")
            try:
                staff = User.objects.get(user__email=email)
                user = staff.user
                domain = 'localhost:3004'
                url = 'http://' + domain
                html_content = render_to_string(
                    'passwordresetemail.html',
                    {
                        'domain': url, 'email': email,
                        'token': password_reset_token.make_token(user),
                        'uid': urlsafe_base64_encode(
                            encoding.force_bytes(user.pk)),
                        'user': user,
                    })
                email_subject = "PasswordReset Email"
                SendThreadMail.send_html_mail(self, email_subject, html_content, [email], settings.EMAIL_HOST_USER)
                resp = {
                    "status": "success",
                    "message": "Password Reset Link has been send to your email. Please check your email."
                }
            except Exception as e:
                resp = {
                    "status": "failure",
                    "message": "You don't have account account with this email. Please provide a valid email address."
                }
            return Response(resp)
        else:
            resp = {
                "status": "failure",
                "message": serializer.errors
            }
            return Response(resp)


@extend_schema(tags=['staff'])
class StaffResetPasswordAPIView(APIView):
    """This class represents a password reset password request for a staff

    Args:
        APIView (StaffResetPasswordAPIView): For staff reset password
    """

    def get(self, request, uidb64, token, *args, **kwargs):
        """**Staff Reset Password**

        Path Parameter:
        ----------------
            form_data{
                token : string
                uidb64 : string
            }

        Returns:
        ---------
            JSON Response : Success or Failure Messages
        """
        try:
            uid = encoding.force_text(urlsafe_base64_decode(uidb64))
            user = User.objects.get(id=uid)
            if user is not None and password_reset_token.check_token(user, token):
                resp = {"status": "success", "message": "Token is valid", "validlink": True}
            else:
                resp = {"status": "failure", "message": "Token is invalid, please request new one."}
        except Exception as e:

            resp = {
                "status": "failure",
                "message": "Invalid token",
                "validlink": False
            }
        return Response(resp)

    @extend_schema(request=UserResetPasswordSerializer)
    def post(self, request, *args, **kwargs):
        """ Staff Reset Password

        Parameter:
        ----------
            form_data{
                token : string
                uidb64 : string
            }

        Returns:
        ---------
            JSON Response : Success or Failure Messages
        """
        password = UserResetPasswordSerializer(data=request.data)
        if password.is_valid(raise_exception=True):
            try:
                token = self.kwargs.get("token")
                uidb64 = self.kwargs.get("uidb64")
                uid = encoding.force_text(urlsafe_base64_decode(uidb64))
                user = User.objects.get(id=uid)
                if user is not None and password_reset_token.check_token(user, token):
                    new_password2 = password.validated_data.get("new_password2")
                    old_password = user.password
                    if user.check_password(new_password2):
                        resp = {"new_password1": ["New password cannot be the same as your old password!"]}
                        return Response(resp)
                    user.set_password(new_password2)
                    user.save()
                    return Response({"status": "success", "message": "Password reset success."})
            except Exception as e:

                resp = {
                    "status": "failure",
                    "message": "Password did not match!"
                }
            return Response(resp)
        else:
            resp = {
                "status": "failure",
                "message": password.errors
            }
            return Response(resp)


# @extend_schema(tags=['staff'])
# class StaffProfileAPIView(APIView):
#     """This class represents a view staff profile
#
#     Args:
#         APIView (StaffProfileAPIView): For Staff view Profile
#
#     Returns:
#         JSON response : Success or Failure
#     """
#     permission_classes = [AllStaffPermission]
#
#     def get(self, request, *args, **kwargs):
#         """ Staff Profile Get
#
#         Path Parameter:
#         --------------
#             form_data{
#                 id : string
#             }
#
#         Returns:
#         -----------
#             JSON Response : Success or Failure Messages
#         """
#         staff_obj = User.objects.get(user=request.user)
#         serializer = StaffProfileSerializer(staff_obj, context={'request': request})
#         resp = {
#             "status": "success",
#             "data": serializer.data
#         }
#         return Response(resp)
#
#     parser_classes = [FormParser, MultiPartParser]
#
#     @extend_schema(request=StaffProfileUpdateSerializer)
#     def patch(self, request, *args, **kwargs):
#         """ Staff Profile Update
#
#         Path Parameter:
#         --------------
#             form_data{
#                 phone : string
#                 profile_image : string
#             }
#
#         Returns:
#         -----------
#             JSON Response : Success or Failure Messages
#         """
#         staff_obj = User.objects.get(user=request.user)
#         serializer = StaffProfileUpdateSerializer(staff_obj, data=request.data, partial=True,
#                                                   context={'request', request})
#         if serializer.is_valid():
#             serializer.save()
#             first_name = serializer.validated_data.get("first_name")
#             last_name = serializer.validated_data.get("last_name")
#             if first_name:
#                 staff_obj.user.first_name = first_name
#             if last_name:
#                 staff_obj.user.last_name = last_name
#             staff_obj.user.save()
#             resp = {
#                 "status": "success",
#                 "message": "Your Profile is updated."
#             }
#         else:
#             resp = {
#                 "status": "failure",
#                 "message": serializer.errors
#             }
#         return Response(resp)


@extend_schema(tags=['staff'])
class StaffMyProfileAPIView(DynamicSerializerClassMixin, generics.RetrieveUpdateAPIView):
    serializer_class = StaffMyProfileUpdateSerializer
    serializer_action_classes = {
        'GET': StaffProfileSerializer
    }

    def get_object(self) -> QuerySet[User]:
        return self.request.user

