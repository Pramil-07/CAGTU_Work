from django.contrib import admin
from django.urls import path, include
from apps.checkoutapp.api.v1.api import *

urlpatterns = [
    path("cart/create/", CartCreateAPIView.as_view(), name="cartcreateapi"),
    path("cart/", CartDetailAPIView.as_view(), name="cartdetailapiview"),
    path(
        "cart/multiple-remove/",
        MultipleCartItemRemoveView.as_view(),
        name="multiplecartremoveapi",
    ),
    path("cart/<int:cart_id>/", CartUpdateAPIView.as_view(), name="cartupdateapi"),
    # path("decrease-quantity/<int:cart_id>/", DecreaseQuantityAPIView.as_view(), name="decreasequantityapi"),
    path(
        "order/summary/",
        CustomerOrderSummaryAPIView.as_view(),
        name="customerordersummaryapiview",
    ),
    path(
        "order/coupon/", ApplyForCouponAPIView.as_view(), name="applyforcouponapiview"
    ),
    path(
        "delivery-address/", AddDeliveryDetailAPIView.as_view(), name="adddeliveryview"
    ),
    path("billing-address/", BillingAddressCreateAPI.as_view(), name="addbillingview"),
    path("order/confirm/", ConfirmOrderAPIView.as_view(), name="confirmorderapiview"),
    path(
        "order/cancel/<int:order_id>/",
        CancelOrderAPIView.as_view(),
        name="cancelorderapi",
    ),
    path("order/history/", OrderHistoryAPIView.as_view(), name="orderhistoryapiview"),
    path(
        "order/history/<int:pk>/",
        OrderHistoryDetailView.as_view(),
        name="orderhistoryapiview",
    ),
    path(
        "cms/order/history/",
        CMSOrderHistoryAPIView.as_view(),
        name="cmsorderhistoryapiview",
    ),
    path(
        "change/order-status/<int:order_id>/",
        ChangeOrderStatusAPI.as_view(),
        name="changeorderstatusapi",
    ),
    path("orderitem/", OrderItemAPIView.as_view(), name="orderitemapiview"),
]
