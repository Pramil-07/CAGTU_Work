# from .api.v1.serializers import *
# from apps.accountapp.utils import AllStaffPermission, MerchantAndStaffPermission
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
# from rest_framework.parsers import FormParser, MultiPartParser
# from .helpers import *
# from collections import OrderedDict
# from apps.accountapp.utils import AllStaffPermission, MaintainerOnlyPermission, AdminOnlyPermission, MerchantOnlyPermission
# from rest_framework.pagination import PageNumberPagination
# from django.db.models import Q
# from rest_framework import status
# from rest_framework.exceptions import ValidationError, APIException
# import random
# class ValidationError403(APIException):
#     status_code = status.HTTP_403_FORBIDDEN
# class CMSProductAPIView(APIView, PageNumberPagination):
#     permission_classes = [MerchantAndStaffPermission]
#     parser_classes = [MultiPartParser, FormParser]    
#     @extend_schema(request=ProductCreateSerializer)
#     def post(self, request):
#         serializer = ProductCreateSerializer(data=request.data)
#         if serializer.is_valid():
#             try:
#                 added_by = request.user.staff
#                 added_by = "BUZZ Mall"
#                 serializer.save(user=request.user, added_by=added_by, type="product",status="Active")
#             except Exception:
#                 added_by = request.user.merchant
#                 added_by = "merchant"
#                 serializer.save(user=request.user, added_by=added_by, type="product",status="Pending")
#             resp = {
#                 "product_id":serializer.data["id"]
#             }
#         else:
#             resp = {
#                 "status":"failure",
#                 "message":serializer.errors
#             }
#         return Response(resp)
    
#     page_size = 10
#     page_size_query_param = 'page_size' 
#     max_page_size = 1000
#     def get_paginated_response(self, data, page, page_num):
#         return Response(OrderedDict([
#             ('total_pages', self.page.paginator.num_pages),
#             ('count', self.page.paginator.count),
#             ('current', page),
#             ('next', self.get_next_link()),
#             ('previous', self.get_previous_link()),
#             ('page_size', page_num),
#             ('result', data),
#         ]))
    
#     def get_queryset(self,request):
#         keyword = self.request.GET.get('keyword', '')
#         brand = self.request.GET.get('brand')
#         # color = self.request.GET.get('color')
#         sortBy = self.request.GET.get('sortBy')
#         new_queryset = Product.all_products.filter(
#             Q(name__icontains=keyword) | Q(category__name__icontains=keyword) | 
#             Q(user__username__icontains=keyword) | Q(model_no__icontains=keyword) | 
#             Q(product_status__icontains=keyword) | Q(slug__icontains=keyword) |
#             Q(stocks__sku__icontains=keyword) | Q(created_at__icontains=keyword)
#             # Q(user__username__icontains=keyword) | Q(model_no__icontains=keyword) | 
#             ).distinct()
#         try:
#             user = request.user.merchant
#             new_queryset = new_queryset.filter(user = request.user)
#         except Exception as e:
#             pass

#         # filters = {}
#         # if brand:
#         #     filters['brand__name']=brand
#         # # if color:
#         # #     filters['color']=color
#         # filter_q = Q(**filters)

#         # if filters:
#         #     new_queryset.filter(filter_q)
#         # if sortBy:
#         #     try:
#         #         new_queryset = new_queryset.order_by(sortBy)
#         #     except:
#         #         pass

#         return self.paginate_queryset(new_queryset, self.request)
        
#     def get(self,request):
#         page = self.request.GET.get('page', 1)
#         page_size = self.request.GET.get('page_size', 10)
#         product = self.get_queryset(request)
#         serializer = CMSProductListSerializer(product, many=True,context={"request":request})
#         return self.get_paginated_response(serializer.data, page, page_size)
    

# class CMSProductPatchandDeleteAPIView(APIView):
#     permission_classes = [MerchantAndStaffPermission]
#     def get_object(self,request,id):
#         try:
#             product = Product.all_products.get(id=id)
#             try:
#                 user = request.user.staff
#                 return product
#             except Exception as e:
#                 if product.user == request.user:
#                     return product
#                 resp = {
#                     "status":"failure",
#                     "message":"You do not have permission to perform this action."
#                 }
#                 raise ValidationError403(resp)
#         except Product.DoesNotExist as e:
#             raise Http404 from e

#     def get(self,request, id):
#         product = self.get_object(request,id)
#         serializer = CMSProductDetailSerializer(product, context={"request":request})
#         resp = {
#             "status":"success",
#             "data":serializer.data,
#         }
#         return Response(resp)
#     parser_classes = [MultiPartParser,FormParser]
    
