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
"""

from django.urls import path, include

from apps.activity.api import (
    RatingAPIView,
    RatingListAPIView,
    RatingPatchAndDeleteAPIView,
    MerchantratingPatchAndDeleteView,
    StaffActivitiesAPIView, ReplyListCreateAPIView, ReplyDetailAPIView,
)

urlpatterns = [
    path("rating/", RatingAPIView.as_view(), name="ratingapi"),
    path(
        "rating/slug/<slug:slug>/",
        RatingListAPIView.as_view(),
        name="ratinglistapi",
    ),

    path(
        "rating/<int:rating_id>/",
        RatingPatchAndDeleteAPIView.as_view(),
        name="ratingpatchanddeleteapi",
    ),

    path("rating/<int:rating_id>/replies/", ReplyListCreateAPIView.as_view(), name="reply-list-create"),

    # Retrieve, update, delete a specific reply
    path("replies/<int:pk>/", ReplyDetailAPIView.as_view(), name="reply-detail"),
    path(
        "merchant-rating/<int:rating_id>/",
        MerchantratingPatchAndDeleteView.as_view(),
        name="merchantratingdeleteupdateapi",
    ),
    path(
        "staff/activities/", StaffActivitiesAPIView.as_view(), name="staffactivitiesapi"
    ),
]
