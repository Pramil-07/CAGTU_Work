from django.db import models
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()


class DeactivateHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    from_date = models.DateTimeField(auto_now_add=True)
    to_date = models.DateTimeField(null=True, blank=True)
    reactivate_date = models.DateTimeField(null=True, blank=True)
    reason = models.CharField(max_length=255)

    class Meta:
        ordering = ('-from_date',)
        verbose_name = 'Deactivate History'
        verbose_name_plural = 'Deactivate Histories'

    def __str__(self):
        return self.user.username


class UserSuspension(models.Model):
    created_by = models.ForeignKey(User, on_delete=models.SET_DEFAULT, default=settings.DEFAULT_UUID)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='suspended_user')
    from_date = models.DateTimeField(auto_now_add=True)
    to_date = models.DateTimeField()
    reason = models.CharField(max_length=512)

    def __str__(self):
        return f"{self.created_by.username} to {self.user.username}"
