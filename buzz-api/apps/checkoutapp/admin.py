from django.contrib import admin
from .models import *


class DeliveryDetailAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "first_name",
        "last_name",
        "email",
        "contact_number",
        "country",
        "city",
        "delivery_option",
        
    )
    search_fields = (
        "first_name",
        "last_name",
        "email",
        "contact_number",
        "country",
        "city",
        "company_name",
    )
    list_filter = ("country", "city", "delivery_option")

admin.site.register(Delivery_detail, DeliveryDetailAdmin)

class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "order_id",
        "user",
        "sub_total",
        "discount",
        "total_price",
        "payment_method",
        "order_status",
        "is_paid",
        "ordered",
        "delivered_date",
        # "delivery_price",
         
    )
    list_filter = (
        "order_status",
        "is_paid",
        "ordered",
        "coupon_used",
        "payment_method",
    )
    search_fields = (
        "order_id",
        "user__username",
        "coupon_name",
    )
     
    ordering = ("-id",)

admin.site.register(Order, OrderAdmin)


class CartAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "product", "stock", "quantity", "order_id")

    def order_id(self, obj):
        return [k.id for k in obj.order_set.all()]


admin.site.register(Cart, CartAdmin)


class OrderItemAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "product_name",
        "product_price",
        "quantity",
        "sub_total",
        "order_id",
    )

    def order_id(self, obj):
        return [k.id for k in obj.order_set.all()]


admin.site.register(OrderItem, OrderItemAdmin)

@admin.register(OrderStatusHistory)
class OrderStatusHistoryAdmin(admin.ModelAdmin):
    list_display = ("order", "status", "changed_by", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("order__order_id", "changed_by__username", "note")


# class CustomerAdmin(admin.ModelAdmin):
#     inlines = [
#         UnitInline,
#     ]
# user=models.ForeignKey(User,on_delete=models.SET_NULL,null=True,blank=True)
# cart=models.ManyToManyField(Cart)
# order_items=models.ManyToManyField(OrderItem)
# delivery_address=models.ForeignKey(Delivery_detail,on_delete=models.SET_NULL,null=True)
# coupon_used=models.BooleanField(default=False)
# coupon_name=models.CharField(max_length=255,null=True,blank=True)
# discount=models.PositiveIntegerField(null=True,blank=True)
# sub_total=models.PositiveIntegerField(null=True,blank=True)
# payment_method=models.CharField(max_length=255, default="on-going")
# total_price=models.PositiveIntegerField(null=True,blank=True)
# order_status=models.CharField(max_length=150, default="on-going")
# is_paid=models.BooleanField(default=False)
# ordered = models.BooleanField(default=False)
