# import geoip2.database
from rest_framework import status, generics, filters
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema

from apps.locales.filters import (
    CurrencyFilterSet,
    ExchangeRateFilterSet,
    LanguageFilterSet,
    CityFilterSet,
)
from apps.locales.models import (
    Country,
    City,
    Language,
    Currency,
    ExchangeRate,
    Horoscope,
    HoroscopeDetail,
    PolicyAndTerms,
)
from apps.core.mixins.serializer import DynamicSerializerClassMixin
from apps.core.mixins.multipledelete import MultipleDeleteClassMixin

# from utils.mixins import DynamicSerializerClassMixin
from rest_framework.views import APIView

# from user_agents import parse
import datetime
from django.db.models import Q
from django.shortcuts import get_object_or_404

from .serializers import (
    CountryListSerializer,
    CityListSerializer,
    CityCreateSerializer,
    CountryCreateSerializer,
    LanguageCreateSerializer,
    LanguageListCreateSerializer,
    LanguageListSerializer,
    LanguageUpdateSerializer,
    CurrencyCreateSerializer,
    CurrencyListCreateSerializer,
    CurrencyListSerializer,
    CurrencyUpdateSerializer,
    ExchangeRateCreateSerializer,
    ExchangeRateUpdateSerializer,
    ExchangeRateListSerializer,
    CountryOptionsListSerializer,
    CityOptionSerializer,
    HoroscopeDetailSerializer,
    HoroscopeDetailCreateSerializer,
    CityThroughCountrySerializer,
    TermsAndPrivacySerializers,
)


class CMSCountryListAPIView(generics.ListAPIView):
    """
    Generic APIView class for listing Country without pagination
    ----------------------------------------------------------------

    You can search using name of the Country without pagination
    """

    serializer_class = CountryOptionsListSerializer
    queryset = Country.objects.filter(is_active=True)
    filter_backends = [filters.SearchFilter]
    search_fields = ["name"]
    pagination_class = None


class CMSCountryListCreateAPIView(
    DynamicSerializerClassMixin, generics.ListCreateAPIView
):
    queryset = Country.objects.all()
    serializer_class = CountryCreateSerializer
    serializer_action_classes = {
        "GET": CountryListSerializer,
    }
    filter_backends = [
        filters.SearchFilter,
        DjangoFilterBackend,
        filters.OrderingFilter,
    ]
    search_fields = ["name"]
    ordering_fields = ["name"]

    def post(self, request, *args, **kwargs):
        """
        Generic API View class for creating and listing Country with pagination
        """
        super().post(request, *args, **kwargs)
        return Response(
            {"status": "success", "message": "Country created successfully"},
            status=status.HTTP_201_CREATED,
        )


