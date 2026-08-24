from django.contrib.contenttypes.models import ContentType
from django.shortcuts import render

from apps.accountapp.models import Merchant, User
from apps.activity.models import Activity
from apps.checkoutapp.models import OrderItem

from rest_framework.generics import RetrieveAPIView
from django.db.models import Prefetch
from .models import Product, Rating, Reply
#from apps.productapp.api.v1.serializers import ProductSerializer

def add_activity_log(
    self,
    action,
    user: User,
    merchant: Merchant = None,
    action_content_type: str = None,
    action_object_id=None,
):
    # case = ObjectReprSwitchCase()
    # data = object_repr
    if merchant:
        actor_content_type = ContentType.objects.get_for_model(Merchant)
        actor_object_id = merchant.id
    else:
        actor_content_type = ContentType.objects.get_for_model(User)
        actor_object_id = user.id

    if action_content_type:
        action_content_type = ContentType.objects.get(model=action_content_type)
        # try:
        #     object_repr = getattr(case, f'object_repr_{content_type.model}')
        #     data = object_id
        # except AttributeError:
        #     object_repr = getattr(case, 'object_repr_default')
    activity = Activity.objects.create(
        actor_content_type=actor_content_type,
        actor_object_id=actor_object_id,
        action=action,
        action_content_type=action_content_type,
        action_object_id=action_object_id,
    )
    activity.save()


def product_purchased_validator(product_id, user):
    return OrderItem.objects.filter(
        order__user=user, order__ordered=True, product_id=product_id
    ).exists()

# class ProductDetailView(RetrieveAPIView):
#     serializer_class = ProductSerializer
#     queryset = Product.objects.all()
#
#     def get_queryset(self):
#         return (
#             Product.objects.all()
#             .prefetch_related(
#                 Prefetch(
#                     "ratings",
#                     queryset=Rating.objects.select_related("user")
#                     .prefetch_related(
#                         Prefetch(
#                             "replies",
#                             queryset=Reply.objects.select_related("user")
#                             .prefetch_related("child_replies"),
#                         )
#                     ),
#                 )
#             )
#         )