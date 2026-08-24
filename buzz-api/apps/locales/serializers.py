from rest_framework import serializers
from django.core.exceptions import ObjectDoesNotExist

from apps.locales.models import (
    Language,
    Currency,
    ExchangeRate,
    Country,
    City,
    Horoscope,
    HoroscopeDetail,
    PolicyAndTerms,
)


class CountryOptionsListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = ["name", "code"]


class CityCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = "__all__"


class CityListSerializer(serializers.ModelSerializer):
    country = CountryOptionsListSerializer()

    class Meta:
        model = City
        fields = "__all__"


class CityOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = ["id", "name"]


class CountryCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = "__all__"

    def validate_language(self, obj):
        """
        For validating language whether language is active or not
        """
        if obj.is_active:
            return obj
        raise serializers.ValidationError(
            {"status": "failure", "message": "Language is not active."}
        )


class LanguageListCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Language
        fields = "__all__"


class LanguageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Language
        fields = "__all__"

    def validate(self, data):
        """
        Setting is_active values to the language
        """
        try:
            if data["is_active"]:
                try:
                    previous_active_obj = Language.objects.get(is_active=True)
                    previous_active_obj.is_active = False
                    previous_active_obj.save()
                    return data
                except ObjectDoesNotExist:
                    return data
            return data
        except:
            return data


class LanguageListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Language
        fields = ["code", "name"]


class LanguageUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Language
        fields = "__all__"


class CurrencyListCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Currency
        exclude = ["minor"]


class CurrencyCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Currency
        fields = "__all__"

    def validate(self, data):
        """
        Setting is_active values to the language
        """
        try:
            if data["is_active"]:
                try:
                    previous_active_obj = Currency.objects.get(is_active=True)
                    previous_active_obj.is_active = False
                    previous_active_obj.save()
                    return data
                except ObjectDoesNotExist:
                    return data
            return data
        except:
            return data


class CurrencyListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Currency
        fields = ["code", "name", "symbol", "id"]


class CurrencyUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Currency
        fields = "__all__"


class ExchangeRateCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExchangeRate
        exclude = ("deleted_at",)


class ExchangeRateListSerializer(serializers.ModelSerializer):
    currency = CurrencyListSerializer()

    class Meta:
        model = ExchangeRate
        fields = "__all__"


class ExchangeRateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExchangeRate
        exclude = ("deleted_at",)


class CountryListSerializer(serializers.ModelSerializer):
    currency = CurrencyListSerializer()
    language = LanguageListSerializer()

    class Meta:
        model = Country
        fields = "__all__"


class CityCountryListSerializer(serializers.ModelSerializer):
    country = CountryOptionsListSerializer()

    class Meta:
        model = City
        fields = ["id", "name", "latitude", "longitude", "country"]


class HoroscopeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Horoscope
        fields = "__all__"


class HoroscopeDetailSerializer(serializers.ModelSerializer):
    horoscope = HoroscopeSerializer()

    class Meta:
        model = HoroscopeDetail
        fields = "__all__"


class HoroscopeDetailCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = HoroscopeDetail
        fields = "__all__"


class CitySerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = "__all__"


class CityThroughCountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = "__all__"


class TermsAndPrivacySerializers(serializers.ModelSerializer):

    class Meta:
        model = PolicyAndTerms
        exclude = ("deleted_at",)
