from unicodedata import category
from django.shortcuts import get_object_or_404
from numpy import product
from rest_framework.views import APIView
from yaml import serialize

from apps.activity.models import Rating, MerchantRating
from apps.activity.serializers import RatingSerializer
from apps.blogapp.serializers import TagSerializer
from apps.checkoutapp.models import Cart
from apps.locales.serializers import CurrencyListCreateSerializer
from ...models import *
from rest_framework import serializers
from django.db.models import Q


# from .models import Color
from rest_framework.validators import UniqueTogetherValidator
from django.db.models import Avg, Count, Sum
from datetime import datetime
from django.core.exceptions import ObjectDoesNotExist


class BrandCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        exclude = ["slug"]


class BrandSerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Brand
        fields = "__all__"

    def get_product_count(self, obj):
        return obj.product_set.all().count()


class CMSBrandSerializer(serializers.ModelSerializer):

    class Meta:
        model = Brand
        fields = "__all__"


class BrandSelectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ["id", "name"]


class BrandUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ["name", "image"]
        extra_kwargs = {"name": {"required": False}, "image": {"required": False}}


# Category create serializer
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        exclude = ["level", "slug", "type"]

    def validate(self, data):
        try:
            if data["parent"] is not None:
                data["icon"] = None
            return data
        except:
            return data

    def validate_parent(self, data):
        parent = Category.objects.get(id=data.id)
        if parent.level == 2:
            raise serializers.ValidationError(
                "This category can not be made parent category. Please try again with suitable category."
            )
        return data


class AttributeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attribute
        exclude = [
            "deleted_at",
        ]


class StockAttributeSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockAttribute
        exclude = [
            "deleted_at",
        ]


class SubSubCategoryListClientSerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        exclude = ["parent", "level", "product_attribute", "stock_attribute"]

    def get_product_count(self, obj):
        return Product.objects.filter(category=obj).count()


class SubSubCategoryListSerializer(serializers.ModelSerializer):
    # sub_sub_category = serializers.SerializerMethodField()
    product_attribute = serializers.SerializerMethodField()
    stock_attribute = serializers.SerializerMethodField()

    class Meta:
        model = Category
        exclude = ["parent", "level"]

    def get_product_attribute(self, obj):
        category_obj = get_object_or_404(Category, id=obj.parent.id)
        data = AttributeSerializer(category_obj.product_attribute.all(), many=True).data
        return data

    def get_stock_attribute(self, obj):
        category_obj = get_object_or_404(Category, id=obj.parent.id)
        data = StockAttributeSerializer(
            category_obj.stock_attribute.all(), many=True
        ).data
        return data


class SubCategoryListClientSerializer(serializers.ModelSerializer):
    sub_sub_category = serializers.SerializerMethodField()
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        # exclude = ['parent','level']
        fields = ["id", "name", "slug", "product_count", "sub_sub_category"]

    def get_sub_sub_category(self, obj):
        sub_category = Category.objects.filter(parent=obj.id)
        return SubSubCategoryListClientSerializer(sub_category, many=True).data

    def get_product_count(self, obj):
        return Product.objects.filter(category__parent=obj).count()


class SubCategoryListSerializer(serializers.ModelSerializer):
    sub_sub_category = serializers.SerializerMethodField()
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        # exclude = ['parent','level']
        fields = ["id", "name", "slug", "product_count", "sub_sub_category"]

    def get_sub_sub_category(self, obj):
        sub_category = Category.objects.filter(parent=obj.id)
        return SubSubCategoryListSerializer(sub_category, many=True).data

    def get_product_count(self, obj):
        return Product.objects.filter(category__parent=obj).count()


class CategoryListClientSerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()
    blog_count = serializers.SerializerMethodField()
    sub_category = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "type",
            "slug",
            "icon",
            "product_count",
            "sub_category",
            "status",
            "blog_count",
        ]

    def get_sub_category(self, obj):
        sub_category = Category.objects.filter(parent=obj.id)
        return SubCategoryListClientSerializer(sub_category, many=True).data

    def get_blog_count(self, obj):
        return obj.blog.all().count()

    def get_product_count(self, obj):
        category_ids = [obj.id]

        # Get child categories
        child_ids = Category.objects.filter(parent=obj).values_list("id", flat=True)
        category_ids.extend(child_ids)

        # Get grandchild categories
        grandchild_ids = Category.objects.filter(parent__in=child_ids).values_list(
            "id", flat=True
        )
        category_ids.extend(grandchild_ids)

        # Count products in all these categories
        product_count = Product.objects.filter(category__id__in=category_ids).count()

        return product_count


class CategoryCreateClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["name", "icon", "status", "type"]

    def update(self, instance, validated_data):
        # Only update the fields provided in the request
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class CategoryListSerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()
    sub_category = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "product_count", "sub_category"]

    def get_sub_category(self, obj):
        sub_category = Category.objects.filter(parent=obj.id)
        return SubCategoryListSerializer(sub_category, many=True).data

    def get_product_count(self, obj):
        return Product.objects.filter(category__parent__parent=obj).count()


class CMSCategoryParentListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "icon",
            "slug",
        ]


class CMSCategoryChildListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "slug",
        ]


class CMSCategoryParentDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug", "icon"]


# class CategoryListSerializer(serializers.ModelSerializer):
#     sub_category = serializers.SerializerMethodField()
#     class Meta:
#         model = Category
#         # fields = '__all__'
#         fields = ['id','name','slug','sub_category']

#     def get_sub_category(self,obj):
#         sub_category = Category.objects.filter(parent=obj.id)
#         return SubCategoryListSerializer(sub_category, many=True).data


class CategoryDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        # fields = '__all__'
        fields = ["id", "name", "parent", "slug"]


class CategoryUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        # fields = '__all__'
        fields = ["id", "name", "parent", "icon"]
        extra_kwargs = {
            "name": {"required": False},
            "parent": {"required": False},
            "icon": {"required": False},
        }

    def validate_parent(self, data):
        parent = Category.objects.get(id=data.id)
        if parent.level == 2:
            raise serializers.ValidationError(
                "This category can not be made parent category. Please try again with suitable category."
            )
        return data


# class ImageCreateSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Image
#         fields = '__all__'
# class ColorCreateSerializer(serializers.ModelSerializer):
#     class Meta:
#         model=Color
#         fields=['hex_code','image']


class StockCreateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Stock
        exclude = ["product", "slug", "attributes", "image", "sku"]


class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ["id", "image"]


class ProductCreateSerializer(serializers.ModelSerializer):
    stocks = StockCreateSerializer(many=True, required=False)
    tags = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Tag.objects.all(), required=False
    )

    class Meta:
        model = Product
        exclude = [
            "slug",
            "deleted_at",
            "type",
        ]

    def validate_name(self, data):
        if len(data) < 5:
            raise serializers.ValidationError(
                "Product name should be more than 5 characters."
            )
        return data

    def create(self, validated_data):
        tags = validated_data.pop("tags", [])

        product = super().create(validated_data)
        if tags:
            product.tags.set(tags)
        return product


class ProductAttributeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product_Attribute
        fields = ("attribute", "value", "product")
        extra_kwargs = {"product": {"read_only": True}}


# class ProductAttributeUpdateSerializer(serializers.Serializer):
#     attribute=serializers.IntegerField()
#     value=serializers.CharField()
class ProductAttributeUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product_Attribute
        fields = ("attribute", "value")

    # def validate(self,obj):
    #     if obj['attribute']  not in obj['product'].category.parent.product_attribute.all():
    #         raise serializers.ValidationError(
    #             {"attribute": ["This attribute is not acceptable for this product. Please change the category or attribute."]}
    #             )
    #     if obj['attribute']   in obj['product'].attributes.all():
    #         raise serializers.ValidationError(
    #             {"attribute": ["This attribute is already in the product. Please change the category or attribute."]}
    #             )
    #     else:
    #         return obj


class ProductAttributeCreateUpdateSerializer(serializers.Serializer):
    attributes = ProductAttributeUpdateSerializer(many=True)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username", "id"]


class StaffSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = User
        fields = ["user"]


class StockCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stock
        exclude = ["deleted_at", "slug", "sku", "attributes"]

    def validate_price(self, data):
        if data == 0:
            raise serializers.ValidationError("Price of product cannot be 0.")
        return data

    def validate(self, data):
        if data["price"] > data["mrp"]:
            raise serializers.ValidationError(
                {"price": "Price should be always less than MRP of the project."}
            )
        return data


class StockSerializer(serializers.Serializer):
    stock = StockCreateSerializer(many=True)


class CMSStockAttributeSerializer(serializers.ModelSerializer):
    attribute = StockAttributeSerializer()

    class Meta:
        model = Stock_StockAttribute
        exclude = ["stock"]


class StockListSerializer(serializers.ModelSerializer):
    price = serializers.ReadOnlyField(source="current_price")
    offer_type = serializers.SerializerMethodField()

    class Meta:
        model = Stock
        exclude = ["deleted_at", "attributes", "offer_price"]

    def get_offer_type(self, obj):
        active_offer = obj.product.offers.filter(
            status="Active", end_date__gte=date.today()
        ).first()
        if active_offer:
            return active_offer.offer_type.name
        return "No offer"


class StockProductListSerializer(serializers.Serializer):
    stock = StockListSerializer(many=True)


class StockForProductListView(serializers.ModelSerializer):
    discount = serializers.SerializerMethodField()
    # stock_attributes = serializers.SerializerMethodField()

    class Meta:
        model = Stock
        fields = [
            "id",
            "price",
            "is_default",
            "mrp",
            "slug",
            "discount",
            "quantity",
            "size",
            "size_unit",
            "status",
            "is_default",
            "color",
        ]

    def get_discount(self, obj):
        return ((obj.mrp - obj.price) / obj.mrp) * 100 if obj.mrp else None

    # def get_stock_attributes(self, obj):
    #     stock_attributes = obj.stock_stockattribute_set.all()
    #     return CMSStockAttributeSerializer(stock_attributes, many=True).data


class ProductAttributeSerializer(serializers.ModelSerializer):
    attribute_data = serializers.SerializerMethodField()

    class Meta:
        model = Product_Attribute
        fields = [
            "attribute",
            "attribute_data",
            "value",
        ]

    def get_attribute_data(self, obj):
        attribute_obj = Attribute.objects.filter(slug=obj.attribute.slug)
        return AttributeSerializer(attribute_obj, many=True).data


class Stock_StockAttributeSerializer(serializers.ModelSerializer):
    stock_attribute_data = serializers.SerializerMethodField()

    class Meta:
        model = Stock_StockAttribute
        fields = [
            "attribute",
            "stock_attribute_data",
            "value",
        ]

    def get_stock_attribute_data(self, obj):
        attribute_obj = StockAttribute.objects.filter(slug=obj.attribute.slug)
        return StockAttributeSerializer(attribute_obj, many=True).data


