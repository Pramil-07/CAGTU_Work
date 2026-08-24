from datetime import date
from django.db.models.signals import post_save , post_delete
from django.dispatch import receiver

from apps.offer.models import BuzzOffer


@receiver(post_save, sender=BuzzOffer)
def update_stock_price(sender, instance, **kwargs):
    if not instance.product:
        return

    for stock in instance.product.stocks.all():
        base_price = stock.mrp or stock.price

        if instance.discount_type == "percentage" and instance.discount_percentage:
            discount_price = base_price * instance.discount_percentage / 100
            new_price = base_price - discount_price
        elif instance.discount_type == "flat" and instance.discount_amount:
            new_price = base_price - instance.discount_amount
        else:
            new_price = base_price

        stock.offer_price = new_price
        stock.save(update_fields=['offer_price'])

@receiver(post_delete, sender=BuzzOffer)
def reset_stock_price(sender, instance, **kwargs):
    if instance.product:
        stocks = instance.product.stocks.all()
        for stock in stocks:
            stock.offer_price = None  # Reset to None or original price if stored
            stock.save(update_fields=['offer_price'])
