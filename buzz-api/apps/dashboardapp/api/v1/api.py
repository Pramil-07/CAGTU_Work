from django.db.models import Count
from django.db.models import Q
from django.db.models import Sum
from django.contrib.auth.models import User
from drf_spectacular.utils import extend_schema
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from django.db.models.functions import ExtractMonth

from apps.checkoutapp.models import Order, OrderItem
from apps.accountapp.models import Address
from apps.dashboardapp.models import ToDoList
from apps.productapp.models import Product, Stock, Category
from apps.checkoutapp.api.v1.serializers import OrderSerializerItem, TopProductSerializer
from .serializers import *


# custom function for receiving stock objects of speicfic categories
def get_stock_objects(category):
        mobile_category_object = Category.objects.get(name__exact=category)
        product_object = Product.objects.filter(category=mobile_category_object)
        stock_objects = Stock.objects.filter(product__in=product_object)
        return stock_objects


class OrderOverviewAPIView(APIView):
    def get(self, request):
        """
        Overview of orders
        """
        total_order = Order.objects.filter(order_status="Ordered").count()
        total_accepted = Order.objects.filter(order_status="Accepted").count()
        total_being_delivered = Order.objects.filter(order_status="Being Delivered").count()
        total_cancelled = Order.objects.filter(order_status="Cancelled").count()
        total_received = Order.objects.filter(order_status="Received").count()
        total_refund_requested = Order.objects.filter(order_status="Refund Requested").count()
        

        resp={
            "status": "success",
            "data" : {
                "total_order" : total_order,
                "total_accepted" : total_accepted,
                "total_being_delivered" : total_being_delivered,
                "total_cancelled" : total_cancelled,
                "total_received" : total_received,
                "total_refund_requested" : total_refund_requested
            }
        }
        return Response(resp)


class RecentOrderAPIView(APIView):
    def get(self, request):
        """
        list the recent orders
        """
        recent_order_list = Order.objects.all().last()
        user_obj = User.objects.get(username=recent_order_list)
        recent_obj = Order.objects.filter(user=user_obj).order_by('-created_at')[:7:1]
        serializer = OrderSerializerItem(recent_obj,many=True)    
        return Response({
            "status": "success",
            "data": serializer.data,
        })


class TopProductAPIView(generics.GenericAPIView):
    def get(self, request):
        """ 
        List top product among all categories
        """
        ordered_items = OrderItem.objects \
            .annotate(product_count=Count('stock'))\
            .values("product_name", "stock")\
            .annotate(total_quantity= Sum('quantity'))\
            .order_by("-total_quantity")[0]
        return Response(
            {
                "status": "success",
                "data": ordered_items,
            }
        )


class TopProductByCategoryAPIView(generics.GenericAPIView):
    serializer_class = TopProductByCategorySerializer
    
    def get(self, request):
        """ 
        list top products on the basis of categories
        """
        stock_objects = get_stock_objects(category="Mobiles")
        ordered_items_mobiles = OrderItem.objects\
            .annotate(product_count = (Count('id', filter=Q(stock__in=stock_objects))))\
            .values("product_name", "product_count","stock")\
            .annotate(total_quantity = Sum('quantity'))\
            .order_by('-total_quantity')
        
        # stock_objects = get_stock_objects(category="Laptop")
        # print("stock_objects", stock_objects)
        # ordered_items_laptop = OrderItem.objects.annotate(product_count = (Count('id', filter=Q(stock__in=stock_objects)))).values("product_name", "stock").annotate(total_quantity = Sum('quantity')).order_by('-total_quantity')
        # print("ordered items", ordered_items_laptop)
        
        return Response(
            {
                "status": "success",
                "data": ordered_items_mobiles,
            }
        )


class TotalUsersAPIView(generics.GenericAPIView):
    serializer_class = TotalUsersSerializer 
    
    def get(self, request):
        """ 
        List total users and users joined every month
        """
        user_data = User.objects\
            .annotate(month=ExtractMonth('date_joined'))\
            .values('month')\
            .annotate(user_count=Count('id', distinct=True))\
            .order_by('month')
        serializer = self.serializer_class(user_data)
        
        return Response( 
                    { 
                     "status" : "success",
                     "data": serializer.data,
                    },
                    status = status.HTTP_200_OK
                )


class TopProductByLocationAPIView(generics.GenericAPIView):
    
    def get(self, request):
        """
        list top products on the basis of location
        """
        user_objects = Address.objects.filter(country__iexact="Nepal").values("user")
        # print("user objects", user_objects)
        ordered_items_country = OrderItem.objects\
            .annotate(product_count = Count('id', filter=Q(user__in=user_objects)))\
            .values("product_name", "stock")\
            .annotate(total_quantity = Sum('quantity'))\
            .order_by('-total_quantity')
        return Response({
            "status": "success",
            "data": ordered_items_country,
        })


class TotalProductsAPIView(generics.GenericAPIView):
    
    def get(self, request):
        """ 
        return total products count
        """
        total_products_count = Product.objects.all().count()
        data = {
            "total_products_count" : total_products_count,
        }
        
        return Response(
            { 
            "status" : "success",
            "data": data,
            },
            status = status.HTTP_200_OK
        )
      
  
class TotalOrdersAPIView(generics.GenericAPIView):
    
    def get(self, request):
        """
        return total orders count
        """
        total_orders = Order.objects.all().count()
        
        return Response(
            {
                "status" : "success",
                "data" : {
                    "total_orders": total_orders,
                }
            },
            status=status.HTTP_200_OK
        )
        

class TotalSalesAPIView(generics.GenericAPIView):
    
    def get(self, request):
        """
        Return total sales
        """
        total_sales = OrderItem.objects\
            .annotate(user_order_count=Count('user'))\
            .values("user", "user_order_count")\
            .annotate(total_sales=Sum("sub_total"))\
        
        return Response(
            {
                "status": "success",
                "data": total_sales,
            },
            status=status.HTTP_200_OK,
        )


class TodolistAPIView(generics.ListCreateAPIView):
    serializer_class = ToDoListSerializer
    queryset = ToDoList.objects.all()


class ToDoListRetireveDestroyUpdateAPIView(generics.RetrieveUpdateDestroyAPIView):
    # permission_classes=[AllStaffPermission]
    serializer_class = ToDoListSerializer
    queryset=ToDoList.objects.all()
    lookup_field = "id"
    
    def update(self, request, *args, **kwargs):
        super().update(request, *args, **kwargs)
        return Response(
            {
                'status':'success',
                'message':'Todo list succesfully updated.'
            }
            )
        
    def delete(self, request, *args, **kwargs):
        super().delete(request, *args, **kwargs)
        return Response(
            {
                'status':'success',
                'message':'Todo list succesfully deleted.'
            }
            )