class ProductListSerializer(serializers.ModelSerializer):
    images = ImageSerializer(many=True, read_only=True)
    category = CategoryDetailSerializer()
    brand = BrandSerializer()
    rating = serializers.SerializerMethodField()
    product_attributes = serializers.SerializerMethodField()
    currency = CurrencyListCreateSerializer()
    is_bookmarked = serializers.SerializerMethodField()
    tags = TagSerializer(many=True, read_only=True)
    stock = serializers.SerializerMethodField()

    class Meta:
        model = Product
        exclude = ["deleted_at", "user", "attributes"]

    def get_is_bookmarked(self, obj):
        return WishList.objects.filter(product=obj).exists()

    def get_stock(self, obj):
        stocks = Stock.objects.filter(product=obj)
        if not stocks.exists():
            return []
        return StockListSerializer(stocks, many=True).data

    def get_rating(self, obj):
        avg_rating = Rating.objects.filter(product_id=obj.id).aggregate(Avg("rating"))
        total_count = Rating.objects.filter(product_id=obj.id).count()
        resp = {**avg_rating, "count": total_count}
        return resp

    def get_product_attributes(self, instance):
        attrs = instance.product_attribute_set.all()
        return CMSProductAttributeSerializer(attrs, many=True).data


""" Detailed product serializer for product detail view """


class CMSProductListSerializer(serializers.ModelSerializer):
    images = ImageSerializer(
        many=True,
        read_only=True,
    )
    stock = serializers.SerializerMethodField()
    category = CategoryDetailSerializer()
    brand = BrandSerializer()
    rating = serializers.SerializerMethodField()
    product_attributes = serializers.SerializerMethodField()
    currency = CurrencyListCreateSerializer()
    is_bookmarked = serializers.SerializerMethodField()
    tags = TagSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        exclude = ["deleted_at", "user", "attributes"]

    def get_is_bookmarked(self, obj):
        product = WishList.objects.filter(product=obj)
        if product:
            return True
        return False

    def get_stock(self, obj):

        stock = Stock.objects.get(product=obj)

        serializer = StockListSerializer(stock, many=True)
        return serializer.data

    def get_rating(self, obj):
        avg_rating = Rating.objects.filter(product_id=obj.id).aggregate(Avg("rating"))
        total_count = Rating.objects.filter(product_id=obj.id).count()

        count = {"count": total_count}
        resp = {}
        resp.update(avg_rating)
        resp.update(count)
        return resp

    def get_product_attributes(self, instance):
        product_attributes = instance.product_attribute_set.all()
        return CMSProductAttributeSerializer(product_attributes, many=True).data


class ProductDetailSerializer(serializers.ModelSerializer):
    stocks = StockListSerializer(many=True)
    category = CategoryDetailSerializer()
    brand = BrandSerializer()
    added_by = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    images = ImageSerializer(many=True)
    currency = CurrencyListCreateSerializer()
    tags = TagSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        exclude = ["deleted_at", "user"]

    def get_added_by(self, obj):
        try:
            current_user = obj.user.staff
            return "BUZZ Mall"
        except:
            try:
                current_user = obj.user.merchant
                return current_user.merchant_name
            except:
                return None

    def get_rating(self, obj):
        return RatingSerializer(obj).data


class ProductUpdateSerializer(serializers.ModelSerializer):
    # photo = PhotoUpdateSerializer(many=True)
    class Meta:
        model = Product
        exclude = ["deleted_at", "added_by", "user", "slug", "status"]
        extra_kwargs = {
            "name": {"required": False},
            "image": {"required": False},
            "brand": {"required": False},
            "model_no": {"required": False},
            "product_status": {"required": False},
            "is_active": {"required": False},
            "type": {"required": False},
            "thumbnail_image": {"required": False},
            "description": {"required": False},
            "category": {"required": False},
        }

    def validate_name(self, data):
        if len(data) < 5:
            raise serializers.ValidationError(
                "Product name should be more than 5 characters."
            )
        return data

    # def validate_category(self, data):
    #     if data.level != 2:
    #         raise serializers.ValidationError(
    #             "You can only create product in the level 3 category."
    #         )
    #     return data


class StaffProductUpdateSerializer(serializers.ModelSerializer):

    # photo = PhotoUpdateSerializer(many=True)
    class Meta:
        model = Product
        exclude = ["deleted_at", "added_by", "user", "slug"]
        extra_kwargs = {
            "status": {"required": False},
            "name": {"required": False},
            "image": {"required": False},
            "brand": {"required": False},
            "model_no": {"required": False},
            "product_status": {"required": False},
            "is_active": {"required": False},
            "type": {"required": False},
            "thumbnail_image": {"required": False},
            "description": {"required": False},
            "category": {"required": False},
        }

    def validate_name(self, data):
        if len(data) < 15:
            raise serializers.ValidationError(
                "Product name should be more than 15 characters."
            )
        return data

    # def validate_category(self, data):
    #     if data.level != 2:
    #         raise serializers.ValidationError(
    #             "You can only create product in the level 3 category."
    #         )
    #     return data

    # def validate(self,data):
    #     try:
    #         if data["status"] == "Active":
    #             # stock = self.stock
    #             print(data)
    #             product = Product.objects.get(id=self.id)
    #             print(self.id)
    #             return data
    #     except Exception as e:
    #         print(str(e))
    #         raise serializers.ValidationError({"status": ["Stock is not added to complete this process."]}) from e
    #     data["status"] == "Pending"
    #     return data


class CustomerDetailSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()

    # first_name=serializers.SerializerMethodField()
    # last_name=serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = ["username", "profile_image", "phone"]

    def get_username(self, obj):
        current_user = User.objects.get(id=obj.user)
        return current_user.username


class CustomerDetailSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    profile_image = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["username", "full_name", "profile_image"]

    def get_username(self, obj):
        return obj.username

    def get_full_name(self, obj):
        return obj.first_name + " " + obj.last_name

    def get_profile_image(self, obj):
        try:
            return self.context["request"].build_absolute_uri(
                obj.customer.profile_image.url
            )
        except Exception as e:
            print("Exception", e)
            return []


class ProductRatingListSerializer(serializers.ModelSerializer):
    user = CustomerDetailSerializer()
    # product=serializers.StringRelatedField()

    class Meta:
        model = Rating
        exclude = ["product", "deleted_at", "status"]


