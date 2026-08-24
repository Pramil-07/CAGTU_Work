from django.db import models
from apps.core.constants import MODEL_STATUS


class TimestampModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        abstract = True


class BaseStatusModel(TimestampModel):
    status = models.CharField(
        max_length=20, choices=MODEL_STATUS, null=True, blank=True
    )

    class Meta:
        abstract = True


class DynamicCategory(TimestampModel):
    """
    This model is an abstract class that represents a category information.
    """

    is_active = models.BooleanField()
    name = models.CharField(
        max_length=255,
        unique=True,
        error_messages={"name": "This name is already registered."},
    )

    def __str__(self):
        return self.name

    class Meta:
        ordering = ["-id"]
        abstract = True
