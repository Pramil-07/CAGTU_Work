from django.contrib.auth import authenticate
from django.template.loader import render_to_string
from django.core.mail import send_mail
from .serializers import *
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import FormParser, MultiPartParser
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from apps.accountapp.models import User as Users
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
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
from django.db.models import Q
from apps.productapp.models import Product

from apps.checkoutapp.models import OrderItem
from django.core.mail import send_mail
from apps.accountapp.utils import *

# from .utils import token_generator
# Create your views here.
from apps.productapp.api.v1.api_cms import LargeResultsSetPagination

import contextlib

# custom import app
from apps.accountapp.utils import *
from apps.core.permissions import *
from apps.core.pagination import *
from apps.core.utils import *
from ...filters import *
from apps.notifications.utils import HookResponse
from django.utils.encoding import force_str


class HomeView(TemplateView):
    template_name = "index.html"


class ActivationAccountAPIView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        """
        Account activation

        Parameters:
        ----------------
           request

            kwargs:
                token : string
                uidb64 : string
                uid : string
                user : int


        Returns:
            Json Response: Success or Failure
        """
        try:
            token = self.kwargs.get("token")
            uidb64 = self.kwargs.get("uidb64")
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(id=uid)
            user.is_active = True
            user.is_verified = True
            user.save()
            resp = {"status": "success", "message": "Your account has been activated."}
            return Response(resp)
        except Exception as e:
            resp = {
                "status": "failure",
                "message": "User not matched!",
                "error": str(e),
            }
            return Response(resp, status=status.HTTP_404_NOT_FOUND)


