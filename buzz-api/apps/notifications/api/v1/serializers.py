from rest_framework import serializers
from apps.notifications.models import Notification


class NotificationCreateSerializer(serializers.ModelSerializer):
    # """
    # Parsing notifications
    # """
    class Meta:
        model = Notification
        fields = "__all__"

    pass
