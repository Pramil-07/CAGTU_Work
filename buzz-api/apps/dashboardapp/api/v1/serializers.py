from django.contrib.auth.models import User
from rest_framework import serializers

from ...models import *


class TotalUsersSerializer(serializers.Serializer):
    total_user_count = serializers.SerializerMethodField()
    user_count_month_data = serializers.SerializerMethodField()
    
    class Meta:
        fields = [
            "total_user_count",
            "user_count_month_data",
        ]
    
    def get_total_user_count(self, obj):
        count = User.objects.count()
        return count
    
    def get_user_count_month_data(self, obj):
        return obj
    

class TopProductByCategorySerializer(serializers.Serializer):
    pass


class ToDoListSerializer(serializers.ModelSerializer):
    class Meta:
        model = ToDoList
        fields = [ 
            "todo_name",
            "todo_description",
            "status",
            "updated_at",          
        ]
        