#     @extend_schema(request=StaffProductUpdateSerializer)
#     def patch(self,request,id):
#         try:
#             images = dict((request.data).lists())['image']
#             del request.data["image"]
#         except:
#             pass
#         product = self.get_object(request,id)
#         try:
#             user = request.user.staff
#             product_serializer = StaffProductUpdateSerializer(product,data=request.data,partial=True)
#         except:
#             product_serializer = ProductUpdateSerializer(product,data=request.data,partial=True)
#         if product_serializer.is_valid():
#             product_serializer.save()
#             resp = {
#                 "status":"success",
#                 "message":"Product updated successfully",
#                 "data":product_serializer.data,
#             }
#         else:
#             resp = {
#                 "status":"failure",
#                 "data":product_serializer.errors,
#             }
#             return Response(resp)

#         return Response(resp)

#     def delete(self,request,id):
#         product = self.get_object(request,id)
#         product.delete()
#         resp = {
#             "status":"success",
#             "message":"Product has been deleted",
#         }
#         return Response(resp)

# class CMSProductMultipleDeleteAPIView(APIView):

#     permission_classes = [MerchantAndStaffPermission]

#     def delete(self, request, *args, **kwargs):
#         query_param = self.request.query_params.get('id') # "[1,2,3]"
#         id_string = query_param[1:-1] # "1,2,3"
#         id_list = [int(x) for x in id_string.split(",")] # [1,2,3]
#         products = Product.all_products.filter(id__in = id_list)
#         if not products:
#             return Response({"status":"failure", "message":"Please select valid product."},status=status.HTTP_404_NOT_FOUND)
        
#         try:
#             user = request.user.staff
#         except:
#             for product in products:
#                 if request.user != product.user:
#                     return Response({"status": "failure", "message": "You do not have permission to perform this action."}, status=status.HTTP_403_FORBIDDEN)

#         products.delete()
#         resp = {
#             "status":"success",
#             "message":"The product have been deleted."
#         }
#         return Response(resp) 

# class BrandCreateAPIView(APIView):
#     permission_classes=[AllStaffPermission]
#     parser_classes = (FormParser, MultiPartParser)
#     @extend_schema(request=BrandCreateSerializer)
#     def post(self,request):
#         serializer=BrandCreateSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             resp={
#                 "status":"success",
#                 "message":"Brand is added successfully."
#                 }
#         else:
#             resp={
#                 "status":"failure",
#                 "message":serializer.errors
#             }
#         return Response(resp)

# class CMSBrandListAPIView(APIView,PageNumberPagination):
#     permission_classes=[AllStaffPermission]
#     page_size = 10 
#     page_size_query_param = 'page_size'
#     max_page_size = 1000

#     def get_paginated_response(self, data, page, page_num):
#         return Response(OrderedDict([
#             ('total_pages', self.page.paginator.num_pages),
#             ('count', self.page.paginator.count),
#             ('current', page),
#             ('next', self.get_next_link()),
#             ('previous', self.get_previous_link()),
#             ('page_size', page_num),
#             ('result', data),
#         ]))
    
#     def get_queryset(self,request):
#         keyword = self.request.GET.get('keyword', '')
#         new_queryset = Brand.objects.filter(name__icontains=keyword)
#         return self.paginate_queryset(new_queryset, self.request)
        
#     def get(self, request):
#         page = self.request.GET.get('page', 1)
#         page_size = self.request.GET.get('page_size', 10)
#         brands = self.get_queryset(request)
#         serializer = BrandSerializer(brands, many=True,context={"request":request})
#         return self.get_paginated_response(serializer.data, page, page_size)


# class BrandUpdateDeleteAPIView(APIView):
#     permission_classes = [AllStaffPermission]
#     def get_object(self, id):
#         try:
#             return Brand.objects.get(id=id)
#         except Brand.DoesNotExist as e:
#             raise Http404 from e
        
#     permission_classes=[AllStaffPermission]
#     def get(self,request,id):
#         brand=self.get_object(id)
#         serializer=BrandSerializer(brand,context={"request":request})
#         resp={
#             "status":"success",
#             "data":serializer.data
#         }
#         return Response(resp)
#     permission_classes=[AllStaffPermission]
#     def delete(self,request,id):
#         brand_obj=self.get_object(id)
#         brand_obj.delete()
#         resp={
#             "status":"success",
#             "message":"Brand is deleted successfully"
#         }
#         return Response(resp)
    
