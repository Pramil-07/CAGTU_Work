from django.contrib import admin
from .models import (
    Currency,
    ExchangeRate,
    Language,
    Country,
    City,
    Horoscope,
    HoroscopeDetail,
    PolicyAndTerms,
)


class CountryAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "local_name",
        "code",
        "phone_code",
        "currency",
        "language",
        "city_count",
    )
    list_display_links = ("code", "name")
    # list_filter = ('country',)
    search_fields = (
        "name",
        "code",
    )

    def city_count(self, obj):
        try:
            return obj.city_set.all().count()
        except:
            return 0


class CityAdmin(admin.ModelAdmin):
    # list_display = ('id', 'name', 'local_name', 'country', 'zip_code')
    list_display = ("id", "name", "local_name")
    list_display_links = ("id", "name")
    list_filter = ("country",)
    search_fields = ("name", "local_name", "country__name")


class CurrencyAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "is_active", "symbol")
    list_display_links = ("code", "name")
    list_filter = ("is_active",)
    search_fields = ("name", "code")


class LanguageAdmin(admin.ModelAdmin):
    list_display = (
        "code",
        "name",
        "is_active",
        "is_default",
    )
    list_display_links = ("code", "name")
    list_filter = ("is_active", "is_default")
    search_fields = ("name", "code")


admin.site.register(Currency, CurrencyAdmin)
admin.site.register(ExchangeRate)
admin.site.register(Language, LanguageAdmin)
admin.site.register(Country, CountryAdmin)
admin.site.register(City, CityAdmin)
admin.site.register(Horoscope)
admin.site.register(HoroscopeDetail)
admin.site.register(PolicyAndTerms)
