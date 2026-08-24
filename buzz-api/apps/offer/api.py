from itertools import product

from django.core import paginator
from django.db.models import Q
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView

from apps.checkoutapp.models import Order, Cart
from apps.core.pagination import CustomPagination
from apps.core.permissions import MaintainerOnlyPermission
from apps.offer.models import Coupon, BuzzOffer, OfferType
from apps.offer.serializers import (
    CouponCreateSerializer, CouponListSerializer, CouponUpdateSerializer, GiftCartCreateSerializer, BuzzOfferSerializer,
    BuzzOfferCreateSerializer, OfferTypeSerializer
)
from rest_framework.response import Response
from collections import OrderedDict
import random
from rest_framework.permissions import AllowAny

from apps.productapp.models import Product


class CMSCouponCreateAPIView(APIView, PageNumberPagination):
    permission_classes = [MaintainerOnlyPermission]

    @extend_schema(request=CouponCreateSerializer)
    def post(self, request):
        """
        Creating coupon for the user
        ----------------------------------------------------------------

        Request_body
        ----------------------------------------------------------------
            request: json_data
            {
                "deleted_at": DateTime,
                "status": "string", // Pending,
                "coupon_code": "string",
                "value": int,
                "min_order_total": int,
                "num_available": int
            }

        Returns
        ----------------------------------------------------------------
            json response: success or failure messages
        """
        serializer = CouponCreateSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save(added_by=request.user)
            resp = {
                "status": "success",
                "message": "Coupon saved successfully"
            }
        else:
            resp = {
                "status": "failure",
                "message": serializer.errors
            }
        return Response(resp)

    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 1000

    def get_paginated_response(self, data, page, page_num):
        return Response(OrderedDict([
            ('total_pages', self.page.paginator.num_pages),
            ('count', self.page.paginator.count),
            ('current', page),
            ('next', self.get_next_link()),
            ('previous', self.get_previous_link()),
            ('page_size', page_num),
            ('result', data),
        ]))

    def get_queryset(self, request):
        keyword = self.request.GET.get('keyword', '')
        value = self.request.GET.get('value')
        sortBy = self.request.GET.get('sortBy')
        new_queryset = Coupon.objects.filter(
            Q(coupon_code__icontains=keyword) | Q(value__icontains=keyword) |
            Q(added_by__username__icontains=keyword)
        )

        filters = {}
        if value:
            filters['value'] = value
        filter_q = Q(**filters)

        if filters:
            new_queryset.filter(filter_q)
        if sortBy:
            try:
                new_queryset = new_queryset.order_by(sortBy)
            except:
                pass

        return self.paginate_queryset(new_queryset, self.request)

    def get(self, request):
        """
        Getting list of coupons
        ----------------------------------------------------------------

        Parameters
        ----------------------------------------------------------------
            queryparams
                page: integer
                page_size: integer
                search: string

        Returns
        ----------------------------------------------------------------
            json response: lists of coupons
        """
        page = self.request.GET.get('page', 1)
        page_size = self.request.GET.get('page_size', 1000)
        coupon = self.get_queryset(request)
        serializer = CouponListSerializer(coupon, many=True)
        return self.get_paginated_response(serializer.data, page, page_size)


