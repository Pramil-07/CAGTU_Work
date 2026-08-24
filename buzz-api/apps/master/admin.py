from django.contrib import admin

from apps.master.models import MasterProfile, MasterProfileAddress, Banner

# Register your models here.


@admin.register(MasterProfile)
class MasterProfileAdmin(admin.ModelAdmin):
    list_display = ("id", "user",  "phone", "is_default")  # 👈 shows id and other fields


@admin.register(MasterProfileAddress)
class MasterProfileAddressAdmin(admin.ModelAdmin):
    list_display = ("id", "street_address", "suburb", "state", "postcode", "country")


@admin.register(Banner)
class BannerAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "banner_type", "order")