#     permission_classes=[AllStaffPermission]
#     parser_classes=[MultiPartParser,FormParser]
#     @extend_schema(request=BrandUpdateSerializer)
#     def patch(self,request,id):
#         brand=self.get_object(id)
#         serializer=BrandUpdateSerializer(brand,data=request.data,partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             resp={
#                 "status":"success",
#                 "message":"Brand is Updated"
#             }
#         else:
#             resp={
#                 "status":"failure",
#                 "message":serializer.errors
#             }
#         return Response(resp)
    
    
# class BrandMultipleDeleteAPIView(APIView):
#     permission_classes = [AllStaffPermission]
#     def delete(self, request, *args, **kwargs):
#         query_param = self.request.query_params.get('id') # "[1,2,3]"
#         try:
#             id_string = query_param[1:-1] # "1,2,3"
#             id_list = [int(x) for x in id_string.split(",")] # [1,2,3]
#             brands = Brand.objects.filter(id__in=id_list)
#             brands.delete()
#         except Exception as e:
#             return Response({"status":"failure","message":"Please select valid brands."},status=status.HTTP_404_NOT_FOUND)  
#         return Response({"status":"success","message":"The brands have been deleted."})

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
#     @extend_schema(request=CategorySerializer)
#     def post(self, request):
#         serializer = CategorySerializer(data = request.data)
#         if serializer.is_valid():
#             try:
#                 parent_id = request.data["parent"]
#                 parent = self.get_object(parent_id)
#                 serializer.save(parent=parent, type="product")
#             except:
#                 serializer.save(type="product")
#             resp = {
#                 "status":"success",
#                 "message":"Category created successfully.",
#                 "data":serializer.data
#             }
#         else:
#             resp = {
#                 "status":"failure",
#                 "message":serializer.errors
#             }
#         return Response(resp)
    
# class CMSCategoryListAPIView(APIView):
#     permission_classes = [AllStaffPermission]
#     def get(self,request):
#         category = Category.objects.filter(level=0).exclude(name="service")
#         serializer = CategoryListSerializer(category, many=True)
#         resp = {
#             "status":"success",
#             "data":serializer.data
#         }
#         return Response(resp)

# class CategoryDetailPatchDeleteAPIView(APIView):
#     permission_classes = [AllStaffPermission]
#     def get_object(self, id):
#         try:
#             return Category.objects.get(id=id, type="product")
#         except Category.DoesNotExist:
#             raise Http404
#     # permission_classes = [AllStaffPermission]
#     def get(self,request,id):
#         category = self.get_object(id)
#         serializer = CategoryDetailSerializer(category)
#         resp = {
#             "status":"success",
#             "data":serializer.data
#         }
#         return Response(resp)

    
#     # permission_classes = [AllStaffPermission]
#     @extend_schema(request=CategoryUpdateSerializer)
#     def patch(self,request,id):
#         category = self.get_object(id)
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
#     # permission_classes = [AllStaffPermission]
#     def delete(self, request, id):
#         category = self.get_object(id)
#         category.delete()
#         resp = {
#             "status":"success",
#             "message":"Category has been deleted."
#         }
#         return Response(resp)

# class CategoryMultipleDeleteAPIView(APIView):
#     permission_classes = [AllStaffPermission]
#     def delete(self, request, *args, **kwargs):
#         query_param = self.request.query_params.get('id') # "[1,2,3]"
#         id_string = query_param[1:-1] # "1,2,3"
#         id_list = [int(x) for x in id_string.split(",")] # [1,2,3]
#         categories = Category.objects.filter(id__in=id_list)
#         if not categories:
#             return Response({"status":"failure", "message":"Please select valid categories."},status=status.HTTP_404_NOT_FOUND)   
#         categories.delete()

#         resp = {
#             "status":"success",
#             "message":"The categories have been deleted."
            
#         }
#         return Response(resp)
    
# class MerchantProductListAPIView(APIView,PageNumberPagination):
#     permission_classes=[AllStaffPermission]
#     page_size = 10
#     page_size_query_param = 'page_size'
#     max_page_size = 1000
#     def get_paginated_response(self, data, page, page_num):
#         return Response(OrderedDict([
#             ('total_pages',self.page.paginator.num_pages),
#             ('count',self.page.paginator.count),
#             ('current',page),
#             ('next', self.get_next_link()),
#             ('previous', self.get_previous_link()),
#             ('page_size', page_num),
#             ('result', data),
#         ]))
    
#     def get_queryset(self, request,merchant_id):
#         keyword = self.request.GET.get('keyword', '')
#         brand = self.request.GET.get('brand')
#         color = self.request.GET.get('color')
#         rating = self.request.GET.get('rating')
#         sortBy = self.request.GET.get('sortBy')
#         new_queryset = Product.all_products.filter(
#             Q(name__icontains=keyword) | Q(brand__name__icontains=keyword) | 
#             Q(model_no__icontains=keyword)
#             )
#         filters = {'user__merchant': merchant_id}
#         if brand:
#             filters['brand__name']=brand
#         if color:
#             filters['color']=color
#         filter_q = Q(**filters)

