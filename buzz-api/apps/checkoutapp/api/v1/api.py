from decimal import Decimal

from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.views import APIView


from rest_framework import filters
from django.conf import settings
from apps.checkoutapp.api.v1.serializers import (
    CartCreateSerializer,
    CartDetailSerializer,
    CartPatchSerializer,
)
from apps.checkoutapp.api.v1.serializers import *
from apps.core.pagination import CustomPagination
from apps.notifications.utils import HookResponse
from apps.offer.models import Coupon
from apps.paymentapp.models import DeliveryCharge, Transaction
from ...models import *
from rest_framework import status
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from datetime import datetime
from rest_framework import generics
from django.template.loader import render_to_string

# custom app import
from apps.core.utils import *
from apps.core.permissions import *
from rest_framework.parsers import FormParser, MultiPartParser
from ...utils import *
from datetime import datetime, timedelta
from apps.customersupportapp.models import Refund
from apps.productapp.api.v1.api import (
    get_active_product_object,
    get_stock_and_product_validate,
)
from apps.checkoutapp.filters import *
from apps.notifications.models import Notification


# Create your views here.
from django.db import transaction


class CartCreateAPIView(APIView):
    permission_classes = [CustomerOnlyPermission]

    @extend_schema(request=CartCreateSerializer(many=True))
    def post(self, request, *args, **kwargs):
        serializer = CartCreateSerializer(data=request.data, many=True)
        if not serializer.is_valid():
            return Response({"status": "failure", "message": serializer.errors})

        response_data = []

        with transaction.atomic():
            order, _ = Order.objects.get_or_create(user=request.user, ordered=False)
            order.cart.filter(user=request.user).delete()

            for item in serializer.validated_data:
                product_id = item.get("product")
                stock_id = item.get("stock")
                quantity_no = item.get(
                    "quantity", 1
                )  # default quantity to 1 if not provided

                if not product_id or not stock_id:
                    response_data.append(
                        {
                            "product": product_id,
                            "status": "failure",
                            "message": "Product and stock are required.",
                        }
                    )
                    continue

                product = get_active_product_object(
                    self, product_id.id if hasattr(product_id, "id") else product_id
                )
                stock = get_stock_and_product_validate(
                    self,
                    product.id,
                    stock_id.id if hasattr(stock_id, "id") else stock_id,
                )

                if stock.quantity < quantity_no:
                    response_data.append(
                        {
                            "product": product.id,
                            "status": "failure",
                            "message": "Item out of stock.",
                        }
                    )
                    continue

                cart_obj, created = Cart.objects.get_or_create(
                    user=request.user,
                    product_id=product.id,
                    stock_id=stock.id,
                    defaults={"quantity": quantity_no},
                )
                if not created:
                    cart_obj.quantity = quantity_no
                    cart_obj.save()

                order.cart.add(cart_obj)

                response_data.append(
                    {
                        "product": product.id,
                        "status": "success",
                        "message": "Added to cart",
                    }
                )

        return Response({"status": "completed", "results": response_data})


class CartDetailAPIView(APIView):
    """
    APIView class for viewing cart details.
    """

    permission_classes = [CustomerOnlyPermission]

    def get_object(self, request):
        try:
            return Cart.objects.filter(user=request.user)
        except Cart.DoesNotExist:
            raise Http404

    def get(self, request, *args, **kwargs):
        """
        Getting cart details of specific user
        """
        cart_obj = self.get_object(request)
        print("cart object", cart_obj)
        serializer = CartDetailSerializer(cart_obj, many=True)

        # total price as Decimal
        total_price = sum(
            (
                item.giftcard.balance
                if item.giftcard
                else (
                    (
                        item.stock.offer_price
                        if item.stock.offer_price is not None
                        else item.stock.price
                    )
                    if item.stock
                    else Decimal("0.00")  # fallback when stock is None
                )
            )
            * item.quantity
            for item in cart_obj
            if item.giftcard or item.stock  # skip completely broken items
        )

        # default delivery charge
        delivery_charge = Decimal("0.00")

        delivery = DeliveryCharge.objects.filter(
            status="Active", is_default=True
        ).first()
        if delivery:
            delivery_charge = delivery.calculate_charge(total_price)

        final_total = total_price + delivery_charge

        resp = {
            "status": "success",
            "data": serializer.data,
            "cart_total": str(total_price),  # cast to string for JSON
            "delivery_charge": str(delivery_charge),
            "final_total": str(final_total),
        }
        return Response(resp)

    def delete(self, request, *args, **kwargs):
        """
        Deleting cart
        """
        carts = self.get_object(request)
        carts.delete()
        resp = {"status": "success", "message": "Cart Cleared."}
        return Response(resp)


