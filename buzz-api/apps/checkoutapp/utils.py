# from django.core.mail import send_mail
# from django.template.loader import render_to_string
# from django.conf import settings

# # def send_customer_mail(email):
#     domain = 'localhost:3004'
#     url = 'http://' + domain
#     html_content_buzz = render_to_string(
#     'BuzzOrderSuccess.html',
#     {
#         "email": email,
#     })
#     html_content_customer = render_to_string(
#     'Ordersuccess.html',
#     {
#     })

#     send_mail(
#         'Order Success',
#         html_content_buzz,
#         settings.EMAIL_HOST_USER,
#         [email],
#         fail_silently=False

#     )
#     send_mail(
#         'Thank You',
#         html_content_customer,
#         settings.EMAIL_HOST_USER,
#         [email],
#         fail_silently=False

#     )
#     # send_mail(
#     #     'Conform Order',
#     #     html_content_merchant,
#     #     settings.EMAIL_HOST_USER,
#     #     [email],
#     #     fail_silently=False

#     # )
from django_filters import rest_framework as filters

from apps.checkoutapp.constants import ORDER_CHOICES
from apps.checkoutapp.models import Order


class OrderFilterSet(filters.FilterSet):
    order_status = filters.ChoiceFilter(field_name="order_status", choices=ORDER_CHOICES, lookup_expr="icontains")
    order_id = filters.CharFilter( field_name="order_id", lookup_expr="iexact" )
    name = filters.CharFilter(field_name="name", lookup_expr="user__username")
    delivery_address = filters.CharFilter(
        field_name="delivery_address__address",
        lookup_expr="icontains"
    )
    class Meta:
        model = Order
        fields = ["order_status", "order_id", "name" , "delivery_address"]
