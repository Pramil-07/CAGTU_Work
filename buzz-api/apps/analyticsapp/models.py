from django.db import models
from apps.productapp.models import Product
from django.contrib.auth import get_user_model

User = get_user_model()

class ProductView(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="views")
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    viewed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.product.name} viewed at {self.viewed_at}"
