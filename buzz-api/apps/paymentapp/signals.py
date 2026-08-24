from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.checkoutapp.models import OrderItem
from apps.paymentapp.models import PaymentMethod, Transaction


@receiver(post_save, sender=Transaction)
def update_transaction(sender, instance, created, **kwargs):
    if not created and instance.payment_status == "completed":
        order = getattr(instance, "order", None)
        if order:
            try:
                payment_obj = PaymentMethod.objects.get(name=instance.provider)
                order.payment_method = payment_obj
            except PaymentMethod.DoesNotExist:
                order.payment_method = None

            # Update order

             
            order.order_status = "Accepted"
            order.save()

            # Propagate to all order_items
            order.order_items.update(order_status=order.order_status)