from rest_framework import serializers
from .models import DeactivateHistory, UserSuspension


class DeactivateHistorySerializer(serializers.ModelSerializer):
    # user = UserSerializerForCMS()

    class Meta:
        model = DeactivateHistory
        fields = '__all__'


class SuspendUserListSerializer(serializers.ModelSerializer):
    created_by = serializers.StringRelatedField()

    class Meta:
        model = UserSuspension
        exclude = ('user',)


class SuspendUserCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSuspension
        fields = ['user', 'to_date', 'reason']

