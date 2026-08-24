from django.urls import path

from apps.master.views import (
    MasterProfileCreateAPIView,
    MasterProfileUpdateAPIView,
    ListAllMasterProfile,
)

urlpatterns = [
    path("", MasterProfileCreateAPIView.as_view(), name="master-profile-list-api"),
    path("all/", ListAllMasterProfile.as_view(), name="master-profile-list-api_all"),
    path(
        "<int:id>/",
        MasterProfileUpdateAPIView.as_view(),
        name="masterprofileupdate-detail",
    ),
]
