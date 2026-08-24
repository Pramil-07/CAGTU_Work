from datetime import date

from django.contrib.auth import get_user_model
from django.db import models
from django.db.models import JSONField, Avg, Count
from django.forms import ImageField
from django.http import Http404
from apps.accountapp.models import *
from django.db.models.signals import pre_save
from django.template.defaultfilters import slugify
from .utils import unique_slugify, sku_generator, unique_update_slugify
from rest_framework import serializers
from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator
from rest_framework.response import Response
from .managers import *
from .constants import *
from ..blogapp.models import Tag

from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from django.db.models import UniqueConstraint
from django.db.models.functions import Lower
from apps.core.models import TimestampModel, BaseStatusModel
from ..locales.models import Currency

User = get_user_model()


# Create your models here.
class Brand(models.Model):
    slug = models.SlugField(max_length=250, null=True, blank=True)
    name = models.CharField(max_length=250)
    image = models.ImageField(upload_to="brand/images")
    banner = models.ImageField(upload_to="brand/banner")

    class Meta:
        ordering = ("-id",)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if self._state.adding:
            if Brand.objects.filter(name__iexact=self.name).first():
                resp = {
                    "status": "failure",
                    "message": "The brand name is already in the list. Please create another name.",
                }
                raise serializers.ValidationError(resp)
        else:
            brand_obj = (
                Brand.objects.filter(name__iexact=self.name).exclude(id=self.pk).count()
            )
            if brand_obj > 0:
                resp = {
                    "status": "failure",
                    "message": "The brand name is already in the list. Please create another name.",
                }
                raise serializers.ValidationError(resp)

        self.slug = unique_slugify(self, slugify(self.name))
        super(Brand, self).save(*args, **kwargs)


class Attribute(TimestampModel):
    name = models.CharField(
        max_length=255,
        unique=True,
        error_messages={"unique": "This name has already been created."},
    )
    type = models.CharField(max_length=20, choices=INPUT_TYPE)
    options = models.TextField(null=True, blank=True)
    unit = models.CharField(max_length=100, null=True, blank=True)
    info = models.CharField(max_length=255, null=True, blank=True)
    slug = models.SlugField(max_length=250, null=True, blank=True)

    def __str__(self) -> str:
        return f"{self.id}-{self.name}"

    class Meta:
        ordering = ("-id",)

    def save(self, *args, **kwargs):
        if self._state.adding:
            if Attribute.objects.filter(name__iexact=self.name).first():
                resp = {
                    "status": "failure",
                    "message": "The attribute name is already in the list. Please create another name.",
                }
                raise serializers.ValidationError(resp)
        else:
            attribute_obj = (
                Attribute.objects.filter(name__iexact=self.name)
                .exclude(id=self.pk)
                .count()
            )
            if attribute_obj > 0:
                resp = {
                    "status": "failure",
                    "message": "The attribute name is already in the list. Please create another name.",
                }
                raise serializers.ValidationError(resp)
        self.slug = unique_update_slugify(self, self._state.adding, slugify(self.name))
        super(Attribute, self).save(*args, **kwargs)


class StockAttribute(TimestampModel):
    name = models.CharField(
        max_length=255,
        unique=True,
        error_messages={"unique": "This name has already been created."},
    )
    type = models.CharField(max_length=20, choices=INPUT_TYPE)
    options = models.TextField(null=True, blank=True)
    unit = models.CharField(max_length=100, null=True, blank=True)
    info = models.CharField(max_length=255, null=True, blank=True)
    slug = models.SlugField(max_length=250, null=True, blank=True)

    def __str__(self) -> str:
        return f"{self.id}-{self.name}"

    class Meta:
        ordering = ("-id",)

    def save(self, *args, **kwargs):
        if self._state.adding:
            if Attribute.objects.filter(name__iexact=self.name).first():
                resp = {
                    "status": "failure",
                    "message": "The attribute name is already in the list. Please create another name.",
                }
                raise serializers.ValidationError(resp)
        else:
            attribute_obj = (
                Attribute.objects.filter(name__iexact=self.name)
                .exclude(id=self.pk)
                .count()
            )
            if attribute_obj > 0:
                resp = {
                    "status": "failure",
                    "message": "The attribute name is already in the list. Please create another name.",
                }
                raise serializers.ValidationError(resp)
        self.slug = unique_update_slugify(self, self._state.adding, slugify(self.name))
        super(StockAttribute, self).save(*args, **kwargs)


