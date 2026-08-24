
from apps.activity.models import Rating
from apps.productapp.models import BulkOrder, TopCategory

from utils.redis_cache_invalidate import invalidate_cache
from .utils import send_email_user
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from apps.productapp.models import WishList, Product, Category

@receiver([post_save, post_delete], sender=Rating)
def update_product_rating_signal(sender, instance, **kwargs):
    if instance.product:
        instance.product.update_product_rating()


@receiver(post_save, sender=BulkOrder)
def send_bulk_order_message(sender, instance, created, **kwargs):
    if created:
        owner_subject = f"New Bulk Order #{instance.id} Created"
        owner_message = (
            f"A new bulk order has been created by {instance.customer}\n\n"
            f"Customer: {instance.customer or 'Anonymous'}\n"
            f"Contact Phone: {instance.contact_no}\n"
            f"Contact Email: {instance.contact_email}\n"
            f"Description: {instance.description or 'N/A'}\n"
        )

        try:
            send_email_user(
                recipient_email=instance.contact_email,
                subject=owner_subject,
                message=owner_message,
            )
        except Exception as e:
            print(f"Failed to enqueue owner email task: {e}")

        if instance.contact_email:
            user_subject = f"Your Bulk Order #{instance.id} Confirmation"
            user_message = (
                f"Dear {instance.customer or 'Customer'},\n\n"
                f"Thank you for placing a bulk order with us. We have received your order and will process it shortly.\n\n"
                f"Order Details:\n"
                f"Description: {instance.description or 'N/A'}\n"
                "\n\nBest regards,\n Meetho Sweets"
            )
            try:
                send_email_user(
                    recipient_email=instance.contact_email,
                    subject=user_subject,
                    message=user_message,
                )
            except Exception as e:
                print(f"Failed to enqueue customer email task: {e}")



    # ---------------- Wishlist ----------------


    @receiver(post_save, sender=WishList)
    @receiver(post_delete, sender=WishList)
    def invalidate_wishlist_cache(sender, instance, **kwargs):
        """
        Invalidate all cached wishlists for the user when updated.
        """
        pattern = f"wishlist:user:{instance.user.id}:*"
        invalidate_cache(pattern)


    # ---------------- Product ----------------


    @receiver(post_save, sender=Product)
    @receiver(post_delete, sender=Product)
    def invalidate_product_cache(sender, instance, **kwargs):

        invalidate_cache("products:list:*")

        invalidate_cache("products:recommended")
        invalidate_cache("products:popular")
        invalidate_cache(f"products:similar:*")
        if instance.category:
            category_slug = instance.category.slug
            invalidate_cache(f"products:category:{category_slug}:*")

        # ---------------- invalidate tag caches ----------------

        for tag in instance.tags.all():
            invalidate_cache(f"product:tag:{tag.slug}")




    # ---------------- Category ----------------


    @receiver(post_save, sender=Category)
    @receiver(post_delete, sender=Category)
    def invalidate_category_cache(sender, instance, **kwargs):
        # Invalidate category list
        invalidate_cache("categories:list:*")

        # Invalidate products inside this category
        if instance.slug:
            invalidate_cache(f"products:category:{instance.slug}:*")

    # ---------------- TopCategory ----------------


    @receiver(post_save, sender=TopCategory)
    @receiver(post_delete, sender=TopCategory)
    def invalidate_topcategory_cache(sender, instance, **kwargs):
        invalidate_cache("categories:top:*")