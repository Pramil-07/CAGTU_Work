from django.urls import path
from .api import *

urlpatterns = [
    # country urls
    path("cms/country/option/", CMSCountryListAPIView.as_view(), name="countryoption"),
    path("cms/country/", CMSCountryListCreateAPIView.as_view(), name="country"),
    path(
        "cms/country/<str:pk>/",
        CMSCountryRetrieveUpdateDestroyAPIView.as_view(),
        name="countryupdatedelete",
    ),
    path(
        "cms/country/multiple/delete/",
        CMSCountryMultipleDelete.as_view(),
        name="countrymultipledelete",
    ),
    # City Urls
    path("cms/city/options/", CMSCityListAPIView.as_view(), name="city"),
    path("cms/city/", CMSCityListCreateAPIView.as_view(), name="cityoptions"),
    path(
        "cms/city/<int:pk>/",
        CMSCityRetrieveUpdateDestroyAPIView.as_view(),
        name="cityupdatedelete",
    ),
    path(
        "cms/city/multipledelete/",
        CMSCityMultipleDelete.as_view(),
        name="citylistmultipledelete",
    ),
    # Client Urls
    path(
        "client/country/options/",
        ClientCountryListAPIView.as_view(),
        name="countryoptions",
    ),
    path("client/city/options/", ClientCityListAPIView.as_view(), name="cityoptions"),
    # language
    path(
        "cms/language/",
        LanguageListCreateAPIView.as_view(),
        name="languagelistcreateapiview",
    ),
    path(
        "language/options/", LanguageListAPIView.as_view(), name="languagelistapiview"
    ),
    path(
        "cms/language/options/",
        CMSLanguageListAPIView.as_view(),
        name="cmslanguagelistapiview",
    ),
    path(
        "cms/language/<str:pk>/",
        LanguageRetrieveUpdateDestroyAPIView.as_view(),
        name="languageretrieveupdatedestroyapiview",
    ),
    path(
        "cms/language/multiple/delete/",
        LanguageMultipleDeleteAPIView.as_view(),
        name="languagemultipledeleteapiview",
    ),
    # currency
    path(
        "cms/currency/",
        CurrencyListCreateAPIView.as_view(),
        name="currencylistcreateapiview",
    ),
    path(
        "currency/options/", CurrencyListAPIView.as_view(), name="currencylistapiview"
    ),
    path(
        "cms/currency/options/",
        CurrencyListAPIView.as_view(),
        name="cmscurrencylistapiview",
    ),
    path(
        "cms/currency/<str:pk>/",
        CurrencyRetrieveUpdateDestroyAPIView.as_view(),
        name="currencyretrieveupdatedestroyapiview",
    ),
    path(
        "cms/currency/multiple/delete/",
        CurrencyMultipleDeleteAPIView.as_view(),
        name="currencymultipledeleteapiview",
    ),
    # exchange rate
    path(
        "cms/exchangerate/",
        ExchangeRateListCreateAPIView.as_view(),
        name="exchangeratelistcreateapiview",
    ),
    path(
        "cms/exchangerate/<int:id>/",
        ExchangeRateRetrieveUpdateDestroyAPIView.as_view(),
        name="exchangerateretrieveupdatedestroyapiview",
    ),
    path(
        "cms/exchangerate/multiple-delete/",
        ExchangeRateMultipleDeleteAPIView.as_view(),
        name="exchangeratemultipledeleteapiview",
    ),
    # path("device-details/", DeviceDetailAPI.as_view(), name="devicedetailview"),
    # geo location
    # path("iplocation/", GeoLocationListAPIView.as_view(), name="geolocation"),
    # Horoscope For Client
    path(
        "horoscope/daily/",
        DailyHoroscopeDetailListAPI.as_view(),
        name="daily_horoscope_detail_list_api",
    ),
    path(
        "horoscope/weekly/",
        WeeklyHoroscopeDetailListAPI.as_view(),
        name="weekly_horoscope_detail_list_api",
    ),
    path(
        "horoscope/monthly/",
        MonthlyHoroscopeDetailListAPI.as_view(),
        name="monthly_horoscope_detail_list_api",
    ),
    path(
        "horoscope/yearly/",
        YearlyHoroscopeDetailListAPI.as_view(),
        name="yearly_horoscope_detail_list_api",
    ),
    path(
        "horoscope/<int:pk>/",
        HoroscopeDetailView.as_view(),
        name="horoscope_detail_view",
    ),
    # Horoscope for CMS
    path(
        "cms/horoscope/",
        HoroscopeDetailCreateView.as_view(),
        name="horoscope_detail_create_serializer",
    ),
    # get the list of cities using country id
    path(
        "city-list/<int:pk>/",
        CityListFromCountryAPIView.as_view(),
        name="city__list_through_country",
    ),
    # terms and condition
    path(
        "terms-and-policy/",
        TermsAndPolicyAPI.as_view(),
        name="terms and conditions and policy",
    ),
    path(
        "terms-and-policy/<int:id>/",
        TermsAndPolicyUpdateAPI.as_view(),
        name="terms and conditions and policy",
    ),
]
