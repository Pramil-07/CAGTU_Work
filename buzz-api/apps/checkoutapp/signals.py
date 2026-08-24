from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from apps.checkoutapp.models import Order, OrderStatusHistory
from apps.offer.models import BuzzOffer


@receiver(post_save, sender=Order)
def reduce_stock_on_payment(sender, instance, created, **kwargs):
    if not created:
        # We want to detect if is_paid changed to True now
        # So we fetch previous state from DB
        old_order = Order.objects.get(pk=instance.pk)
        if not old_order.is_paid and instance.is_paid:
            for order_item in instance.order_items.all():
                stock = order_item.stock
                if stock.quantity >= order_item.quantity:
                    stock.quantity -= order_item.quantity
                    stock.save()
                else:
                    # Optionally raise or log
                    print(f"Stock not enough for {stock.id}")


@receiver(pre_save, sender=Order)
def log_order_status_change(sender, instance, **kwargs):
    """Track status changes and log in history automatically."""
    if instance.pk:  # update
        try:
            old_order = Order.objects.get(pk=instance.pk)
        except Order.DoesNotExist:
            return

        if old_order.order_status != instance.order_status:
            OrderStatusHistory.objects.create(
                order=instance,
                status=instance.order_status,
                changed_by=getattr(instance, "_changed_by", None),  # optional
                note=getattr(instance, "_note", None),
                proof_image=getattr(instance, "_proof_image", None),
                proof_document=getattr(instance, "_proof_document", None),
            )


@receiver(post_save, sender=Order)
def reduce_stock_on_payment(sender, instance, created, **kwargs):
    """Reduce stock when payment confirmed."""
    if not created:
        old_order = Order.objects.get(pk=instance.pk)
        if not old_order.is_paid and instance.is_paid:
            for order_item in instance.order_items.all():
                stock = order_item.stock
                if stock.quantity >= order_item.quantity:
                    stock.quantity -= order_item.quantity
                    stock.save()
                else:
                    print(f"Stock not enough for {stock.id}")


from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone


@receiver(post_save, sender=Order)
def assign_offer_on_payment(sender, instance, created, **kwargs):
    # Only run if order is marked paid and offer is not yet assigned
    if instance.is_paid and instance.offer is None:
        for item in instance.order_items.all():
            # adjust access to product according to your OrderItem model
            product = (
                getattr(item, "product", None) or getattr(item, "stock", None).product
            )
            if product:
                # Get active offer for the product
                offer = (
                    BuzzOffer.objects.filter(
                        product=product, end_date__gte=timezone.now()
                    )
                    .order_by("-is_featured", "-id")
                    .first()
                )
                if offer:
                    instance.offer = offer
                    instance.save(update_fields=["offer"])
                    break  # assign only one offer per order