class CMSCountryRetrieveUpdateDestroyAPIView(
    DynamicSerializerClassMixin, generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = CountryCreateSerializer
    queryset = Country.objects.all()
    serializer_action_classes = {
        "GET": CountryListSerializer,
    }
    filter_backends = [
        filters.SearchFilter,
        DjangoFilterBackend,
        filters.OrderingFilter,
    ]
    search_fields = ["name"]
    ordering_fields = ["name"]
    lookup_field = "pk"

    def update(self, request, *args, **kwargs):
        """
        Generic API View class for update Country information
        """
        super().update(request, *args, **kwargs)
        return Response(
            {"status": "success", "message": "Country successfully updated."},
        )

    def delete(self, request, *args, **kwargs):
        """
        Generic API View class for delete  Country information
        """
        super().delete(request, *args, **kwargs)
        return Response(
            {"status": "success", "message": "Country successfully deleted."}
        )


class CMSCountryMultipleDelete(MultipleDeleteClassMixin, generics.CreateAPIView):
    """
    Multiple Delete object of Country
    ----------------
    parameters:
        id: list (must be integer)
        Note: Any string listed will be removed and only number will be accepted.
    ------------------
    example:
        {
            "id": [
            1,2,3
            ]
        }
    ---------------
    Please note that this class is using MultipleDeleteClassMixin
    """

    id_queryset = Country.objects.all()
    className = "Country"  # this name will be shown in the response message. You are advised to make className plural.


class ClientCountryListAPIView(CMSCountryListAPIView):
    """
    For list of Country with nested format client side with no authentication
    ----------------------------------------------------------------

    Parameters
    ----------------------------------------------------------------
        search_fields = ("name",)

    Returns
    ----------------------------------------------------------------
        json response: paginated data for GET
    """

    permission_classes = [AllowAny]


# Generic API VIew classes  for without paginations for city
class CMSCityListAPIView(generics.ListAPIView):
    """
    Generic APIView class for listing City without pagination
    ----------------------------------------------------------------

    You can search using name of the City without pagination
    """

    serializer_class = CityOptionSerializer
    queryset = City.objects.all()
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    filterset_class = CityFilterSet
    search_fields = ["name"]
    pagination_class = None


class CMSCityListCreateAPIView(DynamicSerializerClassMixin, generics.ListCreateAPIView):
    serializer_class = CityCreateSerializer
    queryset = City.objects.all()
    serializer_action_classes = {
        "GET": CityListSerializer,
    }
    filter_backends = [
        filters.SearchFilter,
        DjangoFilterBackend,
        filters.OrderingFilter,
    ]
    filterset_class = CityFilterSet
    search_fields = ["name"]
    ordering_fields = ["name"]

    def post(self, request, *args, **kwargs):
        """
        Generic API View class for creating and listing City with pagination
        """
        super().post(request, *args, **kwargs)
        return Response(
            {"status": "success", "message": "City created successfully"},
            status=status.HTTP_201_CREATED,
        )


class CMSCityRetrieveUpdateDestroyAPIView(
    DynamicSerializerClassMixin, generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = CityCreateSerializer
    queryset = City.objects.all()
    serializer_action_classes = {
        "GET": CityListSerializer,
    }
    filter_backends = [
        filters.SearchFilter,
        DjangoFilterBackend,
        filters.OrderingFilter,
    ]
    search_fields = ["name"]
    ordering_fields = ["name"]
    lookup_field = "pk"

    def update(self, request, *args, **kwargs):
        """
        Generic API View class for update City information
        """
        super().update(request, *args, **kwargs)
        return Response(
            {"status": "success", "message": "City successfully updated."},
        )

    def delete(self, request, *args, **kwargs):
        """
        Generic API View class for delete city information
        """
        super().delete(request, *args, **kwargs)
        return Response({"status": "success", "message": "City successfully deleted."})


class CMSCityMultipleDelete(MultipleDeleteClassMixin, generics.CreateAPIView):
    """
    Multiple Delete object of City
    ----------------
    parameters:
        id: list (must be integer)
        Note: Any string listed will be removed and only number will be accepted.
    ------------------
    example:
        {
            "id": [
            1,2,3
            ]
        }
    ---------------
    Please note that this class is using MultipleDeleteClassMixin
    """

    id_queryset = City.objects.all()
    className = "Cities"  # this name will be shown in the response message. You are advised to make className plural.


class ClientCityListAPIView(CMSCityListAPIView):
    """
    For list of City with nested format client side with no authentication
    ----------------------------------------------------------------

    Parameters
    ----------------------------------------------------------------
        search_fields = ("name",)

    Returns
    ----------------------------------------------------------------
        json response: paginated data for GET
    """

    permission_classes = [AllowAny]


# Generic API View Classes for management of languages


class LanguageListCreateAPIView(
    DynamicSerializerClassMixin, generics.ListCreateAPIView
):
    """
    Generic API View class for creating and listing language
    """

    serializer_class = LanguageCreateSerializer
    serializer_action_classes = {"GET": LanguageListCreateSerializer}
    queryset = Language.objects.all()
    filter_backends = [
        filters.SearchFilter,
        DjangoFilterBackend,
        filters.OrderingFilter,
    ]
    search_fields = ["name"]
    ordering_fields = ["name"]
    filterset_class = LanguageFilterSet

    def create(self, request, *args, **kwargs):
        """
        For creating a new language
        """
        # serializer = self.serializer_class(data=request.data)
        # if serializer.is_valid():
        #     self.perform_create(serializer.save())
        super().create(request, *args, **kwargs)
        return Response(
            {
                "status": "success",
                "message": "Language is created successfully",
            },
            status=status.HTTP_201_CREATED,
        )


class CMSLanguageListAPIView(generics.ListAPIView):
    """
    Generic APIView class for listing language
    ----------------------------------------------------------------

    You can search using name of the language
    """

    serializer_class = LanguageListSerializer
    queryset = Language.objects.filter(is_active=True)
    filter_backends = [
        filters.SearchFilter,
        DjangoFilterBackend,
        filters.OrderingFilter,
    ]
    search_fields = ["name"]
    filterset_class = LanguageFilterSet
    pagination_class = None
    ordering_fields = ["name"]


class LanguageListAPIView(CMSLanguageListAPIView):
    """
    Generic APIView class for listing language
    ----------------------------------------------------------------

    You can search using name of the language
    """

    permission_classes = (AllowAny,)


class LanguageRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    """
    RetrieveUpdateDestroyAPIView class for retrieving, update and deleting language
    """

    serializer_class = LanguageUpdateSerializer
    queryset = Language.objects.all()
    lookup_field = "pk"

    def update(self, request, *args, **kwargs):
        """
        Updating language
        """
        super().update(request, *args, **kwargs)
        return Response(
            {"status": "success", "message": "Language successfully updated."},
            status=status.HTTP_200_OK,
        )

    def delete(self, request, *args, **kwargs):
        """
        for deleting a language
        """
        super().delete(request, *args, **kwargs)
        return Response(
            {"status": "success", "message": "Language successfully deleted."},
            status=status.HTTP_200_OK,
        )


class LanguageMultipleDeleteAPIView(MultipleDeleteClassMixin, generics.CreateAPIView):
    """
    Deleting multiple languages objects
    -----------------------------------

    Parameters:
    -----------------------------------
    id: list

    example: /multiple-delete?id=[1,2,3]
    ------------------------------------
    """

    id_queryset = Language.objects.all()
    className = "Language"


# Generic API View Classes for management of currencies


class CurrencyListCreateAPIView(generics.ListCreateAPIView):
    """
    Generic API View class for creating and listing currency
    """

    serializer_class = CurrencyCreateSerializer
    serializer_action_classes = {"GET": CurrencyListCreateSerializer}
    queryset = Currency.objects.all()
    filter_backends = [
        filters.SearchFilter,
        DjangoFilterBackend,
        filters.OrderingFilter,
    ]
    search_fields = ["name", "code"]
    ordering_fields = ["name", "code"]
    filterset_class = CurrencyFilterSet
    permission_classes = (AllowAny,)

    def create(self, request, *args, **kwargs):
        """
        For creating a new language
        """
        super().create(request, *args, **kwargs)
        return Response(
            {
                "status": "success",
                "message": "Currency is created successfully",
            },
            status=status.HTTP_201_CREATED,
        )


class CMSCurrencyListAPIView(generics.ListAPIView):
    """
    Generic APIView class for listing currency
    ----------------------------------------------------------------

    You can search using name of the currency
    """

    serializer_class = CurrencyListSerializer
    queryset = Currency.objects.filter(is_active=True)
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "code"]
    pagination_class = None
    ordering_fields = ["name", "code"]


class CurrencyListAPIView(CMSCurrencyListAPIView):
    """
    Generic APIView class for listing currency
    ----------------------------------------------------------------

    You can search using name of the currency
    """

    permission_classes = (AllowAny,)


class CurrencyRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    """
    RetrieveUpdateDestroyAPIView class for retrieving, updating and deleting currency
    """

    serializer_class = CurrencyUpdateSerializer
    queryset = Currency.objects.all()
    lookup_field = "pk"

    def update(self, request, *args, **kwargs):
        """
        Updating language
        """
        super().update(request, *args, **kwargs)
        return Response(
            {"status": "success", "message": "Currency successfully updated."},
            status=status.HTTP_200_OK,
        )

    def delete(self, request, *args, **kwargs):
        """
        for deleting a language
        """
        super().delete(request, *args, **kwargs)
        return Response(
            {"status": "success", "message": "Currency successfully deleted."},
            status=status.HTTP_200_OK,
        )


class CurrencyMultipleDeleteAPIView(MultipleDeleteClassMixin, generics.CreateAPIView):
    """
    Deleting multiple currency objects
    -----------------------------------

    Parameters:
    -----------------------------------
    id: list

    example: /multiple-delete?id=[1,2,3]
    ------------------------------------
    """

    id_queryset = Currency.objects.all()
    className = "Currency"


# Generic API View Classes for management of exchange rates


class ExchangeRateListCreateAPIView(
    DynamicSerializerClassMixin, generics.ListCreateAPIView
):
    """
    Generic API View class for creating and listing exchange rates
    """

    serializer_class = ExchangeRateCreateSerializer
    serializer_action_classes = {"GET": ExchangeRateListSerializer}
    queryset = ExchangeRate.objects.all()
    filter_backends = [
        filters.SearchFilter,
        DjangoFilterBackend,
        filters.OrderingFilter,
    ]
    search_fields = ["currency"]
    ordering_fields = ["currency"]
    filterset_class = ExchangeRateFilterSet

    def create(self, request, *args, **kwargs):
        """
        For creating a new language
        """
        super().create(request, *args, **kwargs)
        return Response(
            {
                "status": "success",
                "message": "ExchangeRate is created successfully",
            },
            status=status.HTTP_201_CREATED,
        )


class ExchangeRateRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    """
    RetrieveUpdateDestroyAPIView class for retrieving, updating and deleting exchange rates
    """

    serializer_class = ExchangeRateUpdateSerializer
    queryset = ExchangeRate.objects.all()
    lookup_field = "id"

    def update(self, request, *args, **kwargs):
        """
        Updating language
        """
        super().update(request, *args, **kwargs)
        return Response(
            {"status": "success", "message": "ExchangeRate successfully updated."},
            status=status.HTTP_200_OK,
        )

    def delete(self, request, *args, **kwargs):
        """
        for deleting a language
        """
        super().delete(request, *args, **kwargs)
        return Response(
            {"status": "success", "message": "Language successfully deleted."},
            status=status.HTTP_200_OK,
        )


class ExchangeRateMultipleDeleteAPIView(
    MultipleDeleteClassMixin, generics.CreateAPIView
):
    """
    Deleting multiple exchange rate objects
    -----------------------------------

    Parameters:
    -----------------------------------
    id: list

    example: /multiple-delete?id=[1,2,3]
    ------------------------------------
    """

    id_queryset = ExchangeRate.objects.all()
    className = "ExchangeRate"


# class DeviceDetailAPI(APIView):
#     permission_classes = [AllowAny]
#
#     def get(self, request, *args, **kwargs):
#         user = request.META.get('HTTP_USER_AGENT')
#         user_agent = parse(user)
#         return Response(str(user_agent))


# get location from ip address
def get_client_ip(request):
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        ip = x_forwarded_for.split(",")[0]
    else:
        ip = request.META.get("REMOTE_ADDR")
    return ip


# @extend_schema(summary="get location from ip address", tags=["ip-location-data"])
# class GeoLocationListAPIView(generics.ListAPIView):
#     """
#     Get geolocation based on ip address
#     """
#     pagination_class = None
#     permission_classes = (AllowAny,)
#
#     def get(self, request, format=None, *args, **kwargs):
#         """
#         Get geolocation based on ip address
#         """
#         ip = get_client_ip(self.request)
#         with geoip2.database.Reader('./res/GeoLite2-City.mmdb') as reader:
#             try:
#                 geo = reader.city(ip)
#                 country = geo.country.name
#                 city = geo.city.name
#                 latitude = geo.location.latitude
#                 longitude = geo.location.longitude
#             except:
#                 country = None
#                 city = None
#                 latitude = None
#                 longitude = None
#
#             data = {
#                 "country": country,
#                 "city": city,
#                 "longitude": longitude,
#                 "latitude": latitude,
#             }
#
#             return Response(
#                 {
#                     "status": "success",
#                     "data": data
#                 }
#             )
#


class DailyHoroscopeDetailListAPI(generics.ListAPIView):
    serializer_class = HoroscopeDetailSerializer
    pagination_class = None
    permission_classes = [AllowAny]

    def get_queryset(self):
        return HoroscopeDetail.objects.filter(
            type="daily", end_date=datetime.datetime.now().date()
        )


class WeeklyHoroscopeDetailListAPI(generics.ListAPIView):
    serializer_class = HoroscopeDetailSerializer
    pagination_class = None
    permission_classes = [AllowAny]

    def get_queryset(self):
        print(datetime.datetime.now().date())
        return HoroscopeDetail.objects.filter(
            Q(start_date__lte=datetime.datetime.now().date())
            & Q(end_date__gte=datetime.datetime.now().date()),
            type="weekly",
        )


class MonthlyHoroscopeDetailListAPI(generics.ListAPIView):
    serializer_class = HoroscopeDetailSerializer
    pagination_class = None
    permission_classes = [AllowAny]

    def get_queryset(self):
        return HoroscopeDetail.objects.filter(
            Q(start_date__lte=datetime.datetime.now().date())
            & Q(end_date__gte=datetime.datetime.now().date()),
            type="monthly",
        )


class YearlyHoroscopeDetailListAPI(generics.ListAPIView):
    serializer_class = HoroscopeDetailSerializer
    pagination_class = None
    permission_classes = [AllowAny]

    def get_queryset(self):
        return HoroscopeDetail.objects.filter(
            Q(start_date__lte=datetime.datetime.now().date())
            & Q(end_date__gte=datetime.datetime.now().date()),
            type="yearly",
        )


class HoroscopeDetailView(generics.RetrieveAPIView):
    serializer_class = HoroscopeDetailSerializer
    queryset = HoroscopeDetail.objects.all()
    pagination_class = None
    permission_classes = [AllowAny]


class HoroscopeDetailCreateView(
    DynamicSerializerClassMixin, generics.ListCreateAPIView
):
    serializer_class = HoroscopeDetailCreateSerializer
    queryset = HoroscopeDetail.objects.all()
    serializer_action_classes = {"GET": HoroscopeDetailSerializer}


@extend_schema(summary="list cities using county id")
class CityListFromCountryAPIView(generics.ListAPIView):
    serializer_class = CityThroughCountrySerializer
    pagination_class = None
    permission_classes = (AllowAny,)
    lookup_field = "pk"

    def get_queryset(self):
        id = self.kwargs.get(self.lookup_field)
        country_obj = get_object_or_404(Country, id=id)
        return City.objects.filter(country=country_obj)


class TermsAndPolicyAPI(APIView):
    serializer_class = TermsAndPrivacySerializers
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        query_params = request.query_params.get("type")
        if not query_params:
            instance = PolicyAndTerms.objects.all()
        else:

            instance = PolicyAndTerms.objects.filter(type=query_params)
        if not instance:
            return Response(
                {"status": "failure", "message": "No content found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = self.serializer_class(instance, many=True)
        return Response(
            {"Status": "success", "data": serializer.data}, status=status.HTTP_200_OK
        )

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TermsAndPolicyUpdateAPI(APIView):
    serializer_class = TermsAndPrivacySerializers

    def put(self, request, id, *args, **kwargs):
        instance = PolicyAndTerms.objects.filter(id=id).first()
        if not instance:
            return Response("not found", status=status.HTTP_404_NOT_FOUND)

        serializer = self.serializer_class(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id, *args, **kwargs):
        instance = PolicyAndTerms.objects.filter(id=id)
        if not instance:
            return Response("not found", status=status.HTTP_404_NOT_FOUND)
        instance.delete()
        return Response({"Success": "deleted"})
