from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from apps.accountapp.api.v1.api import *

from apps.accountapp.api.v1.staff import (
    StaffRegistrationAPIView,
    StaffRetrieveUpdateDestroyAPIView,
    StaffListAPIView,
    StaffForgotPasswordAPIView,
    StaffResetPasswordAPIView,
    StaffLoginAPIView,
    StaffMyProfileAPIView,
)
from apps.accountapp.api.v1.customer import (
    CustomerRegistrationAPIView,
    CustomerLoginAPIView,
)

urlpatterns = [
    path(
        "customer/registration/",
        CustomerRegistrationAPIView.as_view(),
        name="customerregisterapi",
    ),
    path("customer/login/", CustomerLoginAPIView.as_view(), name="customerloginapi"),
    path("cms/customer/list/", CustomerListAPIView.as_view(), name="customerlistapi"),
    path(
        "cms/customer/<uuid:pk>/",
        CmsCustomerProfileView.as_view(),
        name="customerprofilecmsapi",
    ),
    path(
        "customer/status/<int:id>/",
        ChangeCustomerStatusAPIView.as_view(),
        name="customerstatuschangeapi",
    ),
    # path("customer/password-change/", CustomerPasswordChangeAPIView.as_view(), name="customerpasswordchangeapi"),
    path(
        "verify/<uidb64>/<token>/",
        ActivationAccountAPIView.as_view(),
        name="accountverifyapi",
    ),
    path(
        "customer/forgot-password/",
        CustomerForgotPasswordAPIView.as_view(),
        name="customerforgotpasswordapi",
    ),
    path(
        "customer/reset-password/<uidb64>/<token>/",
        CustomerResetPasswordAPIView.as_view(),
        name="userresetpasswordapi",
    ),
    path("customer/profile/", CustomerProfileView.as_view(), name="customerprofileapi"),
    path("staff/login/", StaffLoginAPIView.as_view(), name="staffloginapi"),
    path(
        "staff/register/",
        StaffRegistrationAPIView.as_view(),
        name="staffregistrationapi",
    ),
    path(
        "password-change/",
        AccountPasswordChangeAPIView.as_view(),
        name="account_password_change_apiview",
    ),
    path("staff/list/", StaffListAPIView.as_view(), name="stafflistapi"),
    # path("staff/profile/", StaffProfileAPIView.as_view(), name="staffprofileupdateapi"),
    path(
        "staff/profile/", StaffMyProfileAPIView.as_view(), name="staffprofileupdateapi"
    ),
    path(
        "staff/update/<uuid:pk>/",
        StaffRetrieveUpdateDestroyAPIView.as_view(),
        name="staff_retrieve_update_destroy_apiview",
    ),
    path(
        "staff/forgot-password/",
        StaffForgotPasswordAPIView.as_view(),
        name="staffforgotpasswordapi",
    ),
    path(
        "staff/reset-password/<uidb64>/<token>/",
        StaffResetPasswordAPIView.as_view(),
        name="staffresetpasswordapi",
    ),
    path(
        "merchant/registration/",
        MerchantRegistrationAPIView.as_view(),
        name="merchantregistrationapi",
    ),
    path(
        "merchant/staff/registration/",
        MerchantStaffRegistrationAPIView.as_view(),
        name="merchantstaffregistrationapi",
    ),
    path("merchant/list/", MerchantListAPIView.as_view(), name="merchantlistapi"),
    path(
        "merchant/password-change/",
        MerchantPasswordChangeAPIView.as_view(),
        name="merchantpasswordchangeapi",
    ),
    path(
        "merchant/forgot-password/",
        MerchantForgotPasswordAPIView.as_view(),
        name="merchantforgotpasswordapi",
    ),
    path(
        "merchant/<int:id>/", MerchantProfileView.as_view(), name="merchantprofileapi"
    ),
    path(
        "merchant/profile/",
        MerchantProfileGetUpdateAPIView.as_view(),
        name="merchantprofileupdateapi",
    ),
    # path("merchant-rating/<int:merchant_id>/", MerchantRatingCreateAPIView.as_view(), name="merchantratingapi"),
    path(
        "merchant/status/<int:id>/",
        ChangeMerchantStatusAPIView.as_view(),
        name="merchantstatuschangeapi",
    ),
    path(
        "merchant/reset-password/<uidb64>/<token>/",
        MerchantResetPasswordAPIView.as_view(),
        name="merchantresetpasswordapi",
    ),
    path(
        "user/reset-password-otp/<uidb64>/<otp>/",
        UserResetPasswordOTPAPIView.as_view(),
        name="userresetpasswordapi",
    ),
    path("refresh-token/", TokenRefreshView.as_view(), name="tokenrefresh"),
    # Address and Profile
    path("address/", AddressAPIView.as_view(), name="addressapi"),
    path(
        "address/<int:id>/",
        AddressPatchAndDeleteAPIView.as_view(),
        name="addressdeleteapi",
    ),
    path("profile/", UserProfileView.as_view(), name="userprofileapi"),
    path("profile/list/",UserListView.as_view(), name="userlistapi"),
    path("merchant/login/", MerchantLoginAPIView.as_view(), name="merchantloginapi"),
    path(
        "merchant/send-mail/",
        SendMailToMerchantAPIView.as_view(),
        name="sendmailtomerchantapi",
    ),
    path(
        "merchant/follow/<int:merchant_id>/",
        MerchantFollowAPIView.as_view(),
        name="merchantfollowapiview",
    ),
    path("merchants/", MerchantListClientView.as_view(), name="merchantlistclientview"),
    path(
        "merchant/client/<int:id>/",
        MerchantProfileClientView.as_view(),
        name="merchantprofileclientview",
    ),
]
