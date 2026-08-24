from django.urls import path

from apps.notifications.api.v1.api import *

urlpatterns = [
    path('notification/create/', NotificationCreateAPIView.as_view(), name="notification"),
    path("webhook/", WebhookReceivedAPIView.as_view(), name="webhookmessage"),
    path("notify/",MessageAPIView.as_view(), name="message"),
]