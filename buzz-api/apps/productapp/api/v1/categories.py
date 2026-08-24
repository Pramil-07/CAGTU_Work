from stripe import Price
from yaml import serialize
from .serializers import *
from apps.productapp.filters import ProductFilterSet
from rest_framework.views import APIView
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from rest_framework.parsers import FormParser, MultiPartParser
from ...helpers import *
from collections import OrderedDict

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
from apps.core.permissions import *
from apps.core.utils import *
from .excel_read import Workbook
from django.conf import settings
import os
from apps.productapp.excel_utils.category_mobiles import (
    create_mobile_stock,
    create_product_mobile,
)
from apps.productapp.excel_utils.excel_validations import validate_excel, validate_stock


class CategoryChildListAPIView(generics.ListAPIView):
    """Get list of child categories

    Args:
        id: int
        page: int
        page_size: int
    Returns:
        Response: Paginated data
    """

    permission_classes = [AllStaffPermission]
    serializer_class = CategoryGrandParentCreateSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["name"]
    lookup_url_kwarg = "pk"

    def get_serializer_class(self):
        parent = get_object_or_404(Category, id=self.kwargs.get(self.lookup_url_kwarg))
        if parent.level == 1:
            return CategoryChildListSerializer
        return CategoryGrandParentListSerializer

    def get_queryset(self):
        parent = get_object_or_404(Category, id=self.kwargs.get(self.lookup_url_kwarg))
        return Category.objects.filter(type="product", parent=parent)

    def list(self, request, *args, **kwargs):
        parent = get_object_or_404(Category, id=self.kwargs.get(self.lookup_url_kwarg))
        response = super().list(request, *args, **kwargs)
        try:
            response.data = {
                **response.data,
                "parent": {"id": parent.id, "name": parent.name},
                "grandparent": {"id": parent.parent.id, "name": parent.parent.name},
            }
        except:
            response.data = {
                **response.data,
                "parent": {"id": parent.id, "name": parent.name},
            }
        return response


class CategoryGrandParentListCreateAPIView(generics.ListCreateAPIView):
    """Get and create grand parent categories

    Returns:
        Response: Paginated data
    """

    permission_classes = [AllStaffPermission]
    queryset = Category.objects.filter(level=0, type="product")
    filter_backends = [filters.SearchFilter]
    search_fields = ["name"]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return CategoryGrandParentCreateSerializer
        return CategoryGrandParentListSerializer

    def perform_create(self, serializer):
        serializer.save(type="product")

    def post(self, request, *args, **kwargs):
        super().post(request, *args, **kwargs)
        return Response(
            {"status": "success", "message": "Category successfully created."},
            status=status.HTTP_200_OK,
        )


class CategoryRetrieveAndUpdateAPIView(generics.RetrieveUpdateAPIView):
    permission_classes = [AllStaffPermission]
    queryset = Category.objects.filter(level=0, type="product")
    serializer_class = CategoryGrandParentCreateSerializer

    def put(self, request, *args, **kwargs):
        response = super().put(request, *args, **kwargs)
        response.data = {
            "status": "success",
            "message": "Category successfully updated.",
            **response.data,
        }
        return response

    def patch(self, request, *args, **kwargs):
        response = super().patch(request, *args, **kwargs)
        response.data = {
            "status": "success",
            "message": "Category successfully updated.",
            **response.data,
        }
        return response


class CategoryParentCreateAPIView(generics.CreateAPIView):
    permission_classes = [AllStaffPermission]
    serializer_class = CategoryParentCreateSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["name"]

    def perform_create(self, serializer):
        serializer.save(type="product")

    def create(self, request, *args, **kwargs):
        # serializer = self.serializer_class(data=request.data)
        # if serializer.is_valid(raise_exception=True):
        #     serializer.save(type="product")
        return Response(
            {"status": "success", "message": "Category successfully created."},
            status=status.HTTP_200_OK,
        )


