from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

from apps.activity.constants import ACTION
from apps.blogapp.models import BlogPost
from apps.core.models import BaseStatusModel, TimestampModel

from apps.accountapp.models import Merchant

from apps.productapp.models import Product, Stock

from django.contrib.auth import get_user_model
from django.db import models

from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator, MinValueValidator

User = get_user_model()


class Activity(TimestampModel):
    actor_content_type = models.ForeignKey(
        ContentType, on_delete=models.CASCADE, related_name="actor_content"
    )
    actor_object_id = models.PositiveIntegerField()
    actor_content_object = GenericForeignKey("actor_content_type", "actor_object_id")

    action_content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        related_name="action_content",
        null=True,
        blank=True,
    )
    action_object_id = models.PositiveIntegerField(null=True, blank=True)
    action_content_object = GenericForeignKey("action_content_type", "action_object_id")

    action = models.CharField(max_length=255, choices=ACTION)


class Rating(BaseStatusModel):

    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="reviews", null=True, blank=True
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.FloatField(
        validators=[MinValueValidator(1.0), MaxValueValidator(5.0)]
    )
    blog = models.ForeignKey(BlogPost, on_delete=models.SET_NULL, null=True, blank=True , related_name="reviews")
    review = models.TextField(null=True, blank=True)

    class Meta:
        unique_together = ("user", "product")

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

    def __str__(self):
        target = self.product or self.blog
        return f"Id {self.id} Rating {self.rating} by {self.user.username} on {target}"


class RatingImages(TimestampModel):
    rating = models.ForeignKey(Rating, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="rating_images/", null=False, blank=False)

    def __str__(self):
        return f"Image for Rating {self.rating.id}"




class Reply(models.Model):
    """Nested reply system (up to 3 levels deep) for ratings"""
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="replies"
    )
    rating = models.ForeignKey(
        Rating, on_delete=models.CASCADE, related_name="replies"
    )
    text = models.TextField()
    parent_reply = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="child_replies"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"Reply by {self.user} -> {self.rating}"

    def get_depth(self):
        """Calculate depth of this reply"""
        depth, parent = 1, self.parent_reply
        while parent:
            depth += 1
            parent = parent.parent_reply
        return depth

    def clean(self):
        """Prevent more than 3 nested replies"""
        if self.parent_reply and self.parent_reply.get_depth() >= 3:
            raise ValidationError("Maximum reply depth of 3 levels reached.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)





class MerchantRating(BaseStatusModel):
    """
    Merchant rating by customers
    """

    merchant = models.ForeignKey(Merchant, on_delete=models.CASCADE)
    customer = models.ForeignKey(User, on_delete=models.CASCADE)
    review = models.CharField(max_length=455, null=True, blank=True)
    rating = models.IntegerField(validators=[MaxValueValidator(5)])
    recommend = models.BooleanField()

    class Meta:
        ordering = ["-id"]

    def __str__(self):
        return self.merchant.merchant_name
