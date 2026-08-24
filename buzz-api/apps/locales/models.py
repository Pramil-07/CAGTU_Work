from datetime import datetime

from ckeditor_uploader.fields import RichTextUploadingField
from django.db import models
from django.utils.text import slugify

from apps.core.models import TimestampModel, BaseStatusModel
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
from .constants import HOROSCOPE_TYPE
from django.utils import timezone


class Currency(models.Model):
    code = models.CharField(max_length=5, primary_key=True)
    name = models.CharField(max_length=64)
    # symbol = models.CharField(max_length=32, null=True, blank=True)
    # number = models.PositiveSmallIntegerField(null=True)
    minor = models.PositiveSmallIntegerField(
        default=100,
        help_text="Enter the number of minors eg: 100 for cents to become 1 USD",
    )
    supports_stripe = models.BooleanField(default=False)
    is_active = models.BooleanField(default=False)
    current_value = models.FloatField(validators=[MinValueValidator(0.0)])
    is_default = models.BooleanField(default=False)
    enable_currency_configuration = models.BooleanField(default=False)
    symbol = models.CharField(max_length=32, null=True)

    @property
    def id(self):
        return self.code

    class Meta:
        ordering = ("-code",)
        verbose_name = _("Currency")
        verbose_name_plural = _("Currencies")

    def __str__(self):
        return self.name


class ExchangeRate(TimestampModel):
    currency = models.ForeignKey(Currency, on_delete=models.CASCADE)
    value = models.FloatField(validators=[MinValueValidator(0.0)])
    is_default = models.BooleanField(default=False)
    is_active = models.BooleanField(default=False)
    enable_currency_configuration = models.BooleanField(default=False)

    class Meta:
        verbose_name = _("ExchangeRate")
        verbose_name_plural = _("ExchangeRates")

    def __str__(self):
        return self.currency.name


class Language(models.Model):
    code = models.CharField(max_length=16, primary_key=True)
    name = models.CharField(max_length=64)
    is_active = models.BooleanField(default=False)
    is_default = models.BooleanField(default=False)
    enable_language_configuration = models.BooleanField(default=False)

    @property
    def id(self):
        return self.code

    class Meta:
        verbose_name = _("Language")
        verbose_name_plural = _("Languages")

    def __str__(self):
        return self.name


class Country(models.Model):
    code = models.CharField(max_length=3, primary_key=True)
    is_active = models.BooleanField(default=False)
    name = models.CharField(max_length=64)
    local_name = models.CharField(max_length=128)
    phone_code = models.CharField(max_length=5)
    currency = models.ForeignKey(Currency, on_delete=models.CASCADE)
    language = models.ForeignKey(Language, on_delete=models.CASCADE)

    @property
    def id(self):
        return self.code

    class Meta:
        ordering = ("name",)
        verbose_name = _("Country")
        verbose_name_plural = _("Countries")

    def __str__(self):
        return self.name


class City(models.Model):
    name = models.CharField(max_length=128)
    local_name = models.CharField(max_length=128)
    country = models.ForeignKey(Country, on_delete=models.CASCADE)
    zip_code = models.CharField(max_length=10)
    latitude = models.FloatField(
        validators=[MinValueValidator(-90.0), MaxValueValidator(90.0)], default=0
    )
    longitude = models.FloatField(
        validators=[MinValueValidator(-180.0), MaxValueValidator(180.0)], default=0
    )

    class Meta:
        verbose_name = _("City")
        verbose_name_plural = _("Cities")
        unique_together = ("country", "zip_code")

    def __str__(self):
        return self.name


class Horoscope(models.Model):
    title = models.CharField(max_length=128)
    sub_title = models.CharField(max_length=128)
    image = models.ImageField(upload_to="cipher/user/media")

    def __str__(self):
        return self.title


class HoroscopeDetail(models.Model):
    horoscope = models.ForeignKey(Horoscope, on_delete=models.CASCADE)
    type = models.CharField(max_length=50, choices=HOROSCOPE_TYPE)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField()
    description = models.CharField(max_length=1255)
    sharing_url = models.URLField(null=True, blank=True)

    class Meta:
        ordering = ("id",)

    def __str__(self):
        return f"{self.horoscope.title} -{self.type}"


class PolicyAndTerms(BaseStatusModel):
    type = [
        ("Privacy", "Privacy Policy"),
        ("Terms", "Terms of Condition"),
    ]
    type = models.CharField(max_length=50, choices=type, default="Privacy")
    Content = RichTextUploadingField(null=True, blank=True)
    Effective_Date = models.DateField(null=True, blank=True)
    slug = models.SlugField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(f"{self.type}")
            slug = base_slug
            counter = 1
            while PolicyAndTerms.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.type
