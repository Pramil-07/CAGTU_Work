from rest_framework import permissions
from django.contrib.auth import get_user_model

from apps.accountapp.models import Merchant

User = get_user_model()


class AdminOnlyPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return user.is_staff
        # try:
        #     staff = user.staff
        #     if staff.role == "admin":
        #         if staff.status == "Active":
        #             has_perm = True
        #         else:
        #             has_perm = False
        #     else:
        #         has_perm = False
        #     return has_perm
        # except Exception as e:
        #     has_perm = False


class MaintainerOnlyPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return user.is_staff
        # try:
        #     staff = user.staff
        #     if staff.role == "admin" or staff.role == "maintainer":
        #         if staff.status == "Active":
        #             has_perm = True
        #         else:
        #             has_perm = False
        #     else:
        #         has_perm = False
        #     return has_perm
        # except Exception as e:
        #
        #     has_perm = False
        # return has_perm


class AllStaffPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return user.is_staff


class MerchantAndStaffPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        user = request.user
        try:
            merchant = user.merchant
            if merchant.status == "Active":
                has_perm = True
            else:
                has_perm = False
            return has_perm
        except Exception as e:
            has_perm = False
        try:
            staff = user.staff
            if staff.status == "Active":
                has_perm = True
            else:
                has_perm = False
            return has_perm
        except Exception as e:
            has_perm = False

        return has_perm


class CustomerStaffPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        user = request.user


        try:
            customer = user.customer
            if customer:
                has_perm = True
            else:
                has_perm = False
            return has_perm
        except Exception as e:
            has_perm = False
        try:
            staff = user.staff
            if staff:
                has_perm = True
            else:
                has_perm = False
            return has_perm
        except Exception as e:
            has_perm = False
        return has_perm


class AllStaffPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return user.is_staff


class MerchantOnlyPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        user = request.user
        try:
            merchant: Merchant = user.merchant
            return merchant.status == "Active"
            #     has_perm = True
            # else:
            #     has_perm = False
            # return has_perm
        except AttributeError as e:
            return False


class CustomerOnlyPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        user: User = request.user
        if not user.is_authenticated:
            return False
        return user.is_customer
