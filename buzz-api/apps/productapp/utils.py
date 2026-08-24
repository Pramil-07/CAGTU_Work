from django.core.mail import EmailMessage
from django.utils.crypto import get_random_string
import random
from django.conf import settings


def unique_slugify(instance, slug):
    model = instance.__class__
    unique_slug = slug
    while model.objects.filter(slug=unique_slug).exists():
        unique_slug = slug + "-" + get_random_string(length=4)
    return unique_slug


def unique_update_slugify(instance, created, slug):
    model = instance.__class__
    unique_slug = slug
    if created:
        while model.objects.filter(slug=unique_slug).exists():
            unique_slug = slug + "-" + get_random_string(length=4)
    else:
        while model.objects.filter(slug=unique_slug).exclude(id=instance.id).exists():
            unique_slug = slug + "-" + get_random_string(length=4)
    return unique_slug


def sku_generator(instance, product_id):
    model = instance.__class__
    random_number = random.randint(100000, 999999)
    count = model.objects.filter(product_id=product_id).count()
    count += 1
    return f"{random_number}-{product_id}-{count}"


def send_email_user(recipient_email, subject, message, kwargs=None):
    from_email = settings.DEFAULT_FROM_EMAIL
    safe_kwargs = kwargs or {}
    subject = subject
    message = message
    email = EmailMessage(
        subject=subject,
        body=message,
        from_email=from_email,
        to=[recipient_email],
        **safe_kwargs,
    )

    email.send(fail_silently=False)


def bulk_product_data_process():
    pass