@extend_schema(tags=["customer"])
class CustomerResetPasswordAPIView(APIView):
    permission_classes = (AllowAny,)

    def get(
        self,
        request,
        uidb64,
        token,
        *args,
        **kwargs,
    ):
        """
        **Customer Password Change**
        -----------------------------------------------------------

        Path Parameters:
        ---------------
            form_data:
                Request_body
                    {
                    token : string
                    uidb64 : string
                    }
        Returns:
        -------------
        json_data : Success or Failure Messages
        """
        try:
            uid = encoding.force_text(urlsafe_base64_decode(uidb64))
            customer = User.objects.get(user__id=uid)
            user = customer.user
            if user is not None and password_reset_token.check_token(user, token):
                resp = {
                    "status": "success",
                    "message": "Token is valid",
                    "validlink": True,
                }
                return Response(resp)
            else:
                resp = {
                    "status": "failure",
                    "message": "Token is invalid, please request new one.",
                }
        except Exception as e:
            resp = {"status": "failure", "message": "Invalid token", "validlink": False}
        return Response(resp, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(request=UserResetPasswordSerializer)
    def post(self, request, *args, **kwargs):
        """
        **Customer Password Change**
        ------------------------------------------------

        Parameters:
        ---------------
            form_data:
                Request_body
                    {
                    token : string
                    uidb64 : string
                    }


        Returns:
        -------------
        json_data : Success or Failure
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
                        resp = {
                            "new_password1": [
                                "New password cannot be the same as your old password!"
                            ]
                        }
                        return Response(resp, status=status.HTTP_406_NOT_ACCEPTABLE)
                    user.set_password(new_password2)
                    user.save()
                    return Response(
                        {"status": "success", "message": "Password reset success."}
                    )
            except Exception as e:
                resp = {"status": "failure", "message": str(e)}
        else:
            resp = {"status": "failure", "message": password.errors}
        return Response(resp)


@extend_schema(tags=["customer"])
class CustomerForgotPasswordAPIView(APIView):
    permission_classes = (AllowAny,)

    @extend_schema(request=UserForgotPasswordSerializer)
    def post(self, request, *args, **kwargs):
        """
        **Customer  Forgot Password**

        Parameters:
        ---------------
            form_data:
                Request_body
                    {
                        email : string
                    }


        Returns:
        -------------
        JSON Response : Success or Failure Messages
        """

        serializer = UserForgotPasswordSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            # For email validation
            email = serializer.validated_data.get("email")
            print("email", email)
            try:
                customer = User.objects.filter(email=email).first()
                print("customer", customer)

            except Exception as e:
                return Response(
                    {
                        "status": "failure",
                        "message": "Email with this account does not exist.",
                    },
                    status=status.HTTP_404_NOT_FOUND,
                )
            user = customer
            domain = settings.WEB_UI_URL
            url = f"http://{domain}"
            html_content = render_to_string(
                "passwordresetemail.html",
                {
                    "domain": url,
                    "email": email,
                    "token": password_reset_token.make_token(user),
                    "uid": urlsafe_base64_encode(encoding.force_bytes(user.pk)),
                    "user": user,
                },
            )
            # send_mail(f'Password Reset from {domain}', html_content, settings.EMAIL_HOST_USER, [email], fail_silently=False)
            # send_html_mail(self, subject, html_content, recipient_list, sender):
            SendThreadMail.send_html_mail(
                self,
                f"Password Reset from {domain}",
                html_content,
                [email],
                settings.DEFAULT_FROM_EMAIL,
            )
            resp = {
                "status": "success",
                "message": "Password Reset Link has been send to your email. Please check your email.",
            }
        else:
            resp = {"status": "failure", "message": serializer.errors}
        return Response(resp)


@extend_schema(tags=["customer"])
class CustomerProfileView(APIView):
    permission_classes = [CustomerOnlyPermission]

    def get(self, request, *args, **kwargs):
        """
        **Customer Profile**

        Path Parameters:
        ---------------
            request : json_data
                email : string

        Returns:
        -------------
        json_data : Success or Failure Messages
        """

        customer = User.objects.get(id=request.user.id)
        serializer = CustomerProfileSerializer(customer, context={"request": request})
        resp = {"status": "success", "data": serializer.data}
        return Response(resp)

    permission_classes = [CustomerOnlyPermission]
    parser_classes = (FormParser, MultiPartParser)

    @extend_schema(request=CustomerProfileUpdateSerializer)
    def patch(self, request, *args, **kwargs):
        data = request.data.copy()
        address_str = data.get("address")

        if address_str:
            try:
                addresses = json.loads(
                    address_str
                )  # Parse JSON string into list of dicts
            except json.JSONDecodeError:
                return Response(
                    {"status": "error", "message": "Invalid address JSON"}, status=400
                )

            # Assuming Address model has fields: street_address, postal_code, city, state, country
            # And a ForeignKey to customer, e.g., user=request.user
            # Adjust if your relations differ

            # Delete old addresses or handle update as needed:
            Address.objects.filter(user=request.user).delete()
            print("address creating start")
            for addr in addresses:
                Address.objects.create(
                    user=request.user,
                    street_address=addr.get("street_address", ""),
                    postal_code=addr.get("postal_code", ""),
                    city=addr.get("city", ""),
                    state=addr.get("state", ""),
                    country=addr.get("country", ""),
                )

        # Remove 'address' from data so serializer doesn't get confused
        if "address" in data:
            data.pop("address")

        customer = request.user
        serializer = CustomerProfileUpdateSerializer(customer, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {"status": "success", "message": "Your profile has been updated."}
        )


@extend_schema(tags=["customer"])
class CmsCustomerProfileView(generics.RetrieveAPIView):
    permission_classes = [AllStaffPermission]
    serializer_class = CustomerProfileSerializer
    queryset = User.objects.all()
    lookup_field = "pk"


# @extend_schema(tags=['staff'])
# class StaffRegistrationAPIView(APIView):
#     permission_classes = [AdminOnlyPermission]
#     parser_classes = (FormParser, MultiPartParser)
#
#     @extend_schema(request=StaffRegistrationSerializer)
#     def post(self, request, *args, **kwargs):
#         """
#         **Staff Registeration**
#
#         Parameters:
#         ---------------
#             request : form_data
#                     username : string
#                     email  : string
#                     password : string
#                     confirm_password : string
#                     first_name : string
#                     last_name : string
#                     phone : string
#                     role : string
#                     profile_img : string
#
#         Requirements Password:
#         ------------------------
#             SpecialSym =['$', '@', '#', '%', '!', '^', '&', '*']
#             - The new password must be at least 8 characters long.
#             - The new password should not be greater than 12 characters long.
#             - The new password must contain at least one letter and at least one digit or punctuation character.
#             - The new password must contain at least one Uppercase Letter. The New password must contain at least one Special Symbols.
#
#
#
#         Returns:
#         -------------
#             json_data : Success or Failure Messages
#     """
#         serializer = StaffRegistrationSerializer(data=request.data)
#         if serializer.is_valid(raise_exception=True):
#             # For validation purposes
#             username = serializer.validated_data.get("username")
#             email = serializer.validated_data.get("email")
#             password = serializer.validated_data.get("password")
#             first_name = serializer.validated_data.get("first_name")
#             last_name = serializer.validated_data.get("last_name")
#             phone = serializer.validated_data.get("phone")
#             profile_image = serializer.validated_data.get("profile_image")
#             role = serializer.validated_data.get("role")
#             profile_image = serializer.validated_data.get("profile_image")
#             #  Staff roll
#             if role == "admin":
#                 user = User.objects.create_user(
#                     username=username, email=email, password=password, first_name=first_name, last_name=last_name,
#                     is_superuser=True, is_staff=True)
#             elif role == "maintainer":
#                 user = User.objects.create_user(
#                     username=username, email=email, password=password, first_name=first_name, last_name=last_name,
#                     is_superuser=False, is_staff=True)
#             else:
#                 user = User.objects.create_user(
#                     username=username, email=email, password=password, first_name=first_name, last_name=last_name,
#                     is_superuser=False, is_staff=False)
#             staff = User.objects.create(status="Active", user=user, phone=phone, role=role,
#                                          profile_image=profile_image)
#             resp = {
#                 "status": "success",
#                 "message": "Staff is Registered Succesfully",
#             }
#         else:
#             resp = {
#                 "status": "failure",
#                 "message": serializer.errors
#             }
#         return Response(resp)


@extend_schema(tags=["merchant"])
class MerchantRegistrationAPIView(APIView):
    parser_classes = (FormParser, MultiPartParser)

    @extend_schema(request=MerchantRegistrationSerializer)
    def post(self, request, *args, **kwargs):
        """
        **Merchant Registration**
        ------------------------------

        Parameters:
        ---------------
            request : form_data
                    username : string
                    email  : string
                    password : string
                    confirm_password : string
                    first_name : string
                    last_name : string
                    phone : string
                    role : string
                    profile_img : string
                    shop_code: string
                    opening_time: timefield -> H:M:S [ 24 hr format]
                    closing_time: timefield -> H:M:S [ 24 hr format]

        Requirements Password:
        ------------------------
            SpecialSym =['$', '@', '#', '%', '!', '^', '&', '*']
            - The new password must be at least 8 characters long.
            - The new password should not be greater than 12 characters long.
            - The new password must contain at least one letter and at least one digit or punctuation character.
            - The new password must contain at least one Uppercase Letter. The New password must contain at least one Special Symbols.


        Returns:
        -------------
            json_data : Success or Failure Messages
        """

        serializer = MerchantRegistrationSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            # For validation purposes
            username = serializer.validated_data.get("username")
            email = serializer.validated_data.get("email")
            password = serializer.validated_data.get("password")
            phone = serializer.validated_data.get("phone")
            profile_image = serializer.validated_data.get("profile_image")
            merchant_name = serializer.validated_data.get("merchant_name")
            shop_code = serializer.validated_data.get("shop_code")
            opening_time = serializer.validated_data.get("opening_time")
            closing_time = serializer.validated_data.get("closing_time")

            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                is_superuser=False,
                is_staff=False,
                is_active=False,
            )
            merchant = Merchant.objects.create(
                status="Active",
                user=user,
                merchant_name=merchant_name,
                phone=phone,
                profile_image=profile_image,
                shop_code=shop_code,
                opening_time=opening_time,
                closing_time=closing_time,
            )
            resp = {
                "status": "success",
                "message": "Congratulations! Your account has been succesfully created.",
            }
        else:
            resp = {"status": "failure", "message": serializer.errors}
        return Response(resp)