# class CMSProductDetailSerializer(serializers.ModelSerializer):
#     stocks = StockListSerializer(many=True)
#     category = CategoryDetailSerializer()
#     brand = BrandSerializer()
#     added_by=serializers.SerializerMethodField()
#     rating=serializers.SerializerMethodField()
#     attributes=serializers.SerializerMethodField()
#     class Meta:
#         model = Product
#         exclude = ['deleted_at']
#     def get_attributes(self, instance):
#         return {attribute.attribute.name:attribute.value for attribute in instance.product_attribute_set.all()}

#     def get_added_by(self,obj):
#         try:
#             current_user=obj.user.staff
#             return f"{obj.user.first_name} {obj.user.last_name}"
#         except:
#             try:
#                 current_user=obj.user.merchant
#                 return current_user.merchant_name
#             except:
#                 return None
#     def get_rating(self,obj):
#         ratings=Rating.objects.filter(product=obj)
#         return ProductRatingListSerializer(ratings, many=True,context={"request":self.context["request"]}).data


class CMSAttributeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attribute
        exclude = ["created_at", "updated_at", "deleted_at"]


class CMSProductAttributeSerializer(serializers.ModelSerializer):
    attribute = CMSAttributeSerializer()

    class Meta:
        model = Product_Attribute
        fields = [
            "id",
            "attribute",
            "value",
        ]


class CMSProductDetailSerializer(serializers.ModelSerializer):
    stocks = StockListSerializer(many=True)
    category = CategoryDetailSerializer()
    brand = BrandSerializer()
    added_by = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    product_attributes = serializers.SerializerMethodField()

    class Meta:
        model = Product
        exclude = ["deleted_at", "attributes"]

    def get_product_attributes(self, instance):
        product_attributes = instance.product_attribute_set.all()
        return CMSProductAttributeSerializer(product_attributes, many=True).data

    def get_added_by(self, obj):
        try:
            current_user = obj.user.staff
            return f"{obj.user.first_name} {obj.user.last_name}"
        except:
            try:
                current_user = obj.user.merchant
                return current_user.merchant_name
            except:
                return None

    def get_rating(self, obj):
        ratings = Rating.objects.filter(product=obj)
        return ProductRatingListSerializer(
            ratings, many=True, context={"request": self.context["request"]}
        ).data


# class PhotoUpdateSerializer(serializers.ModelSerializer):
#     # product = ProductUpdateSerializer()
#     class Meta:
#         model = Photo
#         fields = ['image']


# class PhotoSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Photo
#         fields = ['id','image']


class WishProductSerializer(serializers.ModelSerializer):
    rating = serializers.SerializerMethodField()
    added_by = serializers.SerializerMethodField()

    # def get_rating(self,obj):
    #     avg_rating = MerchantRating.objects.filter(merchant_id=obj.id).aggregate(Avg('rating'))
    #     total_count = MerchantRating.objects.filter(merchant_id=obj.id).count()
    #     count = {
    #         "count":total_count
    #     }
    #     resp = {}
    #     resp.update(avg_rating)
    #     resp.update(count)
    #     return resp
    class Meta:
        model = Product
        fields = ("id", "slug", "name", "added_by", "rating")

    def get_added_by(self, obj):
        try:
            current_user = obj.user.staff
            return "Buzz Mall"
        except:
            try:
                current_user = obj.user.merchant
                avg_rating = MerchantRating.objects.filter(
                    merchant_id=obj.id
                ).aggregate(Avg("rating"))
                total_count = MerchantRating.objects.filter(merchant_id=obj.id).count()
                count = {"count": total_count}
                rating = {}
                rating.update(avg_rating)
                rating.update(count)
                resp = {
                    "merchant": "current_user.merchant_name",
                    "merchant_rating": rating,
                }
                return resp
            except:
                return None

    def get_rating(self, obj):
        avg_rating = Rating.objects.filter(product_id=obj.id).aggregate(Avg("rating"))
        total_count = Rating.objects.filter(product_id=obj.id).count()
        # total = Rating.objects.filter(product_id=obj.id).annotate(count =Count('id'))
        count = {"count": total_count}
        resp = {}
        resp.update(avg_rating)
        resp.update(count)
        return resp


class WishStockListSerializer(serializers.ModelSerializer):
    # stock = StockListSerializer(many=True)
    discount = serializers.SerializerMethodField()

    class Meta:
        model = Stock
        fields = ("id", "image", "slug", "price", "mrp", "discount")

    def get_discount(self, obj):
        return ((obj.mrp - obj.price) / obj.mrp) * 100 if obj.mrp else None


class WishListSerializer(serializers.ModelSerializer):
    product = WishProductSerializer()  # 1
    stock = WishStockListSerializer()  # 2

    class Meta:
        model = WishList
        fields = ["product", "stock"]


class CartDataSerializer(serializers.Serializer):
    product_id = serializers.CharField()
    quantity = serializers.CharField()
    price = serializers.CharField()


class CartSerializer(serializers.Serializer):
    cart_item = CartDataSerializer(many=True)


class FileStoreCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = FileStore
        fields = ["image"]


# class StockCreateSerializer(serializers.ModelSerializer):
#     class Meta:
#         model=Stock
#         exclude = ['deleted_at','slug','sku']
#     def validate_price(self,data):
#         if data == 0:
#             raise serializers.ValidationError("Price of product cannot be 0.")
#         return data
#     def validate(self,data):
#         if data['price'] > data['mrp']:
#             raise serializers.ValidationError({"price":"Price should be always less than MRP of the project."})
#         return data
#     def validate_sku(self,data):
#         if len(data) < 10:
#             raise serializers.ValidationError("SKU should be atleast 10 characters long.")
#         return data


