from rest_framework.filters import OrderingFilter

class ProductOrdering(OrderingFilter):
    
    def get_ordering(self, request, queryset, view):
        return super().get_ordering(request, queryset, view)