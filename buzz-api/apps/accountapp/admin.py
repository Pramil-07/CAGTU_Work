from django.contrib import admin
from .models import Address, Merchant, Follow, Employee, User

# Register your models here.
admin.site.register([Address, Merchant, User])


class EmployeeAdmin(admin.ModelAdmin):
    model = Employee
    list_display = ('id',)


class FollowAdmin(admin.ModelAdmin):
    list_display = ('id', 'merchant', 'followers_count')

    def followers_count(self, obj):
        return (obj.followers.all().count())





# admin.site.register(Staff)
admin.site.register(Follow, FollowAdmin)
admin.site.register(Employee, EmployeeAdmin)