#         if filters:
#             new_queryset.filter(filter_q)
#         if sortBy:
#             try:
#                 new_queryset = new_queryset.order_by(sortBy)
#             except:
#                 pass

#         try:
#             if sortBy == "-rating":
#                 new_queryset = new_queryset.annotate(avg_rating=Avg('rating')).order_by('-avg_rating')
#             elif sortBy == "rating":
#                 new_queryset = new_queryset.annotate(avg_rating=Avg('rating')).order_by('avg_rating')
#             else:
#                 new_queryset = new_queryset.order_by(sortBy)
#         except Exception:
#             pass

#         return self.paginate_queryset(new_queryset, self.request)
    
    
#     def get(self,request,merchant_id):
#         page = self.request.GET.get('page', 1)
#         page_size = self.request.GET.get('page_size', 10)
#         products = self.get_queryset(request,merchant_id)
#         serializer = ProductListSerializer(products, many=True, context={"request":request})
#         resp = {
#             "status":"success",
#             "data":serializer.data
#         }

#         return self.get_paginated_response(serializer.data, page, page_size)

# class MerchantProductAPIView(APIView):
#     permission_classes=[MerchantOnlyPermission]
#     def get(self,request):
#         products=Product.all_products.filter(user=request.user)
#         serializer=CMSProductListSerializer(products,many=True,context={'request':request})
#         resp={
#             "status":"success",
#             "data":serializer.data
#         }
#         return Response(resp)
    
# class CMSCouponCreateAPIView(APIView, PageNumberPagination):
#     permission_classes = [MaintainerOnlyPermission]
#     @extend_schema(request=CouponCreateSerializer)
#     def post(self, request):
#         serializer = CouponCreateSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save(added_by=request.user)
#             resp = {
#                 "status":"success",
#                 "message":"Coupon saved successfully"
#             }
#         else:
#             resp = {
#                 "status":"failure",
#                 "message":serializer.errors
#             }
#         return Response(resp)
    
#     page_size = 10
#     page_size_query_param = 'page_size'
#     max_page_size = 1000
#     def get_paginated_response(self, data, page, page_num):
#         return Response(OrderedDict([
#             ('total_pages',self.page.paginator.num_pages),
#             ('count',self.page.paginator.count),
#             ('current',page),
#             ('next', self.get_next_link()),
#             ('previous', self.get_previous_link()),
#             ('page_size', page_num),
#             ('result', data),
#         ]))
    
#     def get_queryset(self, request):
#         keyword = self.request.GET.get('keyword', '')
#         value = self.request.GET.get('value')
#         sortBy = self.request.GET.get('sortBy')
#         new_queryset = Coupon.objects.filter(
#             Q(coupon_code__icontains=keyword) | Q(value__icontains=keyword) | 
#             Q(added_by__username__icontains=keyword)
#             )
        
#         filters = {}
#         if value:
#             filters['value']=value
#         filter_q = Q(**filters)

#         if filters:
#             new_queryset.filter(filter_q)
#         if sortBy:
#             try:
#                 new_queryset = new_queryset.order_by(sortBy)
#             except:
#                 pass

#         return self.paginate_queryset(new_queryset, self.request)
    
    
#     def get(self, request):
#         page = self.request.GET.get('page', 1)
#         page_size = self.request.GET.get('page_size', 1000)
#         coupon = self.get_queryset(request)
#         serializer = CouponListSerializer(coupon, many=True)
#         return self.get_paginated_response(serializer.data, page, page_size)


# class CMSCouponPatchAndDeleteAPIView(APIView):
#     permission_classes = [MaintainerOnlyPermission]
#     def get_object(self, coupon_id):
#         try:
#             return Coupon.objects.get(id=coupon_id)
#         except Coupon.DoesNotExist:
#             raise Http404
        
#     @extend_schema(request=CouponUpdateSerializer)
#     def patch(self, request, coupon_id):
#         coupon = self.get_object(coupon_id)
#         serializer = CouponUpdateSerializer(coupon,data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             resp = {
#                 "status":"success",
#                 "message":"Coupon updated successfully"
#             }
#         else:
#             resp = {
#                 "status":"failure",
#                 "message":serializer.errors
#             }
#         return Response(resp)
#     def get(self, request, coupon_id):
#         coupon = self.get_object(coupon_id)
#         serializer = CouponListSerializer(coupon)
#         resp = {
#             "status":"success",
#             "data":serializer.data
#         }
#         return Response(resp)
    
