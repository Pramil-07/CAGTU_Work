from apps.productapp.models import Product
from django.shortcuts import get_object_or_404
from rest_framework.permissions import BasePermission


def merchantorstaffqueryset(func):
    def inner(self, *args, **kwargs):
        try:
            if self.request.user.merchant:
                return Product.all_products.filter(user=self.request.user)
        except:
            return Product.all_products.all()
        return func(self, *args, **kwargs)

    return inner


def merchantorstaffserializer(func):
    def inner(self, serializer):
        try:
            if self.request.user.merchant:
                return serializer.save(
                    user=self.request.user,
                    type="product",
                    status="Pending",
                    added_by=self.request.user.merchant.merchant_name,
                )
        except:
            return serializer.save(
                user=self.request.user,
                type="product",
                status="Pending",
                added_by="BUZZ MALL",
            )
        return func(self, serializer)

    return inner


def isMerchantOrStaff(func):
    def inner(self, id):
        print("Hello")
        product_obj = get_object_or_404(Product, id=id)
        try:
            if self.request.user.merchant:
                if product_obj.user == self.request.user:
                    return product_obj
                else:
                    return "Error"
        except:
            if self.request.user.staff:
                return product_obj
        return func(self)

    return inner


class IsSuperAdminUser(BasePermission):
    message = "only superuser can perform this action."

    def has_permission(self, request, view):
        return request.user and request.user.is_superuser
