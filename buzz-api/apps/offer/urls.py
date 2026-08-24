from django.contrib import admin
from django.urls import path, include
from apps.offer.api import (
    CMSCouponCreateAPIView, CMSCouponPatchAndDeleteAPIView, CouponMultipleDeleteAPIView, GiftCardCreateAPIView,
    BuzzOfferCreateAPIView, BuzzOfferListAPIView, BuzzOfferUpdateDeleteAPIView, OfferTypeAPIView,
)

urlpatterns = [
    path("cms/coupon/", CMSCouponCreateAPIView.as_view(), name="cmscouponcreateapi"),
    path("cms/coupon/<int:coupon_id>/", CMSCouponPatchAndDeleteAPIView.as_view(), name="cmscouponpatchanddeleteapi"),
    path("cms/coupon/multiple-delete/", CouponMultipleDeleteAPIView.as_view(), name="couponmultipledeleteapi"),
    path("giftcard/", GiftCardCreateAPIView.as_view(), name="giftcardapi"),
    path("create/" , BuzzOfferCreateAPIView.as_view(), name="buzzofferapi"),
    path("list/", BuzzOfferListAPIView.as_view(), name="buzzofferlistapi"),
    path("<int:id>/", BuzzOfferUpdateDeleteAPIView.as_view(), name="buzzofferupdatedeleteapi"),

    path('type/', OfferTypeAPIView.as_view(), name='offer-type-list-create'),
    path('type/<int:pk>/', OfferTypeAPIView.as_view(), name='offer-type-update-delete'),

]
