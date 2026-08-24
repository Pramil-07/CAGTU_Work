from django.db import models
from django.db import models
from django.conf import settings
from apps.productapp.models import Product , Category
import uuid


User = settings.AUTH_USER_MODEL


VENDOR_STATUS = [
("active", "Active"),
("inactive", "Inactive"),
("suspended", "Suspended"),
]

class Vendor(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='vendors')
    vendor_code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=255, null=True, blank=True)
    contact_person = models.CharField(max_length=255, blank=True)
    products = models.ManyToManyField(Product, blank=True, related_name='vendor')
    description = models.TextField(blank=True)
    company = models.CharField(max_length=255, null=True, blank=True)
    contact_no = models.CharField(max_length=20)
    address = models.CharField(max_length=255)
    extra_data = models.JSONField(default=dict, blank=True)
    email = models.EmailField(blank=True, null=True)
    country = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    zip_code = models.CharField(max_length=30, blank=True)
    tax_id = models.CharField(max_length=100, blank=True)
    bank_name = models.CharField(max_length=255, blank=True)
    account_number = models.CharField(max_length=255, blank=True)
    ifsc_code = models.CharField(max_length=100, blank=True)
    payment_terms = models.CharField(max_length=100, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='vendors')
    status = models.CharField(max_length=20, choices=VENDOR_STATUS, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.vendor_code} - {self.name or self.company or 'Vendor'}"

class VendorDocument(models.Model):
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='documents')
    file = models.FileField(upload_to='vendor_documents/')
    name = models.CharField(max_length=255, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name or self.file.name