class CategoryDestroyAPIView(generics.DestroyAPIView):
    permission_classes = [AllStaffPermission]
    queryset = Category.objects.filter(type="product")

    def delete(self, *args, **kwargs):
        category = get_object_or_404(Category, id=kwargs["pk"])
        if category.product_set.all().count() != 0:
            return Response(
                {
                    "status": "failure",
                    "message": "This category is currently being used and cannot be deleted. Please remove it from all the products and try once again.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )
        if category.category_set.all().count() != 0:
            return Response(
                {
                    "status": "failure",
                    "message": "This category has active childs. Please remove all the childs and try once again.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )
        super().delete(*args, **kwargs)
        return Response(
            {"status": "success", "message": "Category successfully deleted."},
            status=status.HTTP_200_OK,
        )


class CategoryParentRetrieveUpdateAPIView(generics.RetrieveUpdateAPIView):
    permission_classes = [AllStaffPermission]
    queryset = Category.objects.filter(level=1, type="product")
    serializer_class = CategoryParentCreateSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = CategoryParentRetrieveSerializer(instance)
        return Response(serializer.data)

    def put(self, request, *args, **kwargs):
        response = super().put(request, *args, **kwargs)
        response.data = {
            "status": "success",
            "message": "Category successfully updated.",
            **response.data,
        }
        return response

    def patch(self, request, *args, **kwargs):
        response = super().patch(request, *args, **kwargs)
        response.data = {
            "status": "success",
            "message": "Category successfully updated.",
            **response.data,
        }
        return response


class CategoryChildCreateAPIView(generics.CreateAPIView):
    permission_classes = [AllStaffPermission]
    serializer_class = CategoryChildCreateSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save(type="product")
        return Response(
            {"status": "success", "message": "Category successfully created."},
            status=status.HTTP_200_OK,
        )


class CategoryChildRetrieveUpdateAPIView(generics.RetrieveUpdateAPIView):
    permission_classes = [AllStaffPermission]
    queryset = Category.objects.filter(level=2, type="product")
    serializer_class = CategoryChildCreateSerializer

    def put(self, request, *args, **kwargs):
        response = super().put(request, *args, **kwargs)
        response.data = {
            "status": "success",
            "message": "Category successfully updated.",
            **response.data,
        }
        return response

    def patch(self, request, *args, **kwargs):
        response = super().patch(request, *args, **kwargs)
        response.data = {
            "status": "success",
            "message": "Category successfully updated.",
            **response.data,
        }
        return response


class CategoryMultipleDeleteAPIView(generics.DestroyAPIView):
    permission_classes = [AllStaffPermission]

    def destroy(self, request, *args, **kwargs):
        try:
            query_param = eval(self.request.query_params.get("id"))
        except:
            return Response(
                {
                    "status": "failure",
                    "message": "The id should be in list format. eg. id=[1,2,3]",
                },
                status=status.HTTP_403_FORBIDDEN,
            )
        try:
            categories = Category.objects.filter(id__in=query_param)
            if not categories:
                return Response(
                    {"status": "failure", "message": "Please select valid categories."},
                    status=status.HTTP_404_NOT_FOUND,
                )
            for category in categories:
                if category.product_set.all().count() != 0:
                    return Response(
                        {
                            "status": "failure",
                            "message": "This category is currently being used and cannot be deleted. Please remove it from all the products and try once again.",
                        },
                        status=status.HTTP_403_FORBIDDEN,
                    )
                if category.category_set.all().count() != 0:
                    return Response(
                        {
                            "status": "failure",
                            "message": "This category has active childs. Please remove all the childs and try once again.",
                        },
                        status=status.HTTP_403_FORBIDDEN,
                    )
        except Exception as e:
            return Response(
                {
                    "status": "failure",
                    "message": f"{str(e)}. The id should be in list format. eg. id=[1,2,3]",
                },
                status=status.HTTP_404_NOT_FOUND,
            )
        self.perform_destroy(categories)
        resp = {"status": "success", "message": "The categories have been deleted."}
        return Response(resp)


class AttributeListWithoutPaginationListAPIView(generics.ListAPIView):
    """List and create API for Attributes

    Args:
        name: CharField eg: pixel size, no. of hdmi ports
        type: CharField (Choices= 'number','text','select')
        unit: CharField (accepts null) eg: KG, GB, Watt, RPM

    """

    permission_classes = [AllStaffPermission]
    queryset = Attribute.objects.all()
    serializer_class = AttributeListWithoutPaginationSerializer

    def paginate_queryset(self, queryset):
        if (
            self.paginator
            and self.request.query_params.get(self.paginator.page_query_param, None)
            is None
        ):
            return None
        return super().paginate_queryset(queryset)


class StockAttributeListWithoutPaginationListAPIView(generics.ListAPIView):
    """List and create API for Attributes

    Args:
        name: CharField eg: pixel size, no. of hdmi ports
        type: CharField (Choices= 'number','text','select')
        unit: CharField (accepts null) eg: KG, GB, Watt, RPM

    """

    permission_classes = [AllStaffPermission]
    queryset = StockAttribute.objects.all()
    serializer_class = StockAttributeListWithoutPaginationSerializer

    def paginate_queryset(self, queryset):
        if (
            self.paginator
            and self.request.query_params.get(self.paginator.page_query_param, None)
            is None
        ):
            return None
        return super().paginate_queryset(queryset)


class AttributeListCreateAPIView(generics.ListCreateAPIView):
    """
    List and create API for Attributes

    Args:
    ----------------------------------------------------------------
        name: CharField eg: pixel size, no. of hdmi ports
        type: CharField (Choices= 'number','text','select')
        options: (only if type is 'select') -> ['option_one', 'option_two', 'option_three'] ; Note: using single quotation marks instead of double quotation marks inside list
        unit: CharField (accepts null) eg: KG, GB, Watt, RPM

    Returns:
    ----------------------------------------------------------------
            Response with paginated data of list of attributes.
            Response with status and message.
    """

    permission_classes = [AllStaffPermission]
    queryset = Attribute.objects.all()
    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "type", "unit"]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return AttributeCreateSerializer
        return AttributeListSerializer

    def create(self, request, *args, **kwargs):
        super().create(request, *args, **kwargs)
        return Response(
            {"status": "success", "message": "Attribute succesfully created."},
            status=status.HTTP_201_CREATED,
        )


class AttributeRetriveUpdateDeleteAPIView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [AllStaffPermission]
    queryset = Attribute.objects.all()
    serializer_class = AttributeCreateSerializer

    def delete(self, request, *args, **kwargs):
        attribute = get_object_or_404(Attribute, id=kwargs["pk"])
        if attribute.category_product.all().count() != 0:
            return Response(
                {
                    "status": "failure",
                    "message": "Attribute is currently being used and cannot be deleted. Please remove it from the category and try once again.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )
        super().delete(request, *args, **kwargs)
        return Response(
            {"status": "success", "message": "Attribute successfully deleted."},
            status=status.HTTP_200_OK,
        )

    def put(self, request, *args, **kwargs):
        response = super().put(request, *args, **kwargs)
        response.data = {
            "status": "success",
            "message": "Attribute successfully updated.",
            **response.data,
        }
        return response

    def patch(self, request, *args, **kwargs):
        response = super().patch(request, *args, **kwargs)
        response.data = {
            "status": "success",
            "message": "Attribute successfully updated.",
            **response.data,
        }
        return response


class AttributeMultipleDestroyAPIView(generics.DestroyAPIView):
    """Multiple Delete Attribute with id list

    Args:
        id : list

    Returns:
        Response: success or failure with message
    """

    permission_classes = [AllStaffPermission]

    def destroy(self, request, *args, **kwargs):
        try:
            query_param = eval(self.request.query_params.get("id"))
        except:
            return Response(
                {
                    "status": "failure",
                    "message": "The id should be in list format. eg. id=[1,2,3]",
                },
                status=status.HTTP_403_FORBIDDEN,
            )
        try:
            instance = Attribute.objects.filter(id__in=query_param)
            for attribute in instance:
                if attribute.category_product.all().count() != 0:
                    return Response(
                        {
                            "status": "failure",
                            "message": "Attribute is currently being used and cannot be deleted. Please remove it from the category and try once again.",
                        },
                        status=status.HTTP_403_FORBIDDEN,
                    )
        except Exception as e:
            return Response(
                {
                    "status": "failure",
                    "message": f"{str(e)}. The id should be in list format. eg. id=[1,2,3]",
                },
                status=status.HTTP_404_NOT_FOUND,
            )
        self.perform_destroy(instance)
        return Response(
            {"status": "success", "message": "Attributes has been deleted."},
            status=status.HTTP_200_OK,
        )


# StockAttribute
class StockAttributeListCreateAPIView(generics.ListCreateAPIView):
    """List and create API for StockAttributes

    Args:
        name: CharField eg: pixel size, no. of hdmi ports
        type: CharField (Choices= 'number','text','select')
        unit: CharField (accepts null) eg: KG, GB, Watt, RPM
    Returns:
            Response with paginated data of list of attributes.
            Response with status and message.
    """

    permission_classes = [AllStaffPermission]
    queryset = StockAttribute.objects.all()
    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "type", "unit"]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return StockAttributeKeyCreateSerializer
        return StockAttributeKeyListSerializer

    def create(self, request, *args, **kwargs):
        super().create(request, *args, **kwargs)
        return Response(
            {"status": "success", "message": "StockAttribute succesfully created."},
            status=status.HTTP_201_CREATED,
        )


class StockAttributeKeyRetriveUpdateDeleteAPIView(
    generics.RetrieveUpdateDestroyAPIView
):
    permission_classes = [AllStaffPermission]
    queryset = StockAttribute.objects.all()
    serializer_class = StockAttributeKeyCreateSerializer

    def delete(self, request, *args, **kwargs):
        attribute = get_object_or_404(StockAttribute, id=kwargs["pk"])
        if attribute.category_stock.all().count() != 0:
            return Response(
                {
                    "status": "failure",
                    "message": "StockAttribute is currently being used and cannot be deleted. Please remove it from the category and try once again.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )
        super().delete(request, *args, **kwargs)
        return Response(
            {"status": "success", "message": "StockAttribute successfully deleted."},
            status=status.HTTP_200_OK,
        )

    def put(self, request, *args, **kwargs):
        response = super().put(request, *args, **kwargs)
        response.data = {
            "status": "success",
            "message": "StockAttribute successfully updated.",
            **response.data,
        }
        return response

    def patch(self, request, *args, **kwargs):
        response = super().patch(request, *args, **kwargs)
        response.data = {
            "status": "success",
            "message": "StockAttribute successfully updated.",
            **response.data,
        }
        return response


class StockAttributeMultipleDestroyAPIView(generics.DestroyAPIView):
    """Multiple Delete Attribute with id list

    Args:
        id : list

    Returns:
        Response: success or failure with message
    """

    permission_classes = [AllStaffPermission]

    def destroy(self, request, *args, **kwargs):
        try:
            query_param = eval(self.request.query_params.get("id"))
        except:
            return Response(
                {
                    "status": "failure",
                    "message": "The id should be in list format. eg. id=[1,2,3]",
                },
                status=status.HTTP_403_FORBIDDEN,
            )
        try:
            instance = StockAttribute.objects.filter(id__in=query_param)
            for attribute in instance:
                if attribute.category_stock.all().count() != 0:
                    return Response(
                        {
                            "status": "failure",
                            "message": "Stock Attribute is currently being used and cannot be deleted. Please remove it from the category and try once again.",
                        },
                        status=status.HTTP_403_FORBIDDEN,
                    )
        except Exception as e:
            return Response(
                {
                    "status": "failure",
                    "message": f"{str(e)}. The id should be in list format. eg. id=[1,2,3]",
                },
                status=status.HTTP_404_NOT_FOUND,
            )
        self.perform_destroy(instance)
        return Response(
            {"status": "success", "message": "Stock Attributes has been deleted."},
            status=status.HTTP_200_OK,
        )


class BulkCreateProductPostAPIView(generics.GenericAPIView):
    # permission_classes = [MerchantAndStaffPermission]
    parser_classes = [FormParser, MultiPartParser]
    serializer_class = ExcelfileSerializer

    @extend_schema(tags=["Excel"])
    def post(self, request, *args, **kwargs):
        """
        Adding products in respective categories using excel file
        ----------------------------------------------------------------

        Request_body
        ----------------------------------------------------------------
            request: form_data
                filename: str (filefield)

        Returns
        ----------------------------------------------------------------
            json response: success or failure messages along with corresponding data
        """
        try:
            fileName = request.data["filename"]
            ExcelStorage.objects.create(filename=fileName)
            # # filelink = [request.build_absolute_uri(file_obj.filename.url)] # file link needed
            # # resp = str(filelink)
            last_file = ExcelStorage.objects.last()
            dir_name = str(last_file.filename)
            dir = os.path.join(settings.MEDIA_ROOT, dir_name)
            try:
                data_obj = Workbook(excelfile=dir, request=request)
                product_datas = data_obj.create_product()
                stock_datas = data_obj.create_stocks()

                try:
                    merchant_obj = Merchant.objects.get(user=request.user)
                    added_by = merchant_obj.merchant_name
                except ObjectDoesNotExist:
                    try:

                        added_by = "BUZZ Mall"

                    except Exception as e:
                        return Response(
                            {"status": "failure", "message": f"Error {e}"},
                            status=status.HTTP_404_NOT_FOUND,
                        )
                validation_response = validate_excel(
                    request=request, product_datas=product_datas
                )
                if type(validation_response) is not bool:
                    return validation_response
                elif validation_response:
                    validate_stock_response = validate_stock(stock_datas=stock_datas)
                    if type(validate_stock_response) is not bool:
                        return validate_stock_response
                    elif validate_stock_response:
                        image_data = data_obj.image()
                        stock_image_data = data_obj.stock_image()
                        data = create_product_mobile(
                            request=request,
                            product_datas=product_datas,
                            image_data=image_data,
                            added_by=added_by,
                        )
                        create_mobile_stock(
                            data=data,
                            stock_image_data=stock_image_data,
                            stock_data=stock_datas,
                        )
                    else:
                        return Response(
                            {
                                "status": "failure",
                                "message": "not able to create product",
                            }
                        )

                else:
                    return Response(
                        {
                            "status": "failure",
                            "message": "not able to create product",
                        }
                    )

            except Exception as e:
                return Response(
                    {
                        "status": "failed",
                        "message": str(e),
                    }
                )

            return Response(
                {
                    "status": "success",
                    "message": "file uploaded successfully",
                }
            )

        except Exception as e:
            resp = {
                "status": "failure",
                "message": str(e),
            }

        return Response(resp)


# Service Category


# Inherits CategoryGrandParentListCreateAPIView
@extend_schema(tags=["Service Category"])
class ServiceCategoryGrandParentListCreateAPIView(CategoryGrandParentListCreateAPIView):
    """
    Get and create grand parent service categories

    Returns:
        Response: Paginated data
    """

    def perform_create(self, serializer):
        serializer.save(type="service")

    @extend_schema(
        tags=["Service Category"], summary="Service category grandparent create api"
    )
    def post(self, request, *args, **kwargs):
        super().post(request, *args, **kwargs)
        return Response(
            {"status": "success", "message": "Service category successfully created."},
            status=status.HTTP_200_OK,
        )


@extend_schema(tags=["Service Category"], summary="Service category parent create api")
class ServiceCategoryParentCreateAPIView(CategoryParentCreateAPIView):
    """
    Service Category create for Parent (level 2 category)
    """

    def perform_create(self, serializer):
        serializer.save(type="service")

    def create(self, request, *args, **kwargs):
        # serializer = self.serializer_class(data=request.data)
        # if serializer.is_valid(raise_exception=True):
        #     serializer.save(type="product")

        response = super().create(request, *args, **kwargs)
        return Response(
            {"status": "success", "message": "Service category successfully created."},
            status=status.HTTP_200_OK,
        )


@extend_schema(tags=["Service Category"], summary="Service category child create api")
class ServiceCategoryChildCreateAPIView(CategoryChildCreateAPIView):
    def create(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save(type="product")
        return Response(
            {"status": "success", "message": "Category successfully created."},
            status=status.HTTP_200_OK,
        )


@extend_schema(
    tags=["Service Category"], summary="Service category DetailPatchDeleteAPIView"
)
class CMSServiceCategoryDetailPatchDeleteAPIView(APIView):
    permission_classes = [AllStaffPermission]

    def get_object(self, id):
        try:
            return Category.objects.get(id=id, type="service")
        except Category.DoesNotExist:
            raise Http404

    def get(self, request, id):
        """
        Getting service category details using category id
        """
        service_category = self.get_object(id)
        # serializer = CategoryDetailSerializer(service_category)
        serializer = CategoryParentRetrieveSerializer(service_category)
        resp = {"status": "success", "data": serializer.data}
        return Response(resp)

    @extend_schema(request=CategoryUpdateSerializer)
    def patch(self, request, id):
        """
        Updating service category
        ----------------------------------------------------------------

        Parameters
        ----------------------------------------------------------------
            pathparameters
                id: int

        Request_body
        ----------------------------------------------------------------
            request: json_data
            {
                "name": "string",
                "parent": int
            }
        """
        service_category = self.get_object(id)
        serializer = CategoryUpdateSerializer(
            service_category, data=request.data, partial=True
        )
        if serializer.is_valid():
            # parent_id = request.data["parent"]
            # parent = self.get_object(parent_id)
            # serializer.save(parent=parent)
            serializer.save()
            resp = {
                "status": "success",
                "message": "Service category has been updated.",
            }
        else:
            resp = {"status": "failure", "message": serializer.errors}
        return Response(resp)

    def delete(self, request, id):
        """
        Deleting service category using id
        """
        service_category = self.get_object(id)
        service_category.delete()
        resp = {"status": "success", "message": "Service category has been deleted."}
        return Response(resp)


@extend_schema(tags=["Service Category"], summary="Service category multiple delete")
class CMSServiceCategoryMultipleDeleteAPIView(APIView):
    permission_classes = [AllStaffPermission]

    def delete(self, request, *args, **kwargs):
        """
        Deleting multiple service categories in a single execution
        """
        query_param = self.request.query_params.get("id")  # "[1,2,3]"
        id_list = eval(query_param)
        service_categories = Category.objects.filter(id__in=id_list)
        if not service_categories:
            return Response(
                {"status": "failure", "message": "Please select valid categories."},
                status=status.HTTP_404_NOT_FOUND,
            )
        service_categories.delete()
        resp = {"status": "success", "message": "The categories have been deleted."}
        return Response(resp)