class CMSProductListSerializer(serializers.ModelSerializer):
    quantity_count = serializers.SerializerMethodField()
    stock_count = serializers.SerializerMethodField()
    stock = serializers.SerializerMethodField()
    category = CategoryDetailSerializer()
    brand = BrandSerializer()
    user = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    product_attributes = serializers.SerializerMethodField()

    def get_stock(self, obj):

        stock = Stock.objects.filter(product=obj)

        serializer = StockForProductListView(stock, many=True)
        return serializer.data

    def get_quantity_count(self, obj):
        quantity_sum = obj.stocks.all().aggregate(Sum("quantity"))
        return quantity_sum["quantity__sum"] or 0

    def get_stock_count(self, obj):
        return obj.stocks.all().count()

    class Meta:
        model = Product
        exclude = ["deleted_at", "description", "attributes"]

    def get_user(self, obj):
        try:
            current_user = obj.user.staff
            return f"{obj.user.first_name} {obj.user.last_name}"
        except:
            try:
                current_user = obj.user.merchant
                return current_user.merchant_name
            except:
                return None

    def get_rating(self, obj):
        avg_rating = Rating.objects.filter(product_id=obj.id).aggregate(Avg("rating"))
        total_count = Rating.objects.filter(product_id=obj.id).count()
        # total = Rating.objects.filter(product_id=obj.id).annotate(count =Count('id'))
        count = {"count": total_count}
        resp = {}
        resp.update(avg_rating)
        resp.update(count)
        return resp

    def get_product_attributes(self, instance):
        product_attributes = instance.product_attribute_set.all()
        return CMSProductAttributeSerializer(product_attributes, many=True).data


class ProductAttributeListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attribute
        fields = "__all__"


# class HAStockCreateSerializer(serializers.ModelSerializer):
#     class Meta:
#         model=Stock
#         fields=['id','mrp','price','size','size_type','color','availability','quantity','warranty_type','warranty_year','build_type','image']
#         extra_kwargs={'warranty_type':{'required':True},'warranty_year':{'required':True}}
#     def validate_price(self,data):
#         if data == 0:
#             raise serializers.ValidationError("Price of product cannot be 0.")
#         return data
#     def validate(self,data):
#         if data['price'] > data['mrp']:
#             raise serializers.ValidationError({"price":"Price should be always less than MRP of the project."})
#         return data

# class HAStockGetSerializer(serializers.ModelSerializer):
#     class Meta:
#         model=Stock
#         fields=['id','availability','sku','mrp','price','size','size_type','color','quantity','warranty_type','warranty_year','build_type','image','slug']

# class HAStockSerializer(serializers.Serializer):
#     stock = HAStockCreateSerializer(many=True)


# class StockHAUpdateSerializer(serializers.ModelSerializer):
#     class Meta:
#         model=Stock
#         fields =['id','mrp','price','size','size_type','color','availability','quantity','warranty_type','warranty_year','build_type','image']
#         extra_kwargs={'availability':{'required':False},
#                     'quantity':{'required':False},'mrp':{'required':False},
#                     'price':{'required':False},'size':{'required':False},
#                     'size_unit':{'required':False},'color':{'required':False},
#                     'warranty_type':{'required':False},'warranty_year':{'required':False},


#                     }
#     def validate_price(self,data):
#         if data == 0:
#             raise serializers.ValidationError("Price of product cannot be 0.")
#         return data
#     def validate(self,data):
#         try:
#             if data['price'] > data['mrp']:
#                 raise serializers.ValidationError({"price":"Price should be always less than MRP of the project."})
#         except:
#             pass
#         return data

# class StockHAAllUpdateSerializer(serializers.Serializer):
#     stock = StockHAUpdateSerializer(many=True)

# class StockTVCreateSerializer(serializers.ModelSerializer):
#     class Meta:
#         model=Stock
#         fields = ['id','availability','quantity','mrp','price','size','size_type','color',
#                 'ram','rom','processor','operating_system','wireless_connection','warranty_type','warranty_year',
#                 'resolution','smart_tv','hdmi_ports_no','usb_ports_no','build_type']
#         extra_kwargs={
#                     'wireless_connection':{'required':True},'warranty_type':{'required':True},
#                     'warranty_year':{'required':True},'resolution':{'required':True},
#                     'smart_tv':{'required':True},'hdmi_ports_no':{'required':True},'usb_ports_no':{'required':True}
#                     }
#     def validate_price(self,data):
#         if data == 0:
#             raise serializers.ValidationError("Price of product cannot be 0.")
#         return data
#     def validate(self,data):
#         if data['price'] > data['mrp']:
#             raise serializers.ValidationError({"price":"Price should be always less than MRP of the project."})
#         return data

# class StockTVSerializer(serializers.Serializer):
#     stock = StockTVCreateSerializer(many=True)
# class StockTVGetSerializer(serializers.ModelSerializer):
#     class Meta:
#         model=Stock
#         fields = ['id','availability','sku','quantity','mrp','price','size','size_type','color',
#                 'ram','rom','processor','operating_system','wireless_connection','warranty_type','warranty_year',
#                 'resolution','smart_tv','hdmi_ports_no','usb_ports_no','build_type','slug']

# class StockTVUpdateSerializer(serializers.ModelSerializer):
#     class Meta:
#         model=Stock
#         fields = ['id','availability','quantity','mrp','price','size','size_type','color',
#                 'ram','rom','processor','operating_system','wireless_connection','warranty_type','warranty_year',
#                 'resolution','smart_tv','hdmi_ports_no','usb_ports_no','build_type']
#         extra_kwargs={'availability':{'required':False},
#                     'quantity':{'required':False},'mrp':{'required':False},
#                     'price':{'required':False},'size':{'required':False},
#                     'size_type':{'required':False},'color':{'required':False},

#                     }
#     def validate_price(self,data):
#         if data == 0:
#             raise serializers.ValidationError("Price of product cannot be 0.")
#         return data
#     def validate(self,data):
#         if data['price'] > data['mrp']:
#             raise serializers.ValidationError({"price":"Price should be always less than MRP of the project."})
#         return data