class UserForgotPasswordSendOTPAPIView(APIView):
    @extend_schema(request=UserForgotPasswordSendOTPSerializer)
    def post(self, request, *args, **kwargs):

        serializer = UserForgotPasswordSendOTPSerializer(data=request.data)
        if serializer.is_valid():
            """
            **User forgot password send otp**

            Parameters:
            ---------------
                request : form_data

                        token : string
                        uidb64 : string


            Returns:
            -------------
                json_data : Success or Failure Messages
            """
            phone = serializer.validated_data.get("phone")
            try:
                user = User.objects.get(phone=phone)
            except ObjectDoesNotExist:
                try:
                    user = User.objects.get(phone=phone)
                except:
                    resp = {
                        "status": "failure",
                        "message": "Account with this number does not exist. Please try again with a valid number.",
                    }
                    return Response(resp, status=status.HTTP_404_NOT_FOUND)

            otp = random.randint(1000, 9999)
            try:
                client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
                user.otp = otp
                message = client.messages.create(
                    body=f"Your OTP is - {user.otp}",
                    from_="+12172926441",
                    # to is always this for testing period
                    to="+9779803000686",
                )
                user.save()
            except:
                resp = {
                    "status": "failure",
                    "message": "Number does not exist. SMS could not be send.",
                }
                return Response(resp, status=status.HTTP_404_NOT_FOUND)
            resp = {
                "status": "success",
                "message": "OTP has been send to 9803000686. Please check your phone.",
                "uid": urlsafe_base64_encode(encoding.force_bytes(user.user.pk)),
            }
            return Response(resp)
        else:
            resp = {"status": "failure", "message": serializer.errors}
            return Response(resp)


class UserResetPasswordOTPAPIView(APIView):
    def get(self, request, uidb64, otp, *args, **kwargs):
        """
        **User Forgot Password Send OTP**

        Path Parameters:
        ---------------
            request : form_data

                    otp : string
                    uidb64 : string


        Returns:
        -------------
            json_data : Success or Failure Messages
        """
        try:
            uid = encoding.force_text(urlsafe_base64_decode(uidb64))
            try:
                user = User.objects.get(id=uid)
            except user.DoesNotExist:
                resp = {"status": "failure", "message": "User does not exist."}
                return Response(resp, status=status.HTTP_404_NOT_FOUND)
            if user is not None:
                try:
                    user = User.objects.get(user=user.id)
                except ObjectDoesNotExist:
                    try:
                        user = User.objects.get(user=user.id)
                    except:
                        resp = {
                            "status": "failure",
                            "message": "Account does not exist",
                        }
                        return Response(resp, status=status.HTTP_404_NOT_FOUND)

                if user.otp == otp:
                    resp = {"status": "success", "message": "OTP is valid"}
                else:
                    resp = {"status": "failure", "message": "OTP is not valid"}
                    return Response(status=status.HTTP_406_NOT_ACCEPTABLE)
            else:
                resp = {
                    "status": "failure",
                    "message": "OTP is invalid, please request new one.",
                }
                return Response(status=status.HTTP_406_NOT_ACCEPTABLE)
        except Exception as e:
            resp = {"status": "failure", "message": "Invalid token", "validlink": False}
            return Response(resp, status=status.HTTP_400_BAD_REQUEST)
        return Response(resp)

    @extend_schema(request=UserResetPasswordOTPSerializer)
    def post(self, request, *args, **kwargs):
        """
        **User Forgot Password Send OTP**

        Parameters:
        ---------------
            request : form_data

                    otp : string
                    uidb64 : string


        Returns:
        -------------
            json_data : Success or Failure Messages
        """
        password = UserResetPasswordOTPSerializer(data=request.data)
        if password.is_valid(raise_exception=True):
            try:
                otp = self.kwargs.get("otp")
                uidb64 = self.kwargs.get("uidb64")
                uid = encoding.force_text(urlsafe_base64_decode(uidb64))
                try:
                    user = User.objects.get(id=uid)
                except user.DoesNotExist:
                    resp = {"status": "failure", "message": "User does not exist."}
                    return Response(resp, status=status.HTTP_404_NOT_FOUND)
                try:
                    user = User.objects.get(user=user.id)
                except ObjectDoesNotExist:
                    try:
                        user = User.objects.get(user=user.id)
                    except Exception:
                        resp = {
                            "status": "failure",
                            "message": "Account does not exist.",
                        }
                        return Response(resp, status=status.HTTP_404_NOT_FOUND)
                # maintainer = Maintainer.objects.get(user=user.id)
                if user.otp == otp:
                    new_password2 = password.validated_data.get("new_password2")
                    user.set_password(new_password2)
                    user.save()
                    user.otp = random.randint(1000, 9999)
                    user.save()
                    return Response(
                        {"status": "success", "message": "Password reset success."}
                    )
                else:
                    resp = {"status": "failure", "message": "OTP is not valid"}
                    return Response(resp, status=status.HTTP_406_NOT_ACCEPTABLE)
            except Exception as e:
                resp = {"status": "failure", "message": "Password did not match!"}
                return Response(resp, status=status.HTTP_400_BAD_REQUEST)
        else:
            resp = {"status": "failure", "message": password.errors}
        return Response(resp)


@extend_schema(tags=["merchant"])
class ChangeMerchantStatusAPIView(APIView):
    permission_classes = [MaintainerOnlyPermission]

    @extend_schema(request=MerchantStatusSerializer)
    def get_object(self, id):
        """
        **Merchant Change Status**

        Path Parameters:
        ---------------
            request : form_data

                    id  : int



        Returns:
        -------------
            json_data : Success or Failure Messages
        """
        try:
            return Merchant.objects.get(id=id)
        except Merchant.DoesNotExist:
            raise Http404

    @extend_schema(request=MerchantStatusSerializer)
    def patch(self, request, id, *args, **kwargs):
        """
        **Merchant status update**
        ---------------------------

        Path Parameters:
        ---------------
            request : form_data
                    id  : int

        Returns:
        -------------
        json_data : Success or Failure Messages
        """

        merchant_obj = self.get_object(id)
        serializer = MerchantStatusSerializer(
            merchant_obj, data=request.data, partial=True
        )
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            resp = {"status": "Success", "data": serializer.data}
        else:
            resp = {"status": "Failure", "message": serializer.errors}
        return Response(resp)


