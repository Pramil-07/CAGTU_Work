from django.core.paginator import Paginator
from django.db.models.signals import post_save, post_delete
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import PermissionDenied

from apps.core.cache import CustomCache
from apps.core.pagination import CustomPagination
from .serializers import *

from rest_framework.views import APIView
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from rest_framework.parsers import FormParser, MultiPartParser, FileUploadParser

from ...decorators import IsSuperAdminUser
from ...helpers import *
from collections import OrderedDict

from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser

from .api_cms import ValidationError403
import random
from rest_framework import status, generics, filters
from django_filters.rest_framework import DjangoFilterBackend

# custom import app
from apps.core.permissions import *
from apps.core.utils import *
from apps.checkoutapp.models import Order
from apps.productapp.filters import ProductFilterSet
from django.core.exceptions import ObjectDoesNotExist
from django.dispatch import receiver


def get_active_product_object(self, id):
    """
    To get active product object
    """
    try:
        return Product.objects.get(id=id, status="Active")
    except ObjectDoesNotExist:
        raise Http404


def get_stock_object(self, id):
    """
    To get stock object
    """
    try:
        return Stock.objects.get(id=id)
    except ObjectDoesNotExist:
        raise Http404


def get_stock_and_product_validate(self, product_id, stock_id):
    try:
        return Stock.objects.get(id=stock_id, product_id=product_id)
    except ObjectDoesNotExist:
        raise Http404


class WishListGenericListAPIView(generics.ListAPIView):

    serializer_class = WishListSerializer
    pagination_class = CustomPagination
    ordering_fields = ("name", "created_at", "stocks__price")
    permission_classes = [CustomerOnlyPermission]

    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            raise PermissionDenied("Authentication required")
        if user.is_authenticated:
            return WishList.objects.filter(user=user)  # Always return a queryset
        else:
            raise PermissionDenied("Authentication required")


class WishListClearAPIView(APIView):
    """
    API View class for clearing wish list of specific user

    Methods:
        delete(request):
            deletes the wishlist
    """

    permission_classes = [CustomerOnlyPermission]

    def delete(self, request):
        """
        Deletes/Clears the wishlist of the specific user

        """
        WishList.objects.filter(user=request.user).delete()
        return Response({"status": "success", "message": "Wish list cleared"})


class WishListAPIView(APIView):
    """
    st.    API View class for getting wishlist and clearing the product from
        the wish li


        Methods:
            get(request)
                return the wishlist of the user if it exists
            delete(request)
                clears the product from the wishlist
    """

    permission_classes = [CustomerOnlyPermission]

    @CustomCache.cache_response("wishlist:user:{request.user.id}", timeout=300)
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def get(self, request):
        """
        Returns wishlist of specified customer
        """
        wish = WishList.objects.filter(user=request.user)
        serializer = WishListSerializer(wish, context={"request": request})
        try:
            wish = WishList.objects.get(user=request.user)
            resp = {"status": "success", "data": serializer.data}
        except WishList.DoesNotExist:
            wish_create = WishList.objects.create(user=request.user)
            wish = WishList.objects.get(user=request.user)
            serializer = WishListSerializer(wish, context={"request": request})
            resp = {"status": "success", "data": serializer.data}
        return Response(resp)

    def delete(self, request):
        """
        clear the product from wishlist
        """
        try:
            wish = WishList.objects.get(user=request.user)
            wish.product.clear()
            resp = {"status": "success", "message": "Wish List cleared."}
        except Exception as e:
            resp = {"status": "failure", "message": "WishList cannot be found."}
        return Response(resp)


class AddRemoveWishAPIView(APIView):
    """
    API View class for adding or removing products in wish list
    """

    permission_classes = [CustomerOnlyPermission]

    def post(self, request, product_id, stock_id, *args, **kwargs):
        """
        For adding or removing products in wish list
        ----------------------------------------------------------------

        Parameters
        ----------------------------------------------------------------
            pathparameters
                product_id: int
                stock_id: int

        Returns
        ----------------------------------------------------------------
            json response: success or failure messages
        """
        product = get_active_product_object(self, product_id)
        stock = get_stock_and_product_validate(self, product_id, stock_id)
        wishlist = WishList.objects.filter(user=request.user)
        try:
            remove_from_wish = WishList.objects.get(
                user=request.user, product=product, stock=stock
            ).delete()
            resp = {
                "status": "success",
                "message": "Product has been removed from Wish list.",
            }
        except ObjectDoesNotExist:
            add_to_wish = WishList.objects.create(
                user=request.user, product=product, stock=stock
            )
            resp = {
                "status": "success",
                "message": "Product has been added to Wish list.",
            }
        except Exception as e:
            resp = {"status": "failure", "message": str(e)}
        return Response(resp)