# class StockTVAllUpdateSerializer(serializers.Serializer):
#     stock = StockTVUpdateSerializer(many=True)


# class ComputerStockCreateSerializer(serializers.ModelSerializer):
#     class Meta:
#         model=Stock
#         fields=['id','mrp','price','size','size_type','color','availability','quantity','ram','rom','processor','graphics_card','operating_system','wireless_connection','warranty_type','warranty_year','resolution','hdmi_ports_no','usb_ports_no','network_compatibility','build_type','image']
#         extra_kwargs={'ram':{'required':True},'rom':{'required':True},'processor':{'required':True},'graphics_card':{'required':True},'operating_system':{'required':True},'wireless_connectivity':{'required':True},'warranty_type':{'required':True},'warranty_year':{'required':True},'resolution':{'required':True}}
#     def validate_price(self,data):
#         if data == 0:
#             raise serializers.ValidationError("Price of product cannot be 0.")
#         return data
#     def validate(self,data):
#         if data['price'] > data['mrp']:
#             raise serializers.ValidationError({"price":"Price should be always less than MRP of the project."})
#         return data

# class ComputerStockGetSerializer(serializers.ModelSerializer):
#     class Meta:
#         model=Stock
#         fields=['id','availability','sku','mrp','price','size','size_type','color','quantity','ram','rom','processor','graphics_card','operating_system','wireless_connection','warranty_type','warranty_year','resolution','hdmi_ports_no','usb_ports_no','network_compatibility','build_type','image','slug']
#         extra_kwargs={'ram':{'required':True},'rom':{'required':True},'processor':{'required':True},'graphics_card':{'required':True},'operating_system':{'required':True},'wireless_connectivity':{'required':True},'warranty_type':{'required':True},'warranty_year':{'required':True},'resolution':{'required':True}}


# class StockMobileCreateSerializer(serializers.ModelSerializer):
#     class Meta:
#         model=Stock
#         fields = ['id','availability','quantity','mrp','price','size','size_type','color','image',
#                 'ram','rom','processor','operating_system','wireless_connection','warranty_type','warranty_year',
#                 'resolution','phone_type','network_compatibility','build_type','wireless_charging']
#         extra_kwargs={
#                     'wireless_connection':{'required':True},'warranty_type':{'required':True},
#                     'warranty_year':{'required':True},'resolution':{'required':True},
#                     'network_compatibility':{'required':True}
#                     }
#     def validate_price(self,data):
#         if data == 0:
#             raise serializers.ValidationError("Price of product cannot be 0.")
#         return data
#     def validate(self,data):
#         if data['price'] > data['mrp']:
#             raise serializers.ValidationError({"price":"Price should be always less than MRP of the project."})
#         return data

# class StockMobileGetSerializer(serializers.ModelSerializer):
#     class Meta:
#         model=Stock
#         fields = ['id','availability','quantity','mrp','price','size','size_type','color','image',
#                 'ram','rom','processor','operating_system','wireless_connection','warranty_type','warranty_year',
#                 'resolution','phone_type','network_compatibility','build_type','wireless_charging','slug']


# class StockAllMobileSerializer(serializers.Serializer):
#     stock = StockMobileCreateSerializer(many=True)
# class ClothStockCreateSerializer(serializers.ModelSerializer):
#     class Meta:
#         model=Stock
#         fields = ['id','availability','quantity','mrp','price','size','size_type','color','warranty_type','warranty_year','sleeves','clothing_material','fit_type','length','wash_type','jeans_type','pants_fly','clothing_style','collar_type','image']
#         extra_kwargs={
#                     'clothing_material':{'required':True},'warranty_type':{'required':True},
#                     'warranty_year':{'required':True},'clothing_style':{'required':True},
#                     'network_compatibility':{'required':True}
#                     }
#     def validate_price(self,data):
#         if data == 0:
#             raise serializers.ValidationError("Price of product cannot be 0.")
#         return data
#     def validate(self,data):
#         if data['price'] > data['mrp']:
#             raise serializers.ValidationError({"price":"Price should be always less than MRP of the project."})
#         return data

# class ClothStockGetSerializer(serializers.ModelSerializer):
#     class Meta:
#         model=Stock
#         fields = ['id','availability','sku','quantity','mrp','price','size','size_type','color','warranty_type','warranty_year','sleeves','clothing_material','fit_type','length','wash_type','jeans_type','pants_fly','clothing_style','collar_type','image','slug']

# class ClothAllStockSerializer(serializers.Serializer):
#     stock = ClothStockCreateSerializer(many=True)
# class StockMobileUpdateSerializer(serializers.ModelSerializer):
#     class Meta:
#         model=Stock
#         fields = ['id','availability','quantity','mrp','price','size','size_type','color','warranty_type','warranty_year','sleeves','clothing_material','fit_type','length','wash_type','jeans_type','pants_fly','clothing_style','collar_type','image']

#         extra_kwargs={'availability':{'required':False},
#                     'quantity':{'required':False},'mrp':{'required':False},
#                     'price':{'required':False},'size':{'required':False},
#                     'size_type':{'required':False},'color':{'required':False},
#                     }
#     def validate_price(self,data):
#         if data == 0:
#             raise serializers.ValidationError("Price of product cannot be 0.")
#         return data
#     def validate(self,data):
#         if data['price'] > data['mrp']:
#             raise serializers.ValidationError({"price":"Price should be always less than MRP of the project."})
#         return data


# class StockMobileAllUpdateSerializer(serializers.Serializer):
#     stock = StockMobileUpdateSerializer(many=True)

