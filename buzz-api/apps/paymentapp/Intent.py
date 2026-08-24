from decimal import Decimal
import json
from datetime import datetime
from django.utils import timezone
from typing import Callable

import requests
from django.contrib.auth import get_user_model
from django.db import transaction
from django.template.loader import render_to_string
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from apps.checkoutapp.api.v1.serializers import OrderSerializer
from apps.checkoutapp.models import Order, OrderItem, Delivery_detail, Cart
from apps.core.utils import SendThreadMail
from apps.offer.models import Coupon
from apps.paymentapp.api.v1.serializers import (
    PaymentIntentSerializer,
    PaymentVerificationSerializer,
)
from apps.paymentapp.client import paypal_client
from apps.paymentapp.client._khalti import KhaltiClient
from apps.paymentapp.email import send_payment_receipt
from apps.paymentapp.models import DeliveryCharge, Payment, PaymentMethod, Transaction
from django.conf import settings
import stripe

from apps.productapp.models import Stock

User = get_user_model()
stripe.api_key = settings.STRIPE_API_SECRET


class CreatePaymentIntent(CreateAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = PaymentIntentSerializer

    @transaction.atomic
    def create(self, request, *arge, **kwargs):
        provider = kwargs["provider"]
        data = request.data.get("delivery_data") or {}
        print("data delivery", data)

        try:
            """section for order confirm"""
            # ✅ Fetch latest open order for this user
            order = (
                Order.objects.filter(user=request.user, ordered=False)
                .order_by("-created_at")
                .first()
            )

            if not order:
                return Response(
                    {"status": "failure", "message": "No active order found."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            # ✅ Handle delivery address
            delivery_address_id = request.data.get("delivery_address_id")
            if delivery_address_id:
                # Filtering only by ID since no 'user' field in your model
                try:
                    delivery_address = Delivery_detail.objects.get(
                        id=delivery_address_id
                    )
                except Delivery_detail.DoesNotExist:
                    return Response(
                        {
                            "status": "failure",
                            "message": "Selected delivery address does not exist.",
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )
            else:
                delivery_data = {
                    "country": data.get("country"),
                    "state": data.get("state"),
                    "city": data.get("city"),
                    "street_address": data.get("street_address"),
                    "postal_code": data.get("postal_code"),
                    "contact_number": data.get("contact_number"),
                    "email": data.get("email"),
                    "first_name": data.get("first_name"),
                    "last_name": data.get("last_name"),
                    "order": order,
                    "user": request.user,  # only if your model actually has this FK
                }

                missing = [
                    f
                    for f, v in delivery_data.items()
                    if f
                    in [
                        "country",
                        "state",
                        "city",
                        "street_address",
                        "postal_code",
                        "contact_number",
                        "email",
                        "first_name",
                        "last_name",
                    ]
                    and not v
                ]

                if missing:
                    return Response(
                        {
                            "status": "failure",
                            "message": "Missing required fields",
                            "missing": missing,
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                delivery_address = Delivery_detail.objects.create(**delivery_data)

            order.delivery_address = delivery_address
            print("Address updated for order.")
            OrderItem.objects.filter(
             user=request.user,
            order_status="None").delete()
            # ✅ Validate stock and create order items
            for cart in order.cart.all():
                if not cart.giftcard:
                    if cart.stock.quantity < cart.quantity:
                        diff = cart.quantity - cart.stock.quantity
                        return Response(
                            {
                                "status": "failure",
                                "cart_item": cart.id,
                                "message": f"Please remove {diff} from the cart.",
                            },
                            status=status.HTTP_400_BAD_REQUEST,
                        )
                    image = getattr(cart.stock, "image", cart.product.thumbnail_image)
                    sub_total = cart.get_total_product_price()
                   

                    order_item_create = OrderItem.objects.create(
                        user=request.user,
                        stock=cart.stock,
                        product_name=cart.product.name,
                        product_id=cart.product.id,
                        product_price=cart.stock.offer_price or cart.stock.price,
                        product_image=image,
                        quantity=cart.quantity,
                        sub_total=sub_total,
                        order_status="None",
                    )
                else:
                    sub_total = cart.get_total_giftcard_price()
                    order_item_create = OrderItem.objects.create(
                        user=request.user,
                        giftcard=cart.giftcard,
                        quantity=1,
                        product_name="GiftCard",
                        product_price=sub_total,
                        sub_total=sub_total,
                        # order_status="None",
                    )
                order.order_items.add(order_item_create.id)

            order.sub_total = order.get_sub_order_total()
            print("Subtotal calculated.", order.sub_total)

            delivery = DeliveryCharge._base_manager.filter(is_default=True).first()
            print("Delivery charge fetched:", delivery)
            if not delivery:
                return Response(
                    {
                        "status": "failure",
                        "message": "No active delivery charge found.",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            delivery_charge = delivery.calculate_charge(order.sub_total)

            order.delivery_price = delivery_charge
            order.total_price = order.sub_total + delivery_charge

            order.save(update_fields=["sub_total", "delivery_price", "total_price"])

            order.save()

            # ✅ Coupon validation
            if order.coupon_used:
                try:
                    coupon = Coupon.objects.get(coupon_code=order.coupon_name)
                    if (
                        coupon.num_available < 1
                        or coupon.deleted_at.timestamp() < datetime.now().timestamp()
                    ):
                        return Response(
                            {
                                "status": "failure",
                                "message": "Coupon has already expired.",
                            },
                            status=status.HTTP_400_BAD_REQUEST,
                        )
                    if order.sub_total < coupon.min_order_total:
                        return Response(
                            {
                                "status": "failure",
                                "message": f"The cart total must exceed {coupon.min_order_total} to use this coupon code.",
                            },
                            status=status.HTTP_400_BAD_REQUEST,
                        )
                    coupon.num_used += 1
                    coupon.num_available -= 1
                    coupon.save()
                except Exception as e:
                    return Response(
                        {
                            "status": "failure",
                            "message": "Coupon is not valid.",
                            "error": str(e),
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            # ✅ Mark order as confirmed (Ordered status only)
            order.total_price = order.get_grand_order_total()
            # order.ordered = True
            # order.order_status = "Ordered"
            order.save()

            # ✅ Update stock and clear cart
            for cart in order.cart.all():
                if not cart.giftcard:
                    stock_obj = Stock.objects.get(id=cart.stock.id)
                    stock_obj.quantity -= cart.quantity
                    stock_obj.save()
            # Cart.objects.filter(user=request.user).delete()

            # ✅ Send confirmation email
            html_content = render_to_string(
                "order_invoice.html", {"user": request.user, "my_order": order}
            )
            SendThreadMail.send_html_mail(
                self,
                "Order Confirmation",
                html_content,
                [request.user.email],
                settings.DEFAULT_FROM_EMAIL,
            )

            """End of confirm order"""
            payment_method = PaymentMethod.objects.get(slug=provider)
            serializer: PaymentIntentSerializer = self.serializer_class(
                data=request.data,
            )
            serializer.is_valid(raise_exception=True)
            create_intent = getattr(self, f"create_intent_{provider.lower()}")

        except PaymentMethod.DoesNotExist:
            raise ValidationError(
                {"status": "failure", "message": "Payment method does not exist"}
            )

        except AttributeError as e:
            raise ValidationError({"status": "failure", "details": str(e)})

        order = Order.objects.filter(user=request.user).order_by("-created_at").first()
        merchant: User or None = serializer.validated_data.get("merchant")

        if provider.lower() == "cod":
            intent_response, intent_id , payment_method = create_intent(order, provider)
        else:
            # For all other providers (Stripe, PayPal, etc.), do not pass the 'provider' argument
            intent_response, intent_id = create_intent(order)

        ### input transaction model to be created
        print("Intent response:", intent_response)
        txn, create = Transaction.objects.get_or_create(
            intent_id=intent_id,
            order=order,
            provider=payment_method.slug,
            transaction_type="payment",
            defaults={
                "sender": merchant or self.request.user,
                "status": "Active",
                "receiver_id": settings.DEFAULT_UUID,
                "amount": order.total_price,
                "currency": "USD",
                "transaction_type": "payment",
                "extra_data": intent_response,
            },
        )
        if create and Transaction.objects.filter(sender=request.user).count() == 1:

            # add offer point and notification method  here
            pass
        order.order_status = "ordered"
        order.save(update_fields=["order_status"])

        return Response(
            {"Success": True, "data": intent_response, "id": intent_id},
            status=status.HTTP_200_OK,
        )

    def create_intent_paypal(self, order: Order):

        amount = f"{order.total_price + order.delivery_price:.2f}"

        if amount is None:
            raise ValidationError(
                "Order has no total_price. Cannot create payment intent."
            )

        try:
            response = paypal_client.create_intent(
                amount=amount,  # ✅ Pass float, not str
                order_id=order.order_id,
                order_name=f"Order with id {order.order_id}",
                currency_code="USD",
            )
            print("DEBUG: PayPal API responded")
        except Exception as e:
            print("ERROR: PayPal client raised an exception:", str(e))
            raise ValidationError(
                {"status": "failure", "message": "PayPal client error"}
            )

        try:
            json_response = response.json()
        except json.JSONDecodeError as e:
            print("ERROR: Failed to decode PayPal response as JSON:", str(e))
            json_response = {"status": "failure", "message": str(e)}

        print("DEBUG: PayPal Response JSON:", json_response)

        if 200 <= response.status_code < 300:
            print("DEBUG: PayPal intent created successfully")
            return json_response, json_response["id"]

        print("ERROR: PayPal intent creation failed with status", response.status_code)
        raise ValidationError(
            {
                "status": "failure",
                "message": json_response.get(
                    "detail", "Payment intent creation failure"
                ),
                "merchant": json_response,
            },
            code=response.status_code,
        )

    def create_intent_stripe(self, order: Order):
        amount = order.total_price + order.delivery_price
        if amount is None:
            raise ValidationError(
                "Order has no total_price. Cannot create payment intent."
            )

        try:
            intent = stripe.PaymentIntent.create(
                amount=int(amount * 100),  # Stripe requires amount in cents
                currency="usd",  # lowercase
                metadata={
                    "order_id": order.order_id,
                    "order_name": f"Order with id {order.order_id}",
                },
            )
        except Exception as e:
            raise ValidationError({"status": "failure", "message": str(e)})

        if not intent:
            raise ValidationError(
                {"status": "failure", "message": "Payment intent creation failure"}
            )

        return intent, intent["id"]

    def create_intent_khalti(self, order: Order):
        """
        Create a Khalti payment intent
        """
        if not order.total_price:
            raise ValidationError(
                "Order has no total_price. Cannot create Khalti payment intent."
            )

        # Convert NPR to paisa (Khalti works in paisa)
        amount_paisa = int(order.total_price * 100)

        # Setup client
        client = KhaltiClient(
            public_key=settings.KHALTI_PUBLIC_KEY,
            secret_key=settings.KHALTI_SECRET_KEY,
            sandbox=settings.KHALTI_SANDBOX,  # True for dev, False for prod
        )

        # Prepare customer info (Khalti requires at least name, email, phone)
        customer_info = {
            "name": f"{order.user.first_name} {order.user.last_name}",
            "email": order.user.email,
            "phone": (
                order.delivery_address.contact_number if order.delivery_address else ""
            ),
        }

        try:
            response = client.create_intent(
                amount=amount_paisa,
                order_id=order.order_id,
                order_name=f"Order #{order.order_id}",
                customer_info=customer_info,
            )
        except Exception as e:
            raise ValidationError({"status": "failure", "message": str(e)})

        try:
            data = response.json()
        except Exception:
            data = {"status": "failure", "message": "Invalid Khalti response."}

        if response.status_code == 200:
            # `pidx` is the unique payment intent ID in Khalti
            return data, data.get("pidx")

        raise ValidationError(
            {
                "status": "failure",
                "message": data.get("detail", "Khalti payment intent creation failed"),
                "khalti_response": data,
            },
            code=response.status_code,
        )

    def create_intent_cod(self, order: Order, provider: str):
        """
        Handle Cash on Delivery (COD) logic.
        """
        try:
            payment_method = PaymentMethod.objects.get(slug="cod")
        except PaymentMethod.DoesNotExist:
            raise ValidationError(
                {"status": "failure", "message": "COD payment method does not exist"}
            )

        order.payment_method = payment_method
        order.order_status = "Ordered"
        order.ordered = True
        order.save()

        intent_response = {"message": "This order is Cash on Delivery"}
        intent_id = "COD_INTENT_" + str(order.order_id)
        return intent_response, intent_id, payment_method


class VerifyPayment(CreateAPIView):
    serializer_class = PaymentVerificationSerializer
    permission_classes = (AllowAny,)

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            raise
        provider = kwargs.get("provider")
        txn = (
            Transaction.objects.filter(sender=request.user, status="Active")
            .order_by("-created_at")
            .first()
        )
        order = txn.order if txn else None

        if not txn:
            raise ValidationError(
                {"status": "failure", "message": "No active transaction found"}
            )
        try:
            method = getattr(self, f"complete_{provider}")
        except AttributeError:
            raise ValidationError(
                {
                    "provider": [
                        f'Unsupported payment service provider "{provider}" supplied'
                    ]
                }
            )
        try:
            payment: dict = method(
                txn,
                data=serializer.validated_data.get("merchant_response", {}),
                *args,
                **kwargs,
            )
        except Exception as e:
            raise
        try:

            txn.mark_complete()

            order.ordered = True
            order.order_status = "Ordered"
            order.created_at = timezone.now()
            order.save()

            # ✅ Update stock and clear cart
        
            Cart.objects.filter(user=request.user).delete()
            send_payment_receipt(txn, payment, request.user)

        except Exception as e:
            raise
        return Response(
            {
                "status": "success",
                "message": "Successfully created Payment",
                "detail": payment,
            }
        )

    @staticmethod
    def set_transaction_dispute(txn: Transaction):
        txn.status = "dispute"
        txn.save()

    @transaction.atomic
    def complete_paypal(self, txn: Transaction, *args, **kwargs):

        response = paypal_client.verify_payment(txn.intent_id)

        if response.status_code == 201:
            return response.json()
        else:
            self.set_transaction_dispute(txn)
            raise ValidationError({"status": "failure", "data": response.json()})

    def complete_stripe(self, txn: Transaction, *args, **kwargs):
        print("I am here")
        try:
            intent = stripe.PaymentIntent.retrieve(txn.intent_id)
            print(f"📨 [DEBUG] Stripe intent: {intent}")

            if intent.status == "succeeded" and intent.amount_received == intent.amount:
                return dict(intent)

            self.set_transaction_dispute(txn)
            print(
                f"❌ [DEBUG] Stripe: Payment not completed yet. Status: {intent.status}"
            )
            raise ValidationError(
                {"status": "failure", "message": f"Payment status is '{intent.status}'"}
            )

        except stripe.error.StripeError as e:
            self.set_transaction_dispute(txn)
            print(f"❌ [DEBUG] Stripe API error: {e}")
            raise ValidationError({"status": "failure", "message": str(e)})

    def complete_khalti(self, txn: Transaction, *args, **kwargs):
        """
        Verify Khalti payment using pidx
        """
        client = KhaltiClient(
            public_key=settings.KHALTI_PUBLIC_KEY,
            secret_key=settings.KHALTI_SECRET_KEY,
            sandbox=settings.KHALTI_SANDBOX,
        )

        try:
            response = client.verify_payment(token=txn.intent_id)
        except Exception as e:
            self.set_transaction_dispute(txn)
            raise ValidationError({"status": "failure", "message": str(e)})

        try:
            data = response.json()
        except Exception:
            self.set_transaction_dispute(txn)
            raise ValidationError(
                {"status": "failure", "message": "Invalid Khalti verification response"}
            )

        if response.status_code == 200 and data.get("status") == "Completed":
            return data

        self.set_transaction_dispute(txn)
        raise ValidationError({"status": "failure", "khalti_response": data})

    def complete_cod(self, txn: Transaction, *args, **kwargs):
        order=txn.order
        order.order_status = "Ordered"
        txn.payment_status = "pending"
        order.is_paid = False

        order.save(update_fields=["order_status", "is_paid"])
        txn.save(update_fields=["payment_status"])
        return {"status": "success", "message": "This order is Cash on Delivery"}
