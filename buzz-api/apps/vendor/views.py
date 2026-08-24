from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Vendor, VendorDocument
from .serializers import VendorSerializer, VendorDocumentSerializer


class VendorListCreateAPIView(APIView):
    """
    GET: List all vendors
    POST: Create a new vendor
    """

    def get(self, request , *args , **kwargs ):
        vendors = Vendor.objects.all().order_by("-created_at")
        serializer = VendorSerializer(vendors, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request , *args , **kwargs):
        serializer = VendorSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VendorDetailAPIView(APIView):
    """
    GET: Retrieve a vendor by ID
    PUT/PATCH: Update vendor details
    DELETE: Remove vendor
    """

    def get_object(self, pk , *args , **kwargs):
        return get_object_or_404(Vendor, pk=pk)

    def get(self, request, pk , *args , **kwargs):
        vendor = self.get_object(pk)
        serializer = VendorSerializer(vendor)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk , *args , **kwargs):
        vendor = self.get_object(pk)
        serializer = VendorSerializer(vendor, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk , *args , **kwargs):
        vendor = self.get_object(pk)
        serializer = VendorSerializer(vendor, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk , *args , **kwargs):
        vendor = self.get_object(pk)
        vendor.delete()
        return Response({"message": "Vendor deleted successfully"}, status=status.HTTP_204_NO_CONTENT)


class VendorDocumentListCreateAPIView(APIView):
    """
    GET: List all documents for a specific vendor
    POST: Upload a new document for a vendor
    """

    def get(self, request, vendor_id , *args , **kwargs):
        documents = VendorDocument.objects.filter(vendor_id=vendor_id)
        serializer = VendorDocumentSerializer(documents, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, vendor_id , *args , **kwargs):
        data = request.data.copy()
        data["vendor"] = vendor_id
        serializer = VendorDocumentSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VendorDocumentDetailAPIView(APIView):
    """
    GET: Retrieve a single document
    PUT/PATCH: Update document
    DELETE: Delete document
    """

    def get_object(self, pk  , *args , **kwargs):
        return get_object_or_404(VendorDocument, pk=pk)

    def get(self, request, pk , *args , **kwargs):
        document = self.get_object(pk)
        serializer = VendorDocumentSerializer(document)
        return Response(serializer.data)

    def put(self, request, pk , *args , **kwargs):
        document = self.get_object(pk)
        serializer = VendorDocumentSerializer(document, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk , *args , **kwargs):
        document = self.get_object(pk)
        serializer = VendorDocumentSerializer(document, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk  , *args , **kwargs):
        document = self.get_object(pk)
        document.delete()
        return Response({"message": "Document deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