class CartUpdateAPIView(APIView):
    """
    APIView class for updating cart
    """

    permission_classes = [CustomerOnlyPermission]

    def get_object(self, cart_id):
        try:
            return Cart.objects.get(id=cart_id)
        except Cart.DoesNotExist:
            raise Http404

    @extend_schema(request=CartPatchSerializer)
    def patch(self, request, cart_id, *args, **kwargs):
        """
        Updating cart of the specific user
        ----------------------------------------------------------------

        Parameters
        ----------------------------------------------------------------
            pathparameters
                cart_id : int
            request: json
                {
                    quantity: int,
                }

        Returns
        ----------------------------------------------------------------
            json response: success or failure messages

        """
        cart_obj = self.get_object(cart_id)
        if cart_obj.giftcard:
            resp = {"You cannot add quantity to the giftcard."}
        else:
            serializer = CartPatchSerializer(cart_obj, data=request.data, partial=True)
            if serializer.is_valid():
                quantity = serializer.validated_data.get("quantity")

                if quantity is not None:

                    if quantity > cart_obj.stock.quantity:
                        resp = {"status": "failure", "message": "Item Out of stock."}
                    else:
                        if quantity <= 0:
                            cart_obj.delete()
                            resp = {"status": "success", "message": "Quantity Updated."}
                        else:
                            serializer.save()
                            resp = {
                                "status": "success",
                                "message": "Quantity Updated.",
                                "data": serializer.data,
                            }
                    return Response(resp)
                else:
                    return Response(
                        {
                            "status": "failure",
                            "message": "Quantity cant be 0",
                            "data": serializer.errors,
                        },
                        400,
                    )
            else:
                resp = {"status": "failure", "message": serializer.errors}
        return Response(resp)

    def delete(self, request, cart_id):
        """
        Deleting cart
        ----------------------------------------------------------------

        Parameters
        ----------------------------------------------------------------
            cart_id: int
        """
        cart_obj = self.get_object(cart_id)
        cart_obj.delete()
        resp = {"status": "success", "message": "Cart Deleted."}
        return Response(resp)