CATEGORY_TYPES = (("product", "Product"), ("blog", "Blog"))


class Category(BaseStatusModel):
    name = models.CharField(max_length=250, unique=True)
    parent = models.ForeignKey("self", on_delete=models.CASCADE, null=True, blank=True)
    level = models.IntegerField(null=True)
    icon = models.TextField(null=True, blank=True)
    type = models.CharField(max_length=250, default="product", choices=CATEGORY_TYPES)
    slug = models.SlugField(max_length=250, null=True, blank=True)
    product_attribute = models.ManyToManyField(
        Attribute, related_name="category_product"
    )
    stock_attribute = models.ManyToManyField(
        StockAttribute, related_name="category_stock", blank=True
    )

    def save(self, *args, **kwargs):
        if self.parent is None:
            self.level = 0
        else:
            parent_obj = Category.objects.filter(id=self.parent.id).first()
            if parent_obj and parent_obj.parent:
                self.level = 2
            else:
                self.level = 1

        self.slug = unique_update_slugify(self, self._state.adding, slugify(self.name))
        super(Category, self).save(*args, **kwargs)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ("-id",)
        verbose_name = "Category"
        verbose_name_plural = "categories"


from ckeditor_uploader.fields import RichTextUploadingField


class Product(BaseStatusModel):
    is_active = models.BooleanField(default=True)
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=200, default="product")
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    added_by = models.CharField(
        max_length=50, null=True, blank=True, default="Mitho Sweets"
    )
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE, null=True, blank=True)
    model_no = models.CharField(max_length=100, null=True, blank=True)
    thumbnail_image = models.TextField(null=True, blank=True)
    video_url = models.URLField(null=True, blank=True)
    product_status = models.CharField(max_length=50, choices=PRODUCT_STATUS)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    description = RichTextUploadingField(null=True, blank=True)
    tags = models.ManyToManyField(Tag, related_name="products", blank=True)
    warranty_type = models.CharField(
        max_length=25, null=True, blank=True, choices=WARRANTY_PERIOD
    )
    currency = models.ForeignKey(
        Currency, null=True, blank=True, on_delete=models.SET_NULL
    )
    average_rating = models.FloatField(default=0)
    warranty_period = models.CharField(max_length=150, null=True, blank=True)
    slug = models.SlugField(max_length=250, null=True, blank=True)
    notes = models.CharField(max_length=250, null=True, blank=True)
    meta_title = models.CharField(max_length=150, null=True, blank=True)
    meta_description = RichTextUploadingField(null=True, blank=True)
    extra_data = models.JSONField(null=True, blank=True)
    meta_keyword = models.CharField(max_length=450, null=True, blank=True)
    order = models.IntegerField(unique=True, null=True, blank=True)
    attributes = models.ManyToManyField(Attribute, through="Product_Attribute")
    # objects = ProductAllManager()

    objects = models.Manager()
    all_products = ProductAllManager()
    all_services = ServiceAllManager()
    products = ProductActiveManager()
    services = ServiceActiveManager()

    def update_product_rating(self):
        stats = self.reviews.aggregate(avg=Avg("rating"), count=Count("id"))
        self.average_rating = stats["avg"] or 0
        self.save(
            update_fields=[
                "average_rating",
            ]
        )

    def save(self, *args, **kwargs):

        if not self.slug or (self.pk and self.name != Product.objects.get(pk=self.pk).name):
            self.slug = unique_slugify(self, slugify(self.name))

        self.added_by = self.user.username if hasattr(self, "user") and self.user else "Mitho Sweets"
        super(Product, self).save(*args, **kwargs)

    def __str__(self):
        return self.slug

    class Meta:
        ordering = ["-id"]


