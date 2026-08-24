from django.contrib.contenttypes.fields import GenericForeignKey
from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType

User = get_user_model()


# Create your models here.
class Notification(models.Model):
    """
    Here, `user` is the user who receives the notification
    `created_for` the causing user todo: change the field name in future
    """

    # user = models.ForeignKey(User, on_delete=models.CASCADE)
    # created_for = models.ForeignKey(
    #     User, on_delete=models.CASCADE, related_name="notification_for"
    # )
    # title = models.CharField(max_length=50)
    # content = models.JSONField(default=dict, null=True, blank=True)
    # content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    # object_id = models.CharField(max_length=36)
    # content_object = GenericForeignKey("content_type", "object_id")
    # created_date = models.DateTimeField(auto_now_add=True)
    # read_date = models.DateTimeField(null=True, blank=True)
    #
    # def __str__(self):
    #     return f"{self.user.username} - {self.title}"