class MultipleCartItemRemoveView(APIView):
    """
    APIView Class for deleting multiple cart items
    """

    permission_classes = [CustomerOnlyPermission]

    def delete(self, request, *args, **kwargs):
        """
        Deleting multiple items from the cart
        ----------------------------------------------------------------

        Parameters
        ----------------------------------------------------------------
            request: query_params
                id: List[int]

        Returns
        ----------------------------------------------------------------
            json response: success or failure messages
        """
        query_param = self.request.query_params.get("id")  # "[1,2,3]"
        print("query_params", query_param)
        try:
            # id_string = query_param[1:-1] # "1,2,3"
            # id_list = [int(x) for x in id_string.split(",")] # [1,2,3]

            id_list = eval(query_param)
            carts = Cart.objects.filter(id__in=id_list)
            carts.delete()
        except Exception as e:
            return Response(
                {
                    "status": "failure",
                    "message": "Please select valid carts.",
                    "details": str(e),
                },
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(
            {"status": "success", "message": "The carts have been deleted."}
        )


class AddDeliveryDetailAPIView(APIView):
    """
    APIView class for adding a new delivery details
    """

    def get_object(self, request, *args, **kwargs):
        try:
            return Order.objects.get(user=request.user, ordered=False)
        except Order.DoesNotExist:
            raise Http404

    permission_classes = [CustomerOnlyPermission]

    def get(self, request, *args, **kwargs):
        delivery_address = Delivery_detail.objects.filter(user=request.user)
        serializer = DeliveryDetailSerializer(delivery_address, many=True)
        return Response({"data": serializer.data}, status=status.HTTP_200_OK)

    @extend_schema(request=AddDeliveryDetailSerializer)
    def post(self, request, *args, **kwargs):
        """
        Adding delivery details to the specified customer
        ----------------------------------------------------------------
        Parameters
        ----------------------------------------------------------------
            request : json_data
            {
                "country": "string",
                "state": "string",
                "city": "string",
                "street_address": "string",
                "postal_code": "string",
                "contact_number": "+9779803000686",
                "delivery_option": "string",
                "first_name": "string",
                "last_name": "string",
                "company_name": "string"
            }

        Returns
        ----------------------------------------------------------------
            json response: success or failure messages
        """
        serializer = AddDeliveryDetailSerializer(data=request.data)
        if serializer.is_valid():
            order = self.get_object(request)
            address = serializer.save(user=request.user)
            try:

                address_id = serializer.data["id"]
                order = Order.objects.get(user=request.user, ordered=False)
                order.delivery_address_id = address_id
                order.save()
                resp = {"status": "success", "message": "Delivery Address added."}

            except order.DoesNotExist:
                resp = {
                    "status": "success",
                    "message": "Delivery Address added (no open order).",
                    "address_id": address.id,
                }

        else:
            resp = {"status": "failure", "message": serializer.errors}
        return Response(resp)


class BillingAddressCreateAPI(generics.CreateAPIView):
    serializer_class = AddDeliveryDetailSerializer
    queryset = Delivery_detail.objects.all()

    def perform_create(self, serializer):
        serializer.save()
        order = get_object_or_404(Order, user=self.request.user, ordered=False)
        address_id = serializer.data["id"]
        order.billing_adderess_id = address_id
        order.save()

    def post(self, request, *args, **kwargs):
        super().post(request, *args, **kwargs)
        return Response(
            {"status": "success", "message": "Billing address added successfully."},
            status=status.HTTP_201_CREATED,
        )


class CustomerOrderSummaryAPIView(APIView):
    """
    APIView class for customer order summary
    """

    permission_classes = [CustomerOnlyPermission]

    def get(self, request):
        """
        Getting customer order summary information
        """
        try:
            order_obj = Order.objects.get(user=request.user, ordered=False)
            serializer = CustomerOrderSummarySerializer(order_obj)
            resp = {"status": "success", "data": serializer.data}
            return Response(resp)
        except Exception as e:
            resp = {"status": "failure", "message": str(e)}
            return Response(resp)


class ApplyForCouponAPIView(APIView):
    permission_classes = [CustomerOnlyPermission]

    def get_coupon(self, coupon_code):
        try:
            return Coupon.objects.get(coupon_code=coupon_code)
        except Exception:
            resp = {"status": "failure", "message": "Invalid Coupon Code."}
            return Response(resp)

    @extend_schema(request=ApplyForCouponSerilaizer)
    def post(self, request):
        """
        Apply for coupon code
        ----------------------------------------------------------------

        Parameters
        ----------------------------------------------------------------
            request: json_data
            {
                coupon_code: string
            }

        Returns
        ----------------------------------------------------------------
            json response: success or failure messages
        """
        serializer = ApplyForCouponSerilaizer(data=request.data)
        if serializer.is_valid():
            coupon_code = serializer.validated_data.get("coupon_code")
            try:
                order = Order.objects.get(user=request.user, ordered=False)
                coupon = self.get_coupon(coupon_code)
                if order.coupon_used:
                    resp = {
                        "status": "failure",
                        "message": "Please remove existing coupon.",
                    }
                    return Response(resp)
                if order.get_cart_total() >= coupon.value and coupon.num_available > 0:

                    order.discount = coupon.value
                    order.coupon_used = True
                    order.coupon_name = coupon_code
                    order.save()
                    resp = {"status": "success", "message": "Coupon code applied."}
                else:
                    resp = {"status": "failure", "message": "Insufficient cart amount."}
            except Exception as e:
                resp = {"status": "failure", "message": str(e)}
            return Response(resp)

    def delete(self, request):
        try:
            order = Order.objects.get(user=request.user, ordered=False)
            order.coupon_used = False
            order.discount = None
            order.coupon_name = None
            order.save()
            resp = {"status": "success", "message": "Coupon code removed."}
        except Exception as e:
            resp = {"status": "failure", "message": str(e)}
        return Response(resp)

    # min_order_total = models.PositiveIntegerField()
    # num_available = models.PositiveIntegerField()
    # num_used = models.PositiveIntegerField(default=0)
    # category = models.ManyToManyField(Category)


class ConfirmOrderAPIView(APIView):
    """
    APIView class for confirming order (without assigning payment method)
    """

    permission_classes = [CustomerOnlyPermission]

    def post(self, request, *args, **kwargs):
        try:
            # ✅ Fetch latest open order for this user
            order = (
                Order.objects.filter(user=request.user, ordered=False)
                .order_by("-created_at")
                .first()
            )
            if not order:
                return Response(
                    {
                        "status": "failure",
                        "message": "No open order found for this user.",
                    },
                    status=400,
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
                    "country": request.data.get("country"),
                    "state": request.data.get("state"),
                    "city": request.data.get("city"),
                    "street_address": request.data.get("street_address"),
                    "postal_code": request.data.get("postal_code"),
                    "contact_number": request.data.get("contact_number"),
                    "email": request.data.get("email"),
                    "first_name": request.data.get("first_name"),
                    "last_name": request.data.get("last_name"),
                    "order": order,
                    "user": request.user,  # linking to order since no user field
                }
                delivery_address = Delivery_detail.objects.create(**delivery_data)

            order.delivery_address = delivery_address

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
                        product_price=cart.stock.price,
                        product_image=image,
                        quantity=cart.quantity,
                        sub_total=sub_total,
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
                    )
                order.order_items.add(order_item_create.id)

            order.sub_total = order.get_sub_order_total()

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
            print(order.total_price)
            order.ordered = True
            order.order_status = "Ordered"
            delivery = DeliveryCharge.objects.filter(
                status="Active", is_default=True
            ).first()
            if delivery:
                delivery_charge = delivery.calculate_charge(order.total_price)
                order.delivery_price = delivery_charge
                order.total_price = order.total_price + delivery_charge
                order.save()
                print("Order is saved")

            order.save()

            # ✅ Update stock and clear cart
            for cart in order.cart.all():
                if not cart.giftcard:
                    stock_obj = Stock.objects.get(id=cart.stock.id)
                    # stock_obj.quantity -= cart.quantity
                    stock_obj.save()
            Cart.objects.filter(user=request.user).delete()

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

            # ✅ Serialize response
            serializer = OrderSerializer(order)
            return Response(
                {
                    "status": "success",
                    "message": "Order confirmed successfully.",
                    "data": serializer.data,
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response({"status": "failure", "message": str(e)}, status=500)


class ChangeOrderStatusAPI(APIView):
    """
    APIView class for changing order status
    """

    permission_classes = [AllStaffPermission]
    parser_classes = [MultiPartParser, FormParser]

    def get_order(self, order_id):
        try:
            return Order.objects.get(id=order_id)
        except Order.DoesNotExist as e:
            raise Http404 from e

    @extend_schema(request=OrderSerializer)
    def patch(self, request, order_id, *args, **kwargs):
        order_obj = self.get_order(order_id)
        serializer = OrderSerializer(order_obj, data=request.data, partial=True)
        if serializer.is_valid():
            if serializer.validated_data.get("order_status") == "Received":
                serializer.save(delivered_date=datetime.now())
                order_obj.is_paid = True if order_obj.payment_method != "COD" else False
                txn = Transaction.objects.filter(order=order_obj).first()
                if txn:
                    txn.payment_status = "completed"
                    txn.save(update_fields=["payment_status"])
                order_obj.save()
            else:
                serializer.save()
            resp = {"status": "success", "message": "Order status updated"}
        else:
            resp = {"status": "failure", "message": serializer.errors}
        return Response(resp)


from django.db.models import Q


class OrderHistoryAPIView(APIView):
    """
    API View class for gettng order history
    """

    permission_classes = [CustomerOnlyPermission]
    pagination_class = CustomPagination()

    def get(self, request, *args, **kwargs):
        """Getting order history of specific customer"""
        qs = Order.objects.filter(user=request.user, ordered=True).order_by(
            "-created_at"
        )
        if request.user.is_superuser:
            qs = Order.objects.filter(Q(ordered=True) | Q(is_paid=True)).order_by(
                "-created_at"
            )
        filterset = OrderFilterSet(request.query_params, queryset=qs)

        order = filterset.qs

        ordering = request.query_params.get("ordering")
        if ordering:
            fields = []
            for field in ordering.split(","):
                if field == "-created_at":
                    fields.append("created_at")
                elif field == "created_at":
                    fields.append("-created_at")
                elif field == "-delivered_date":
                    fields.append("delivered_date")
                elif field == "delivered_date":
                    fields.append("-delivered_date")
                else:
                    fields.append(field)
            order = order.order_by(*fields)

        paginator = self.pagination_class
        paginated_orders = paginator.paginate_queryset(order, request)
        serializer = OrderHistorySerializer(
            paginated_orders, many=True, context={"request": request}
        )
        return paginator.get_paginated_response(serializer.data)


class CMSOrderHistoryAPIView(generics.ListAPIView):
    """Generics ListAPIView for listing Order History
    ----------------------------------------------------"""

    permission_classes = [MerchantAndStaffPermission]
    queryset = Order.objects.filter(ordered=True)
    serializer_class = OrderHistorySerializer
    # filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = [
        "order__id",
        "customer__user__username",
        "payment_method",
        "coupon_name",
    ]
    filterset_class = CMSOrderHistoryFilterSet


class OrderHistoryDetailView(generics.RetrieveAPIView):
    permission_classes = [CustomerOnlyPermission]
    serializer_class = OrderHistoryDetailSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user, ordered=True)