#     def delete(self, request, coupon_id):
#         coupon = self.get_object(coupon_id)
#         coupon.delete()
#         resp = {
#             "status":"success",
#             "message":"Coupon is successfully deleted."
#         }
#         return Response(resp)
        
# class CouponMultipleDeleteAPIView(APIView):
#     permission_classes = [MaintainerOnlyPermission]
#     def delete(self, request, *args, **kwargs):
#         query_param = self.request.query_params.get('id') # "[1,2,3]"
#         id_string = query_param[1:-1] # "1,2,3"
#         id_list = [int(x) for x in id_string.split(",")] # [1,2,3]
#         coupons = Coupon.objects.filter(id__in=id_list)
#         if not coupons:
#             return Response({"status":"failure", "message":"Please select valid coupon."},status=status.HTTP_404_NOT_FOUND)   
#         coupons.delete()
#         resp = {
#             "status":"success",
#             "message":"The coupon have been deleted."
            
#         }
#         return Response(resp)
    
# # Test
# class StockDemoAPIView(APIView):
#     @extend_schema(request=StockSerializer)
#     def post(self,request):
#         stock = request.data["stock"]
#         for one in stock:
            
#             stock_product = one
#             sku=stock_product["sku"]
#             # stock_create = Stock.object.create(
#             #     sku=stock_product["sku"]
#             # )
#         resp = {
#             "status":"success",
#             # "data":request.data,
#             "stock":stock
#         }
#         return Response(resp)
    
# class CartDemoAPIView(APIView):
#     @extend_schema(request=StockSerializer)
#     def post(self,request):
#         stock = request.data["stock"]
#         for one in stock:
            
#             stock_product = one
#             sku=stock_product["sku"]
#             # stock_create = Stock.object.create(
#             #     sku=stock_product["sku"]
#             # )
#         resp = {
#             "status":"success",
#             # "data":request.data,
#             "stock":stock
#         }
#         return Response(resp)

# class ThumbnailFileStoreCreateAPIView(APIView):
#     permission_classes = [MerchantAndStaffPermission]
#     parser_classes = [FormParser, MultiPartParser]
#     @extend_schema(request=FileStoreCreateSerializer)
#     def post(self, request):
#         try:
#             images = dict((request.data).lists())['image']
#             image_link = []
#             if len(images) > 2:
#                 resp = {
#                     "status":"failure",
#                     "message":"You can select only 2 images for thumbnail."
#                 }
#                 return Response(resp, status=status.HTTP_403_FORBIDDEN)
#             for image in images:
#                 create = FileStore.objects.create(image=image)
#                 image_link += [request.build_absolute_uri(create.image.url)]
#             resp = str(image_link)
    
#         except Exception as e:
#             resp = {
#                 "status":"failure",
#                 "message":str(e)
#             }
        
#         return Response(resp)
    
# class FileStoreCreateAPIView(APIView):
#     permission_classes = [MerchantAndStaffPermission]
#     parser_classes = [FormParser, MultiPartParser]
#     @extend_schema(request=FileStoreCreateSerializer)
#     def post(self, request):
#         try:
#             images = dict((request.data).lists())['image']
#             image_link = []
#             if len(images) > 5:
#                 resp = {
#                     "status":"failure",
#                     "message":"Too many images. Please select only 5."
#                 }
#                 return Response(resp, status=status.HTTP_403_FORBIDDEN)
#             for image in images:
#                 create = FileStore.objects.create(image=image)
#                 image_link += [request.build_absolute_uri(create.image.url)]
#             resp = str(image_link)
    
#         except Exception as e:
#             resp = {
#                 "status":"failure",
#                 "message":str(e)
#             }
        
#         return Response(resp)
    
# class StockCreateAPIView(APIView):
#     permission_classes = [MerchantAndStaffPermission]
#     @extend_schema(request=StockSerializer)
#     def post(self, request):
#         serializer = StockSerializer(data=request.data)

#         if serializer.is_valid():
            
#             for stock in serializer.data["stock"]:
#                 stock_serializer = StockCreateSerializer(data=stock)
#                 if stock_serializer.is_valid():
#                     stock_serializer.save()
#                     resp = {
#                         "status":"success",
#                         "message":"Product saved Successfully."
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
    
#     def get_stock_object(self,product_id):
#         try:
#             return Stock.objects.filter(product_id=product_id)
#         except Stock.DoesNotExist:
#             raise Http404

#     def get(self, request, product_id):
#         product = self.get_product_object(product_id)
#         if product.category.parent.parent.slug == "mobile":
#             stock = Stock.objects.filter(product_id=product_id)
#             serializer = StockMobileGetSerializer(stock, many=True)
#             resp = {
#                 "status":"success",
#                 "data":serializer.data
#             }
#         else:
#             resp = {
#                 "status":"failure",
#                 "message":"This product is not mobile instance."
#             }
#         return Response(resp)
    
