from django.db import models

class ProductActiveManager(models.Manager):

    def get_queryset(self):
        return super().get_queryset().filter(status="Active", type="product")

class ProductAllManager(models.Manager):

    def get_queryset(self):
        return super().get_queryset().filter(type="product")
    

class ServiceActiveManager(models.Manager):

    def get_queryset(self):
        return super().get_queryset().filter(status="Active", type = "service")

class ServiceAllManager(models.Manager):

    def get_queryset(self):
        return super().get_queryset().filter(type="service")