from django.contrib import admin
from .models import Vendor, VendorDocument

class VendorDocumentInline(admin.TabularInline):
    model = VendorDocument
    extra = 0

@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = ('vendor_code', 'name', 'company', 'contact_no', 'status')
    search_fields = ('vendor_code', 'name', 'company', 'address', 'contact_no')
    inlines = [VendorDocumentInline]

@admin.register(VendorDocument)
class VendorDocumentAdmin(admin.ModelAdmin):
    list_display = ('vendor', 'name', 'expiry_date', 'uploaded_at')
