from django.db import models
from apps.checkoutapp.models import Order
from apps.productapp.models import Product, Stock
from apps.core.models import TimestampModel
from django.core.validators import RegexValidator
from .constants import *
from apps.core.models import BaseStatusModel
from django.contrib.auth import get_user_model

User = get_user_model()

# Create your models here.

# Newsletter


class Newsletter(BaseStatusModel):
    email = models.EmailField(max_length=254)

    def __str__(self):
        return self.email


class Feedback(BaseStatusModel):
    feedback_category = models.CharField(max_length=255)
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    email = models.EmailField(max_length=254)
    phone = models.CharField(max_length=25)
    subject = models.CharField(max_length=255)
    description = models.TextField()
    attachment = models.FileField(
        upload_to="feedback/attachment", null=True, blank=True
    )

    def __str__(self):
        return self.email

    class Meta:
        ordering = ["-id"]


class Refund(BaseStatusModel):
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    customer = models.ForeignKey(User, on_delete=models.CASCADE)
    reason = models.CharField(max_length=100)
    message = models.TextField(null=True, blank=True)
    attachment = models.FileField(upload_to="product/refund", null=True, blank=True)
    accepted = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.customer.user.first_name}-{self.customer.user.last_name}"


class Questionnaire(BaseStatusModel):
    enquirer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="enquirer_user",
        null=True,
        blank=True,
    )
    store_name = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="store_name_user",
        null=True,
        blank=True,
    )
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="product_Questionnaire"
    )
    question = models.TextField(null=True, blank=True)
    answer = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.id}: {self.question} by {self.enquirer}: answered by {self.store_name}"


class ContactUs(TimestampModel):
    ticket_id = models.AutoField(primary_key=True)
    category = models.CharField(max_length=255, choices=CATEGORY_STATUS)
    email = models.EmailField()
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    phone_regex = RegexValidator(
        regex="^\+(?:[0-9]●?){6,14}[0-9]$",
        message="Contact number must be entered in the format: '+999999999'. Up to 15 digits allowed.",
    )
    phone = models.CharField(
        validators=[phone_regex], max_length=17, null=True, blank=True
    )
    subject = models.CharField(max_length=255)
    description = models.TextField()
    attachment = models.FileField(
        upload_to="contact-us/attachments", null=True, blank=True
    )
    status = models.CharField(max_length=255, choices=CONTACT_STATUS)

    def __str__(self) -> str:
        return f"{self.first_name}-{self.last_name}"

    class Meta:
        verbose_name_plural = "contactus"


# class Questionnaires(TimeStamp):
#     enquirer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="enquirer_user", null=True, blank=True)
#     store_name = models.ForeignKey(User, on_delete=models.CASCADE, related_name="store_name_user", null=True, blank=True)
#     product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="product_Questionnaire")
#     question = models.TextField(null=True, blank=True)
#     answer = models.TextField(null=True, blank=True)

#     def __str__(self):
#         return f"{self.id}: {self.question} by {self.enquirer}: answered by {self.store_name}"
