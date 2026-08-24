from django.conf import settings
from django.shortcuts import render
from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import NotFound
import json
from apps.accountapp.models import Address
from apps.master.models import MasterProfile, MasterProfileAddress
from apps.master.serializers import (
    MasterProfileListCreateSerializers,
    MasterProfileListSerializers,
)
from rest_framework.parsers import MultiPartParser, JSONParser


class ListAllMasterProfile(APIView):
    serializer_class = MasterProfileListSerializers
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        try:
            qs = MasterProfile.objects.all()
            print("qs", qs)
        except MasterProfile.DoesNotExist:
            return Response(
                {"error": "MasterProfile not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = self.serializer_class(qs, many=True, context={"request": request})

        return Response(
            {"status": "success", "data": serializer.data}, status=status.HTTP_200_OK
        )


class MasterProfileCreateAPIView(APIView):
    serializer_class = MasterProfileListCreateSerializers
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        try:
            qs = MasterProfile.objects.get(user=settings.DEFAULT_UUID, is_default=True)
        except MasterProfile.DoesNotExist:
            return Response(
                {"error": "MasterProfile not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = self.serializer_class(qs, context={"request": request})

        return Response(
            {"status": "success", "data": [serializer.data]}, status=status.HTTP_200_OK
        )

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            print("data", data)
            if not data:
                return Response(
                    {"error": "No data"}, status=status.HTTP_400_BAD_REQUEST
                )

            serializer = self.serializer_class(data=data)
            if serializer.is_valid():
                serializer.save(
                    user=request.user if request.user.is_superuser else None
                )
                return Response(
                    {"Status": "success", "data": serializer.data},
                    status=status.HTTP_201_CREATED,
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class MasterProfileUpdateAPIView(APIView):
    serializer_class = MasterProfileListCreateSerializers

    def put(self, request, id, *args, **kwargs):
        try:
            data = request.data
            print("data", data)
            if not data:
                return Response(
                    {"error": "No data"}, status=status.HTTP_400_BAD_REQUEST
                )
            if not id:
                return Response(
                    {"error": "No masterprofile with this id on database."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            master_profile = MasterProfile.objects.get(id=id)

            serializer = self.serializer_class(master_profile, data=data, partial=True)
            if serializer.is_valid():
                serializer.save(
                    user=request.user if request.user.is_superuser else None
                )
                return Response(
                    {"Status": "success", "data": serializer.data},
                    status=status.HTTP_201_CREATED,
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id, *args, **kwargs):

        Master_profile = MasterProfile.objects.filter(id=id)
        if Master_profile is None:
            return Response("MasterProfile not found", status=status.HTTP_404_NOT_FOUND)
        Master_profile.delete()
        return Response({"Deleted"}, status=status.HTTP_204_NO_CONTENT)