#     @extend_schema(request=StockAllMobileSerializer)
#     def post(self, request,*args,**kwargs):
#         product_id=self.kwargs.get("product_id")
#         product = self.get_product_object(product_id)
#         if product.category.parent.parent.slug == "mobile":
        
#             serializer = StockAllMobileSerializer(data=request.data)
#             if serializer.is_valid():
#                 for stock in serializer.data["stock"]:
#                     stock_serializer = StockMobileCreateSerializer(data=stock)
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
#                 "message":"The product is not a mobile instance."
#             }
#         return Response(resp)

#     @extend_schema(request=StockMobileAllUpdateSerializer)
#     def patch(self, request, product_id):
#         product_id=self.kwargs.get("product_id")
#         product = self.get_product_object(product_id)
#         if product.category.parent.parent.slug == "mobile":
#             stocks = self.get_stock_object(product_id)
#             serializer = StockMobileAllUpdateSerializer(data=request.data)
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
    
#     def get_stock_object(self,product_id):
#         try:
#             return Stock.objects.filter(product_id=product_id)
#         except Stock.DoesNotExist:
#             raise Http404
#     def get(self, request, product_id):
#         product = self.get_product_object(product_id)
#         if product.category.parent.parent.slug == "mens-fashion":
#             stock = self.get_stock_object(product_id)
#             serializer = ClothStockGetSerializer(stock, many=True)
#             resp = {
#                 "status":"success",
#                 "data":serializer.data
#             }
#         else:
#             resp = {
#                 "status":"failure",
#                 "message":"This product is not cloth instance."
#             }
#         return Response(resp)
    
#     @extend_schema(request=ClothAllStockSerializer)
#     def post(self, request,*args,**kwargs):
#         product_id=self.kwargs.get("product_id")
#         product = self.get_product_object(product_id)
#         if product.category.parent.parent.slug == "mens-fashion":
#             serializer = ClothAllStockSerializer(data=request.data)

#             if serializer.is_valid():
#                 for stock in serializer.data["stock"]:
#                     stock_serializer = ClothStockCreateSerializer(data=stock)
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
#                 "message":"The product is not a cloth instance."
#             }
#         return Response(resp)
    
#     @extend_schema(request=StockClothAllUpdateSerializer)
#     def patch(self, request, product_id):
#         product_id=self.kwargs.get("product_id")
#         product = self.get_product_object(product_id)
#         if product.category.parent.parent.slug == "mobile":
#             stocks = self.get_stock_object(product_id)
#             serializer = StockClothAllUpdateSerializer(data=request.data)
#             if serializer.is_valid():
#                 for count, stock_data in enumerate(serializer.data["stock"]):  
#                     stock_serializer =StockClothUpdateSerializer(
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
#                 "message":"The product is not a cloth instance."
#             }
#         return Response(resp)

# # Service category
# class CMSServiceCategoryCreateAPIView(APIView):
#     permission_classes = [AllStaffPermission]
#     def get(self,request):
#         category = Category.objects.filter(level=0, name = "service")
#         serializer = CategoryListSerializer(category, many=True)
#         resp = {
#             "status":"success",
#             "data":serializer.data
#         }
#         return Response(resp)
    
#     def get_object(self, id):
#         try:
#             return Category.objects.get(id=id)
#         except Category.DoesNotExist:
#             resp = {
#                 "status":"failure",
#                 "message":"No parent found of this Service Category."
#             }
        
#     @extend_schema(request=ServiceCategorySerializer)
#     def post(self, request):
#         serializer = ServiceCategorySerializer(data = request.data)
#         if serializer.is_valid():
#             try:
#                 parent_id = request.data["parent"]
#                 parent = self.get_object(parent_id)
#                 serializer.save(parent=parent, type="service")
#             except:
#                 serializer.save(type="service")
#             resp = {
#                 "status":"success",
#                 "message":"Service category created successfully.",
#                 "data":serializer.data
#             }
#         else:
#             resp = {
#                 "status":"failure",
#                 "message":serializer.errors
#             }
#         return Response(resp)
    
# class CMSServiceCategoryDetailPatchDeleteAPIView(APIView):
#     permission_classes = [AllStaffPermission]
#     def get_object(self, id):
#         try:
#             return Category.objects.get(id=id, type="service")
#         except Category.DoesNotExist:
#             raise Http404

#     def get(self,request,id):
#         service_category = self.get_object(id)
#         serializer = CategoryDetailSerializer(service_category)
#         resp = {
#             "status":"success",
#             "data":serializer.data
#         }
#         return Response(resp)

