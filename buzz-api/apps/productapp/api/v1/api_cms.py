from logging import exception

from attr import attributes
from django.contrib.contenttypes.models import ContentType
from django.db import transaction
from rest_framework.permissions import AllowAny, IsAuthenticated

from apps.core.cache import CustomCache
from .serializers import *
from apps.productapp.filters import *
from rest_framework.views import APIView
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from rest_framework.parsers import FormParser, MultiPartParser
from ...helpers import *
from collections import OrderedDict
from apps.core.pagination import CustomPagination
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from rest_framework import status
from rest_framework.exceptions import ValidationError, APIException
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics
from rest_framework import filters
import random
from django.shortcuts import get_object_or_404

# custom app import
from apps.core.pagination import CustomPagination
from apps.core.permissions import *
from apps.core.utils import *


class ValidationError403(APIException):
    status_code = status.HTTP_403_FORBIDDEN


class CMSProductGenericAPIView(generics.ListCreateAPIView):
    """
    APIView class for viewing products
    """

    permission_classes = [AllStaffPermission]
    queryset = Product.all_products.all()
    filter_backends = [
        filters.SearchFilter,
        DjangoFilterBackend,
        filters.OrderingFilter,
    ]
    filterset_class = ProductFilterSet
    search_fields = [
        "name",
        "category__name",
        "model_no",
        "product_status",
        "slug",
        "stocks__sku",
    ]
    ordering_fields = ("name", "created_at", "stocks__price")

    def get_serializer_class(self):
        if self.request.method == "GET":
            return CMSProductListSerializer
        return ProductCreateSerializer

    def perform_create(self, serializer):
        serializer.save(
            added_by="BUZZ Mall",
            user=self.request.user,
            type="product",
            status="Pending",
        )

    def post(self, request, *args, **kwargs):
        """
        Product post for Buzz Admin
        --
        Args:
        ---
            name = 16 to 255 chatacters
            is_active = boolean
            thumnbnail_image = response of api/v1/filestore/thumbnail
            product_status = ("GENERAL", "SALE", "FEATURED", "HOT DEALS")
            warranty_type = ("Brand Warranty", "Store Warranty")
        Returns:
        ---
            Response: Status and message
        """
        super().post(request, *args, **kwargs)
        actor_content_type = ContentType.objects.get_for_model(Staff)
        action_content_type = ContentType.objects.get_for_model(Product)
        activity = Activity.objects.create(
            actor_content_type=actor_content_type,
            actor_object_id=self.request.user.staff.id,
            action_content_type=action_content_type,
            action_object_id=self.queryset[0].id,
            action="Create",
        )
        return Response(
            {
                "status": "success",
                "message": "Product successfully created.",
                "product_id": self.queryset[0].id,
            },
            status=status.HTTP_201_CREATED,
        )

    def get(self, request, *args, **kwargs):
        """
        Product List view for Buzz Admin
        --
        Args:
        ---
            search_fields = ['name', 'category__name','model_no','product_status','slug','stocks__sku']
            ordering_fields = ('name','created_at','stocks__price')
            filter_fields = ('brand','category','price_gte','price_lte','availability')
            page: int
            page_size: int

        Returns
        ----
            json response: success or failure messages along with corresponding datas
        """
        return super().get(request, *args, **kwargs)


class CMSProductPatchandDeleteAPIView(APIView):
    permission_classes = [AllStaffPermission]

    def get_object(self, request, id):
        try:
            return Product.all_products.get(id=id)
        except Product.DoesNotExist as e:
            raise Http404 from e

    def get(self, request, id):
        """
        Getting products information
        """
        product = self.get_object(request, id)
        serializer = CMSProductDetailSerializer(product, context={"request": request})
        resp = {
            "status": "success",
            "data": serializer.data,
        }
        return Response(resp)

    parser_classes = [MultiPartParser, FormParser]

    @extend_schema(request=StaffProductUpdateSerializer)
    def patch(self, request, id):
        """
        Updating product data
        ----------------------------------------------------------------

        Request_body
        ----------------------------------------------------------------
            request: form_data
                is_active: bool
                name: str
                model_no: str
                thumbnail_image: str
                product_status: str (CHOICES)
                description: str
                notes: str
                meta_title: str
                meta_description: str
                meta_keyword: str
                brand: int
                category: int

        Returns
        ----------------------------------------------------------------
            json response: success or failure messages allong with corresponding datas
        """

        product = self.get_object(request, id)
        product_serializer = StaffProductUpdateSerializer(
            product, data=request.data, partial=True
        )
        if product_serializer.is_valid(raise_exception=True):
            product_serializer.save()
            resp = {
                "status": "success",
                "message": "Product updated successfully",
            }
        else:
            resp = {
                "status": "failure",
                "data": product_serializer.errors,
            }
            return Response(resp, status=status.HTTP_400_BAD_REQUEST)
        return Response(resp)

    def delete(self, request, id):
        """
        Deleting product using product id
        """
        product = self.get_object(request, id)
        product.delete()
        resp = {
            "status": "success",
            "message": "Product has been deleted",
        }
        return Response(resp)


