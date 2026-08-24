"""cagtubuzz URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('buzz/', include('buzz.urls'))
"""

from django.contrib import admin
from django.urls import path, include, re_path

from rest_framework import permissions

from django.conf.urls.static import static
from django.conf import settings
from rest_framework_simplejwt.views import TokenRefreshView

from apps.accountapp.api.v1.api import HomeView
from fcm_django.api.rest_framework import FCMDeviceAuthorizedViewSet
from rest_framework.routers import DefaultRouter

from apps.blogapp.views import TagListCreateView, TagDetailView
from apps.social_app.views import AccountInactiveView

router = DefaultRouter()
router.register("devices", FCMDeviceAuthorizedViewSet)
admin.site.site_header = "Buzz administration"
admin.site.index_title = "Features area"
admin.site.site_title = "Buzz"

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", HomeView.as_view()),
    path(r'social-auth/', include('social_django.urls', namespace='social')),
    re_path(r"api/(?P<version>(v1|v2))/account/", include("apps.accountapp.urls")),
    re_path(r"api/(?P<version>(v1|v2))/master/", include("apps.master.urls")),
    re_path(r"api/(?P<version>(v1|v2))/activity/", include("apps.activity.urls")),
    re_path(r"api/(?P<version>(v1|v2))/product/", include("apps.productapp.urls")),
    re_path(
        r"api/(?P<version>(v1|v2))/support/", include("apps.customersupportapp.urls")
    ),
    re_path(r"api/(?P<version>(v1|v2))/checkout/", include("apps.checkoutapp.urls")),
    re_path(r"api/(?P<version>(v1|v2))/payment/", include("apps.paymentapp.urls")),
    re_path(r"api/(?P<version>(v1|v2))/offer/", include("apps.offer.urls")),
    re_path(
        r"api/(?P<version>(v1|v2))/notification/", include("apps.notifications.urls")
    ),
    re_path(r"api/(?P<version>(v1|v2))/dashboard/", include("apps.dashboardapp.urls")),
    re_path(r"api/(?P<version>(v1|v2))/security/", include("apps.security.urls")),
    re_path(r"api/(?P<version>(v1|v2))/locale/", include("apps.locales.urls")),
    re_path(r"api/(?P<version>(v1|v2))/social_app/", include("apps.social_app.urls")),
    path('accounts/', include('allauth.urls')),
    path("account_inactive/", AccountInactiveView.as_view(), name="account_inactive"),
    re_path(r"api/(?P<version>(v1|v2))/blogs/", include("apps.blogapp.urls")),
    re_path(r"api/(?P<version>(v1|v2))/analytics/", include("apps.analyticsapp.urls")),

    re_path(r"api/(?P<version>(v1|v2))/vendor/", include("apps.vendor.urls")),
    path("error/", include("apps.errlogs.urls")),



    re_path(r"api/(?P<version>v1|v2)/tags/$", TagListCreateView.as_view(), name="tag-list"),
    re_path(r"api/(?P<version>v1|v2)/tags/(?P<pk>\d+)/$", TagDetailView.as_view(), name="tag-detail"),

    # FCM-DJANGO
    path("", include(router.urls)),
]
if settings.DEBUG:
    import debug_toolbar
    from drf_spectacular.views import (
        SpectacularAPIView,
        SpectacularRedocView,
        SpectacularSwaggerView,
    )

    urlpatterns = [
        *urlpatterns,
        # YOUR PATTERNS
        path("__debug__/", include(debug_toolbar.urls)),
        path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
        # Optional UI:
        path(
            "docs/",
            SpectacularSwaggerView.as_view(url_name="schema"),
            name="swagger-ui",
        ),
        path(
            "api/schema/redoc/",
            SpectacularRedocView.as_view(url_name="schema"),
            name="redoc",
        ),
        path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
        *static(settings.STATIC_URL, document_root=settings.STATIC_ROOT),
        *static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT),
        path("ckeditor/", include("ckeditor_uploader.urls")),
        # FCM-DJANGO
        path("", include(router.urls)),
    ]
