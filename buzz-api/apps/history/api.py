from datetime import datetime

from rest_framework.response import Response
from rest_framework.views import APIView

from .filters import DeactivateHistoryFilterSet
from .models import DeactivateHistory, UserSuspension
from rest_framework import (
    generics, filters, status
)
from django_filters.rest_framework import DjangoFilterBackend
from .serializers import DeactivateHistorySerializer, SuspendUserCreateSerializer, SuspendUserListSerializer
from utils.permissions import check_permissions
from django.shortcuts import get_object_or_404

from ..core.mixins.serializer import DynamicSerializerClassMixin
from django.contrib.auth import get_user_model

User = get_user_model()


class DeactivateHistoryCMSListAPIView(generics.ListAPIView):
    '''
        User Deactivation history of user for CMS
        ---------------------------------------
            search_field = ('user', 'user__email',)
            ordering_field = ('user', 'from_date', 'to_date', 'reactive_date', 'reason')
            filter_field = ('start_date', 'end_date', 'reason', 'user')
    '''
    serializer_class = DeactivateHistorySerializer
    queryset = DeactivateHistory.objects.all()
    filter_backends = (filters.OrderingFilter, filters.SearchFilter, DjangoFilterBackend)
    search_field = ('user', 'user__email', 'user__username', 'user__phone')
    ordering_field = ('user', 'from_date', 'to_date', 'reactive_date', 'reason')
    filterset_class = DeactivateHistoryFilterSet

    # @check_permissions('history.add_deactivatehistory')  # uncomment after adding in csv file
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, *kwargs)


class DeactivateHistoryCMSRetrieveView(generics.RetrieveAPIView):
    '''
        User Deactivation history of user for CMS retrieve
        ---------------------------------------

    '''
    serializer_class = DeactivateHistorySerializer
    queryset = DeactivateHistory.objects.all()


class SuspendUserView(DynamicSerializerClassMixin, generics.ListCreateAPIView):
    serializer_class = SuspendUserCreateSerializer
    queryset = UserSuspension.objects.all()
    serializer_action_classes = {
        'GET': SuspendUserListSerializer
    }

    def perform_create(self, serializer):
        return serializer.save(created_by=self.request.user)

    def create(self, request, *args, **kwargs):
        super().create(request, *args, **kwargs)
        return Response(
            {
                "status": "success",
                "message": "User Suspended successfully",
            },
            status.HTTP_200_OK
        )


class WhiteListUserView(APIView):
    def post(self, request, *args, **kwargs):
        suspend_user = get_object_or_404(UserSuspension.objects.filter(user=User.objects.get(id=self.kwargs.get("pk")),
                                                                       to_date__gt=datetime.datetime.now()))
        suspend_user.to_date = datetime.datetime.now()
        suspend_user.save()
        return Response(
            {
                "status": "success",
                "message": "User whitelisted successfully",
            },
            status.HTTP_200_OK
        )
