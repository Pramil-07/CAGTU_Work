from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings


def send_payment_receipt(txn, payment, user):
    print("I am here to send the payment receipt")

    subject = f"Payment Receipt - Transaction {txn.id}"
    context = {
        "txn": txn,
        "payment": payment,
        "user": user,
        "order_items": txn.order.order_items.all(),
    }

    html_message = render_to_string("email/receipt.html", context)

    send_mail(
        subject=subject,
        message="",  # plain text fallback
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],  # must be a list
        html_message=html_message,
        fail_silently=False
    )