class CancelOrderAPIView(APIView):
    """
    APIView class for canceling a order
    """

    permission_classes = [CustomerOnlyPermission]

    def get_order(self, order_id):
        try:
            order_obj = Order.objects.get(
                id=order_id, user=self.request.user, order_status="Ordered"
            )
            order_items = order_obj.order_items.all()
            for item in order_items:
                stock_obj = Stock.objects.get(id=item.stock_id)
                stock_obj.quantity += item.quantity
                stock_obj.save()
            return order_obj
        except Order.DoesNotExist as e:
            raise Http404 from e

    def post(self, request, order_id):
        """
        Cancelling order
        ----------------------------------------------------------------

        Parameters
        ----------------------------------------------------------------
            pathparameter
                order_id : int

        Returns
        ----------------------------------------------------------------
            json response: success or failure messages
        """
        order_obj = self.get_order(order_id)
        order_obj.order_status = "Cancelled"
        order_obj.save()
        resp = {"resp": "success", "message": "Order cancelled"}
        return Response(resp)


class OrderItemAPIView(APIView):
    serializer_class = OrderItemSerializer
    pagination_class = CustomPagination

    def get(self, request, *args, **kwargs):
        user = request.user
        if user.is_superuser:
            items = OrderItem.objects.filter(user=request.user).exclude(
                order_status="None"
            )

        else:
            items = (
                OrderItem.objects.filter(user=request.user)
                .exclude(order_status="None")
                .select_related("user", "stock")
                .order_by("-created_at")
            )

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(items, request)
        serializers = self.serializer_class(
            page, many=True, context={"request": request}
        )

        return paginator.get_paginated_response(serializers.data)