#     @extend_schema(request=CategoryUpdateSerializer)
#     def patch(self,request,id):
#         service_category = self.get_object(id)
#         serializer = CategoryUpdateSerializer(service_category, data=request.data, partial=True)
#         if serializer.is_valid():
#             parent_id = request.data["parent"]
#             parent = self.get_object(parent_id)
#             serializer.save(parent=parent)
#             resp = {
#                 "status":"success",
#                 "message":"Service category has been updated."
#             }
#         else:
#             resp = {
#                 "status": "failure",
#                 "message": serializer.errors
#             }
#         return Response(resp)

#     def delete(self, request, id):
#         service_category = self.get_object(id)
#         service_category.delete()
#         resp = {
#             "status":"success",
#             "message":"Service category has been deleted."
#         }
#         return Response(resp)

# class CMSServiceCategoryMultipleDeleteAPIView(APIView):
#     permission_classes = [AllStaffPermission]
#     def delete(self, request, *args, **kwargs):
#         query_param = self.request.query_params.get('id') # "[1,2,3]"
#         id_string = query_param[1:-1] # "1,2,3"
#         id_list = [int(x) for x in id_string.split(",")] # [1,2,3]
#         service_categories = Category.objects.filter(id__in=id_list)
#         if not service_categories:
#             return Response({"status":"failure", "message":"Please select valid categories."},status=status.HTTP_404_NOT_FOUND)   
#         service_categories.delete()
#         resp = {
#             "status":"success",
#             "message":"The categories have been deleted."
            
#         }
#         return Response(resp)
    
# # class CMSService
# class CMSServiceAPIView(APIView, PageNumberPagination):
#     permission_classes = [MerchantAndStaffPermission]
    
#     page_size = 10
#     page_size_query_param = 'page_size' 
#     max_page_size = 1000
#     def get_paginated_response(self, data, page, page_num):
#         return Response(OrderedDict([
#             ('total_pages', self.page.paginator.num_pages),
#             ('count', self.page.paginator.count),
#             ('current', page),
#             ('next', self.get_next_link()),
#             ('previous', self.get_previous_link()),
#             ('page_size', page_num),
#             ('result', data),
#         ]))
    
#     def get_queryset(self,request):
#         keyword = self.request.GET.get('keyword', '')
#         brand = self.request.GET.get('brand')
#         # color = self.request.GET.get('color')
#         sortBy = self.request.GET.get('sortBy')
        
#         new_queryset = Product.all_services.filter(
#             Q(name__icontains=keyword) | Q(category__name__icontains=keyword) | 
#             Q(user__username__icontains=keyword) | Q(model_no__icontains=keyword) | 
#             Q(product_status__icontains=keyword) | Q(slug__icontains=keyword) |
#             Q(created_at__icontains=keyword)
#             ).distinct()
#         try:
#             user = request.user.merchant
#             new_queryset = new_queryset.filter(user = request.user)
#         except Exception as e:
#             pass
#         return self.paginate_queryset(new_queryset, self.request)
        
#     def get(self,request):
#         page = self.request.GET.get('page', 1)
#         page_size = self.request.GET.get('page_size', 10)
#         product = self.get_queryset(request)
#         serializer = CMSProductListSerializer(product, many=True,context={"request":request})
#         return self.get_paginated_response(serializer.data, page, page_size)
    

    
#     parser_classes = [MultiPartParser, FormParser]    
#     @extend_schema(request=ServiceCreateSerializer)
#     def post(self, request):
#         serializer = ServiceCreateSerializer(data=request.data)
#         if serializer.is_valid():
#             try:
#                 added_by = request.user.staff
#                 added_by = "BUZZ Mall"
#             except:
#                 added_by = request.user.merchant
#                 added_by = "merchant"
#             serializer.save(user=request.user, added_by=added_by, type="service")
#             resp = {
#                 "service_id":serializer.data["id"]
#             }
#         else:
#             resp = {
#                 "status":"failure",
#                 "message":serializer.errors
#             }
#         return Response(resp)
    
# class CMSServicePatchandDeleteAPIView(APIView):
#     permission_classes = [MerchantAndStaffPermission]
#     def get_object(self,request,id):
#         try:
#             product = Product.all_services.get(id=id)
#             try:
#                 user = request.user.staff
#                 return product
#             except:
#                 if product.user != request.user:
#                     resp = {
#                         "status":"failure",
#                         "message":"You do not have permission to perform this action."
#                     }
#                     raise ValidationError403(resp)
#                 else:
#                     return product
#         except Product.DoesNotExist:
#             raise Http404