class ProductImage(BaseStatusModel):
    image = models.ImageField(upload_to="product_images/")
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="images"
    )

    def __str__(self):
        return f"Image for {self.product.name}"


class BulkOrder(BaseStatusModel):
    customer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    name = models.CharField(max_length=255, null=True, blank=True)
    products = models.ManyToManyField(Product, blank=True, related_name="bulk")
    description = models.TextField(blank=True)
    company = models.CharField(max_length=255, null=True, blank=True)
    contact_no = models.CharField(max_length=20)
    address = models.CharField(max_length=255)
    contact_email = models.EmailField(blank=True)
    extra_data = models.JSONField(default=dict)


    def __str__(self):
        if self.customer:
            return f"{self.customer} Bulk Order"
        return "Bulk Order"


class Product_Attribute(models.Model):
    """Many to Many relation of Product and Attribute

    Args:
        models (_type_): _description_
    """

    attribute = models.ForeignKey(Attribute, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    value = models.CharField(max_length=255)

    def save(self, *args, **kwargs):
        if (
            Product_Attribute.objects.filter(
                attribute=self.attribute, product=self.product
            ).count()
            > 0
        ):
            raise serializers.ValidationError(
                {
                    "attribute": [
                        "Attribute already exits for this product.",
                    ]
                }
            )
        super(Product_Attribute, self).save(*args, **kwargs)

    def __str__(self) -> str:
        return self.attribute.name


class FileStore(models.Model):
    image = models.ImageField(upload_to="filestore")


class Stock(BaseStatusModel):
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="stocks"
    )
    slug = models.SlugField(max_length=255)
    mrp = models.PositiveIntegerField(null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    offer_price = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    sku = models.CharField(max_length=250)
    color = models.CharField(max_length=250)
    availability = models.BooleanField()
    size_unit = models.CharField(max_length=50)
    size = models.PositiveIntegerField()
    quantity = models.PositiveIntegerField()
    image = models.TextField(null=True, blank=True)
    is_default = models.BooleanField(default=False)
    attributes = models.ManyToManyField(
        StockAttribute, through="Stock_StockAttribute", blank=True
    )

    def __str__(self):
        return self.slug

    @property
    def current_price(self):
        if (
            self.offer_price
            and self.product.offers.filter(end_date__gte=date.today()).exists()
        ):
            return self.offer_price

        return self.price

    def save(self, *args, **kwargs):
        if not self.sku:
            self.sku = sku_generator(self, self.product_id)

        if not self.status:
            self.status = True

        if self.is_default:
            stocks = Stock.objects.filter(product=self.product)
            for stock in stocks:
                stock.is_default = False
                stock.save()
        self.slug = unique_slugify(self, slugify(f"{self.product.slug}-{self.sku}"))
        super(Stock, self).save(*args, **kwargs)

    class Meta:
        ordering = ["-id"]


class Stock_StockAttribute(models.Model):
    attribute = models.ForeignKey(StockAttribute, on_delete=models.CASCADE)
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE)
    value = models.CharField(max_length=255)

    def save(self, *args, **kwargs):
        if (
            Stock_StockAttribute.objects.filter(
                attribute=self.attribute, stock=self.stock
            ).count()
            > 0
        ):
            raise serializers.ValidationError(
                {
                    "attribute": [
                        "Attribute already exits for this stock.",
                    ]
                }
            )
        super(Stock_StockAttribute, self).save(*args, **kwargs)

    def __str__(self) -> str:
        return f"{self.attribute.name} of {self.stock.sku} is {self.value}"


class WishList(BaseStatusModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE, null=True, blank=True)

    class Meta:
        ordering = ("-id",)


"""
Creating a model for storing excel file
"""


class ExcelStorage(models.Model):
    filename = models.FileField(upload_to="excel")


class TopCategory(BaseStatusModel):
    name = models.CharField(max_length=255, null=True, blank=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.status:
            self.status = "Active"

        if not self.name:
            self.name = self.category.name
        super().save(*args, **kwargs)
