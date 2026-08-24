from django.contrib import admin
from .models import Payment, PaymentMethod, Transaction, DeliveryCharge

# Register your models here.
admin.site.register(Payment)
admin.site.register(PaymentMethod)
admin.site.register(Transaction)
admin.site.register(DeliveryCharge)
