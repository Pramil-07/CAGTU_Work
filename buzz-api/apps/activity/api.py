from django.db.models import Q
from django.http import Http404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema
from rest_framework.parsers import FormParser, MultiPartParser
from collections import OrderedDict
from rest_framework.pagination import PageNumberPagination

from rest_framework import status, generics, filters

# custom import app
from apps.accountapp.api.v1.serializers import MerchantRatingListSerializer
from apps.accountapp.models import Merchant
from apps.activity.filters import ActivitiesFilterSet
from apps.activity.models import Rating, MerchantRating, Activity, RatingImages
from apps.activity.serializers import (
    RatingCreateSerializer,
    RatingListSerializer,
    RatingUpdateSerializer,
    MerchantRatingUpdateDeleteSerializer,
    MerchantRatingSerializer,
    StaffActivitiesListSerializer,
)
from apps.activity.views import product_purchased_validator
from apps.blogapp.models import BlogPost
from apps.checkoutapp.models import OrderItem
from apps.core.pagination import CustomPagination
from apps.core.permissions import *
from apps.productapp.models import Product, Stock
from utils.exceptions import ValidationError403


class RatingAPIView(APIView):
    """APIView class for rating"""

    def get_object(self, id):
        try:
            return Product.objects.get(id=id)
        except Product.DoesNotExist:
            raise Http404

    permission_classes = [CustomerOnlyPermission]
    parser_classes = [MultiPartParser, FormParser]

    @extend_schema(summary="for creation of rating", request=RatingCreateSerializer)
    def post(self, request, *args, **kwargs):
        serializer_class = RatingCreateSerializer
        product_id = self.request.query_params.get("product_id")
        blog_id = self.request.query_params.get("blog_id")

        if not product_id and not blog_id:
            return Response(
                {"Error": "Either product or blog id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        product = None
        blog = None
        image = None

        if product_id:
            product = self.get_object(product_id)

        if blog_id:
            blog = get_object_or_404(BlogPost, id=blog_id)

        data = request.data
        files = request.FILES.getlist("images")
        print("image files", files)

        rating = Rating.objects.create(
            product=product,
            blog=blog,
            user=request.user,
            rating=data.get("rating"),
            review=data.get("review"),
        )

        for file in files:
            RatingImages.objects.create(rating=rating, image=file)

        serializer = RatingCreateSerializer(rating)

        return Response(serializer.data)


class RatingListAPIView(APIView, PageNumberPagination):
    permission_classes = (AllowAny,)
    """
    APIView class for listing ratings of the products
    """

    page_size = 10
    page_size_query_param = "page_size"
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

    def get_queryset(self, request, slug, *args, **kwargs):
        rating = self.request.GET.get("rating")
        sortBy = self.request.GET.get("sortBy", "-created_at")
        new_queryset = Rating.objects.filter(Q(product__slug=slug) | Q(blog__slug=slug))
        if rating:
            try:
                new_queryset = new_queryset.filter(rating=rating)
            except:
                pass

        if sortBy:
            try:
                new_queryset = new_queryset.order_by(sortBy)
            except:
                pass
        return self.paginate_queryset(new_queryset, self.request)

    def get(self, request, slug, *args, **kwargs):

        page = self.request.GET.get("page", 1)
        page_size = self.request.GET.get("page_size", 10)
        rating = self.get_queryset(request, slug)
        serializer = RatingListSerializer(
            rating, many=True, context={"request": request}
        )
        user = request.user
        product = Product.objects.filter(slug=slug).first()
        if product:
            product_id = product.id

            purchased = False
            if user.is_authenticated:
                purchased = product_purchased_validator(product_id, user)

            paginated = self.get_paginated_response(serializer.data, page, page_size)
            paginated.data["purchased"] = purchased
            return paginated
        return self.get_paginated_response(serializer.data, page, page_size)


class RatingPatchAndDeleteAPIView(APIView):
    """
    APIView class for updating ratings
    """

    permission_classes = [CustomerStaffPermission]

    def get_object(self, request, rating_id, *args, **kwargs):
            rating = get_object_or_404(Rating, id=rating_id)

            if hasattr(request.user, "staff"):
                return rating

            # If user is the owner, allow
            if rating.user == request.user:
                return rating

            resp = {
                "status": "failure",
                "message": "You do not have permission to perform this action.",
            }
            raise ValidationError403(resp)

    def get(self, request, rating_id, *args, **kwargs):
        rating = self.get_object(request, rating_id)
        serializer = RatingListSerializer(rating)
        resp = {"status": "success", "data": serializer.data}
        return Response(resp)

    parser_classes = [MultiPartParser, FormParser]

    @extend_schema(request=RatingUpdateSerializer)
    def patch(self, request, rating_id, *args, **kwargs):
        """
        Updating products rating
        ----------------------------------------------------------------

        Parameters
        ----------------------------------------------------------------
            pathparameters
                rating_id: int

        Request_body
        ----------------------------------------------------------------
            request: form_data
                review: string ( can be null)
                rating: integer
                quality_rating: integer
                vfm_rating: integer
                recommend: boolean
                attachment: string(filefield) (can be null)

        Returns
        -----------------------------------------------------------------
            json response: success or failure messages
        """
        rating = self.get_object(request, rating_id)
        serializer = RatingUpdateSerializer(rating, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            resp = {"status": "success", "message": "Rating has been updated."}
            return Response(resp)
        else:
            resp = {"status": "success", "data": serializer.errors}
            return Response(resp)

    def delete(self, request,  *args, **kwargs):
        rating_id = kwargs.get("rating_id")
        rating = get_object_or_404(Rating, id=rating_id)
        print('delet id hit')
        rating.delete()
        resp = {"status": "success", "message": "Rating has been deleted."}
        return Response(resp)


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from apps.activity.models import Reply, Rating
from .serializers import ReplySerializer

class ReplyListCreateAPIView(APIView):
    """
    List all replies for a rating or create a new reply.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, rating_id , *args , **kwargs):
        replies = Reply.objects.filter(rating_id=rating_id, parent_reply__isnull=True)

        serializer = ReplySerializer(replies, many=True, context={"request": request})
        print("reply", replies , serializer.data)
        return Response(serializer.data)

    def post(self, request, rating_id , *args , **kwargs):
        rating = get_object_or_404(Rating, id=rating_id)
        serializer = ReplySerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            parent_reply = serializer.validated_data.get("parent_reply", None)
            if parent_reply and parent_reply.get_depth() >= 3:
                return Response(
                    {"detail": "Maximum reply depth of 3 levels reached."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            serializer.save(user=request.user, rating=rating)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReplyDetailAPIView(APIView):
    """
    Retrieve, update, or delete a specific reply.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk , *args , **kwargs):
        return get_object_or_404(Reply, pk=pk)

    def get(self, request, pk , *args , **kwargs):
        reply = self.get_object(pk)
        serializer = ReplySerializer(reply, context={"request": request})
        return Response(serializer.data)

    def put(self, request, pk , *args , **kwargs):
        reply = self.get_object(pk)
        serializer = ReplySerializer(reply, data=request.data, partial=True, context={"request": request})
        if serializer.is_valid():
            parent_reply = serializer.validated_data.get("parent_reply", reply.parent_reply)
            if parent_reply and parent_reply.get_depth() >= 3:
                return Response(
                    {"detail": "Maximum reply depth of 3 levels reached."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk , *args , **kwargs):
        reply = self.get_object(pk)
        reply.delete()
        return Response({"detail": "Reply deleted successfully."}, status=status.HTTP_204_NO_CONTENT)




class MerchantratingPatchAndDeleteView(APIView):
    permission_classes = [CustomerStaffPermission]

    def get_object(self, request, rating_id, *args, **kwargs):
        try:
            merchant_rating = MerchantRating.objects.get(id=rating_id)
            try:
                if request.user.staff:
                    return merchant_rating
            except Exception:
                if request.user.customer == merchant_rating.customer:
                    return merchant_rating
                resp = {
                    "status": "failure",
                    "message": "You do not have permission to perform this action.",
                }
                return ValidationError403(resp)

        except MerchantRating.DoesNotExist as e:
            raise Http404 from e

    def get(self, request, rating_id, *args, **kwargs):
        """**Merchant Rating API View**
        ------------------------------

        Path Parameter:
        --------------
            form_data:
                    id : int
        Returns:
        -----------
        JSON Response : Success or Failure Messages
        """
        rating = self.get_object(request, rating_id)
        serializer = MerchantRatingListSerializer(rating)
        resp = {"status": "success", "data": serializer.data}
        return Response(resp)

    parser_classes = [MultiPartParser, FormParser]

    @extend_schema(request=MerchantRatingUpdateDeleteSerializer)
    def patch(self, request, rating_id, *args, **kwargs):
        """
         **Merchant Rating API class for  Merchant Rating Update**
         -----------------------------------------------------------

        Parameter:
         ------------
             form_data:
                     ratingId : integer
         Returns:
         ------------------------------------------------------------
         JSON Response : Success or Failure Messages
        """
        merchant_rating = self.get_object(request, rating_id)
        serializer = MerchantRatingUpdateDeleteSerializer(
            merchant_rating, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            resp = {"status": "success", "message": "Rating has been updated."}
        else:
            resp = {"status": "success", "data": serializer.errors}
        return Response(resp)

    def delete(self, request, rating_id, *args, **kwargs):
        """
         **Merchant Rating delete API for deleting a merchant rating**
         -----------------------------------------------------------

        Path Parameter:
         ------------
             form_data:
                     ratingId : integer
         Returns:
         ------------------------------------------------------------
         JSON Response : Success or Failure Messages
        """
        merchant_rating = self.get_object(request, rating_id)
        merchant_rating.delete()
        resp = {"status": "success", "message": "Merchant Rating has been deleted."}
        return Response(resp)


class MerchantRatingCreateAPIView(APIView):
    """This class is used to create a new MerchantRating

    Args:
        APIView (MerchantRatingCreateAPIView): For creating Merchant ratings

    Returns:
        JSON Response : Success or Failure
    """

    permission_classes = [CustomerOnlyPermission]
    parser_classes = [MultiPartParser, FormParser]

    def get_merchant(self, merchant_id):
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
        try:
            return Merchant.objects.get(id=merchant_id)
        except Merchant.DoesNotExist:
            raise Http404

    @extend_schema(request=MerchantRatingSerializer)
    def post(self, request, merchant_id, *args, **kwargs):
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
        merchant = self.get_merchant(merchant_id)
        merchant_products = Product.all_products.filter(
            user__merchant=merchant
        ).values_list("id", flat=True)
        customer_products = OrderItem.objects.filter(user=request.user).values_list(
            "product_name", flat=True
        )
        check = any(item in merchant_products for item in customer_products)
        if check:
            serializer = MerchantRatingSerializer(data=request.data)
            if serializer.is_valid():
                if MerchantRating.objects.filter(
                    customer=request.user.customer, merchant=merchant
                ):
                    resp = {
                        "status": "failure",
                        "message": "You have already left a rating for this merchant.",
                    }
                else:
                    serializer.save(
                        customer=request.user.customer,
                        merchant=merchant,
                        status="Active",
                    )
                    resp = {
                        "status": "success",
                        "message": "Thank you for your rating.",
                    }
            else:
                resp = {"status": "failure", "message": serializer.errors}
        else:
            resp = {
                "status": "failure",
                "message": "You donnot have permission to give rating to this merchant.",
            }
        return Response(resp)


class StaffActivitiesAPIView(generics.ListAPIView):
    """
    Staff Activities API class for listing staff activities
    -----------------------------------------------------------

    Parameter:
    ------------
       query_parameters:
       -------
        action {
            end_date: string
            page : integer
            page_size :integer
            start_date : string
            }
    Returns:
    ------------------------------------------------------------
    JSON Response : Success or Failure Messages
    """

    serializer_class = StaffActivitiesListSerializer
    queryset = Activity.objects.all()
    pagination_class = CustomPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = ActivitiesFilterSet
