from django.urls import path
from .views import (
    VendorListCreateAPIView,
    VendorDetailAPIView,
    VendorDocumentListCreateAPIView,
    VendorDocumentDetailAPIView,
)

urlpatterns = [
    path("", VendorListCreateAPIView.as_view(), name="vendor-list-create"),
    path("<uuid:pk>/", VendorDetailAPIView.as_view(), name="vendor-detail"),
    path("<uuid:vendor_id>/documents/", VendorDocumentListCreateAPIView.as_view(), name="vendor-documents"),
    path("vendor-documents/<int:pk>/", VendorDocumentDetailAPIView.as_view(), name="vendor-document-detail"),
]
