from ckeditor.fields import RichTextField
from ckeditor_uploader.fields import RichTextUploadingField
from django.contrib.auth import get_user_model
from django.db import models, transaction
from django.db.models import Choices
from django_filters.fields import ChoiceField
from apps.core.models import BaseStatusModel

User = get_user_model()


class MasterProfileAddress(BaseStatusModel):
    street_address = models.CharField(max_length=255, null=True, blank=True)
    suburb = models.CharField(max_length=100, null=True, blank=True)
    state = models.CharField(max_length=100, null=True, blank=True)
    postcode = models.CharField(max_length=8, null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        parts = [self.street_address, self.suburb, self.state, self.postcode]
        return ", ".join(filter(None, parts))


class Banner(BaseStatusModel):
    class BannerType(models.TextChoices):
        CAROUSEL = "CAR", "Carousel"
        HEADER = "HDR", "Header "
        FOOTER = "FTR", "Footer"
        ANNOUNCEMENT = "ANN", "Announcement"

    master_profile = models.ForeignKey(
        "MasterProfile", on_delete=models.CASCADE, null=True, blank=True
    )
    title = models.CharField(max_length=255, null=True, blank=True)
    quotes = models.CharField(max_length=255, null=True, blank=True)
    description = RichTextUploadingField(null=True, blank=True)
    image = models.ImageField(
        upload_to="media/carousel/carousel/", null=True, blank=True
    )
    header_banner_image = models.ImageField(
        upload_to="media/carousel/header/", null=True, blank=True
    )
    footer_banner_image = models.ImageField(
        upload_to="media/carousel/footer/", null=True, blank=True
    )
    banner_type = models.CharField(
        max_length=3,
        choices=BannerType.choices,
        default=BannerType.CAROUSEL,
    )

    order = models.PositiveIntegerField(null=True, blank=True)
    category_badge = models.CharField(max_length=100, null=True, blank=True)

    class Meta:
        unique_together = ("order", "banner_type", "master_profile")

    def __str__(self):
        return f"{self.title or 'Unnamed Banner'} "


class MasterProfile(BaseStatusModel):
    DAYS_OF_WEEK = [
        ("MON", "Monday"),
        ("TUE", "Tuesday"),
        ("WED", "Wednesday"),
        ("THU", "Thursday"),
        ("FRI", "Friday"),
        ("SAT", "Saturday"),
        ("SUN", "Sunday"),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    profile_name = models.CharField(max_length=120, null=True)
    profile_logo = models.ImageField(
        upload_to="media/carousel/", null=True, blank=True
    )
    phone = models.CharField(
        max_length=20,
        null=True,
        blank=True,
        help_text="Include country code, e.g. +61XXXXXXXXX",
    )
    hotline_number = models.CharField(
        max_length=20,
        null=True,
        blank=True,
        help_text="Include country code, e.g. +61XXXXXXXXX",
    )
    address = models.ForeignKey(
        MasterProfileAddress,
        on_delete=models.PROTECT,
    )
    email = models.EmailField(max_length=255, null=True, blank=True)
    opening_day = models.CharField(
        choices=DAYS_OF_WEEK, max_length=5, null=True, blank=True
    )
    closing_day = models.CharField(
        choices=DAYS_OF_WEEK, max_length=5, null=True, blank=True
    )
    opening_time = models.TimeField(null=True, blank=True)
    closing_time = models.TimeField(null=True, blank=True)
    extra_info = models.JSONField(null=True, blank=True)
    banners = models.ManyToManyField(Banner, blank=True)
    is_default = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.profile_name or 'Unnamed Profile'}"

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user"],
                condition=models.Q(is_default=True),
                name="unique_master_profile",
            )
        ]

    def save(self, *args, **kwargs):
        if self.is_default:
            with transaction.atomic():
                MasterProfile.objects.filter(user=self.user, is_default=True).exclude(
                    pk=self.pk
                ).update(is_default=False)
                super().save(*args, **kwargs)

        else:
            super().save(*args, **kwargs)
