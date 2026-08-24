from django.urls import path
from .api import (DeactivateHistoryCMSListAPIView, DeactivateHistoryCMSRetrieveView, SuspendUserView, WhiteListUserView,
                  )

urlpatterns = [
    path('deactivate/history/', DeactivateHistoryCMSListAPIView.as_view(), name="deactivate_history_cmslist_apiview"),
    path('deactivate/history/<int:pk>/', DeactivateHistoryCMSRetrieveView.as_view(),
         name="deactivate_history_cms_retrieve_view"),
    path("cms/suspend-user/", SuspendUserView.as_view(), name="suspend_user_view"),
    path("cms/whitelist-user/<uuid:pk>/", WhiteListUserView.as_view(), name="white_list_user_view"),

]
