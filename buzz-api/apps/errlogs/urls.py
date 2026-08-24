from django.urls import path
from . import views

urlpatterns = [
    # URL to trigger the view that simulates an error and logs it.
    path(
        "simulate-and-log/", views.simulate_and_log_error, name="simulate_and_log_error"
    ),
    # URL to trigger a raw error without a try-except block to see Django's default behavior.
    path("trigger-error/", views.trigger_error, name="trigger_error"),
]