# class StockClothUpdateSerializer(serializers.ModelSerializer):
#     class Meta:
#         model=Stock
#         fields = ['id','availability','quantity','mrp','price','size','size_type','color','warranty_type','warranty_year','sleeves','clothing_material','fit_type','length','wash_type','jeans_type','pants_fly','clothing_style','collar_type','image']

#         extra_kwargs={'availability':{'required':False},
#                     'quantity':{'required':False},'mrp':{'required':False},
#                     'price':{'required':False},'size':{'required':False},
#                     'size_type':{'required':False},'color':{'required':False},
#                     }
#     def validate_price(self,data):
#         if data == 0:
#             raise serializers.ValidationError("Price of product cannot be 0.")
#         return data
#     def validate(self,data):
#         if data['price'] > data['mrp']:
#             raise serializers.ValidationError({"price":"Price should be always less than MRP of the project."})
#         return data


# class StockClothAllUpdateSerializer(serializers.Serializer):
#     stock = StockClothUpdateSerializer(many=True)


# class ComputerStockSerializer(serializers.Serializer):
#     stock = ComputerStockCreateSerializer(many=True)

# class StockComputerUpdateSerializer(serializers.ModelSerializer):
#     class Meta:
#         model=Stock
#         fields=['id','mrp','price','size','size_type','color','availability','quantity','ram','rom','processor','graphics_card','operating_system','wireless_connection','warranty_type','warranty_year','resolution','hdmi_ports_no','usb_ports_no','network_compatibility','build_type','image']
#         # extra_kwargs={'ram':{'required':True},'rom':{'required':True},'processor':{'required':True},'graphics_card':{'required':True},'operating_system':{'required':True},'wireless_connectivity':{'required':True},'warranty_type':{'required':True},'warranty_year':{'required':True},'resolution':{'required':True}}
#         extra_kwargs={'availability':{'required':False},
#                     'quantity':{'required':False},'mrp':{'required':False},
#                     'price':{'required':False},'size':{'required':False},
#                     'size_type':{'required':False},'color':{'required':False},
#                     'warranty_type':{'required':False},'warranty_year':{'required':False},
#                     'ram':{'required':False},'rom':{'required':False},'processor':{'required':False},
#                     'graphics_card':{'required':False},'operating_system':{'required':False},
#                     'wireless_connectivity':{'required':False},'resolution':{'required':False}


#                     }
#     def validate_price(self,data):
#         if data == 0:
#             raise serializers.ValidationError("Price of product cannot be 0.")
#         return data
#     def validate(self,data):
#         if data['price'] > data['mrp']:
#             raise serializers.ValidationError({"price":"Price should be always less than MRP of the project."})
#         return data

# class StockComputerAllUpdateSerializer(serializers.Serializer):
#     stock = StockComputerUpdateSerializer(many=True)


class ServiceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        exclude = ["level", "slug", "type"]

    def validate_parent(self, data):
        parent = Category.objects.get(id=data.id)
        if parent.level == 2:
            raise serializers.ValidationError(
                "This category can not be made parent category. Please try again with suitable category."
            )
        return data


class ServiceCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        exclude = ["slug", "user", "added_by", "deleted_at", "type"]

    def validate_name(self, data):
        if len(data) < 15:
            raise serializers.ValidationError(
                "Service name should be more than 15 characters."
            )
        return data

    def validate_category(self, data):
        if data.level != 2:
            raise serializers.ValidationError(
                "You cannot create product in this level service category."
            )
        if data.type != "service":
            raise serializers.ValidationError("The category is not of service type.")

        return data


# service
class StockServiceCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stock
        fields = ["id", "availability", "mrp", "price", "size", "size_unit", "quantity"]
        # extra_kwargs={
        #             'color':{'required':False},'quantity':{'required':True},
        #             }

    def validate_price(self, data):
        if data == 0:
            raise serializers.ValidationError("Price of product cannot be 0.")
        return data

    def validate(self, data):
        if data["price"] > data["mrp"]:
            raise serializers.ValidationError(
                {"price": "Price should be always less than MRP of the project."}
            )
        return data


class StockServiceGetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stock
        fields = [
            "id",
            "sku",
            "availability",
            "mrp",
            "price",
            "size",
            "size_unit",
            "quantity",
            "slug",
        ]


class StockServiceSerializer(serializers.Serializer):
    stock = StockServiceCreateSerializer(many=True)


# class StockServiceUpdateSerializer(serializers.ModelSerializer):
#     class Meta:
#         model=Stock
#         fields = ['id','availability','mrp','price','size','size_unit','quantity']
#         extra_kwargs={'availability':{'required':False},
#                     'mrp':{'required':False}, 'price':{'required':False},'size':{'required':False},
#                     'size_type':{'required':False},'quantity':{'required':False}
#                     }
#     def validate_price(self,data):
#         if data == 0:
#             raise serializers.ValidationError("Price of product cannot be 0.")
#         return data
#     def validate(self,data):
#         try:
#             if data['price'] > data['mrp']:
#                 raise serializers.ValidationError({"price":"Price should be always less than MRP of the project."})
#         except:
#             pass
#         return data

# class StockServiceAllUpdateSerializer(serializers.Serializer):
#     stock = StockServiceUpdateSerializer(many=True)


class CategoryGrandParentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name", "icon")


class CategoryGrandParentListSerializer(serializers.ModelSerializer):
    child_count = serializers.SerializerMethodField()
    product_attribute = serializers.SerializerMethodField()
    stock_attribute = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = (
            "id",
            "name",
            "icon",
            "child_count",
            "product_attribute",
            "stock_attribute",
        )

    def get_child_count(self, obj):
        return obj.category_set.all().count()

    def get_product_attribute(self, obj):
        return [
            {
                "id": attribute.id,
                "name": attribute.name,
                "type": attribute.type,
                "options": attribute.options,
                "unit": attribute.unit,
                "info": attribute.info,
                "slug": attribute.slug,
            }
            for attribute in obj.product_attribute.all()
        ]

    def get_stock_attribute(self, obj):
        return [
            {
                "id": attribute.id,
                "name": attribute.name,
                "type": attribute.type,
                "unit": attribute.unit,
            }
            for attribute in obj.stock_attribute.all()
        ]


class CategoryParentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        exclude = ("icon", "level", "type", "slug")
        extra_kwargs = {
            "product_attribute": {"required": False},
            "stock_attribute": {"required": False},
        }

    def validate(self, data):
        try:
            if data["parent"] is not None:
                data["icon"] = None
            return data
        except:
            return data

    def validate_parent(self, data):
        parent = Category.objects.get(id=data.id)
        if parent.level == 2:
            raise serializers.ValidationError(
                "This category can not be made parent category. Please try again with suitable category."
            )
        return data


class CategoryParentRetrieveSerializer(serializers.ModelSerializer):
    product_attribute = serializers.SerializerMethodField()
    stock_attribute = serializers.SerializerMethodField()

    class Meta:
        model = Category
        exclude = ("icon", "level", "type", "slug")

    def get_product_attribute(self, obj):
        return [
            {
                "id": attribute.id,
                "name": attribute.name,
                "type": attribute.type,
                "options": attribute.options,
                "unit": attribute.unit,
                "info": attribute.info,
                "slug": attribute.slug,
            }
            for attribute in obj.product_attribute.all()
        ]

    def get_stock_attribute(self, obj):
        return [
            {
                "id": attribute.id,
                "name": attribute.name,
                "type": attribute.type,
                "unit": attribute.unit,
            }
            for attribute in obj.stock_attribute.all()
        ]


class CategoryChildCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name", "parent")

    def validate(self, data):
        try:
            if data["parent"] is not None:
                data["icon"] = None
            return data
        except:
            return data

    def validate_parent(self, data):
        parent = Category.objects.get(id=data.id)
        if parent.level == 2:
            raise serializers.ValidationError(
                "This category can not be made parent category. Please try again with suitable category."
            )
        return data


class CategoryChildListSerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ("id", "name", "parent", "product_count")

    def get_product_count(self, obj):
        return obj.product_set.all().count()


class AttributeListSerializer(serializers.ModelSerializer):
    category_count = serializers.SerializerMethodField()

    class Meta:
        model = Attribute
        exclude = ("deleted_at", "updated_at")

    def get_category_count(self, obj):
        return obj.category_product.all().count()


class AttributeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attribute
        exclude = ["slug", "deleted_at"]


# class StockCreateSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Stock
#         exclude = ['slug','deleted_at','status','sku']
class StockAttributeKeyListSerializer(serializers.ModelSerializer):
    category_count = serializers.SerializerMethodField()

    class Meta:
        model = StockAttribute
        exclude = ("deleted_at", "updated_at")

    def get_category_count(self, obj):
        return obj.category_stock.all().count()


class StockAttributeKeyCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockAttribute
        exclude = ["slug", "deleted_at"]


class StockAttributeValueCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stock_StockAttribute
        fields = ("attribute", "value")

    # def validate(self,obj):
    #     if obj['attribute'] in obj['stock'].product.category.parent.stock_attribute.all():
    #         return obj
    #     else:
    #         raise serializers.ValidationError(
    #             {"attribute": ["This attribute is not acceptable for this stock. Please change the category or attribute."]}
    #             )


class StockAttributeValueBulkCreateSerializer(serializers.Serializer):
    attributes = StockAttributeValueCreateSerializer(many=True)


class AttributeListWithoutPaginationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attribute
        fields = ["id", "name"]


class StockAttributeListWithoutPaginationSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockAttribute
        fields = ["id", "name"]


""" Attributes Serializer post method; excel file"""


class ExcelfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = ExcelStorage
        fields = ["filename"]


class ProductAttributesSerializer(serializers.ModelSerializer):
    product_attribute = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ["product_attribute"]

    def get_product_attribute(self, obj):
        category_obj = get_object_or_404(Category, id=obj.parent.id)
        data = AttributeSerializer(category_obj.product_attribute.all(), many=True).data
        return data


class StockAttributesSerializer(serializers.ModelSerializer):
    stock_attribute = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ["stock_attribute"]

    def get_stock_attribute(self, obj):
        category_obj = get_object_or_404(Category, id=obj.parent.id)
        print(category_obj.stock_attribute.all())
        data = StockAttributeSerializer(
            category_obj.stock_attribute.all(), many=True
        ).data
        return data


class BulkOrderSerializer(serializers.ModelSerializer):
    products = serializers.SerializerMethodField()
    contact_no = serializers.CharField(required=True)

    def validate_phone_number(self, value):
        import re

        if not re.match("^\+?\d{8,15}$", value):
            raise serializers.ValidationError(
                "Phone number must be in the format '+999999999' with up to 15 digits."
            )

        return value

    class Meta:
        model = BulkOrder
        fields = [
            "id",
            "customer",
            "name",
            "products",
            "description",
            "company",
            "contact_no",
            "address",
            "contact_email",
            "extra_data",
        ]

    def get_products(self, obj):
        return ProductListSerializer(obj.products.all(), many=True).data


class TopCategorySerializer(serializers.ModelSerializer):
    category = serializers.SerializerMethodField()
    icon = serializers.SerializerMethodField()
    slug = serializers.SerializerMethodField()
    main_category = serializers.SerializerMethodField()

    class Meta:
        model = TopCategory
        fields = ["id", "category", "status", "icon", "slug", "main_category"]

    def get_main_category(self, obj):
        if obj.category.id:
            return obj.category.id
        return None

    def get_category(self, obj):
        return obj.category.name

    def get_icon(self, obj):
        return obj.category.icon

    def get_slug(self, obj):
        return obj.category.slug


class TopCategoryPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = TopCategory
        fields = ["status", "category"]