#     def get(self,request, id):
#         product = self.get_object(request,id)
#         serializer = CMSProductDetailSerializer(product, context={"request":request})
#         resp = {
#             "status":"success",
#             "data":serializer.data,
#         }
#         return Response(resp)
#     parser_classes = [MultiPartParser,FormParser]
    
#     @extend_schema(request=ProductUpdateSerializer)
#     def patch(self,request,id):
#         try:
#             images = dict((request.data).lists())['image']
#             del request.data["image"]
#         except:
#             pass
#         product = self.get_object(request,id)
#         product_serializer = ProductUpdateSerializer(product,data=request.data,partial=True)
#         if product_serializer.is_valid():
#             product_serializer.save()
#             resp = {
#                 "status":"success",
#                 "message":"Product updated successfully",
#                 "data":product_serializer.data,
#             }
#         else:
#             resp = {
#                 "status":"failure",
#                 "data":product_serializer.errors,
#             }
#             return Response(resp)

#         return Response(resp)

#     def delete(self,request,id):
#         product = self.get_object(request,id)
#         product.delete()
#         resp = {
#             "status":"success",
#             "message":"Product has been deleted",
#         }
#         return Response(resp)

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
        
# class StockSingleDeleteAPIView(APIView):
#     permission_classes = [MerchantAndStaffPermission]
#     def get_object(self, stock_id):
#         try:
#             return Stock.objects.get(id=stock_id)
#         except Stock.DoesNotExist:
#             raise Http404
#     def delete(self, request, stock_id):
#         stocks = self.get_object(stock_id)
#         product = stocks.product
#         try:
#             user = request.user.staff
#         except:
#             # for stock in stocks:
#             if request.user != stocks.product.user:
#                 return Response({"status": "failure", "message": "You do not have permission to perform this action."}, status=status.HTTP_403_FORBIDDEN)

#         stocks.delete()
#         stocks_count = Stock.objects.filter(product=product).count()
#         if stocks_count < 1:
#             product.status = "Pending"
#             product.save()
#             resp = {
#                 "status":"success",
#                 "message":"Since the shortage of stock, your product has been made inactive. Kindly fill the stock to activate it again."
#             }
#         else:
#             resp = {
#                 "status":"success",
#                 "message":"Stock has been deleted."
#             }
#         return Response(resp)
# class StockProductClearAPIView(APIView):
#     permission_classes = [MerchantAndStaffPermission]
#     def get_object(self, id):
#         try:
#             return Product.objects.get(id=id)
#         except Product.DoesNotExist:
#             raise Http404

#     def delete(self, request, id):
#         product = self.get_object(id)
#         stocks = Stock.objects.filter(product=product)
#         try:
#             user = request.user.staff
#         except:
#             for stock in stocks:
#                 if request.user != stock.product.user:
#                     return Response({"status": "failure", "message": "You do not have permission to perform this action."}, status=status.HTTP_403_FORBIDDEN)

#         stocks.delete()
#         product.status = "Pending"
#         product.save()
#         resp = {
#             "status":"success",
#             "message":"Since the shortage of stock, your product has been made inactive. Kindly fill the stock to activate it again."
#         }
#         return Response(resp)

# class StockMultipleDeleteAPIView(APIView):
#     permission_classes = [MerchantAndStaffPermission]
#     def delete(self, request, *args, **kwargs):
#         query_param = self.request.query_params.get('id') # "[1,2,3]"
#         id_string = query_param[1:-1] # "1,2,3"
#         id_list = [int(x) for x in id_string.split(",")] # [1,2,3]
#         stocks = Stock.objects.filter(id__in=id_list)
#         if not stocks:
#             return Response({"status":"failure", "message":"Please select valid stocks."},status=status.HTTP_404_NOT_FOUND)   
#         product = stocks[0].product
#         try:
#             user = request.user.staff
#         except:
#             for stock in stocks:

#                 if request.user != stock.product.user:
#                     return Response({"status": "failure", "message": "You do not have permission to perform this action."}, status=status.HTTP_403_FORBIDDEN)

#         stocks.delete()
#         stocks_count = Stock.objects.filter(product=product).count()
#         if stocks_count < 1:
#             product.status = "Pending"
#             product.save()
#             resp = {
#                 "status":"success",
#                 "message":"Since the shortage of stock, your product has been made inactive. Kindly fill the stock to activate it again."
#             }
#         else:
#             resp = {
#                 "status":"success",
#                 "message":"The Stocks has been deleted."
#             }
#         # resp = {
#         #     "status":"success",
#         #     "message":"The stocks have been deleted."
            
#         # }
#         return Response(resp)
    
# # class StaffQualityCheckProductOfMerchantAPIView(APIView):
# #     def post(self, request, product_id):
        