@extend_schema(tags=["merchant"])
class MerchantListAPIView(APIView, PageNumberPagination):
    """This class represents a list of Merchant

    Args:
        APIView (MerchantListAPIView):  Merchant Listing
        PageNumberPagination (get_paginated_response):  For pagination purposes

    """

    permission_classes = [MaintainerOnlyPermission]
    page_size = 10
    max_page_size = 1000

    def get_paginated_response(self, data, page, page_num):

        return Response(
            OrderedDict(
                [
                    ("total_pages", self.page.paginator.num_pages),
                    ("count", self.page.paginator.count),
                    ("current", page),
                    ("next", self.get_next_link()),
                    ("previous", self.get_previous_link()),
                    ("page_size", page_num),
                    ("result", data),
                ]
            )
        )

    def get_queryset(self, request, *args, **kwargs):
        keyword = self.request.GET.get("keyword", "")
        # brand = self.request.GET.get('brand')
        # color = self.request.GET.get('color')
        sortBy = self.request.GET.get("sortBy")
        new_queryset = Merchant.objects.filter(
            Q(user__username__icontains=keyword)
            | Q(user__email__icontains=keyword)
            | Q(user__date_joined__icontains=keyword)
            | Q(user__last_login__icontains=keyword)
            | Q(merchant_name__icontains=keyword)
            | Q(phone__icontains=keyword)
        )
        # filters = {}
        # if brand:
        #     filters['brand__name']=brand
        # if color:
        #     filters['color']=color
        # filter_q = Q(**filters)

        # if filters:
        #     new_queryset.filter(filter_q)
        # if sortBy:
        #     try:
        #         new_queryset = new_queryset.order_by(sortBy)
        #     except:
        #         pass
        try:
            new_queryset = new_queryset.order_by(sortBy)
        except:
            pass
        return self.paginate_queryset(new_queryset, self.request)

    def get(self, request, *args, **kwargs):
        """
        **User Forgot Password Send OTP**

        Path Parameters:
        ---------------
            request : form_data

        Returns:
        -------------
            json_data : Success or Failure Messages
        """
        page = self.request.GET.get("page", 1)
        page_size = self.request.GET.get("page_size", 1000)
        merchant = self.get_queryset(request)
        serializer = MerchantListSerializer(
            merchant, many=True, context={"request": request}
        )
        return self.get_paginated_response(serializer.data, page, page_size)


@extend_schema(tags=["merchant"])
class MerchantProfileView(APIView):
    permission_classes = [MerchantAndStaffPermission]

    # For Merchant and Staff Only have access
    def get_object(self, id):
        try:
            return Merchant.objects.get(id=id)
        except Merchant.DoesNotExist:
            raise Http404

    def get(self, request, id, *args, **kwargs):
        """
        **Merchant Profile View**
        ---------------------------------------

        Path Parameters:
        ---------------
            form_data{
                    id  : int
                    }

        Returns:
        -------------
        json_data : Success or Failure Messages
        """
        merchant_obj = self.get_object(id)
        serializer = MerchantProfileSerializer(
            merchant_obj, context={"request": request}
        )
        resp = {"status": "Success", "data": serializer.data}
        return Response(resp)


class AddressAPIView(APIView):
    permission_classes = [CustomerOnlyPermission]

    @extend_schema(
        methods=["POST"], request=AddressSerializer, responses=AddressSerializer
    )
    def post(self, request, *args, **kwargs):
        """
         **Address API View**
         -----------------------------------------------------------

        Parameter:
         ------------
             form_data {
                 first_name : string
                 last_name : string
                 country : string
                 status : string
                 city : string
                 postal_code : string
                 contact_number : string
                 street_address : string
                 company_name : string
                 is_default : boolean
                 }
         Returns:
         ------------------------------------------------------------
         JSON Response : Success or Failure Messages
        """
        user_address_count = Address.objects.filter(user=request.user).count()
        if user_address_count >= 3:
            resp = {
                "status": "failure",
                "message": "You have already added three address.",
            }
        else:
            serializer = AddressSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(user=request.user)
                resp = {"status": "success", "message": "Address created successfully."}
            else:
                resp = {"status": "failure", "message": serializer.errors}
        return Response(resp)

    @extend_schema(description="Get address details of user")
    def get(self, request, *args, **kwargs):
        """
        **User Forgot Password Send OTP**

        Parameters:
        ---------------
            request : json_data
            {

            }


        Returns:
        -------------
            json_data : Success or Failure Messages
        """
        user = request.user
        address = Address.objects.filter(user=user)
        serializer = AddressSerializer(address, many=True)
        resp = {"status": "success", "data": serializer.data}
        return Response(resp)