class CMSProductMultipleDeleteAPIView(APIView):
    permission_classes = [AllStaffPermission]

    def delete(self, request, *args, **kwargs):
        """
        Deleting multiple products in a single execution
        """
        try:
            query_param = self.request.query_params.get("id")  # "[1,2,3]"
            id_list = eval(query_param)
        except Exception as e:
            return Response(
                {
                    "status": "failure",
                    "message": f"{str(e)}. Please try id = [1,2,3] format.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            products = Product.all_products.filter(id__in=id_list)
        except Exception as e:
            return Response(
                {
                    "status": "failure",
                    "message": f"{str(e)}. Please try id = [1,2,3] format.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not products:
            return Response(
                {"status": "failure", "message": "Please select valid product."},
                status=status.HTTP_404_NOT_FOUND,
            )

        products.delete()
        resp = {"status": "success", "message": "The product have been deleted."}
        return Response(resp)


import requests
import os


class CMSBrandListCreateAPIView(generics.ListCreateAPIView):
    permission_classes = [AllStaffPermission]
    parser_classes = (FormParser, MultiPartParser)
    queryset = Brand.objects.all()
    filter_backends = [
        filters.SearchFilter,
        DjangoFilterBackend,
        filters.OrderingFilter,
    ]
    filterset_class = BrandFilterSet
    search_fields = ["name"]
    ordering_fields = "created_at"

    def get_serializer_class(self):
        if self.request.method == "GET":
            return BrandSerializer
        return BrandCreateSerializer

    def post(self, request, *args, **kwargs):
        """
        Creating brands
        ----------------------------------------------------------------

        Request_body
        ----------------------------------------------------------------
            request: form_data
                name: str
                image: str (imagefilefield)
                banner: str (filefield)

        Returns
        ----------------------------------------------------------------
            json response: success or failure messages
        """
        response = super().post(request, *args, **kwargs)

        resp = {
            "status": "success",
            "message": "Brand is added successfully.",
        }
        return Response(resp, status=status.HTTP_201_CREATED)

    def get(self, request, *args, **kwargs):
        """
        Getting brands list
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
        return super().get(request, *args, **kwargs)


class BrandListSelectView(generics.ListAPIView):
    permission_classes = [MerchantAndStaffPermission]
    serializer_class = BrandSelectSerializer
    queryset = Brand.objects.all()

    def paginate_queryset(self, queryset):
        if (
            self.paginator
            and self.request.query_params.get(self.paginator.page_query_param, None)
            is None
        ):
            return None
        return super().paginate_queryset(queryset)


class BrandUpdateDeleteAPIView(APIView):
    permission_classes = [AllStaffPermission]

    def get(self, request, id):
        brand = get_object_or_404(Brand, id=id)
        serializer = BrandSerializer(brand, context={"request": request})
        resp = {"status": "success", "data": serializer.data}
        return Response(resp)

    permission_classes = [AllStaffPermission]

    def delete(self, request, id):
        """
        Deleting brand using brand id
        """

        brand = get_object_or_404(Brand, id=id)
        brand.delete()
        resp = {"status": "success", "message": "Brand is deleted successfully"}
        return Response(resp)

    permission_classes = [AllStaffPermission]
    parser_classes = [MultiPartParser, FormParser]

    @extend_schema(request=BrandUpdateSerializer)
    def patch(self, request, id):
        """
        Update brands information
        ----------------------------------------------------------------

        Parameters
        ----------------------------------------------------------------
            pathparameters
                id : int

        Request_body
        ----------------------------------------------------------------
            request: form_data
                name: str
                image: str (filefield)

        Returns
        ----------------------------------------------------------------
            json response: success or failure messages
        """
        brand = get_object_or_404(Brand, id=id)
        serializer = BrandUpdateSerializer(brand, data=request.data, partial=True)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            resp = {"status": "success", "message": "Brand is Updated"}
        else:
            resp = {"status": "failure", "message": serializer.errors}
        return Response(resp)


class BrandMultipleDeleteAPIView(APIView):
    permission_classes = [AllStaffPermission]

    def delete(self, request, *args, **kwargs):
        """
        Delete multiple brand objects in a single execution
        """
        query_param = self.request.query_params.get("id")  # "[1,2,3]"
        try:
            id_list = eval(query_param)
            brands = Brand.objects.filter(id__in=id_list)
            brands.delete()
        except Exception as e:
            return Response(
                {"status": "failure", "message": "Please select valid brands."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(
            {"status": "success", "message": "The brands have been deleted."}
        )


# class CategoryCreateAPIView(APIView):
#     permission_classes = [AllStaffPermission]

#     def get_object(self, id):
#         try:
#             return Category.objects.get(id=id)
#         except Category.DoesNotExist:
#             resp = {
#                 "status":"failure",
#                 "message":"No parent found of this Category."
#             }
#             raise ValidationError(resp)
#             # ,status=status.HTTP_404_NOT_FOUND
#     @extend_schema(request=CategorySerializer)

#     def post(self, request):
#         serializer = CategorySerializer(data = request.data)
#         if serializer.is_valid(raise_exception=True):
#             try:
#                 parent_id = request.data["parent"]
#                 parent = self.get_object(parent_id)
#                 serializer.save(parent=parent, type="product")
#             except:
#                 serializer.save(type="product")
#             resp = {
#                 "status":"success",
#                 "message":"Category created successfully.",
#             }
#         else:
#             resp = {
#                 "status":"failure",
#                 "message":serializer.errors
#             }
#         return Response(resp)


# class CategoryDetailPatchDeleteAPIView(APIView):
#     permission_classes = [AllStaffPermission]
#     def get(self,request,id):
#         category = get_object_or_404(Category,id=id,type="product")
#         serializer = CategoryDetailSerializer(category)
#         resp = {
#             "status":"success",
#             "data":serializer.data
#         }
#         return Response(resp)

#     @extend_schema(request=CategoryUpdateSerializer)
#     def patch(self,request,id):
#         category = get_object_or_404(Category,id=id,type="product")
#         serializer = CategoryUpdateSerializer(category, data=request.data, partial=True)
#         if serializer.is_valid():
#             # parent_id = request.data["parent"]
#             # parent = self.get_object(parent_id)
#             serializer.save()

#             resp = {
#                 "status":"success",
#                 "message":"Category has been updated."
#             }
#         else:
#             resp = {
#                 "status": "failure",
#                 "message": serializer.errors
#             }
#         return Response(resp)
#     def delete(self, request, id):
#         category = get_object_or_404(Category,id=id,type="product")
#         category.delete()
#         resp = {
#             "status":"success",
#             "message":"Category has been deleted."
#         }
#         return Response(resp)


class MerchantProductListAPIView(APIView, PageNumberPagination):
    permission_classes = [AllStaffPermission]
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

    def get_queryset(self, request, merchant_id):
        keyword = self.request.GET.get("keyword", "")
        brand = self.request.GET.get("brand")
        color = self.request.GET.get("color")
        rating = self.request.GET.get("rating")
        sortBy = self.request.GET.get("sortBy")
        new_queryset = Product.all_products.filter(
            Q(name__icontains=keyword)
            | Q(brand__name__icontains=keyword)
            | Q(model_no__icontains=keyword)
        )
        filters = {"user__merchant": merchant_id}
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
        except Exception:
            pass

        return self.paginate_queryset(new_queryset, self.request)

    def get(self, request, merchant_id):
        """
        Getting product list of merchant
        ----------------------------------------------------------------

        Parameters
        ----------------------------------------------------------------
            pathparameters
                merchant_id: int

        Returns
        ----------------------------------------------------------------
            json response: success or failure messages along with corresponding datas
        """
        page = self.request.GET.get("page", 1)
        page_size = self.request.GET.get("page_size", 10)
        products = self.get_queryset(request, merchant_id)
        serializer = ProductListSerializer(
            products, many=True, context={"request": request}
        )
        resp = {"status": "success", "data": serializer.data}

        return self.get_paginated_response(serializer.data, page, page_size)


class MerchantProductAPIView(APIView):
    permission_classes = [MerchantOnlyPermission]

    def get(self, request):
        """
        Getting the list of products updated by the Merchant
        """
        products = Product.all_products.filter(user=request.user)
        serializer = CMSProductListSerializer(
            products, many=True, context={"request": request}
        )
        resp = {"status": "success", "data": serializer.data}
        return Response(resp)


# Test
class StockDemoAPIView(APIView):
    @extend_schema(request=StockSerializer)
    def post(self, request):
        """
        Creation to stock for testing
        ----------------------------------------------------------------

        Request_body
        ----------------------------------------------------------------
            request: json_data
            {
                "status": "Pending",
                "mrp": int,
                "price": int,
                "color": "string",
                "availability": bool,
                "size_type": "string",
                "size": int,
                "quantity": int,
                "image": "string",
                "ram": "string",
                "rom": "string",
                "processor": "string",
                "graphics_card": "string",
                "operating_system": "string",
                "wireless_connection": bool,
                "warranty_type": "string",
                "warranty_year": int,
                "hdmi_ports_no": int,
                "usb_ports_no": int,
                "resolution": "string",
                "smart_tv": bool,
                "phone_type": "string",
                "network_compatibility": "string",
                "build_type": "string",
                "wireless_charging": bool,
                "sleeves": "string",
                "clothing_material": "string",
                "fit_type": "string",
                "length": "string",
                "wash_type": "string",
                "jeans_type": "string",
                "pants_fly": "string",
                "clothing_style": "string",
                "collar_type": "string",
                "product": int
            }
        """
        stock = request.data["stock"]
        for one in stock:
            stock_product = one
            sku = stock_product["sku"]
            # stock_create = Stock.object.create(
            #     sku=stock_product["sku"]
            # )
        resp = {
            "status": "success",
            # "data":request.data,
            "stock": stock,
        }
        return Response(resp)


class CartDemoAPIView(APIView):
    @extend_schema(request=StockSerializer)
    def post(self, request):
        """
        Creating cart demo for testing
        """
        stock = request.data["stock"]
        for one in stock:
            stock_product = one
            sku = stock_product["sku"]
            # stock_create = Stock.object.create(
            #     sku=stock_product["sku"]
            # )
        resp = {
            "status": "success",
            # "data":request.data,
            "stock": stock,
        }
        return Response(resp)


class ThumbnailFileStoreCreateAPIView(APIView):
    """
    APIView class for storing thumbnail files
    """

    permission_classes = [MerchantAndStaffPermission]
    parser_classes = [FormParser, MultiPartParser]

    @extend_schema(request=FileStoreCreateSerializer)
    def post(self, request):
        """
        Storing image thumbnail
        ----------------------------------------------------------------

        Request_body
        ----------------------------------------------------------------
            request: form_data
                image: str (imagefilefield)

        Returns
        ----------------------------------------------------------------
            json response: success or failure messages along with corresponding data
        """
        try:
            images = dict((request.data).lists())["image"]
            image_link = []
            if len(images) > 2:
                resp = {
                    "status": "failure",
                    "message": "You can select only 2 images for thumbnail.",
                }
                return Response(resp, status=status.HTTP_403_FORBIDDEN)
            for image in images:
                create = FileStore.objects.create(image=image)
                image_link += [request.build_absolute_uri(create.image.url)]
            resp = str(image_link)

        except Exception as e:
            resp = {"status": "failure", "message": str(e)}

        return Response(resp)


class RemoveBackgroundFileStoreCreateAPIView(APIView):
    """
    APIView class for storing thumbnail files
    """

    permission_classes = [AllStaffPermission]
    parser_classes = [FormParser, MultiPartParser]

    @extend_schema(request=FileStoreCreateSerializer)
    def post(self, request):
        """
        Storing image thumbnail
        ----------------------------------------------------------------

        Request_body
        ----------------------------------------------------------------
            request: form_data
                image: str (imagefilefield)

        Returns
        ----------------------------------------------------------------
            json response: success or failure messages along with corresponding data
        """
        try:
            images = dict((request.data).lists())["image"]
            image_link = []
            if len(images) > 1:
                resp = {
                    "status": "failure",
                    "message": "You can select only 1 images for remove bg.",
                }
                return Response(resp, status=status.HTTP_403_FORBIDDEN)
            for image in images:
                create = FileStore.objects.create(image=image)
                image_link += [request.build_absolute_uri(create.image.url)]
                image = create.image.url[1:]
                response = requests.post(
                    "https://api.remove.bg/v1.0/removebg",
                    files={"image_file": open(f"{image}", "rb")},
                    data={"size": "auto"},
                    headers={"X-Api-Key": "LwyjbBUZkLemw1KH3Wbed7mo"},
                )
                if response.status_code == requests.codes.ok:

                    os.remove(f"{image}")
                    with open(f"{image}", "wb") as out:
                        out.write(response.content)
                else:
                    resp = {"status": "failure", "messages": response.text}
                    return Response(resp, status=response.status_code)
            resp = str(image_link)

        except Exception as e:
            resp = {"status": "failure", "message": str(e)}

        return Response(resp)


class FileStoreCreateAPIView(APIView):
    permission_classes = [MerchantAndStaffPermission]
    parser_classes = [FormParser, MultiPartParser]

    @extend_schema(request=FileStoreCreateSerializer)
    def post(self, request):
        """
        Storing image
        ----------------------------------------------------------------

        Request_body
        ----------------------------------------------------------------
            request: form_data
                image: str (imagefilefield)

        Returns
        ----------------------------------------------------------------
            json response: success or failure messages along with corresponding data
        """
        try:
            images = dict((request.data).lists())["image"]
            image_link = []
            if len(images) > 5:
                resp = {
                    "status": "failure",
                    "message": "Too many images. Please select only 5.",
                }
                return Response(resp, status=status.HTTP_403_FORBIDDEN)
            for image in images:
                create = FileStore.objects.create(image=image)
                image_link += [request.build_absolute_uri(create.image.url)]
            resp = str(image_link)

        except Exception as e:
            resp = {"status": "failure", "message": str(e)}

        return Response(resp)


class StockCreateAPIView(APIView):
    permission_classes = [MerchantAndStaffPermission]

    @extend_schema(request=StockSerializer)
    def post(self, request):
        """
        Creating stocks
        """
        serializer = StockSerializer(data=request.data)

        if serializer.is_valid(raise_exception=True):

            for stock in serializer.data["stock"]:
                stock_serializer = StockCreateSerializer(data=stock)
                if stock_serializer.is_valid():
                    stock_serializer.save()
                    resp = {
                        "status": "success",
                        "message": "Product saved Successfully.",
                    }
                else:
                    resp = {"status": "failure", "message": stock_serializer.errors}
        else:
            resp = {"status": "failure", "message": serializer.errors}

        return Response(resp)


# class StockTVCreateAPIView(APIView):
#     permission_classes = [MerchantAndStaffPermission]
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
#         """
#         Getting product stock using product_id
#         ----------------------------------------------------------------

#         Parameters
#         ----------------------------------------------------------------
#             pathparameters
#                 product_id: int

#         Returns
#         ----------------------------------------------------------------
#             json response: success or failure messages along with corresponding datas
#         """
#         product_id = self.kwargs.get("product_id")
#         product = self.get_product_object(product_id)
#         if product.category.parent.parent.slug == "tvs":
#             stock = self.get_stock_object(product_id)
#             serializer = StockTVGetSerializer(stock, many=True)
#             resp = {
#                 "status":"success",
#                 "data":serializer.data
#             }
#         else:
#             resp = {
#                 "status":"failure",
#                 "message":"This product is not TV instance."
#             }
#         return Response(resp)

#     @extend_schema(request=StockTVSerializer)
#     def post(self, request,*args,**kwargs):
#         """
#         Creating Tv stock
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
#             }

#         Returns
#         ----------------------------------------------------------------
#             json response: success or failure messages
#         """
#         product_id = self.kwargs.get("product_id")
#         product = self.get_product_object(product_id)
#         if product.category.parent.parent.slug == "tvs":
#             serializer = StockTVSerializer(data=request.data)
#             if serializer.is_valid():
#                 for stock in serializer.data["stock"]:
#                     stock_serializer = StockTVCreateSerializer(data=stock)
#                     if stock_serializer.is_valid():
#                         stock_serializer.save(product_id=product_id)
#                 resp = {
#                     "status":"success",
#                     "message":"Stocks added Successfully."
#                 }
#             else:
#                 resp = {
#                     "status":"failure",
#                     "message":serializer.errors
#                 }
#         else:
#             resp = {
#                 "status":"failure",
#                 "message":"This product is not TV instance."
#             }
#         return Response(resp)

#     @extend_schema(request=StockTVAllUpdateSerializer)
#     def patch(self, request, product_id):
#         """
#         Updating Tv stock
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
#             }

#         Returns
#         ----------------------------------------------------------------
#             json response: success or failure messages
#         """
#         stocks = self.get_stock_object(product_id)
#         product = self.get_product_object(product_id)
#         if product.category.parent.parent.slug == "tvs":
#             serializer = StockTVAllUpdateSerializer(data=request.data)
#             if serializer.is_valid():
#                 for count, stock_data in enumerate(serializer.data["stock"]):
#                     stock_serializer =StockTVUpdateSerializer(
#                             stocks[count], data=stock_data, partial=True
#                     )
#                     if stock_serializer.is_valid():
#                         stock_serializer.save()
#                         resp = {
#                             "status":"success",
#                             "message":"Stock updated."

#                         }
#                     else:
#                         resp = {
#                             "status":"failure",
#                             "message":"Inside loop"
#                         }
#             else:
#                 resp = {
#                     "status":"failure",
#                     "message":serializer.errors
#                 }
#         else:
#             resp = {
#                 "status":"failure",
#                 "message":"This product is not TV instance."
#             }
#         return Response(resp)


# class StockMobileCreateAPIView(APIView):
#     permission_classes = [MerchantAndStaffPermission]
#     def get_product_object(self,product_id):
#         try:
#             return Product.all_products.get(id=product_id)
#         except Product.DoesNotExist:
#             raise Http404

# def get_stock_object(self,product_id):
#     try:
#         return Stock.objects.filter(product_id=product_id)
#     except Stock.DoesNotExist:
#         raise Http404

# def get(self, request, product_id):
#     """
#     Getting product stock using product_id
#     ----------------------------------------------------------------

#     Parameters
#     ----------------------------------------------------------------
#         pathparameters
#             product_id: int

#     Returns
#     ----------------------------------------------------------------
#         json response: success or failure messages along with corresponding datas
#     """
#     product = self.get_product_object(product_id)
#     if product.category.parent.parent.slug == "mobile":
#         stock = Stock.objects.filter(product_id=product_id)
#         serializer = StockMobileGetSerializer(stock, many=True)
#         resp = {
#             "status":"success",
#             "data":serializer.data
#         }
#     else:
#         resp = {
#             "status":"failure",
#             "message":"This product is not mobile instance."
#         }
#     return Response(resp)

# @extend_schema(request=StockAllMobileSerializer)
# def post(self, request,*args,**kwargs):
#     """
#     Creating Mobile stock
#     ----------------------------------------------------------------

#     Parameters
#     ----------------------------------------------------------------
#         pathparameters
#             product_id: int

#     Request_body
#     ----------------------------------------------------------------
#         request : json_data
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
#         }

#     Returns
#     ----------------------------------------------------------------
#         json response: success or failure messages
#     """
#     product_id=self.kwargs.get("product_id")
#     product = self.get_product_object(product_id)
#     if product.category.parent.parent.slug == "mobile":

#         serializer = StockAllMobileSerializer(data=request.data)
#         if serializer.is_valid():
#             for stock in serializer.data["stock"]:
#                 stock_serializer = StockMobileCreateSerializer(data=stock)
#                 if stock_serializer.is_valid():
#                     stock_serializer.save(product_id=product_id)
#             resp = {
#                 "status":"success",
#                 "message":"Stocks added Successfully."
#             }
#         else:
#             resp = {
#                 "status":"failure",
#                 "message":serializer.errors
#             }
#     else:
#         resp = {
#             "status":"failure",
#             "message":"The product is not a mobile instance."
#         }
#     return Response(resp)

# @extend_schema(request=StockMobileAllUpdateSerializer)
# def patch(self, request, product_id):
#     """
#     Updating Mobile stock
#     ----------------------------------------------------------------

#     Parameters
#     ----------------------------------------------------------------
#         pathparameters
#             product_id: int

#     Request_body
#     ----------------------------------------------------------------
#         request : json_data
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
#         }

#     Returns
#     ----------------------------------------------------------------
#         json response: success or failure messages
#     """
#     product_id=self.kwargs.get("product_id")
#     product = self.get_product_object(product_id)
#     if product.category.parent.parent.slug == "mobile":
#         stocks = self.get_stock_object(product_id)
#         serializer = StockMobileAllUpdateSerializer(data=request.data)
#         if serializer.is_valid():
#             for count, stock_data in enumerate(serializer.data["stock"]):
#                 stock_serializer =StockTVUpdateSerializer(
#                         stocks[count], data=stock_data, partial=True
#                 )
#                 if stock_serializer.is_valid():
#                     stock_serializer.save()
#                     resp = {
#                         "status":"success",
#                         "message":"Stock updated."

#                         }
#                     else:
#                         resp = {
#                             "status":"failure",
#                             "message":"Inside loop"
#                         }
#             else:
#                 resp = {
#                     "status":"failure",
#                     "message":serializer.errors
#                 }
#         else:
#             resp = {
#                 "status":"failure",
#                 "message":"The product is not a mobile instance."
#             }
#         return Response(resp)

# class StockClothCreateAPIView(APIView):
#     permission_classes = [MerchantAndStaffPermission]
#     def get_product_object(self,product_id):
#         try:
#             return Product.all_products.get(id=product_id)
#         except Product.DoesNotExist:
#             raise Http404

# def get_stock_object(self,product_id):
#     try:
#         return Stock.objects.filter(product_id=product_id)
#     except Stock.DoesNotExist:
#         raise Http404
# def get(self, request, product_id):
#     """
#     Getting product stock using product_id
#     ----------------------------------------------------------------

#     Parameters
#     ----------------------------------------------------------------
#         pathparameters
#             product_id: int

#     Returns
#     ----------------------------------------------------------------
#         json response: success or failure messages along with corresponding datas
#     """
#     product = self.get_product_object(product_id)
#     if product.category.parent.parent.slug == "mens-fashion":
#         stock = self.get_stock_object(product_id)
#         serializer = ClothStockGetSerializer(stock, many=True)
#         resp = {
#             "status":"success",
#             "data":serializer.data
#         }
#     else:
#         resp = {
#             "status":"failure",
#             "message":"This product is not cloth instance."
#         }
#     return Response(resp)

# @extend_schema(request=ClothAllStockSerializer)
# def post(self, request,*args,**kwargs):
#     """
#     Creating Cloth stock
#     ----------------------------------------------------------------

#     Parameters
#     ----------------------------------------------------------------
#         pathparameters
#             product_id: int

#     Request_body
#     ----------------------------------------------------------------
#         request : json_data
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
#         }

#     Returns
#     ----------------------------------------------------------------
#         json response: success or failure messages
#     """
#     product_id=self.kwargs.get("product_id")
#     product = self.get_product_object(product_id)
#     if product.category.parent.parent.slug == "mens-fashion":
#         serializer = ClothAllStockSerializer(data=request.data)

#         if serializer.is_valid():
#             for stock in serializer.data["stock"]:
#                 stock_serializer = ClothStockCreateSerializer(data=stock)
#                 if stock_serializer.is_valid():
#                     stock_serializer.save(product_id=product_id)
#             resp = {
#                 "status":"success",
#                 "message":"Stocks added Successfully."
#             }
#         else:
#             resp = {
#                 "status":"failure",
#                 "message":serializer.errors
#             }
#     else:
#         resp = {
#             "status":"failure",
#             "message":"The product is not a cloth instance."
#         }
#     return Response(resp)

# @extend_schema(request=StockClothAllUpdateSerializer)
# def patch(self, request, product_id):
#     """
#     Updating Cloth stock
#     ----------------------------------------------------------------

#     Parameters
#     ----------------------------------------------------------------
#         pathparameters
#             product_id: int

#     Request_body
#     ----------------------------------------------------------------
#         request : json_data
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
#         }

#     Returns
#     ----------------------------------------------------------------
#         json response: success or failure messages
#     """
#     product_id=self.kwargs.get("product_id")
#     product = self.get_product_object(product_id)
#     if product.category.parent.parent.slug == "mobile":
#         stocks = self.get_stock_object(product_id)
#         serializer = StockClothAllUpdateSerializer(data=request.data)
#         if serializer.is_valid():
#             for count, stock_data in enumerate(serializer.data["stock"]):
#                 stock_serializer =StockClothUpdateSerializer(
#                         stocks[count], data=stock_data, partial=True
#                 )
#                 if stock_serializer.is_valid():
#                     stock_serializer.save()
#                     resp = {
#                         "status":"success",
#                         "message":"Stock updated."

#                         }
#                     else:
#                         resp = {
#                             "status":"failure",
#                             "message":"Inside loop"
#                         }
#             else:
#                 resp = {
#                     "status":"failure",
#                     "message":serializer.errors
#                 }
#         else:
#             resp = {
#                 "status":"failure",
#                 "message":"The product is not a cloth instance."
#             }
#         return Response(resp)


class ServiceCategoryChildListGenericsAPIView(generics.ListAPIView):
    serializer_class = CMSCategoryChildListSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["name"]
    permission_classes = [AllStaffPermission]
    lookup_url_kwarg = "id"

    def get_queryset(self):
        return Category.objects.filter(
            parent_id=self.kwargs.get(self.lookup_url_kwarg), type="service"
        )

    def list(self, request, *args, **kwargs):
        category = super(ServiceCategoryChildListGenericsAPIView, self).list(
            request, *args, **kwargs
        )
        parent_obj = Category.objects.get(id=self.kwargs.get(self.lookup_url_kwarg))
        if parent_obj.level > 1:
            return Response(
                {
                    "status": "failure",
                    "message": "Child of this category does not exist.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )
        parent = CMSCategoryParentDetailSerializer(parent_obj).data
        category.data["parent"] = parent
        if parent_obj.parent:
            g_parent = CMSCategoryParentDetailSerializer(parent_obj.parent).data
            category.data["grandparent"] = g_parent
        return Response(category.data)


@extend_schema(deprecated=True)
class CMSServiceCategoryListGenericAPIView(generics.ListAPIView):
    permission_classes = [AllStaffPermission]
    queryset = Category.objects.filter(level=0, type="service")
    serializer_class = CMSCategoryParentListSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["name"]


class CMSCategoryListAPI(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = CategoryListSerializer

    def get_queryset(self):
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
        grandparent_objects = Category.objects.filter(id__in=parent_objects)
        return grandparent_objects

    def paginate_queryset(self, queryset):
        if (
            self.paginator
            and self.request.query_params.get(self.paginator.page_query_param, None)
            is None
        ):
            return None
        return super().paginate_queryset(queryset)

    # def get_queryset(self):
    #     to_be_deleted1 = []
    #     categoy_object=Category.objects.filter(level=0)
    #     for category in categoy_object:
    #            sub_category_object=category.category_set.all()
    #            to_be_deleted2 = []
    #            for sub_category in sub_category_object:
    #                 if sub_category.category_set.all().count()<1:
    #                     to_be_deleted2.append(sub_category.id)
    #                 if len(to_be_deleted2)<1:
    #                     to_be_deleted1.append(category.id)
    #     print(to_be_deleted1)

    #     return categoy_object.exclude(id__in =  to_be_deleted1)


@extend_schema(deprecated=True)
class CMSServiceCategoryCreateAPIView(APIView):
    permission_classes = [AllStaffPermission]

    def get(self, request):
        """
        Getting service category
        """
        category = Category.objects.filter(level=0, name="service")
        serializer = CategoryListSerializer(category, many=True)
        resp = {"status": "success", "data": serializer.data}
        return Response(resp)

    def get_object(self, id):
        try:
            return Category.objects.get(id=id)
        except Category.DoesNotExist:
            resp = {
                "status": "failure",
                "message": "No parent found of this Service Category.",
            }

    @extend_schema(request=ServiceCategorySerializer)
    def post(self, request):
        """
        Creating  service category
        ----------------------------------------------------------------

        Request_body
        ----------------------------------------------------------------
            request: json_data
            {
                "name": "string",
                "icon": "string",
                "parent": int
            }

        Returns
        ----------------------------------------------------------------
            json response: success or failure messages along with corresponding datas
        """
        serializer = ServiceCategorySerializer(data=request.data)
        if serializer.is_valid():
            try:
                parent_id = request.data["parent"]
                parent = self.get_object(parent_id)
                serializer.save(parent=parent, type="service")
            except:
                serializer.save(type="service")
            resp = {
                "status": "success",
                "message": "Service category created successfully.",
                "data": serializer.data,
            }
        else:
            resp = {"status": "failure", "message": serializer.errors}
        return Response(resp)


class CMSServiceAPIView(APIView, PageNumberPagination):
    permission_classes = [MerchantAndStaffPermission]

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
        # color = self.request.GET.get('color')
        sortBy = self.request.GET.get("sortBy")

        new_queryset = Product.all_services.filter(
            Q(name__icontains=keyword)
            | Q(category__name__icontains=keyword)
            | Q(user__username__icontains=keyword)
            | Q(model_no__icontains=keyword)
            | Q(product_status__icontains=keyword)
            | Q(slug__icontains=keyword)
            | Q(created_at__icontains=keyword)
        ).distinct()
        try:
            user = request.user.merchant
            new_queryset = new_queryset.filter(user=request.user)
        except Exception as e:
            pass
        return self.paginate_queryset(new_queryset, self.request)

    def get(self, request):
        """
        Getting service in a paginated response
        """
        page = self.request.GET.get("page", 1)
        page_size = self.request.GET.get("page_size", 10)
        product = self.get_queryset(request)
        serializer = CMSProductListSerializer(
            product, many=True, context={"request": request}
        )
        return self.get_paginated_response(serializer.data, page, page_size)

    parser_classes = [MultiPartParser, FormParser]

    @extend_schema(request=ServiceCreateSerializer)
    def post(self, request):
        """
        Creating services
        ----------------------------------------------------------------

        Request_body
        ----------------------------------------------------------------
            request: form_data
                status: str
                is_active: bool
                name: str
                model_no: str
                thumbnail_image: str
                product_status: str(CHOICES)
                description: str
                notes: str
                meta_title: str
                meta_description: str
                meta_keyword: str
                brand: integer
                category: integer

        Returns
        ----------------------------------------------------------------
            json response: success or failure messages along with relevant datas
        """
        serializer = ServiceCreateSerializer(data=request.data)
        if serializer.is_valid():
            try:
                added_by = request.user.staff
                added_by = "BUZZ Mall"
            except:
                added_by = request.user.merchant
                added_by = "merchant"
            serializer.save(user=request.user, added_by=added_by, type="service")
            resp = {"service_id": serializer.data["id"]}
        else:
            resp = {"status": "failure", "message": serializer.errors}
        return Response(resp)


class CMSServicePatchandDeleteAPIView(APIView):
    permission_classes = [MerchantAndStaffPermission]

    def get_object(self, request, id):
        try:
            product = Product.all_services.get(id=id)
            try:
                user = request.user.staff
                return product
            except:
                if product.user != request.user:
                    resp = {
                        "status": "failure",
                        "message": "You do not have permission to perform this action.",
                    }
                    raise ValidationError403(resp)
                else:
                    return product
        except Product.DoesNotExist:
            raise Http404

    def get(self, request, id):
        """
        Getting service using id
        """
        product = self.get_object(request, id)
        serializer = CMSProductDetailSerializer(product, context={"request": request})
        resp = {
            "status": "success",
            "data": serializer.data,
        }
        return Response(resp)

    parser_classes = [MultiPartParser, FormParser]

    @extend_schema(request=ProductUpdateSerializer)
    def patch(self, request, id):
        """
        Updating services
        ----------------------------------------------------------------

        Request_body
        ----------------------------------------------------------------
            request: form_data
                status: str
                is_active: bool
                name: str
                model_no: str
                thumbnail_image: str
                product_status: str(CHOICES)
                description: str
                notes: str
                meta_title: str
                meta_description: str
                meta_keyword: str
                brand: integer
                category: integer

        Returns
        ----------------------------------------------------------------
            json response: success or failure messages along with relevant datas
        """
        try:
            images = dict((request.data).lists())["image"]
            del request.data["image"]
        except:
            pass
        product = self.get_object(request, id)
        product_serializer = ProductUpdateSerializer(
            product, data=request.data, partial=True
        )
        if product_serializer.is_valid():
            product_serializer.save()
            resp = {
                "status": "success",
                "message": "Product updated successfully",
                "data": product_serializer.data,
            }
        else:
            resp = {
                "status": "failure",
                "data": product_serializer.errors,
            }
            return Response(resp)

        return Response(resp)

    def delete(self, request, id):
        """
        Deleting services
        """
        product = self.get_object(request, id)
        product.delete()
        resp = {
            "status": "success",
            "message": "Product has been deleted",
        }
        return Response(resp)


# class StockServiceCreateAPIView(APIView):
#     permission_classes = [MerchantAndStaffPermission]
#     def get_product_object(self,service_id):
#         try:
#             return Product.all_services.get(id=service_id)
#         except Product.DoesNotExist:
#             raise Http404

#     def get_stock_object(self,service_id):
#         try:
#             return Stock.objects.filter(product_id=service_id)
#         except Stock.DoesNotExist:
#             raise Http404

#     def get(self, request, service_id):
#         """
#         Getting services info using service id
#         """
#         service_id = self.kwargs.get("service_id")
#         product = self.get_product_object(service_id)
#         if product.category.type == "service":
#             stock = self.get_stock_object(service_id)
#             serializer = StockServiceGetSerializer(stock, many=True)
#             resp = {
#                 "status":"success",
#                 "data":serializer.data
#             }
#         else:
#             resp = {
#                 "status":"failure",
#                 "message":"This product is not TV instance."
#             }
#         return Response(resp)

#     @extend_schema(request=StockServiceSerializer)
#     def post(self, request,*args,**kwargs):
#         """
#         Creating stock services
#         ----------------------------------------------------------------

#         Parameters
#         ----------------------------------------------------------------
#             pathparameters
#                 service_id: int

#         Request_body
#         ----------------------------------------------------------------
#             request: json_data
#             {
#                 "availability": true,
#                 "mrp": int,
#                 "price": int,
#                 "size": int,
#                 "size_type": "string",
#                 "quantity": int
#             }

#         Returns
#         ----------------------------------------------------------------
#             json response: success or failure messages
#         """
#         service_id = self.kwargs.get("service_id")
#         product = self.get_product_object(service_id)
#         if product.category.type == "service":
#             serializer = StockServiceSerializer(data=request.data)
#             if serializer.is_valid():
#                 for stock in serializer.data["stock"]:
#                     stock_serializer = StockServiceCreateSerializer(data=stock)
#                     if stock_serializer.is_valid():
#                         stock_serializer.save(product_id=service_id)
#                 resp = {
#                     "status":"success",
#                     "message":"Stocks added Successfully."
#                 }
#             else:
#                 resp = {
#                     "status":"failure",
#                     "message":serializer.errors
#                 }
#         else:
#             resp = {
#                 "status":"failure",
#                 "message":"This product is not TV instance."
#             }
#         return Response(resp)

#     @extend_schema(request=StockServiceAllUpdateSerializer)
#     def patch(self, request, service_id):
#         """
#         Updating stock services
#         ----------------------------------------------------------------

#         Parameters
#         ----------------------------------------------------------------
#             pathparameters
#                 service_id: int

#         Request_body
#         ----------------------------------------------------------------
#             request: json_data
#             {
#                 "availability": true,
#                 "mrp": int,
#                 "price": int,
#                 "size": int,
#                 "size_type": "string",
#                 "quantity": int
#             }

#         Returns
#         ----------------------------------------------------------------
#             json response: success or failure messages
#         """
#         stocks = self.get_stock_object(service_id)
#         product = self.get_product_object(service_id)
#         if product.category.type == "service":
#             serializer = StockServiceAllUpdateSerializer(data=request.data)
#             if serializer.is_valid():
#                 for count, stock_data in enumerate(serializer.data["stock"]):
#                     stock_serializer =StockServiceUpdateSerializer(
#                             stocks[count], data=stock_data, partial=True
#                     )
#                     if stock_serializer.is_valid():
#                         stock_serializer.save()
#                         resp = {
#                             "status":"success",
#                             "message":"Stock updated."

#                         }
#                     else:
#                         resp = {
#                             "status":"failure",
#                             "message":"Inside loop"
#                         }
#             else:
#                 resp = {
#                     "status":"failure",
#                     "message":serializer.errors
#                 }
#         else:
#             resp = {
#                 "status":"failure",
#                 "message":"This product is not TV instance."
#             }
#         return Response(resp)


class StockSingleDeleteAPIView(APIView):
    permission_classes = [MerchantAndStaffPermission]

    def get_object(self, stock_id):
        try:
            return Stock.objects.get(id=stock_id)
        except Stock.DoesNotExist:
            raise Http404

    def delete(self, request, stock_id):
        """
        Deleting stock using stock_id
        """
        stocks = self.get_object(stock_id)
        product = stocks.product
        try:
            user = request.user.staff
        except:
            # for stock in stocks:
            if request.user != stocks.product.user:
                return Response(
                    {
                        "status": "failure",
                        "message": "You do not have permission to perform this action.",
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

        stocks.delete()
        stocks_count = Stock.objects.filter(product=product).count()
        if stocks_count < 1:
            product.status = "Pending"
            product.save()
            resp = {
                "status": "success",
                "message": "Since the shortage of stock, your product has been made inactive. Kindly fill the stock to activate it again.",
            }
        else:
            resp = {"status": "success", "message": "Stock has been deleted."}
        return Response(resp)


class StockProductClearAPIView(APIView):
    permission_classes = [MerchantAndStaffPermission]

    def get_object(self, id):
        try:
            return Product.objects.get(id=id)
        except Product.DoesNotExist:
            raise Http404

    def delete(self, request, id):
        """
        Clearing products from stock
        """
        product = self.get_object(id)
        stocks = Stock.objects.filter(product=product)
        try:
            user = request.user.staff
        except:
            for stock in stocks:
                if request.user != stock.product.user:
                    return Response(
                        {
                            "status": "failure",
                            "message": "You do not have permission to perform this action.",
                        },
                        status=status.HTTP_403_FORBIDDEN,
                    )

        stocks.delete()
        product.status = "Pending"
        product.save()
        resp = {
            "status": "success",
            "message": "Since the shortage of stock, your product has been made inactive. Kindly fill the stock to activate it again.",
        }
        return Response(resp)


class StockMultipleDeleteAPIView(APIView):
    permission_classes = [MerchantAndStaffPermission]

    def delete(self, request, *args, **kwargs):
        """
        Deleting multiple stocks
        """
        query_param = self.request.query_params.get("id")  # "[1,2,3]"
        id_list = eval(query_param)
        stocks = Stock.objects.filter(id__in=id_list)
        if not stocks:
            return Response(
                {"status": "failure", "message": "Please select valid stocks."},
                status=status.HTTP_404_NOT_FOUND,
            )
        product = stocks[0].product
        try:
            user = request.user.staff
        except:
            for stock in stocks:
                if request.user != stock.product.user:
                    return Response(
                        {
                            "status": "failure",
                            "message": "You do not have permission to perform this action.",
                        },
                        status=status.HTTP_403_FORBIDDEN,
                    )

        stocks.delete()
        stocks_count = Stock.objects.filter(product=product).count()
        if stocks_count < 1:
            product.status = "Pending"
            product.save()
            resp = {
                "status": "success",
                "message": "Since the shortage of stock, your product has been made inactive. Kindly fill the stock to activate it again.",
            }
        else:
            resp = {"status": "success", "message": "The Stocks has been deleted."}
        # resp = {
        #     "status":"success",
        #     "message":"The stocks have been deleted."

        # }
        return Response(resp)


# class StaffQualityCheckProductOfMerchantAPIView(APIView):
#     def post(self, request, product_id):


class LargeResultsSetPagination(PageNumberPagination):
    page_size = 2
    page_size_query_param = "page_size"

    def get_paginated_response(self, data):
        response = Response(data)
        response["count"] = self.page.paginator.count
        response["next"] = self.get_next_link()
        response["previous"] = self.get_previous_link()
        return response


class ProductListGenericsView(generics.ListAPIView):
    queryset = Product.products.all().distinct()
    serializer_class = ProductListSerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    permission_classes = [AllowAny]
    search_fields = [
        "name",
        "category__slug",
        "model_no",
        "product_status",
        "slug",
        "stocks__sku",
        "created_at",
    ]
    filterset_class = ProductFilterSet
    pagination_class = CustomPagination

    @CustomCache.cache_response(
        "products:list:{request.GET.page}:{request.GET.search}:{request.GET.category}:{request.GET.sort_by}:{request.GET.brand}",
        timeout=300,
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class CMSProductListGenericsView(generics.ListAPIView):
    queryset = Product.products.all().distinct()
    serializer_class = CMSProductListSerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    permission_classes = [AllowAny]
    search_fields = [
        "name",
        "category__slug",
        "model_no",
        "product_status",
        "slug",
        "stocks__sku",
        "created_at",
    ]
    filterset_class = ProductFilterSet
    pagination_class = CustomPagination

    @CustomCache.cache_response(
        "products:list:{request.GET.page}:{request.GET.search}:{request.GET.category}:{request.GET.sort_by}:{request.GET.brand}",
        timeout=300,
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


import json


class ProductCreatesAPIView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    serializer_class = ProductCreateSerializer

    def post(self, request, *args, **kwargs):
        try:
            product_data = request.data.copy()
            print("product data", request.data)

            # Extract images
            images_files = request.FILES.getlist("images")
            print("images_files", images_files)
            product_data.pop("images", None)

            # Parse stocks JSON if provided
            stocks_data = []
            if "stocks" in request.data:
                raw_stocks = request.data.get("stocks")
                if isinstance(raw_stocks, str):
                    try:
                        stocks_data = json.loads(raw_stocks)
                    except json.JSONDecodeError:
                        return Response(
                            {"error": "Invalid JSON for stocks"},
                            status=status.HTTP_400_BAD_REQUEST,
                        )
            with transaction.atomic():

                # Validate and create product
                serializer = self.serializer_class(data=product_data)
                serializer.is_valid(raise_exception=True)
                product = serializer.save(user=request.user)

                # Save images
                image_urls = []
                for image_file in images_files:
                    img = ProductImage.objects.create(product=product, image=image_file)
                    image_urls.append(img.image.url)

                # Save stocks
                for stock in stocks_data:
                    Stock.objects.create(product=product, **stock)

                output_serializer = self.serializer_class(product)

                return Response(
                    {
                        "status": "success",
                        "message": "Product created successfully.",
                        "data": output_serializer.data,
                        "images": image_urls,
                    },
                    status=status.HTTP_201_CREATED,
                )

        except Exception as e:
            return Response(
                {
                    "status": "Failed to create Product.",
                    "detailed": str(e),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )


class ProductRetrieveView(generics.RetrieveAPIView):
    queryset = Product.products.all()
    permission_classes = (AllowAny,)
    serializer_class = ProductDetailSerializer
    lookup_field = "slug"


class ProductUpdateView(APIView):

    serializer_class = ProductUpdateSerializer

    def put(self, request, id, *args, **kwargs):
        product_data = request.data.copy()

        images_files = request.FILES.getlist("images")
        print("images_files", images_files)
        product_data.pop("images", None)
        stocks_data = []
        if "stocks" in request.data:
            raw_stocks = request.data.get("stocks")
            print("raw_stocks", raw_stocks)
            if isinstance(raw_stocks, str):
                try:
                    stocks_data = json.loads(raw_stocks)
                except json.JSONDecodeError:
                    return Response(
                        {"error": "Invalid JSON for stocks"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

        try:
            instance = Product.objects.get(id=id)
            serializer = self.serializer_class(
                instance=instance, data=product_data, partial=True
            )
            serializer.is_valid(raise_exception=True)
            product = serializer.save(user=request.user)

            # Save images
            if images_files:
                ProductImage.objects.filter(product=product).delete()
            for image_file in images_files:
                # ProductImage.objects.filter(product=product).delete()
                ProductImage.objects.create(product=product, image=image_file)

            # Save stocks
            for stock in stocks_data:
                print("stock", stock)
                stock_id = stock.pop("id", None)
                if stock_id:
                    # Update existing stock
                    Stock.objects.filter(id=stock_id, product=product).update(**stock)
                else:
                    # Create new stock
                    Stock.objects.create(product=product, **stock)

            return Response(
                {
                    "status": "success",
                    "message": "Product created successfully.",
                    "data": serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:

            return Response(
                {
                    "status": "Failed to create Product.",
                    "detailed": str(e),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )


class ProductDeleteView(generics.DestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductListSerializer  # optional
    lookup_field = "id"


class ProductAttributeCreateAPIView(generics.CreateAPIView):
    permission_classes = [AllStaffPermission]
    serializer_class = ProductAttributeCreateUpdateSerializer
    lookup_url_kwarg = "product_id"

    def perform_create(self, serializer, *args, **kwargs):
        product_id = self.kwargs.get(self.lookup_url_kwarg)
        product_obj = get_object_or_404(Product, id=product_id)
        attributes = serializer.validated_data.get("attributes")
        for attribute_obj in attributes:
            if (
                attribute_obj["attribute"]
                not in product_obj.category.parent.product_attribute.all()
            ):
                raise serializers.ValidationError(
                    {
                        "attribute": [
                            "This attribute is not acceptable for this product. Please change the category or attribute."
                        ]
                    }
                )
            if attribute_obj["attribute"] in product_obj.attributes.all():
                raise serializers.ValidationError(
                    {
                        "attribute": [
                            "This attribute name is already in the product. Please change the attribute."
                        ]
                    }
                )
        attributes = [
            Product_Attribute(product=product_obj, **attribute)
            for attribute in attributes
        ]

        Product_Attribute.objects.bulk_create(attributes)

    def create(self, request, *args, **kwargs):
        super().create(request, *args, **kwargs)
        return Response(
            {"status": "success", "message": "Product attribute successfully created."},
            status=status.HTTP_201_CREATED,
        )


@extend_schema(request=ProductAttributeCreateUpdateSerializer)
class ProductAttributeUpdateAPIView(APIView):
    def patch(self, request, *args, **kwargs):
        serializer = ProductAttributeCreateUpdateSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            attributes = serializer.validated_data.get("attributes")
            id_set = [attribute["attribute"] for attribute in attributes]
            attrs_to_update = Product_Attribute.objects.filter(id__in=id_set)
            for prof in attrs_to_update:
                prof.value = next(
                    attribute["value"]
                    for attribute in attributes
                    if attribute["attribute"] == prof.id
                )

            Product_Attribute.objects.bulk_update(attrs_to_update, ["value"])
            resp = {
                "status": "success",
                "message": "Product attribute values updated successfully.",
            }
            return Response(resp)


# class StockCreateAPIView(generics.CreateAPIView):
#     permission_classes=[AllStaffPermission]
#     serializer_class = StockCreateSerializer
#     def perform_create(self, serializer):
#         serializer.save(status="Active")
#     def create(self, request, *args, **kwargs):
#         response=super().create(request, *args, **kwargs)
#         return Response({'status':'success','message':'Stock successfully created.','stock_id':response.data['id']},status=status.HTTP_201_CREATED)
class StockListAPIView(generics.ListAPIView):
    permission_classes = [AllStaffPermission]
    serializer_class = StockListSerializer
    lookup_url_kwarg = "product_id"

    def get_queryset(self):
        return Stock.objects.filter(product_id=self.kwargs.get(self.lookup_url_kwarg))


class StockRetireveDestroyUpdateAPIView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [AllStaffPermission]
    serializer_class = StockCreateSerializer
    queryset = Stock.objects.all()

    def update(self, request, *args, **kwargs):
        super().update(request, *args, **kwargs)
        return Response({"status": "success", "message": "Stock succesfully updated."})

    def delete(self, request, *args, **kwargs):
        super().delete(request, *args, **kwargs)
        return Response({"status": "success", "message": "Stock succesfully deleted."})


class StockAttributeValueCreateAPIView(generics.CreateAPIView):
    permission_classes = [AllStaffPermission]
    serializer_class = StockAttributeValueBulkCreateSerializer
    lookup_url_kwarg = "stock_id"

    def perform_create(self, serializer, *args, **kwargs):
        stock_id = self.kwargs.get(self.lookup_url_kwarg)
        stock_obj = get_object_or_404(Stock, id=stock_id)
        attributes = serializer.validated_data.get("attributes")
        for obj in attributes:
            if (
                obj["attribute"]
                not in stock_obj.product.category.parent.stock_attribute.all()
            ):
                raise serializers.ValidationError(
                    {
                        "attribute": [
                            "This attribute is not acceptable for this stock. Please change the category or attribute."
                        ]
                    }
                )
        attributes = [
            Stock_StockAttribute(stock=stock_obj, **attribute)
            for attribute in attributes
        ]
        Stock_StockAttribute.objects.bulk_create(attributes)

    def create(self, request, *args, **kwargs):
        super().create(request, *args, **kwargs)
        return Response(
            {"status": "success", "message": "Stock attribute successfully created."},
            status=status.HTTP_201_CREATED,
        )


class ProductAttributeListView(generics.RetrieveAPIView):
    permission_classes = [AllStaffPermission]
    serializer_class = ProductAttributesSerializer
    lookup_field = "category_id"

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_queryset()
        serializer = ProductAttributesSerializer(instance)
        return Response(serializer.data)

    def get_queryset(self):
        category_object = get_object_or_404(
            Category, id=self.kwargs.get("category_id"), level=2, type="product"
        )
        return category_object


class StockAttributeListView(generics.RetrieveAPIView):
    permission_classes = [AllStaffPermission]
    serializer_class = ProductAttributesSerializer
    lookup_field = "product_id"

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_queryset()
        serializer = StockAttributesSerializer(instance.category)
        return Response(serializer.data)

    def get_queryset(self):
        product_obj = get_object_or_404(
            Product, id=self.kwargs.get("product_id"), type="product"
        )
        return product_obj