class ProductGenericListByCategory(generics.ListAPIView):
    """
    Generic APIView class for listing products
    ----------------------------------------------------------------

    Parameters
    ----------------------------------------------------------------
        pathparameters
            category_slug: string
        queryparams
            ordering: string
            page: integer
            page_size: integer
            search: string

    Returns
    ----------------------------------------------------------------
        json response: lists of products
    """

    # queryset=Product.all_products.all()
    serializer_class = ProductListSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        "name",
        "category__name",
        "model_no",
        "product_status",
        "slug",
        "stocks__sku",
        "created_at",
    ]
    filterset_class = ProductFilterSet
    pagination_class = CustomPagination
    ordering_fields = ("name", "created_at", "stocks__price")

    # permission_classes=[MerchantAndStaffPermission]
    @CustomCache.cache_response(
        "products:category:{category_slug}:{request.GET.page}", timeout=300
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def get_queryset(self):
        category_slug = self.kwargs["category_slug"]
        category_list = []
        try:
            category = Category.objects.get(slug=category_slug)
        except Exception as e:
            raise Http404
        if category.level == 2:
            category_list.append(category)
        elif category.level == 1:
            child_category = Category.objects.filter(parent=category)
            category_list += child_category
        else:
            child_category = Category.objects.filter(parent=category)
            for one in child_category:
                grand_child_category = Category.objects.filter(parent=one)
                category_list += grand_child_category
        return Product.objects.filter(category__in=category_list).select_related(
            "category"
        )


class ProductListByCategory(APIView, PageNumberPagination):
    """
    APIView class for listing products by category
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

    def get_queryset(self, request, category_slug):

        keyword = self.request.GET.get("keyword", "")
        brand = self.request.GET.get("brand")
        color = self.request.GET.get("color")
        rating = self.request.GET.get("rating")
        sortBy = self.request.GET.get("sortBy")

        category_list = []

        try:
            category = Category.objects.get(slug=category_slug)
        except Exception as e:
            raise Http404
        if category.level == 2:
            category_list.append(category)
        elif category.level == 1:
            child_category = Category.objects.filter(parent=category)
            category_list += child_category
        else:
            child_category = Category.objects.filter(parent=category)
            for one in child_category:
                grand_child_category = Category.objects.filter(parent=one)
                category_list += grand_child_category
        new_queryset = Product.objects.filter(
            category__in=category_list
        ).select_related("category")
        new_queryset = new_queryset.filter(
            Q(name__icontains=keyword)
            | Q(brand__name__icontains=keyword)
            | Q(model_no__icontains=keyword)
        )

        filters = {}
        if brand:
            filters["brand__name"] = brand
        if color:
            filters["color"] = color
        filter_q = Q(**filters)

        if filters:
            new_queryset.filter(filter_q)
        if sortBy:
            try:
                new_queryset = new_queryset.order_by(sortBy)
            except:
                pass

        try:
            if sortBy == "-rating":
                new_queryset = new_queryset.annotate(avg_rating=Avg("rating")).order_by(
                    "-avg_rating"
                )
            elif sortBy == "rating":
                new_queryset = new_queryset.annotate(avg_rating=Avg("rating")).order_by(
                    "avg_rating"
                )
            else:
                new_queryset = new_queryset.order_by(sortBy)
        except:
            pass

        return self.paginate_queryset(new_queryset, self.request)

    @CustomCache.cache_response(
        "products:category:{category_slug}:{request.GET.page}:{request.GET.keyword}:{request.GET.brand}:{request.GET.color}:{request.GET.sortBy}",
        timeout=600,
    )
    def get(self, request, category_slug):
        """
        Reurns list of products
        ----------------------------------------------------------------

        Parameters
        ----------------------------------------------------------------
            pathparameters
                category_slug: slug
                page: int
                page_size: int

        Returns
        ----------------------------------------------------------------
            json response: list of products by category
        """
        page = self.request.GET.get("page", 1)
        page_size = self.request.GET.get("page_size", 10)
        merchant = self.get_queryset(request, category_slug)
        serializer = ProductListSerializer(
            merchant, many=True, context={"request": request}
        )
        return self.get_paginated_response(serializer.data, page, page_size)


class ProductsListByTagView(APIView):
    @CustomCache.cache_response("product:tag:{tag_name}", timeout=300)
    def get(self, request, *args, **kwargs):
        tag_name = request.query_params.get("tag_name")

        if tag_name:
            # Get products for the specific tag
            tag = Tag.objects.filter(slug=tag_name).first()
            if not tag:
                return Response({"detail": "Tag not found"}, status=404)

            products = tag.products.all()
            serializer = ProductListSerializer(products, many=True)
            return Response({tag_name: serializer.data})

        else:
            """
            If no tag_name query Returns all products with their nested tags.
            """
            products = Product.objects.all()
            serializer = ProductListSerializer(products, many=True)
            return Response(serializer.data)


class TrendingProductListAPIView(APIView):

    def get(self, request, *args, **kwargs):
        products = (
            Product.objects.annotate(
                avg_rating=Avg("reviews__rating"),
                total_ratings=Count("reviews"),
            )
            .filter(total_ratings__gte=1, avg_rating__gte=3)
            .order_by("-avg_rating", "-total_ratings")
        )
        serializer = ProductListSerializer(products, many=True)
        return Response(serializer.data)


class ProductListByBrand(APIView, PageNumberPagination):
    """
    APIView class for product listing by brand
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

    def get_queryset(self, request, brand_slug):

        keyword = self.request.GET.get("keyword", "")
        color = self.request.GET.get("color")
        rating = self.request.GET.get("rating")
        sortBy = self.request.GET.get("sortBy")

        new_queryset = Product.objects.filter(brand__slug=brand_slug)
        new_queryset = new_queryset.filter(
            Q(name__icontains=keyword) | Q(model_no__icontains=keyword)
        )
        filters = {}
        if color:
            filters["color"] = color
        filter_q = Q(**filters)

        if filters:
            new_queryset.filter(filter_q)
        if sortBy:
            try:
                new_queryset = new_queryset.order_by(sortBy)
            except:
                pass

        try:
            if sortBy == "-rating":
                new_queryset = new_queryset.annotate(avg_rating=Avg("rating")).order_by(
                    "-avg_rating"
                )
            elif sortBy == "rating":
                new_queryset = new_queryset.annotate(avg_rating=Avg("rating")).order_by(
                    "avg_rating"
                )
            else:
                new_queryset = new_queryset.order_by(sortBy)
        except:
            pass

        return self.paginate_queryset(new_queryset, self.request)

    def get(self, request, brand_slug):
        """
        Listing products by brand name
        ----------------------------------------------------------------

        Parameters
        ----------------------------------------------------------------
            pathparameters
                page: int
                page_size: int
                brand_slug: string

        Returns
        ----------------------------------------------------------------
            json response: list of products
        """
        page = self.request.GET.get("page", 1)
        page_size = self.request.GET.get("page_size", 10)
        products = self.get_queryset(request, brand_slug)
        serializer = ProductListSerializer(
            products, many=True, context={"request": request}
        )
        return self.get_paginated_response(serializer.data, page, page_size)


from rest_framework.permissions import AllowAny
from rest_framework.authentication import BaseAuthentication


class DetailsProductAPIView(APIView):
    permission_classes = (AllowAny,)
    serializer_class = ProductDetailSerializer

    def get(self, request, slug, *args, **kwargs):
        product = Product.objects.get(slug=slug)
        if product is not None:
            serializer = self.serializer_class(product)
            return Response({"Data": serializer.data}, 200)

        return Response({"Data": "cannot find data with  current parameter."}, 404)


class BrandListAPIView(APIView):
    """
    API View class for listing brands
    """

    def get(self, request, *args, **kwargs):
        """
        Getting brands listing
        """
        brands = Brand.objects.all()
        serializer = BrandSerializer(brands, many=True, context={"request": request})
        resp = {"status": "success", "data": serializer.data}
        return Response(resp)


class CMSBrandListCreateAPIViews(APIView):
    permission_classes = (AllowAny,)

    def get(self, request, *args, **kwargs):
        """Getting brand listing for cms"""

        brand = Brand.objects.all()
        serializer = CMSBrandSerializer(brand, many=True, context={"request": request})
        return Response({"status": "success", "data": serializer.data})

    def post(self, request, *args, **kwargs):
        try:
            serializer = BrandSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(
                    {"status": "success", "data": serializer.data},
                    status=status.HTTP_201_CREATED,
                )

            return Response(
                {"status": "Error", "data": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            return Response(
                {
                    "status": "error",
                    "message": "Something went wrong ",
                    "detailed": str(e),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )


class CMSBrandRetriveUpdateDeleteAPIVIew(APIView):
    def put(self, request, id, *args, **kwargs):
        try:
            try:
                brand = Brand.objects.get(id=id)
            except Brand.DoesNotExist:
                return Response(
                    {"status": "error", "message": "Brand not found"},
                    status=status.HTTP_404_NOT_FOUND,
                )
            serializer = CMSBrandSerializer(brand, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(
                    {"status": "success", "data": serializer.data},
                )

        except Exception as e:
            return Response(
                {
                    "status": "error",
                    "message": "Something went wrong ",
                    "detailed": str(e),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

    def delete(self, request, id, *args, **kwargs):
        try:
            brand = Brand.objects.get(id=id)
            brand.delete()
            return Response(
                {"status": "success", "message": "Brand deleted"},
                status=status.HTTP_204_NO_CONTENT,
            )
        except Brand.DoesNotExist:
            return Response(
                {"status": "error", "message": "Brand not found"},
                status=status.HTTP_404_NOT_FOUND,
            )


class CategoryListAPIView(APIView):
    permission_classes = [AllowAny]
    pagination_class = CustomPagination

    @CustomCache.cache_response(
        "categories:list:{request.GET.type}:{request.GET.parent}:{request.GET.page}",
        timeout=300,
    )
    def get(self, request, *args, **kwargs):
        """
        Getting list of categories
        """
        # Base queryset
        queryset = Category.objects.all()
        print("queryset", queryset)

        # ✅ Add filters
        category_type = request.query_params.get("type")
        parent_id = request.query_params.get("parent")

        if category_type:
            print("category_type ", category_type)
            queryset = queryset.filter(type__iexact=category_type)

        if parent_id:
            queryset = queryset.filter(parent_id=parent_id)

        # Your existing logic (if still needed)
        child_objects = (
            Category.objects.filter(level=2)
            .annotate(category_count=Count("id"))
            .values("parent")
        )
        parent_objects = (
            Category.objects.filter(id__in=child_objects)
            .annotate(category_count=Count("id"))
            .values("parent")
        )

        # Pagination
        paginator = self.pagination_class()
        paginated_data = paginator.paginate_queryset(queryset, request, view=self)
        serializer = CategoryListClientSerializer(paginated_data, many=True)
        return paginator.get_paginated_response(serializer.data)


@extend_schema(tags="category")
class CategoryCreateAPIView(APIView):
    serializer_class = CategoryCreateClientSerializer
    permission_classes = [IsSuperAdminUser]

    def post(self, request, *args, **kwargs):
        data = request.data
        print("data", data)
        if not data:
            return Response(
                {"status": "Error", "message": "Missing data"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            serializer = self.serializer_class(data=data)
            if serializer.is_valid():
                serializer.save()
                return Response(
                    {"status": "Success", "data": serializer.data},
                    status=status.HTTP_201_CREATED,
                )
            return Response(
                {"status": "Error", "errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:
            return Response(
                {
                    "status": "Error",
                    "message": str(e),
                }
            )

    def put(self, request, *args, **kwargs):
        data = request.data
        category_id = data.get("id")

        if not category_id:
            return Response({"status": "Error", "message": "Missing data"}, status=400)

        try:
            category = Category.objects.get(id=category_id)
            print("category", category)
        except Category.DoesNotExist:
            return Response(
                {"status": "Error", "message": "Category not found"}, status=404
            )

        serializer = self.serializer_class(instance=category, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"status": "Success", "data": serializer.data}, status=200)

        return Response({"status": "Error", "data": serializer.errors}, status=400)

    def delete(self, request, *args, **kwargs):
        id = request.data.get("id")
        category = Category.objects.get(id=id)
        if category:
            category.delete()
            return Response(
                {"Category deleted successfully."}, status=status.HTTP_200_OK
            )
        return Response({"category does not exist"}, status=status.HTTP_404_NOT_FOUND)


# class ProductListByBrand(APIView):
#     def get_object(self,brand_slug):
#         try:
#             return Product.objects.filter(slug=brand_slug)
#         except Brand.DoesNotExist:
#             raise Http404

#     def get(self,request,brand_slug):
#         products=self.get_object(brand_slug)
#         serializer=ProductListSerializer(products,many=True)
#         resp={
#             "status":"Success",
#             "data":serializer.data
#         }
#         return Response(resp)


# start
class BuzzProductListAPIView(APIView, PageNumberPagination):
    """
    APIView class for listing buzz products
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

    def get_queryset(self, request):
        keyword = self.request.GET.get("keyword", "")
        brand = self.request.GET.get("brand")
        color = self.request.GET.get("color")
        rating = self.request.GET.get("rating")
        sortBy = self.request.GET.get("sortBy")
        new_queryset = Product.products.filter(
            Q(name__icontains=keyword)
            | Q(brand__name__icontains=keyword)
            | Q(model_no__icontains=keyword)
        ).exclude(added_by="merchant")

        filters = {}
        if brand:
            filters["brand__name"] = brand
        if color:
            filters["color"] = color
        filter_q = Q(**filters)

        if filters:
            new_queryset.filter(filter_q)
        if sortBy:
            try:
                new_queryset = new_queryset.order_by(sortBy)
            except:
                pass

        try:
            if sortBy == "-rating":
                new_queryset = new_queryset.annotate(avg_rating=Avg("rating")).order_by(
                    "-avg_rating"
                )
            elif sortBy == "rating":
                new_queryset = new_queryset.annotate(avg_rating=Avg("rating")).order_by(
                    "avg_rating"
                )
            else:
                new_queryset = new_queryset.order_by(sortBy)
        except:
            pass

        return self.paginate_queryset(new_queryset, self.request)

    def get(self, request):
        """
        Listing buzz products
        ----------------------------------------------------------------

        Parameters
        ----------------------------------------------------------------
            queryparams
                page: int
                page_size: int

        Returns
        ----------------------------------------------------------------
            json response: success or failure messages along with corresponding datas
        """
        page = self.request.GET.get("page", 1)
        page_size = self.request.GET.get("page_size", 10)
        products = self.get_queryset(request)
        serializer = ProductListSerializer(
            products, many=True, context={"request": request}
        )
        resp = {"status": "success", "data": serializer.data}

        return self.get_paginated_response(serializer.data, page, page_size)


class ProductListOfMerchant(APIView, PageNumberPagination):
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

    def get_queryset(self, request, merchant_slug):
        keyword = self.request.GET.get("keyword", "")
        brand = self.request.GET.get("brand")
        color = self.request.GET.get("color")
        # rating = self.request.GET.get("rating")
        sortBy = self.request.GET.get("sortBy")
        new_queryset = Product.products.filter(
            Q(name__icontains=keyword)
            | Q(brand__name__icontains=keyword)
            | Q(model_no__icontains=keyword)
        ).filter(user__merchant__slug=merchant_slug)

        filters = {}
        if brand:
            filters["brand__name"] = brand
        if color:
            filters["color"] = color
        filter_q = Q(**filters)

        if filters:
            new_queryset.filter(filter_q)
        if sortBy:
            try:
                new_queryset = new_queryset.order_by(sortBy)
            except:
                pass

        try:
            if sortBy == "-rating":
                new_queryset = new_queryset.annotate(avg_rating=Avg("rating")).order_by(
                    "-avg_rating"
                )
            elif sortBy == "rating":
                new_queryset = new_queryset.annotate(avg_rating=Avg("rating")).order_by(
                    "avg_rating"
                )
            else:
                new_queryset = new_queryset.order_by(sortBy)
        except:
            pass

        return self.paginate_queryset(new_queryset, self.request)

    def get(self, request, merchant_slug):
        """
        Listing products of merchants
        ----------------------------------------------------------------

        Parameters
        ----------------------------------------------------------------
            queryparams
                page: int
                page_size: int

        Returns
        ----------------------------------------------------------------
            json response: success or failure messages along with corresponding datas
        """
        page = self.request.GET.get("page", 1)
        page_size = self.request.GET.get("page_size", 10)
        products = self.get_queryset(request, merchant_slug)
        serializer = ProductListSerializer(
            products, many=True, context={"request": request}
        )
        resp = {"status": "success", "data": serializer.data}

        return self.get_paginated_response(serializer.data, page, page_size)


# class HAStockCreateAPIView(APIView):
#     def get_product_object(self,product_id):
#         try:
#             return Product.all_products.get(id=product_id)
#         except Product.DoesNotExist:
#             raise Http404

#     def get_stock_object(self,product_id):
#         try:
#             return Stock.objects.filter(product_id=product_id)
#         except Stock.DoesNotExist:
#             raise Http404
#     def get(self, request, product_id):
#         product = self.get_product_object(product_id)
#         if product.category.parent.parent.slug == "home-appliances":
#             stock = self.get_stock_object(product_id)
#             serializer = HAStockGetSerializer(stock, many=True)
#             resp = {
#                 "status":"success",
#                 "data":serializer.data
#             }
#         else:
#             resp = {
#                 "status":"failure",
#                 "message":"This product is not home appliance instance."
#             }
#         return Response(resp)
#     @extend_schema(request=HAStockSerializer)
#     def post(self, request,*args,**kwargs):
#         product_id = self.kwargs.get("product_id")
#         product = self.get_product_object(product_id)
#         if product.category.parent.parent.slug == "home-appliances":
#             serializer = HAStockSerializer(data=request.data)
#             if serializer.is_valid():
#                 for stock in serializer.data["stock"]:
#                     stock_serializer = HAStockCreateSerializer(data=stock)
#                     if stock_serializer.is_valid():
#                         stock_serializer.save(product_id=product_id)
#                 resp = {
#                     "status":"success",
#                     "message":"Stocks added Successfully."
#                 }
#             else:
#                 resp = {
#                     "status":"failure main",
#                     "message":serializer.errors
#                 }
#         else:
#             resp = {
#                 "status":"failure",
#                 "message":"This product is not TV instance."
#             }

#         return Response(resp)

# @extend_schema(request=StockHAAllUpdateSerializer)
# def patch(self, request, product_id):
#     """
#     Updating product stock
#     ----------------------------------------------------------------

#     Parameters
#     ----------------------------------------------------------------
#         pathparameters
#             product_id: int

#     Request_body
#     ----------------------------------------------------------------
#         request: json_data
#             {
#             "mrp": int,
#             "price": int,
#             "size": int,
#             "size_type": "string",
#             "color": "string",
#             "availability": bool,
#             "quantity": int,
#             "warranty_type": "string",
#             "warranty_year": int,
#             "build_type": "string",
#             "image": "string"
#             }

#     Returns
#     ----------------------------------------------------------------
#         json response: success or failure messages

#     """
#     stocks = self.get_stock_object(product_id)
#     serializer = StockHAAllUpdateSerializer(data=request.data)
#     if serializer.is_valid():
#         for count, stock_data in enumerate(serializer.data["stock"]):
#             stock_serializer =StockHAUpdateSerializer(
#                     stocks[count], data=stock_data, partial=True
#             )
#             if stock_serializer.is_valid():
#                 stock_serializer.save()
#                 resp = {
#                     "status":"success",
#                     "message":"Stock updated."

#                     }
#                 else:
#                     resp = {
#                         "status":"failure",
#                         "message":"Inside loop"
#                     }

#         else:

#             resp = {
#                 "status":"failure",
#                 "message":serializer.errors
#             }
#         return Response(resp)


# class ComputerStockCreateAPIView(APIView):
#     """
#     APIView class for creating and listing computer stock
#     """
#     def get_product_object(self,product_id):
#         try:
#             return Product.all_products.get(id=product_id)
#         except Product.DoesNotExist as e:
#             raise Http404 from e

#     def get_stock_object(self,product_id):
#         try:
#             return Stock.objects.filter(product_id=product_id)
#         except Stock.DoesNotExist as e:
#             raise Http404 from e
#     def get(self, request, product_id):
#         """
#         Listing computer stocks
#         ----------------------------------------------------------------

#         Parameters
#         ----------------------------------------------------------------
#             pathparameters
#                 product_id: int

#         Returns
#         ----------------------------------------------------------------
#             json response: success or failure messages along with corresponding datas

#         """
#         product = self.get_product_object(product_id)
#         if product.category.parent.parent.slug == "computers":
#             stock = Stock.objects.filter(product_id=product_id)
#             serializer = ComputerStockCreateSerializer(stock, many=True)
#             resp = {
#                 "status":"success",
#                 "data":serializer.data
#             }
#         else:
#             resp = {
#                 "status":"failure",
#                 "message":"This product is not computer instance."
#             }
#         return Response(resp)
#     @extend_schema(request=ComputerStockSerializer)
#     def post(self, request,*args,**kwargs):
#         """
#         Creating computer stock
#         ----------------------------------------------------------------

#         Parameters
#         ----------------------------------------------------------------
#             pathparameters
#                 product_id: int

#         Request_body
#         ----------------------------------------------------------------
#             request : json_data
#             {
#                 "mrp": int,
#                 "price": int,
#                 "size": int,
#                 "size_type": "string",
#                 "color": "string",
#                 "availability": bool,
#                 "quantity": int,
#                 "ram": "string",
#                 "rom": "string",
#                 "processor": "string",
#                 "graphics_card": "string",
#                 "operating_system": "string",
#                 "wireless_connection": bool,
#                 "warranty_type": "string",
#                 "warranty_year": int,
#                 "resolution": "string",
#                 "hdmi_ports_no": int,
#                 "usb_ports_no": int,
#                 "network_compatibility": "string",
#                 "build_type": "string",
#                 "image": "string"
#             }

#         Returns
#         ----------------------------------------------------------------
#             json response: success or failure messages

#         """
#         product_id = self.kwargs.get("product_id")
#         product = self.get_product_object(product_id)
#         if product.category.parent.parent.slug == "computers":
#             serializer = ComputerStockSerializer(data=request.data)
#             if serializer.is_valid():
#                 for stock in serializer.data["stock"]:
#                     stock_serializer = ComputerStockCreateSerializer(data=stock)
#                     if stock_serializer.is_valid():
#                         stock_serializer.save(product_id=product_id)
#                 resp = {
#                             "status":"success",
#                             "message":"Stocks added Successfully."
#                         }
#             else:
#                 resp = {
#                     "status":"failure ",
#                     "message":serializer.errors
#                 }
#         else:
#             resp = {
#                 "status":"failure",
#                 "message":"This product is not computer instance."
#             }

#         return Response(resp)

# @extend_schema(request=StockComputerAllUpdateSerializer)
# def patch(self, request, product_id):
#     """
#     Updating the computer product stock
#     ----------------------------------------------------------------

#     Parameters
#     ----------------------------------------------------------------
#         pathparameters
#             product_id: int

#     Request_body:
#     ----------------------------------------------------------------
#         request: json_data
#         {
#             "mrp": int,
#             "price": int,
#             "size": int,
#             "size_type": "string",
#             "color": "string",
#             "availability": bool,
#             "quantity": int,
#             "ram": "string",
#             "rom": "string",
#             "processor": "string",
#             "graphics_card": "string",
#             "operating_system": "string",
#             "wireless_connection": bool,
#             "warranty_type": "string",
#             "warranty_year": int,
#             "resolution": "string",
#             "hdmi_ports_no": int,
#             "usb_ports_no": int,
#             "network_compatibility": "string",
#             "build_type": "string",
#             "image": "string"
#         }

#     Returns
#     ----------------------------------------------------------------
#         json response: success or failure messages
#     """
#     stocks = self.get_stock_object(product_id)
#     serializer = StockComputerAllUpdateSerializer(data=request.data)
#     if serializer.is_valid():
#         for count, stock_data in enumerate(serializer.data["stock"]):
#             stock_serializer =StockComputerUpdateSerializer(
#                     stocks[count], data=stock_data, partial=True
#             )
#             if stock_serializer.is_valid():
#                 stock_serializer.save()
#                 resp = {
#                     "status":"success",
#                     "message":"Stock updated."

#                     }
#                 else:
#                     resp = {
#                         "status":"failure",
#                         "message":stock_serializer.errors
#                     }

#         else:

#             resp = {
#                 "status":"failure",
#                 "message":serializer.errors
#             }
#         return Response(resp)


from ...recommend import recommend


class SimilarProducts(APIView):

    def get(self, request, pk, *args, **kwargs):
        get_product = get_object_or_404(Product, id=pk)
        print("product ", get_product)
        try:
            recommendations = recommend(get_product.name)
            if not recommendations:
                return Response(
                    {"success": False, "message": "No recommendations found"}
                )

            recommend_list = []
            for x in recommendations:
                if x not in recommend_list:

                    try:
                        if len(recommend_list) < 10:
                            product = Product.objects.get(name=x)
                            recommend_list.append(product)
                    except:
                        product = Product.objects.filter(name=x)
                        for x in product:
                            if x not in recommend_list:
                                if len(recommend_list) < 10:
                                    filter_product = Product.objects.get(id=x.id)
                                    recommend_list.append(filter_product)

            resp = [
                {
                    "id": one_prod.id,
                    "name": one_prod.name,
                    "category": one_prod.category.name,
                }
                for one_prod in recommend_list
            ]
            return Response(resp)
        except Exception as e:
            return Response(str(e))


class BulkOrderRequestAPIView(APIView):
    serializer_class = BulkOrderSerializer
    permission_classes = (AllowAny,)
    paginaton_class = CustomPagination

    def get(self, request, *args, **kwargs):
        try:
            bulk_orders = BulkOrder.objects.select_related("customer").prefetch_related(
                "products"
            )

            paginator = self.paginaton_class()
            paginated_response = paginator.paginate_queryset(bulk_orders, request)
            serializer = self.serializer_class(paginated_response, many=True)
            return paginator.get_paginated_response(serializer.data)

        except Exception as e:

            return Response(
                {"success": False, "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def post(self, request, *args, **kwargs):
        try:
            serializer = self.serializer_class(data=request.data)
            if serializer.is_valid():
                serializer.save(
                    customer=request.user if request.user.is_authenticated else None
                )
                return Response({"Success": serializer.data}, 200)

            return Response({"Error": serializer.errors}, 400)

        except Exception as e:
            return Response({"Details": str(e)})


class RecommendedProduct(APIView):

    serializer_class = ProductListSerializer
    permission_classes = (AllowAny,)

    @CustomCache.cache_response("products:recommended", timeout=600)
    def get(self, request, *args, **kwargs):
        queryset = list(Product.objects.all())
        count = len(queryset)
        if count == 0:
            return Response({"success": False, "message": "No products found"})

        # Pick up to 10 random products
        num_items = min(10, count)
        random_products = random.sample(queryset, num_items)

        serializer = self.serializer_class(
            random_products, many=True, context={"request": request}
        )
        return Response({"success": True, "data": serializer.data})


class SimilarProductListsAPIView(APIView):
    serializer_class = ProductListSerializer
    permission_classes = (AllowAny,)

    @CustomCache.cache_response("products:similar:{id}", timeout=600)
    def get(self, request, id, *args, **kwargs):
        try:
            # Retrieve the main product by ID
            main_product = Product.objects.get(id=id)

            # Get the category of the main product
            category = main_product.category
            if not category:
                return Response(
                    {
                        "success": False,
                        "error": "No category associated with the product.",
                    },
                    status=status.HTTP_404_NOT_FOUND,
                )

            # Retrieve products in the same category
            products = Product.objects.filter(category=category).exclude(id=id)[:5]
            if not products.exists():
                return Response(
                    {
                        "success": True,
                        "data": [],
                        "message": "No similar products found in the same category.",
                    },
                    status=status.HTTP_200_OK,
                )

            # Serialize the products
            serializer = self.serializer_class(
                products, many=True, context={"request": request}
            )

            return Response(
                {"success": True, "data": serializer.data}, status=status.HTTP_200_OK
            )

        except Product.DoesNotExist:
            return Response(
                {"success": False, "error": f"Product with ID {id} not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            # Log the error for debugging (in production, use a proper logging framework)
            print(f"Error in SimilarProductListsAPIView: {str(e)}")
            return Response(
                {
                    "success": False,
                    "error": "An unexpected error occurred while processing the request.",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class PopularProductsAPIView(APIView):
    serializer_class = ProductListSerializer
    permission_classes = (AllowAny,)

    def get_queryset(self):
        products = Product.objects.annotate(
            avg_rating=Avg("reviews__rating"), rating_count=Count("reviews")
        ).order_by("-avg_rating")[:5]
        return products

    @CustomCache.cache_response("products:popular", timeout=600)
    def get(self, request, *args, **kwargs):
        products = self.get_queryset()
        serializer = self.serializer_class(products, many=True)
        return Response({"success": True, "data": serializer.data})


@extend_schema(tags=["Topcategory"])
class TopCategoryAPIView(APIView):
    serializer_class = TopCategorySerializer
    permission_classes = (AllowAny,)

    @CustomCache.cache_response(
        "categories:top:{request.query_params.status}", timeout=600
    )
    def get(self, request, *args, **kwargs):
        try:
            # 1. Get ALL TopCategory objects
            status_param = request.query_params.get("status")

            qs = TopCategory.objects.select_related("category").all()
            if status_param:
                qs = qs.filter(status=status_param)

            qs = qs.filter(category__type__iexact="product")

            if not qs.exists():
                return Response(
                    {"success": False, "message": "No top categories found"}
                )

            serializer = self.serializer_class(qs, many=True)
            return Response({"success": True, "data": serializer.data})
        except Exception as e:
            return Response({"success": False, "details": str(e)})


class CreateTopCategoryAPIView(APIView):
    serializer_class = TopCategoryPostSerializer

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            print("data", data)
            serializer = self.serializer_class(data=data)
            if serializer.is_valid():
                serializer.save()
                return Response({"success": True, "data": serializer.data})
            return Response(
                {"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST
            )

        except Exception as e:
            return Response({"detail": str(e)})


class UpdateandDeleteTopCategoryAPIView(APIView):
    serializer_class = TopCategoryPostSerializer

    def put(self, request, id, *args, **kwargs):
        try:
            data = request.data
            print("data", data)
            category = TopCategory.objects.filter(id=id).first()
            if not category:
                return Response(
                    "Category is required", status=status.HTTP_400_BAD_REQUEST
                )

            serializer = self.serializer_class(instance=category, data=data)
            if serializer.is_valid():
                serializer.save()
                return Response({"success": True, "data": serializer.data})
            return Response(
                {"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST
            )

        except Exception as e:
            return Response({"detail": str(e)})

    def delete(self, request, id, *args, **kwargs):
        category = TopCategory.objects.filter(id=id)
        print("categroy", category)
        if not category:
            return Response("Category is required", status=status.HTTP_400_BAD_REQUEST)
        category.delete()
        return Response({"success": f"{category} Deleted successfully"})


import pandas as pd


class BulkProductUpload(APIView):
    parser_classes = [FormParser, MultiPartParser]
    permission_classes = [IsAdminUser]

    def post(self, request, *args, **kwargs):
        file = request.FILES.get("file")

        if not file:
            return Response(
                {"status": "failed", "message": "filename file is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            df = pd.read_excel(file, sheet_name="products")

            print(df.columns.tolist())

            product_created = []
            error = []
            import ast

            for idx, row in df.iterrows():
                # Parse tags safely
                raw_tags = row.get("tags")
                try:
                    tags = (
                        ast.literal_eval(raw_tags) if isinstance(raw_tags, str) else []
                    )
                except:
                    tags = []

                # Map product_status
                status_map = {
                    "General": "General",  # or whichever is correct
                }
                product_status = status_map.get(row.get("product_status"), "General")

                # added_by: lookup by name
                added_by_name = row.get("added_by")
                currency_code = row.get("currency")  # e.g., "USD"
                currency_obj = Currency.objects.filter(code=currency_code).first()
                if not currency_obj:
                    error.append({"row": idx, "error": "Invalid currency"})
                    continue

                category = row.get("category")
                category = int(category) if category is not None else None

                product_data = {
                    "name": row.get("name"),
                    "user": row.get("user"),  # UUID works if exists
                    "added_by": added_by_name,
                    "product_status": product_status,
                    "category": category,
                    "description": row.get("description"),
                    "tags": tags,  # parsed into list
                    "currency": currency_obj.id,
                    "is_active": True,
                    "status": "Active",
                }

                serializer = ProductCreateSerializer(data=product_data)

                if serializer.is_valid():
                    instance = serializer.save()
                    product_created.append(
                        instance.id
                    )  # append only the ID, not the whole object
                else:
                    error.append({"row": idx, "error": serializer.errors})

            if error:
                return Response(
                    {
                        "status": "partial_success",
                        "created_products": product_created,
                        "errors": error,
                    },
                    status=status.HTTP_207_MULTI_STATUS,
                )

            return Response(
                {"status": "success", "created_products": product_created},
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:

            return Response(
                {"status": "failed", "message": f"Error processing file: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