class AddressPatchAndDeleteAPIView(APIView):
    permission_classes = [CustomerOnlyPermission]

    # For Customer only
    def get_object(self, request, id, *args, **kwargs):
        try:
            return Address.objects.get(id=id, user=request.user)
        except Address.DoesNotExist:
            raise Http404

    def delete(self, request, id, *args, **kwargs):
        """
         **Address API View**
         -----------------------------------------------------------

        Parameter:
         ------------
             form_data {
                 id : string
                 }
         Returns:
         ------------------------------------------------------------
         JSON Response : Success or Failure Messages
        """
        # For address delete operation
        address_obj = self.get_object(request, id)
        address_obj.delete()
        resp = {"status": "success", "message": "The address is deleted."}
        return Response(resp)

    @extend_schema(request=AddressUpdateSerializer)
    def patch(self, request, id, *args, **kwargs):
        """
         **Address API View**
         -----------------------------------------------------------

        Path Parameter:
         ------------
             form_data {
                 id = integer
                 Request_body{
                     first_name : string
                     last_name : string
                     country : string
                     status : string
                     city : string
                     postal_code : string
                     contact_number : string
                     street_address : string
                     company_name : string
                     is_default : booleag }
                 }
         Returns:
         ------------------------------------------------------------
         JSON Response : Success or Failure Messages
        """
        # For address update operation
        address_obj = self.get_object(request, id)
        serializer = AddressUpdateSerializer(
            address_obj, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            resp = {"status": "success", "message": "The address has been updated."}
        else:
            resp = {"status": "failure", "message": serializer.errors}
        return Response(resp)


# class AddressAddAPIView(APIView):
#     def post


@extend_schema(tags=["customer"])
class CustomerListAPIView(APIView, PageNumberPagination):
    permission_classes = [MaintainerOnlyPermission]

    page_size = 10
    max_page_size = 1000

    def get_paginated_response(self, data, page, page_num):
        # for pigination response
        return Response(
            OrderedDict(
                [
                    ("total_pages", self.page.paginator.num_pages),
                    ("count", self.page.paginator.count),
                    ("current", page),
                    ("next", self.get_next_link()),
                    ("previous", self.get_previous_link()),
                    ("page_size", page_num),
                    ("result", data),
                ]
            )
        )

    def get_queryset(self, request, *args, **kwargs):
        keyword = self.request.GET.get("keyword", "")

        # brand = self.request.GET.get('brand')
        # color = self.request.GET.get('color')
        sortBy = self.request.GET.get("sortBy")
        new_queryset = Users.objects.filter(
            Q(username__icontains=keyword)
            | Q(email__icontains=keyword)
            | Q(created_at__icontains=keyword)
            | Q(last_login__icontains=keyword)
            | Q(is_active__icontains=keyword)
            | Q(phone__icontains=keyword)
        )

        try:
            new_queryset = new_queryset.order_by(sortBy)
        except:
            pass

        return self.paginate_queryset(new_queryset, self.request)

    def get(self, request, *args, **kwargs):
        """
         **Customer List API**
         -----------------------------------------------------------

        Parameter:
         ------------
             form_data {

                 }
         Returns:
         ------------------------------------------------------------
         JSON Response : Success or Failure Messages
        """
        page = self.request.GET.get("page", 1)
        page_size = self.request.GET.get("page_size", 1000)
        customer = self.get_queryset(request)
        serializer = CustomerListSerializer(
            customer, many=True, context={"request": request}
        )
        return self.get_paginated_response(serializer.data, page, page_size)


@extend_schema(tags=["customer"])
class ChangeCustomerStatusAPIView(APIView):
    permission_classes = [MaintainerOnlyPermission]

    # Only maintainer will be able to change the status of a customer
    @extend_schema(request=CustomerStatusSerializer)
    def get_object(self, id):
        try:
            return User.objects.get(id=id)
        except User.DoesNotExist:
            raise Http404

    @extend_schema(request=CustomerStatusSerializer)
    # For
    def patch(self, request, id, *args, **kwargs):
        """**Update customer status**
        -------------------------------------------

        Path Parameters:
        ---------------------------
            form_data {
                id : string
            }

        Returns:
        ------------
        Json Response : Success or Failure Messages
        """
        customer_obj = self.get_object(id)
        serializer = CustomerStatusSerializer(
            customer_obj, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            resp = {"status": "Success", "data": serializer.data}
        else:
            resp = {"status": "Failure", "message": serializer.errors}
        return Response(resp)


from rest_framework.pagination import PageNumberPagination


class UserListPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    # Only login user havae permissions
    def get(self, request, *args, **kwargs):

        user = User.objects.get(id=request.user.id)
        serializers_class = UserProfileSerializer()

        return Response(serializers_class.data)


class UserListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, *args, **kwargs):
        username = request.query_params.get("username")
        email = request.query_params.get("email")
        phone = request.query_params.get("phone")

        users = User.objects.all()

        # Apply filters
        if username:
            users = users.filter(username__icontains=username)
        if email:
            users = users.filter(email__icontains=email)
        if phone:
            users = users.filter(phone__icontains=phone)

        # Pagination
        paginator = UserListPagination()
        paginated_users = paginator.paginate_queryset(users, request)
        serializer = UserProfileSerializer(
            paginated_users, many=True, context={"request": request}
        )

        return paginator.get_paginated_response(serializer.data)


# class UserListView(APIView):
#     permission_classes = [IsAdminUser]  # only authenticated users can access
#
#     def get(self, request, *args, **kwargs):
#         users = User.objects.all()  # fetch all users
#         serializer = UserProfileSerializer(users, many=True , context={"request": request} )  # serialize multiple users
#         return Response(serializer.data)


@extend_schema(tags=["merchant"])
class MerchantLoginAPIView(APIView):
    """This ApiView class provides access to the Merchant Login API

    Args:
        APIView (MerchantLoginAPIView):  For Maintainer Login

    Returns:
        JSON Response :  Success or Failure
    """

    @extend_schema(request=MerchantLoginSerializer)
    def post(self, request, *args, **kwargs):
        """**Merchant Login API POST method**
        -----------------------------------------------

        Parameters:
        -------------
            Json_data{
                email: string
                password: string
                }

        Returns:
        JSON Response : Success or Failure Messages
        """
        serializer = MerchantLoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data.get("email")
            password = serializer.validated_data.get("password")
            try:
                try:
                    merchant_obj = Merchant.objects.get(user__email=email)
                    user = authenticate(
                        username=merchant_obj.user.username, password=password
                    )
                    if (
                        merchant_obj.status == "Active"
                        and merchant_obj.user.is_active == True
                    ):
                        resp = get_tokens_for_user(user)
                    else:
                        resp = {"message": "Pending or Suspended account..."}
                except:
                    merchantstaff_obj = Employee.objects.get(user__email=email)
                    user = authenticate(
                        username=merchantstaff_obj.user.username, password=password
                    )
                    if (
                        merchantstaff_obj.status == "Active"
                        and merchantstaff_obj.user.is_active == True
                    ):
                        resp = get_tokens_for_user(user)
                    else:
                        resp = {"message": "Pending or Suspended account..."}
                    return Response(resp)
            except Exception as e:
                resp = {"message": "Invalid Credentials of the Operator"}
        else:
            resp = {"message": "Missing Information"}
        return Response(resp)


@extend_schema(tags=["merchant"])
class SendMailToMerchantAPIView(APIView):
    """This class is used to send a mail to a Merchant

    Args:
        APIView (SendMailToMerchantAPIView): For sending a mail to a Merchant

    Returns:
        JSON Response : Success or Failure
    """

    permission_classes = [AllStaffPermission]

    @extend_schema(request=SendMailToMerchantSerializer)
    def post(self, request, *args, **kwargs):
        """**Send a mail to a Merchant**
        ------------------------------------

        Parameters:
        ----------
            json_data{
                email : string
            }

        Returns:
        ----------
        JSON Response : Success or Failure Messages
        """
        serializer = SendMailToMerchantSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data.get("email")
            try:
                merchant_obj = Merchant.objects.get(user__email=email)
                user = merchant_obj.user
                domain = "localhost:3004"
                url = f"http://{domain}"
                html_content = render_to_string(
                    "MerchantVerify.html",
                    {
                        "domain": url,
                        "email": email,
                        "token": password_reset_token.make_token(user),
                        "uid": urlsafe_base64_encode(encoding.force_bytes(user.pk)),
                        "user": user,
                    },
                )
                email_subject = "Activate Account"
                SendThreadMail.send_html_mail(
                    self, email_subject, html_content, [email], settings.EMAIL_HOST_USER
                )
                resp = {"status": "success", "message": "Email Sent."}
            except Exception as e:
                resp = {"status": "failure", "message": str(e)}

        else:
            resp = {"status": "failure", "message": serializer.errors}
        return Response(resp)


@extend_schema(tags=["merchant"])
class MerchantPasswordChangeAPIView(APIView):
    """This class is used to change the password of a Merchant

    Args:
        APIView (MerchantPasswordChangeAPIView): For Merchant  Password Change

    Returns:
        JSON Response : Success or Failure
    """

    permission_classes = [MerchantOnlyPermission]

    @extend_schema(request=UserPasswordChangeSerializer)
    def post(self, request, *args, **kwargs):
        """**Merchant Password Change**
        ---------------------------------------

        Patrameters:
        -------------
            json_data{
                Request_body {
                    old_password : string
                    new_password : string
                    new_password1 = string
                    }
                    }


        Returns:
        -------------
        JSON Response : Success or Failure Messages
        """
        op_id = request.user.id
        current_operator = User.objects.get(id=op_id)
        serializer = UserPasswordChangeSerializer(current_operator, data=request.data)
        if serializer.is_valid(raise_exception=True):
            user = current_operator
            old_password = serializer.validated_data.get("old_password")
            if not user.check_password(old_password):
                resp = {"old_password": ["Old password did not match!"]}
            else:
                new_password = serializer.validated_data.get("new_password1")
                if old_password == new_password:
                    resp = {
                        "new_password1": [
                            "New password cannot be the same as your old password!"
                        ]
                    }
                    return Response(resp)
                user.set_password(new_password)
                user.save()
                resp = {"status": "success", "message": "Password changed successfully"}
        else:
            resp = {"status": "failure", "message": serializer.errors}
        return Response(resp)


# @extend_schema(tags=['staff'])
# class StaffPasswordChangeAPIView(APIView):
#     """ This class is used to change the password of a staff
#
#     Args:
#         APIView (StaffPasswordChangeAPIView): For the staff password change
#
#     Returns:
#         JSON Response : Success or Failure
#     """
#     permission_classes = [AllStaffPermission]
#
#     @extend_schema(request=UserPasswordChangeSerializer)
#     def post(self, request, *args, **kwargs):
#         """ **User Password Change**
#
#         Path Parameter :
#         -----------------
#             json_data {
#                 old_password : string
#                 new_password : string
#                 new_password1 : string
#
#             }
#
#         Returns:
#         ---------
#             JSON Response : Success or Failure Messages
#         """
#         op_id = request.user.id
#         current_operator = User.objects.get(id=op_id)
#         serializer = UserPasswordChangeSerializer(current_operator, data=request.data)
#         if serializer.is_valid(raise_exception=True):
#             user = current_operator
#             old_password = serializer.validated_data.get("old_password")
#             if not user.check_password(old_password):
#                 resp = {"old_password": ["Old password did not match!"]}
#                 return Response(resp)
#             else:
#                 new_password = serializer.validated_data.get("new_password1")
#                 if old_password == new_password:
#                     resp = {"new_password1": ["New password cannot be the same as your old password!"]}
#                     return Response(resp)
#                 user.set_password(new_password)
#                 user.save()
#                 resp = {
#                     "status": "success",
#                     "message": "Password changed successfully"
#                 }
#                 return Response(resp)
#         else:
#             resp = {
#                 "status": "failure",
#                 "message": serializer.errors
#             }
#             return Response(resp)
#
#
# @extend_schema(tags=['staff'])
# class StaffForgotPasswordAPIView(APIView):
#     """This class is used for staff if they forgot their password
#
#     Args:
#         APIView (StaffForgotPasswordAPIView): For forgot password
#
#     Returns:
#         JSON Response : Success or Failure
#     """
#
#     @extend_schema(request=UserForgotPasswordSerializer)
#     def post(self, request, *args, **kwargs):
#         """ **User Forgot Password**
#
#         Path Parameters:
#         -----------------
#             json_data
#                 email : string
#
#         Returns:
#         -----------
#             JSON Response : Sucess or Failure Messages
#         """
#         serializer = UserForgotPasswordSerializer(data=request.data)
#         if serializer.is_valid(raise_exception=True):
#             email = serializer.validated_data.get("email")
#             try:
#                 staff = User.objects.get(user__email=email)
#                 user = staff.user
#                 domain = 'localhost:3004'
#                 url = 'http://' + domain
#                 html_content = render_to_string(
#                     'passwordresetemail.html',
#                     {
#                         'domain': url, 'email': email,
#                         'token': password_reset_token.make_token(user),
#                         'uid': urlsafe_base64_encode(
#                             encoding.force_bytes(user.pk)),
#                         'user': user,
#                     })
#                 email_subject = "PasswordReset Email"
#                 SendThreadMail.send_html_mail(self, email_subject, html_content, [email], settings.EMAIL_HOST_USER)
#                 resp = {
#                     "status": "success",
#                     "message": "Password Reset Link has been send to your email. Please check your email."
#                 }
#             except Exception as e:
#                 resp = {
#                     "status": "failure",
#                     "message": "You don't have account account with this email. Please provide a valid email address."
#                 }
#             return Response(resp)
#         else:
#             resp = {
#                 "status": "failure",
#                 "message": serializer.errors
#             }
#             return Response(resp)


@extend_schema(tags=["merchant"])
class MerchantForgotPasswordAPIView(APIView):
    """This class is used for Merchant when the Merchant forgot password

    Args:
        APIView (MerchantForgotPasswordAPIView): For Merchant forgot password

    Returns:
        JSON Response : Success or Failure
    """

    @extend_schema(request=UserForgotPasswordSerializer)
    def post(self, request, *args, **kwargs):
        """**Merchant Forgot Password**
        ------------------------------------------

        Path Parameter:
        ----------------
            json_data
                email : string
        Returns:
        -----------
        JSON Response : Success or Failure
        """

        serializer = UserForgotPasswordSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            email = serializer.validated_data.get("email")
            try:
                merchant_obj = Merchant.objects.get(user__email=email)
                user = merchant_obj.user
                domain = "localhost:3004"
                url = "http://" + domain
                html_content = render_to_string(
                    "passwordresetemail.html",
                    {
                        "domain": url,
                        "email": email,
                        "token": password_reset_token.make_token(user),
                        "uid": urlsafe_base64_encode(encoding.force_bytes(user.pk)),
                        "user": user,
                    },
                )
                email_subject = "PasswordRet Mail"
                SendThreadMail.send_html_mail(
                    self, email_subject, html_content, [email], settings.EMAIL_HOST_USER
                )
                resp = {
                    "status": "success",
                    "message": "Password Reset Link has been send to your email. Please check your email.",
                }
            except Exception as e:
                resp = {
                    "status": "failure",
                    "message": "You don't have account account with this email. Please provide a valid email address.",
                }
            return Response(resp)
        else:
            resp = {"status": "failure", "message": serializer.errors}
            return Response(resp)


# @extend_schema(tags=['staff'])
# class StaffResetPasswordAPIView(APIView):
#     """This class represents a password reset password request for a staff
#
#     Args:
#         APIView (StaffResetPasswordAPIView): For staff reset password
#     """
#
#     def get(self, request, uidb64, token, *args, **kwargs):
#         """**Staff Reset Password**
#
#         Path Parameter:
#         ----------------
#             form_data{
#                 token : string
#                 uidb64 : string
#             }
#
#         Returns:
#         ---------
#             JSON Response : Success or Failure Messages
#         """
#         try:
#             uid = encoding.force_text(urlsafe_base64_decode(uidb64))
#             user = User.objects.get(id=uid)
#             if user is not None and password_reset_token.check_token(user, token):
#                 resp = {"status": "success", "message": "Token is valid", "validlink": True}
#             else:
#                 resp = {"status": "failure", "message": "Token is invalid, please request new one."}
#         except Exception as e:
#
#             resp = {
#                 "status": "failure",
#                 "message": "Invalid token",
#                 "validlink": False
#             }
#         return Response(resp)
#
#     @extend_schema(request=UserResetPasswordSerializer)
#     def post(self, request, *args, **kwargs):
#         """ Staff Reset Password
#
#         Parameter:
#         ----------
#             form_data{
#                 token : string
#                 uidb64 : string
#             }
#
#         Returns:
#         ---------
#             JSON Response : Success or Failure Messages
#         """
#         password = UserResetPasswordSerializer(data=request.data)
#         if password.is_valid(raise_exception=True):
#             try:
#                 token = self.kwargs.get("token")
#                 uidb64 = self.kwargs.get("uidb64")
#                 uid = encoding.force_text(urlsafe_base64_decode(uidb64))
#                 user = User.objects.get(id=uid)
#                 if user is not None and password_reset_token.check_token(user, token):
#                     new_password2 = password.validated_data.get("new_password2")
#                     old_password = user.password
#                     if user.check_password(new_password2):
#                         resp = {"new_password1": ["New password cannot be the same as your old password!"]}
#                         return Response(resp)
#                     user.set_password(new_password2)
#                     user.save()
#                     return Response({"status": "success", "message": "Password reset success."})
#             except Exception as e:
#
#                 resp = {
#                     "status": "failure",
#                     "message": "Password did not match!"
#                 }
#             return Response(resp)
#         else:
#             resp = {
#                 "status": "failure",
#                 "message": password.errors
#             }
#             return Response(resp)
#


@extend_schema(tags=["merchant"])
class MerchantResetPasswordAPIView(APIView):

    def get(self, request, uidb64, token, *args, **kwargs):
        """**Merchant Reset Password**
        ---------------------------------------

        Path Parameter:
        --------------------
            form_data{
                token : string
                uidb64 : string
            }

        Returns:
        ---------------------------
        JSON Response : Success or Failure Messages
        """
        try:
            uid = encoding.force_text(urlsafe_base64_decode(uidb64))
            user = User.objects.get(id=uid)
            if user is not None and password_reset_token.check_token(user, token):
                resp = {
                    "status": "success",
                    "message": "Token is valid",
                    "validlink": True,
                }
            else:
                resp = {
                    "status": "failure",
                    "message": "Token is invalid, please request new one.",
                }
        except Exception as e:

            resp = {"status": "failure", "message": "Invalid token", "validlink": False}
        return Response(resp)

    @extend_schema(request=UserResetPasswordSerializer)
    def post(self, request, *args, **kwargs):
        """**Merchant Reset Password**
        -----------------------------------

        Parameter:
        ---------
            form_data{
                token : string
                uidb64 : string
            }

        Returns:
        --------------------
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
                        resp = {
                            "new_password1": [
                                "New password cannot be the same as your old password!"
                            ]
                        }
                        return Response(resp)
                    user.set_password(new_password2)
                    user.save()
                    return Response(
                        {"status": "success", "message": "Password reset success."}
                    )
            except Exception as e:

                resp = {"status": "failure", "message": "Password did not match!"}
            return Response(resp)
        else:
            resp = {"status": "failure", "message": password.errors}
            return Response(resp)


@extend_schema(tags=["merchant"])
class MerchantProfileGetUpdateAPIView(APIView):
    """This class provides access to the Merchant Profile

    Args:
        APIView (MerchantProfileGetUpdateAPIView): For Merchant Profile Get Update

    Returns:
        JSON response : Success or Failure
    """

    permission_classes = [MerchantOnlyPermission]

    def get(self, request, *args, **kwargs):
        """**Merchant Profile Get**
        -----------------------------------

        Path Parameter:
        --------------
            form_data{
                id : string
            }

        Returns:
        -----------
        JSON Response : Success or Failure Messages
        """
        merchant_obj = Merchant.objects.get(user=request.user)
        serializer = MerchantProfileSerializer(
            merchant_obj, context={"request": request}
        )
        resp = {"status": "success", "message": serializer.data}
        return Response(resp)

    parser_classes = [FormParser, MultiPartParser]

    @extend_schema(request=MerchantProfileUpdateSerializer)
    def patch(self, request, *args, **kwargs):
        """**Merchant profile update**
        ---------------------------------

        Parameter:
        --------------
            form_data{
                phone : string
                profile_image : string
            }

        Returns:
        -----------
        JSON Response : Success or Failure Messages
        """
        merchant_obj = Merchant.objects.get(user=request.user)
        serializer = MerchantProfileUpdateSerializer(
            merchant_obj, data=request.data, partial=True, context={"request", request}
        )
        if serializer.is_valid():
            serializer.save()
            resp = {"status": "success", "message": "Your Profile is updated."}
        else:
            resp = {"status": "failure", "message": serializer.errors}
        return Response(resp)


def get_merchant(self, merchant_id):
    try:
        return Merchant.objects.get(id=merchant_id)
    except Merchant.DoesNotExist:
        raise Http404


# Merchant Follow API
import requests
import json


@extend_schema(tags=["merchant"])
class MerchantFollowAPIView(APIView):
    permission_classes = [CustomerOnlyPermission]

    def post(self, request, merchant_id, *args, **kwargs):
        """
         Merchant Follow API class for  Merchant Follow
         -----------------------------------------------------------

        Parameter:
         ------------
             form_data {
                 merchantId : integer
                 }
         Returns:
         ------------------------------------------------------------
         JSON Response : Success or Failure Messages
        """
        webhook_url = "https://webhook.site/41f690b7-d3da-4a16-8730-50dbf4fc9270"
        merchant = get_merchant(self, merchant_id)
        obj, created = Follow.objects.update_or_create(merchant=merchant)
        customer = request.user.customer
        if customer not in obj.followers.all():
            obj.followers.add(request.user.customer)
            resp = {"status": "success", "message": f"You have followed {merchant}"}
            data = {"name": "Follow", "message": "You have followed."}
        else:
            obj.followers.remove(request.user.customer)
            resp = {"status": "success", "message": f"You have unfollowed {merchant}"}
            data = {"name": "Follow", "message": "You have unfollowed."}
        r = requests.post(
            webhook_url,
            data=json.dumps(data),
            headers={"Content-Type": "application/json"},
        )
        return Response(resp)


@extend_schema(tags=["merchant"])
class MerchantRatingListView(generics.ListAPIView):
    """
     Merchant List Client API class for listing Merchant Client
     -----------------------------------------------------------

    Parameter:
     ------------
         form_data {
                 username : string
                 email :string
                 password : string
                 phone : string
                 profile_image : string
                 full_name : string
             }
     Returns:
     ------------------------------------------------------------
     JSON Response : Success or Failure Messages
    """

    queryset = MerchantRating.objects.filter(status="Active")
    serializer_class = MerchantRatingListSerializer
    pagination_class = LargeResultsSetPagination
    permission_classes = [MerchantAndStaffPermission]


@extend_schema(tags=["merchant"])
class MerchantStaffRegistrationAPIView(APIView):
    """The class representing the Merchant staff registration.

    Args:
        APIView (MerchantStaffRegistrationAPIView): For the Merchant staff registration

    Returns:
        JSON response : Success or Failure
    """

    parser_classes = (FormParser, MultiPartParser)

    @extend_schema(request=MerchantStaffRegistrationSerializer)
    def post(self, request, *args, **kwargs):
        """
         Merchant List Client API class for listing Merchant Client
         -----------------------------------------------------------

        Parameter:
         ------------
             form_data {
                 username : string
                 email :string
                 password : string
                 phone : string
                 profile_image : string
                 full_name : string
                 }
         Returns:
         ------------------------------------------------------------
         JSON Response : Success or Failure Messages
        """
        serializer = MerchantStaffRegistrationSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            username = serializer.validated_data.get("username")
            email = serializer.validated_data.get("email")
            password = serializer.validated_data.get("password")
            phone = serializer.validated_data.get("phone")
            profile_image = serializer.validated_data.get("profile_image")
            full_name = serializer.validated_data.get("full_name")
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                is_superuser=False,
                is_staff=False,
                is_active=True,
            )
            merchant = Employee.objects.create(
                status="Active",
                user=user,
                full_name=full_name,
                phone=phone,
                profile_image=profile_image,
                merchant=request.user.merchant,
            )
            domain = "localhost:3004"
            url = f"http://{domain}"
            html_content = render_to_string(
                "merchantstaff.html",
                {
                    "domain": url,
                    "email": email,
                    "token": password_reset_token.make_token(user),
                    "uid": urlsafe_base64_encode(encoding.force_bytes(user.pk)),
                    "user": user,
                    "merchant": request.user.merchant.merchant_name,
                    "password": password,
                },
            )
            email_subject = "Activate your account"
            SendThreadMail.send_html_mail(
                self, email_subject, html_content, [email], settings.EMAIL_HOST_USER
            )
            resp = {
                "status": "success",
                "message": "Congratulations! The staff account has been succesfully created.",
            }
        else:
            resp = {"status": "failure", "message": serializer.errors}
        return Response(resp)


@extend_schema(tags=["merchant"])
class MerchantListClientView(generics.ListAPIView):
    """
     Merchant List Client API class for listing Merchant Client
     -----------------------------------------------------------

    Parameter:
     ------------
        query_parameters:
        -------
         action {
             page : integer
             page_size :integer
             search : string
             }
     Returns:
     ------------------------------------------------------------
     JSON Response : Success or Failure Messages
    """

    serializer_class = MerchantListSerializer
    queryset = Merchant.objects.all()
    search_fields = ["merchant_name"]
    pagination_class = CustomPagination
    filter_backends = [filters.SearchFilter]


@extend_schema(tags=["merchant"])
class MerchantProfileClientView(generics.RetrieveAPIView):
    """
     Merchant Profile Client API class for View Merchant Profile
     -----------------------------------------------------------

    Path Parameter:
     ------------
         form_data{
             id : integer
             }


     Returns:
     ------------------------------------------------------------
     JSON Response : Success or Failure Messages
    """

    serializer_class = ClientMerchantProfileSerializer
    queryset = Merchant.objects.all()
    lookup_field = "id"
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["merchant_name"]


@extend_schema(tags=["account"])
class AccountPasswordChangeAPIView(generics.CreateAPIView):
    """This class is used to change the password of a staff

    Args:
        APIView (StaffPasswordChangeAPIView): For the staff password change

    Returns:
        JSON Response : Success or Failure
    """

    serializer_class = UserPasswordChangeSerializer

    # permission_classes = [AllStaffPermission]
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            user: User = request.user
            user.set_password(serializer.validated_data["new_password"])
            if not user.is_verified:
                user.is_verified = True
            # try:
            #     social = UserSocialAuth.objects.get(user=user)
            #     user.social_only = False
            # except UserSocialAuth.DoesNotExist:
            #     pass
            user.save()
            return Response({"detail": "password successfully changed"})
