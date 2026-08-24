import re
import uuid

from django.conf import settings
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.core.validators import RegexValidator
from django.db import models, IntegrityError
from django.template.defaultfilters import slugify
from django.utils.translation import gettext_lazy as _
from encrypted_model_fields.fields import EncryptedCharField
from rest_framework.exceptions import ValidationError as RestValidationError

from apps.core.models import BaseStatusModel
from apps.productapp.utils import unique_slugify
from .managers import UserManager


class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(default=uuid.uuid4, primary_key=True)
    email = models.EmailField(_("email address"), null=True, blank=True)
    username = models.CharField(_("username"), max_length=255, unique=True)
    phone = models.CharField(
        max_length=17,
        validators=[
            RegexValidator(
                regex=r"^\+?[1-9][0-9]{7,14}$",
                message="The contact number can have + sign in the beginning and max 15 digits without delimiters",
            )
        ],
        null=True,
        blank=True,
    )
    first_name = models.CharField(_("first name"), max_length=64, null=True, blank=True)
    middle_name = models.CharField(
        _("middle name"), max_length=64, null=True, blank=True
    )
    last_name = models.CharField(_("last name"), max_length=64, null=True, blank=True)

    is_active = models.BooleanField(default=False, verbose_name="Active Status")
    is_phone_verified = models.BooleanField(default=False)
    is_email_verified = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False, verbose_name="Verified Status")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    mfa_enabled = models.BooleanField(
        default=False,
        help_text="Multi factor authentication enabled",
    )
    social_only = models.BooleanField(
        default=False,
        help_text="For login with social auth.",
    )
    profile_image = models.ImageField(
        null=True,
        blank=True,
        upload_to="user/profile",
    )

    is_staff = models.BooleanField(default=False)
    is_customer = models.BooleanField(default=False)

    EMAIL_FIELD = "email"
    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = []

    objects = UserManager()

    class Meta:
        verbose_name = _("user")
        verbose_name_plural = _("users")
        ordering = ("-created_at", "first_name")

    def get_full_name(self):
        """
        Returns the first_name plus the last_name, with a space in between.
        """
        return re.sub(
            r"\s{2,}",
            " ",
            f'{self.first_name or ""} {self.middle_name or ""} {self.last_name or ""}',
        ).strip()

    def get_short_name(self):
        """
        Returns the short name for the user.
        """
        return self.first_name

    def send_email(
            self, subject, html_message, from_email=settings.DEFAULT_FROM_EMAIL, **kwargs
    ):
        """
        Sends an email to this User.
        """
        send_mail(
            subject,
            html_message,
            from_email,
            [self.email],
            html_message=html_message,
            **kwargs,
        )

    def clean(self):
        super().clean()
        self.email = self.__class__.objects.normalize_email(self.email)


    @property
    def full_name(self):
        return self.get_full_name()

    def save(self, *args, **kwargs):
        try:
            self.full_clean()
            super().save(*args, **kwargs)
        except (ValidationError, IntegrityError) as e:
            raise RestValidationError(e)


class Address(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="addresses")
    first_name = models.CharField(max_length=250)
    last_name = models.CharField(max_length=250)
    country = models.CharField(max_length=50)
    state = models.CharField(max_length=50)
    city = models.CharField(max_length=50)
    postal_code = models.CharField(max_length=50)
    contact_number = models.CharField(
        max_length=17,
        validators=[
            RegexValidator(
                regex=r"^\+?[1-9][0-9]{7,14}$",
                message="The contact number can have + sign in the beginning and max 15 digits without delimiters",
            )
        ],
        null=True,
        blank=True,
    )
    street_address = models.CharField(max_length=50)
    company_name = models.CharField(max_length=250, null=True, blank=True)
    is_default = models.BooleanField(default=False)
    email = models.EmailField()

    class Meta:
        verbose_name = "Address"
        verbose_name_plural = "Addresses"

    def __str__(self):
        return self.user.username

    def save(self, *args, **kwargs):
        if self.is_default:
            addresses = Address.objects.filter(user=self.user)
            for address in addresses:
                address.is_default = False
                address.save()
        return super(Address, self).save(*args, **kwargs)



class Merchant(BaseStatusModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    slug = models.SlugField(max_length=250, null=True, blank=True)
    name = models.CharField(max_length=150)
    phone = models.CharField(
        max_length=17,
        validators=[
            RegexValidator(
                regex=r"^\+?[1-9][0-9]{7,14}$",
                message="The contact number can have + sign in the beginning and max 15 digits without delimiters",
            )
        ],
        null=True,
        blank=True,
    )
    logo = models.ImageField(upload_to="merchant/profile", null=True, blank=True)
    # otp = encrypt(models.CharField(max_length=255, null=True, blank=True))
    shop_code = models.CharField(max_length=5, null=True, blank=True)
    opening_time = models.TimeField(null=True, blank=True)
    closing_time = models.TimeField(null=True, blank=True)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        self.slug = unique_slugify(self, slugify(self.name))
        super(Merchant, self).save(*args, **kwargs)

    class Meta:
        ordering = ["-id"]


class Employee(models.Model):
    merchant = models.ForeignKey(Merchant, on_delete=models.RESTRICT)
    user = models.ForeignKey(User, on_delete=models.RESTRICT)
    is_staff = models.BooleanField(default=False)
    is_maintainer = models.BooleanField(default=False)
    is_client = models.BooleanField(default=False)

    class Meta:
        unique_together = ("merchant", "user")

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name}"


# class Follow(TimeStamp):
#     merchant=models.ForeignKey(Merchant,on_delete=models.CASCADE)
#     customer=models.ManyToManyField(Customer)

#     def __str__(self) :
#         return self.merchant.merchant_name


#     class Meta:
#         ordering = ['-id']
class Follow(BaseStatusModel):
    merchant = models.ForeignKey(Merchant, on_delete=models.CASCADE)
    followers = models.ManyToManyField(User, related_name="following", blank=True)

    def __str__(self):
        return self.merchant.name

    class Meta:
        ordering = ["-created_at"]

    def followers_count(self):
        return self.followers.all().count()
