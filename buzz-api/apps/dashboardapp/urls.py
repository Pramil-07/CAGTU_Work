from django.urls import path, include
from apps.dashboardapp.api.v1.api import *

urlpatterns = [
    path("dashboard/order/overview/", OrderOverviewAPIView.as_view(), name="orderoverview"),
    path("dashboard/order/orderlist/", RecentOrderAPIView.as_view(), name="orderlist"),
    path("dashboard/topproduct/", TopProductAPIView.as_view(), name="topproduct"),
    path("dashboard/totalusers/", TotalUsersAPIView.as_view(), name="totalusers"),
    path("dashboard/topproductbycategory/", TopProductByCategoryAPIView.as_view(), name="topproductbycategory"),
    path("dashboard/topproductbylocation/", TopProductByLocationAPIView.as_view(), name="topproductbylocation"),
    path("dashboard/totalproducts/", TotalProductsAPIView.as_view(), name="totalproducts"),
    path("dashboard/totalorders/", TotalOrdersAPIView.as_view(), name="totalorders"),
    path("dashboard/totalsales/", TotalSalesAPIView.as_view(), name="totalsales"),
    path("dashboard/todo/", TodolistAPIView.as_view(), name="todo"),
    path("dashboard/todo/<int:id>/", ToDoListRetireveDestroyUpdateAPIView.as_view(), name="todoupdatedelete"),
]