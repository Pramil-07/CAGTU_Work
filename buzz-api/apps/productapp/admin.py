from django.contrib import admin
from .models import *
from django.db.models.aggregates import Sum

# Register your models here.
admin.site.register(
    [
        Brand,
        WishList,
        FileStore,
        Attribute,
        StockAttribute,
        Product_Attribute,
        Stock_StockAttribute,
        ExcelStorage,

    ]
)


class StockAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "slug",
        "sku",
        "product",
        "price",
        "quantity",
        "is_default",
        "availability",
    )
    list_filter = ("availability", "is_default", "product")
    search_fields = ("slug", "sku", "product__name")
    ordering = ("-id",)


admin.site.register(Stock, StockAdmin)

admin.site.register(ProductImage)


# class NormalUser(User):
#     class Meta:
#         proxy = True
class StockInline(admin.TabularInline):
    model = Stock
    extra = 0  # Optional: removes empty form rows
    fields = (
        "slug",
        "sku",
        "price",
        "quantity",
        "is_default",
        "availability",
    )  # Customize this
    readonly_fields = (
        "slug",
        "sku",
    )  # Optional: if you don’t want these to be editable


class ProductAdmin(admin.ModelAdmin):
    inlines = [StockInline]
    list_display = (
        "id",
        "status",
        "user",
        "added_by",
        "name",
        "type",
        "category",
        "is_active",
        "stocks",
        "total_quantity",
    )

    def stocks(self, obj):
        return obj.stocks.all().count()

    def total_quantity(self, obj):
        quantity_sum = obj.stocks.all().aggregate(Sum("quantity"))
        return quantity_sum["quantity__sum"] or 0


class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "parent", "level", "product_count", "child_count")

    def product_count(self, obj):
        return obj.product_set.all().count()

    def child_count(self, obj):
        return obj.category_set.all().count()

class TopCategroyAdmin(admin.ModelAdmin):
    list_display = ("id","name")

admin.site.register(Product, ProductAdmin)
admin.site.register(Category, CategoryAdmin)
admin.site.register(BulkOrder)
admin.site.register(TopCategory , TopCategroyAdmin)