class CMSCouponPatchAndDeleteAPIView(APIView):
    permission_classes = [MaintainerOnlyPermission]

    # def get_object(self, coupon_id):
    #     try:
    #         return Coupon.objects.get(id=coupon_id)
    #     except Coupon.DoesNotExist:
    #         raise Http404

    @extend_schema(request=CouponUpdateSerializer)
    def patch(self, request, coupon_id):
        coupon = get_object_or_404(Coupon, id=coupon_id)
        serializer = CouponUpdateSerializer(coupon, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            resp = {
                "status": "success",
                "message": "Coupon updated successfully"
            }
        else:
            resp = {
                "status": "failure",
                "message": serializer.errors
            }
        return Response(resp)

    def get(self, request, coupon_id):
        """
        Getting coupon information using coupon id
        """
        coupon = get_object_or_404(Coupon, id=coupon_id)
        serializer = CouponListSerializer(coupon)
        resp = {
            "status": "success",
            "data": serializer.data
        }
        return Response(resp)

    def delete(self, request, coupon_id):
        """
        Deleting coupon using coupon_id
        """

        coupon = get_object_or_404(Coupon, id=coupon_id)
        coupon.delete()
        resp = {
            "status": "success",
            "message": "Coupon is successfully deleted."
        }
        return Response(resp)


class CouponMultipleDeleteAPIView(APIView):
    permission_classes = [MaintainerOnlyPermission]

    def delete(self, request, *args, **kwargs):
        """
        Deleting multiple coupons using coupon id list in a single execution
        """
        query_param = self.request.query_params.get('id')  # "[1,2,3]"
        id_list = eval(query_param)
        coupons = Coupon.objects.filter(id__in=id_list)
        if not coupons:
            return Response({"status": "failure", "message": "Please select valid coupon."},
                            status=status.HTTP_404_NOT_FOUND)
        coupons.delete()
        resp = {
            "status": "success",
            "message": "The coupon have been deleted."

        }
        return Response(resp)


# GiftCard

class GiftCardCreateAPIView(APIView):
    """
    APIView class for adding gift cards
    """

    @extend_schema(request=GiftCartCreateSerializer)
    def post(self, request):
        """
        Creating a gift card
        ----------------------------------------------------------------

        Request_body
        ----------------------------------------------------------------
            request: json_data
            {
                "balance": "string",
                "delivery_method": "string",
                "receiver_first_name": "string",
                "receiver_last_name": "string",
                "receiver_address": "string",
                "email": "user@example.com",
                "sender_full_name": "string"
            }

        Returns
        -----------------------------------------------------------------
            json response: success or failure messages
        """
        serializer = GiftCartCreateSerializer(data=request.data)
        if serializer.is_valid():
            gift_card_number = random.randint(100000000000, 999999999999)
            card_pin = random.randint(1000, 9999)
            serializer.save(card_number=gift_card_number, pin=card_pin)
            cart = Cart.objects.create(user=request.user, giftcard_id=serializer.data["id"], quantity=1)
            try:
                order = Order.objects.get(user=request.user, ordered=False)
            except:
                order = Order.objects.create(user=request.user)
            order.cart.add(cart)
            resp = {
                "status": "success",
                "message": "Gift card Added to cart."
            }
        else:
            resp = {
                "status": "failure",
                "message": serializer.errors
            }

        return Response(resp)


class BuzzOfferListAPIView(APIView):
    serializer_class = BuzzOfferSerializer
    permission_classes = (AllowAny,)
    pagination_class=CustomPagination

    def get(self, request, *args, **kwargs):
        offers = BuzzOffer.objects.filter(is_active=True)
        if not offers.exists():
            return Response({"status": "failure", "message": "No Buzz Offer found"})

        paginator = self.pagination_class()
        paginated_qs = paginator.paginate_queryset(offers, request)
        serializer = self.serializer_class(paginated_qs, many=True)
        return paginator.get_paginated_response({"status": "success", "data": serializer.data})




class BuzzOfferCreateAPIView(APIView):
    serializer_class = BuzzOfferSerializer

    def post(self, request, *args, **kwargs):
        try:
            serializer= BuzzOfferCreateSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(status="Active")
                return Response({"status": "success", "message": "Buzz Offer Created"})
            return Response({"status": "failure", "message": serializer.errors})


        except Exception as e:
            return Response({"status": "failure", "message": str(e)})


class BuzzOfferListAPIView(APIView):
    serializer_class = BuzzOfferSerializer
    permission_classes = (AllowAny,)
    pagination_class=CustomPagination

    def get(self, request, *args, **kwargs):
        try:
            offer_type=request.GET.get("offer_type")
            is_featured=request.GET.get("is_featured")

            if offer_type:
                offers = BuzzOffer.objects.filter(status="Active" , offer_type__name__iexact=offer_type)

            if is_featured:
               offers = BuzzOffer.objects.filter(status="Active", is_featured=is_featured)

            else:
               offers = BuzzOffer.objects.filter(status="Active")

            paginator = self.pagination_class()
            paginated_qs=paginator.paginate_queryset(offers, request)   
            serializer = self.serializer_class(paginated_qs, many=True)

            return paginator.get_paginated_response({"status": "success", "data": serializer.data})

        except Exception as e:
            return Response({"status": "failure", "message": str(e)})


class BuzzOfferUpdateDeleteAPIView(APIView):
    serializer_class = BuzzOfferCreateSerializer

    def put(self, request,id, *args, **kwargs):
        try:
            offer=BuzzOffer.objects.filter(id=id).first()
            if offer:
                serializer=self.serializer_class(offer, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save()
                    return Response({"status": "success", "message": "Buzz Offer Updated"})
                return Response({"status": "failure", "message": serializer.errors})
            else:
                return Response({"status": "failure", "message": "Buzz Offer not found"})

        except Exception as e:
            return Response({"status": "failure", "message": str(e)})

    def delete(self, request, id, *args, **kwargs):
        offer = BuzzOffer.objects.filter(id=id).first()
        if offer:
            offer.delete()
            return Response({"status": "success", "message": "Buzz Offer Deleted"})
        else:
            return Response({"status": "failure", "message": "Buzz Offer not found"})




# class OfferTypeAPIView(APIView):
#     serializer_class = OfferTypeSerializer
#
#     def post(self, request, *args, **kwargs):
#         serializer= self.serializer_class(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response({"status": "success", "message": "Offer Type Added"})
#         return Response({"status": "failure", "message": serializer.errors})
#
#     def get(self, request, *args, **kwargs):
#         offers = OfferType.objects.all()
#         serializer = self.serializer_class(offers, many=True)
#         return Response({"status": "success", "data": serializer.data})


class OfferTypeAPIView(APIView):
    serializer_class = OfferTypeSerializer

    def get(self, request, *args, **kwargs):
        offers = OfferType.objects.all()
        serializer = self.serializer_class(offers, many=True)
        return Response({"status": "success", "data": serializer.data}, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"status": "success", "message": "Offer Type Added"}, status=status.HTTP_201_CREATED)
        return Response({"status": "failure", "message": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk=None, *args, **kwargs):
        try:
            offer = OfferType.objects.get(pk=pk)
        except OfferType.DoesNotExist:
            return Response({"status": "failure", "message": "Offer Type not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.serializer_class(offer, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"status": "success", "message": "Offer Type updated"}, status=status.HTTP_200_OK)
        return Response({"status": "failure", "message": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk=None, *args, **kwargs):
        try:
            offer = OfferType.objects.get(pk=pk)
        except OfferType.DoesNotExist:
            return Response({"status": "failure", "message": "Offer Type not found"}, status=status.HTTP_404_NOT_FOUND)

        offer.delete()
        return Response({"status": "success", "message": "Offer Type deleted"}, status=status.HTTP_204_NO_CONTENT)