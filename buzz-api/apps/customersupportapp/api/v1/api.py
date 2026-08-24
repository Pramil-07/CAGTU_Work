from django.http import Http404
from django.shortcuts import get_object_or_404
from requests import request
import json

from rest_framework.permissions import AllowAny
from uritemplate import partial

# from apps.accountapp.models import Staff
from apps.accountapp.utils import *
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from django.core.mail import send_mail
from django.utils import encoding
from django.http import HttpResponseBadRequest
from django.template.loader import render_to_string
from rest_framework.parsers import FormParser, MultiPartParser, FileUploadParser
from rest_framework.pagination import PageNumberPagination
from rest_framework import pagination
from apps.customersupportapp.models import Feedback, Newsletter
from collections import OrderedDict
from .serializers import *
from rest_framework import generics
from apps.core.pagination import CustomPagination
from rest_framework.pagination import LimitOffsetPagination
from apps.checkoutapp.models import Order, OrderItem
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from rest_framework.validators import ValidationError
from datetime import datetime, timedelta
from django.core.exceptions import ObjectDoesNotExist

# custom app import
from apps.core.permissions import *
from apps.core.utils import *
from .utils import *


class NewsLetterSubscribeAPIView(APIView):
    permission_classes = (AllowAny,)

    @extend_schema(request=NewsLetterSerializer)
    def post(self, request, *args, **kwargs):
        """
        Sends the email to admin and the corresponding user for their newsletter subscription.
        ----------------------------------------------------------------

        Parameters
        ----------------------------------------------------------------
            request: json data
                - should have keywords like ( email)

        Returns
        ----------------------------------------------------------------
        JSON response ( success message or error message)
        """

        serializer = NewsLetterSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            email = serializer.validated_data.get("email")
            serializer.save()
            html_content = render_to_string(
                "newsletteremail.html",
                {
                    "email": email,
                },
            )
            html_content1 = render_to_string("messageforuser.html", {})
            SendThreadMail.send_html_mail(
                self,
                "Someone has subscribed our newsletter",
                html_content,
                ["info@cagtunepal.com"],
                settings.DEFAULT_FROM_EMAIL,
            )
            SendThreadMail.send_html_mail(
                self, "Thank You!", html_content1, [email], settings.DEFAULT_FROM_EMAIL
            )
            resp = {"status": "success", "message": "Thank you for subscribing us"}
        else:
            resp = {"status": "success", "message": serializer.errors}
        return Response(resp)


class NewsLetterSubscriptionsGenericsListAPIView(generics.ListAPIView):
    """
    Generics ListAPIView class for listing newsletter subscribers; ordered on the
    basis of id

    Parameters
    ----------------------------------------------------------------
        queryparams
            page: integer
            page_size: integer

    Returns
    ----------------------------------------------------------------
        json response: lists of newsletter subscribers
    """

    queryset = Newsletter.objects.all().order_by("-id")
    serializer_class = NewsLetterSubscriberListSerializer
    pagination_class = CustomPagination
    permission_classes = [AllStaffPermission]


class NewsLetterSubscriptionsListAPIView(APIView, PageNumberPagination):
    """
    APIView class for Listing newsletter subscribers; paginated using
    pagenumber

    ...........
    Attributes
        page: int
        page_num: int

    Methods
        get_paginated_response(data, page, page_num)
            - returns json response (ordereddict)
        get_queryset(request)
            - gives queryset
        get(request)
            - return paginated response to the user

    """

    permission_classes = [AllStaffPermission]
    page_size = 10
    max_page_size = 1000

    def get_paginated_response(self, data, page, page_num):
        return Response(
            OrderedDict(
                [
                    ("total_pages", self.page.paginator.num_pages),
                    ("count", self.page.paginator.count),
                    ("current", page),
                    ("next", self.get_next_link()),
                    ("previous", self.get_previous_link()),
                    ("page_size", page_num),
                    ("result", data),
                ]
            )
        )

    def get_queryset(self, request):
        subscriber = Newsletter.objects.all()
        return self.paginate_queryset(subscriber, self.request)

    def get(self, request):
        """
        Getting newsletter subscribers
        ----------------------------------------------------------------

        Parameters
        ----------------------------------------------------------------
            queryparams
                page: int
                page_size: int

        Returns
        ----------------------------------------------------------------
            json response: success or failure messages along with corresponding datas
        """
        page = self.request.GET.get("page", 1)
        page_size = self.request.GET.get("page_size", 1000)
        all_subs = self.get_queryset(request)
        serializer = NewsLetterSubscriberListSerializer(all_subs, many=True)
        return self.get_paginated_response(serializer.data, page, page_size)


class NewsletterUnsubscribeAPIView(APIView):
    """
    APIView class for unsubscribing newsletter

    .............
    Attributes
        email: str

    Methods
        post(request, *args, **kwargs)
            - unsubscribe the user from newsletter subscription
            - sends unsubscribe acknowledgement letter to the user
    """

    def post(self, request, *args, **kwargs):
        """
        Unsubscribe the user from the newsletter subscription list
        ----------------------------------------------------------------

        Parameters
        ----------------------------------------------------------------
            email: str

        Returns
        ----------------------------------------------------------------
            json response: success or error messages
        """
        # serializer = NewsLetterUnsubscribeSerializer(data=request.data)
        # if serializer.is_valid(raise_exception=True):
        try:
            email = self.kwargs.get("email")
            sub_email = Newsletter.objects.get(email=email)
            sub_email.delete()

            domain = "localhost:3004"
            url = "http://" + domain
            html_content = render_to_string(
                "newsletterunsubscribe.html",
                {
                    "email": email,
                },
            )
            html_content1 = render_to_string("unsubscribemessageforuser.html", {})
            SendThreadMail.send_html_mail(
                self,
                "Someone has unsubscribed our newsletter",
                html_content,
                ["info@cagtunepal.com"],
                settings.DEFAULT_FROM_EMAIL,
            )
            SendThreadMail.send_html_mail(
                self, "Thank You!", html_content1, [email], settings.EMAIL_HOST_USER
            )
            # send_mail(
            #     'Someone has unsubscribe our newsletter',
            #     html_content,
            #     settings.EMAIL_HOST_USER,
            #     ['info@cagtunepal.com'],
            #     fail_silently=False

            # )
            # send_mail(
            #     'Thank You',
            #     html_content1,
            #     settings.EMAIL_HOST_USER,
            #     [email],
            #     fail_silently=False

            # )
            resp = {
                "status": "success",
                "message": "You have unsubscribe our newsletter",
            }
            return Response(resp)
        except Exception as e:
            resp = {"status": "failure", "message": str(e)}
            return Response(resp)


class FeedbackCreateAPIView(APIView):
    """
    APIView class for saving feedback from user

    Attributes
    ----------------------------------------------------------------
        request: json_data
            {
                feedback_category: str,
                first_name: str,
                last_name: str,
                email: str,
                phone: str,
                subject: str,
                description: str,
                attachment: file_data (file field django),
            }

    Methods
    ----------------------------------------------------------------
        post(request)
            Saving feedback from the user to the database
    """

    parser_classes = (FormParser, MultiPartParser, FileUploadParser)

    @extend_schema(request=FeedbackCreateSerializer)
    def post(self, request):
        """
        Saving feedback data to the database
        ----------------------------------------------------------------

        Parameters
        ----------------------------------------------------------------
            request: json_data
            {
                feedback_category: str,
                first_name: str,
                last_name: str,
                email: str,
                phone: str,
                subject: str,
                description: str,
                attachment: file_data (file field django),
            }

        Returns
        ----------------------------------------------------------------
            json response : success or failure messages
        """
        serializer = FeedbackCreateSerializer(data=request.data)
        if serializer.is_valid():
            feedback_category = serializer.validated_data.get("feedback_category")
            first_name = serializer.validated_data.get("first_name")
            last_name = serializer.validated_data.get("last_name")
            email = serializer.validated_data.get("email")
            phone = serializer.validated_data.get("phone")
            subject = serializer.validated_data.get("subject")
            description = serializer.validated_data.get("description")
            attachment = serializer.validated_data.get("attachment")

            Feedback.objects.create(
                feedback_category=feedback_category,
                first_name=first_name,
                last_name=last_name,
                email=email,
                phone=phone,
                subject=subject,
                description=description,
                attachment=attachment,
            )

            html_content = render_to_string(
                "feedbackemail.html",
                {
                    "email": email,
                },
            )
            send_mail(
                "Feedback from " + first_name + " " + last_name,
                html_content,
                settings.EMAIL_HOST_USER,
                ["prabinchaudhary@cagtu.com"],
                fail_silently=False,
            )
            resp = {"status": "success", "message": "Feedback created"}
            return Response(resp)
        else:
            resp = {"status": "failure", "message": serializer.errors}
            return Response(resp)


class FeedbackListAPIView(APIView, PageNumberPagination):
    """
    APIView class for listing feedbacks from the user

    .............
    Attributes
        page: int
        page_num: int

    Methods
    ----------------------------------------------------------------
        get_paginated_response(data, page, page_num)
            - returns json response (ordereddict)
        get_queryset(request)
            - gives queryset
        get(request)
            - return paginated response to the user
    """

    permission_classes = [AllStaffPermission]
    page_size = 10
    max_page_size = 1000
    permission_classes = [MaintainerOnlyPermission]

    def get_paginated_response(self, data, page, page_num):
        return Response(
            OrderedDict(
                [
                    ("count", self.page.paginator.count),
                    ("current", page),
                    ("next", self.get_next_link()),
                    ("previous", self.get_previous_link()),
                    ("page_size", page_num),
                    ("result", data),
                ]
            )
        )

    def get_queryset(self, request):
        feedbacks = Feedback.objects.all()
        return self.paginate_queryset(feedbacks, self.request)

    def get(self, request):
        """
        Getting feedback list
        """
        page = self.request.GET.get("page", 1)
        page_size = self.request.GET.get("page_size", 1000)
        feedbacks = self.get_queryset(request)
        serializer = FeedbackListSerializer(feedbacks, many=True)
        return self.get_paginated_response(serializer.data, page, page_size)


class ContactFormAPIView(APIView):
    parser_classes = (FormParser, MultiPartParser, FileUploadParser)
    permission_classes = [AllowAny]

    @extend_schema(request=ContactFormSerializer)
    def post(self, request, *args, **kwargs):
        serializer = ContactFormSerializer(data=request.data)
        if serializer.is_valid():
            category = serializer.validated_data.get("category")
            email = serializer.validated_data.get("email")
            first_name = serializer.validated_data.get("first_name")
            last_name = serializer.validated_data.get("last_name")
            phone = serializer.validated_data.get("phone")
            subject = serializer.validated_data.get("subject")
            description = serializer.validated_data.get("description")
            attachment = serializer.validated_data.get("attachment")
            serializer.save()
            ticket = ContactUs.objects.latest("ticket_id")
            ticket_id = ticket.ticket_id
            html_content = render_to_string(
                "contactformemail.html",
                {
                    "ticket_id": "#" + str(ticket_id),
                    "category": category,
                    "first_name": first_name,
                    "last_name": last_name,
                    "email": email,
                    "phone": phone,
                    "subject": subject,
                    "description": description,
                    "attachment": attachment,
                },
            )
            html_content1 = render_to_string(
                "contactforuser.html",
                {
                    "ticket_id": "#" + str(ticket_id),
                },
            )

            SendThreadMail.send_html_mail(
                self,
                "Someone has trying to contact us",
                html_content,
                ["info@cagtunepal.com"],
            settings.DEFAULT_FROM_EMAIL,
            )
            SendThreadMail.send_html_mail(
                self, "Thank You!", html_content1, [email], settings.EMAIL_HOST_USER
            )
            resp = {"status": "success", "message": "Form submitted successfully"}
            return Response(resp)
        else:
            resp = {"status": "failure", "message": serializer.errors}
            return Response(resp)


def get_contactus_object(id):
    try:
        return ContactUs.objects.get(id=id)
    except ContactUs.DoesNotExist:
        raise Http404


class ContactFormListAPIView(APIView, PageNumberPagination):
    """
    APIView class for saving user contacts

    .............
    Attributes
        page: int
        page_num: int

    Methods
        get_paginated_response(data, page, page_num)
            - returns json response (ordereddict)
        get_queryset(request)
            - gives queryset
        get(request)
            - return paginated response to the user
    """

    permission_classes = [AllStaffPermission]
    page_size = 10
    max_page_size = 1000

    def get_paginated_response(self, data, page, page_num):
        return Response(
            OrderedDict(
                [
                    ("count", self.page.paginator.count),
                    ("current", page),
                    ("next", self.get_next_link()),
                    ("previous", self.get_previous_link()),
                    ("page_size", page_num),
                    ("result", data),
                ]
            )
        )

    def get_queryset(self, request):
        contacts = ContactUs.objects.all()
        return self.paginate_queryset(contacts, self.request)

    def get(self, request):
        """
        Getting contact lists
        ----------------------------------------------------------------

        Parameters
        ----------------------------------------------------------------
            queryparams
                page: int
                page_size: int

        Returns
        ----------------------------------------------------------------
            json response: success or failure messages along with corresponding datas
        """
        page = self.request.GET.get("page", 1)
        page_size = self.request.GET.get("page_size", 1000)
        contacts = self.get_queryset(request)
        serializer = ContactsListSerializer(contacts, many=True)
        return self.get_paginated_response(serializer.data, page, page_size)


class ContactFormStatusChangeAPIView(APIView):
    """
    APIView class for changin user contacts

    ................
    Attributes
        request:
            status: str
        args
        kwargs:
            pk : int

    Methods
        patch(request, *args, **kwargs)
            changing user contacts status
    """

    permission_classes = [AllStaffPermission]
    parser_classes = (FormParser, MultiPartParser)

    @extend_schema(request=ContactFormStatusChangeSerializer)
    def patch(self, request, *args, **kwargs):
        """
        Changing user's contact status
        ----------------------------------------------------------------

        Parameters
        ----------------------------------------------------------------
            pathparameters
                id: int
            request: form_data
                status: str (choices= solved, unsolved)

        Returns
        ----------------------------------------------------------------
            json response: success or failure messages
        """
        contact_obj = get_contactus_object(id=self.kwargs.get("pk"))
        serializer = ContactFormStatusChangeSerializer(
            contact_obj, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            resp = {
                "status": "success",
                "message": "ContactForm status has been changed",
            }
            return Response(resp)
        else:
            resp = {"status": "failure", "message": serializer.errors}
            return Response(resp)


class ContactFormDeleteAPIView(APIView):
    """
    APIView class for deleting user's contact

    ..................
    Attributes
    -------------
        pk: int

    Methods
        get_object()
            - return contactus object
        delete(request, pk)
            - deletes contactus object
    """

    permission_classes = [AdminOnlyPermission | AllStaffPermission]

    def get_object(self, pk):
        try:
            return ContactUs.objects.get(id=pk)
        except ContactUs.DoesNotExist:
            raise Http404

    def delete(self, request, pk):
        """
        Deletes the user contact from the database
        """
        contact = self.get_object(pk)
        contact.delete()
        resp = {"status": "success", "message": "One Contact has been deleted"}
        return Response(resp)


class ContactFormMultipleDeleteAPIView(APIView):
    """
    API View class for deleting multiple contacts

    ..................
    Attributes
    -------------
        request
        args
        kwargs
            - [ id list ]

    Methods
        delete(request, *args, **kwargs)
            - deletes multiple contactus object
    """

    permission_classes = [AdminOnlyPermission | AllStaffPermission]

    def delete(self, request, *args, **kwargs):
        """
        Delete multiple contacts
        """
        query_param = self.request.query_param.get("id")  # "[1,2,3]"
        id_string = query_param[1:-1]  # "1,2,3"
        id_list = [int(x) for x in id_string.split(",")]  # [1,2,3]
        contacts = ContactUs.objects.filter(id__in=id_list)
        if not contacts:
            return Response(
                {"status": "failure", "message": "Please select valid contacts"},
                status=status.HTTP_404_NOT_FOUND,
            )
        contacts.delete()
        resp = {"status": "success", "message": "The contacts have been selected"}
        return Response(resp)


from apps.accountapp.api.v1.api import EmailThread


class SendMailToSubscibers(APIView):

    def post(self, request):
        """
        Sending email to the subscrbers
        ----------------------------------------------------------------

        Returns
        ----------------------------------------------------------------
            json response: success or failure messages
        """
        html_content = render_to_string("newsletteremail.html", {})
        html_content1 = render_to_string("newsletteremail.html", {})
        subscribers = Newsletter.objects.all()
        for subscriber in subscribers:
            SendThreadMail.send_html_mail(
                self,
                "Cagtu Newsletter.",
                html_content,
                [subscriber.email],
                settings.EMAIL_HOST_USER,
            )
        SendThreadMail.send_html_mail(
            self,
            "Newsletter Send!",
            html_content,
            ["info@cagtunepal.com"],
            settings.EMAIL_HOST_USER,
        )
        return Response({"status": "success", "message": "Newsletter Mail Sent to all"})


class ReturnApplyAPIView(APIView):
    """
    APIView class for applying for return

    ................
    Attributes
        request
        order_id: int
        stock_id: int
        quantity: int

    Methods
        get_order(self, request, order_id, stock_id, quantity)
            getting order item to apply for return
        post(self, request)
            applying for return
    """

    permission_classes = [CustomerOnlyPermission]
    parser_classes = [MultiPartParser, FormParser]

    def get_order(self, order_id, stock_id, quantity, request):
        """
        Getting the ordered item to apply for return
        """
        try:
            orderobj = Order.objects.get(
                id=order_id, user=request.user, order_status="Received"
            )
            d = timedelta(days=7)
            if orderobj.delivered_date.timestamp() < (datetime.now() - d).timestamp():
                raise ValidationError(
                    {
                        "status": "failure",
                        "message": "You cannot apply for refund after 2 days of order being delivered.",
                    }
                )
            if orderobj.order_items.get(stock_id=stock_id).quantity < int(quantity):
                raise ValidationError(
                    {
                        "status": "failure",
                        "message": "The quantity you applied for return is greater than the quantity ordered.",
                    }
                )
            return orderobj.order_items.get(stock_id=stock_id)
        except Order.DoesNotExist:
            raise Http404

    @extend_schema(request=ReturnAPPlySerializer)
    def post(self, request):
        """
        Applying for return
        ----------------------------------------------------------------

        Request_body
        ----------------------------------------------------------------
            request: form_data
                order: int
                stock: int
                reason: string
                message: string
                attachment: string (filefield)
                quantity: int

        Returns
        ----------------------------------------------------------------
            json response: success or failure messages
        """
        serializer = ReturnAPPlySerializer(data=request.data)
        if serializer.is_valid():
            order_id = request.data["order"]
            stock_id = request.data["stock"]
            quantity = request.data["quantity"]
            try:
                return_obj = Refund.objects.get(
                    customer=request.user.customer, stock_id=stock_id, order=order_id
                )
                resp = {
                    "status": "failure",
                    "message": "You have already applied for return of this product.",
                }
            except:
                orderitems_obj = self.get_order(order_id, stock_id, quantity, request)
                item = Order.objects.get(id=order_id)
                item.order_status = "Refund Requested"
                item.save()
                domain = "localhost:3004"
                url = f"http://{domain}"
                html_content = render_to_string(
                    "return_mail.html",
                    {
                        "domain": url,
                        "email": request.user.email,
                        "token": password_reset_token.make_token(request.user),
                        "uid": urlsafe_base64_encode(
                            encoding.force_bytes(request.user.pk)
                        ),
                        "user": request.user,
                    },
                )
                email_subject = "Return Application Received"
                SendThreadMail.send_html_mail(
                    self,
                    email_subject,
                    html_content,
                    [request.user.email],
                    settings.EMAIL_HOST_USER,
                )
                serializer.save(customer=request.user.customer)
                resp = {
                    "status": "success",
                    "message": "Successfully applied for Return.",
                }

                return Response(resp)
        else:
            resp = {"status": "failure", "message": serializer.errors}
        return Response(resp)


class ReturnApplyList(generics.ListAPIView):
    """
    Generic APIView class for returning list of the applied returns
    ----------------------------------------------------------------

    Parameters
    ----------------------------------------------------------------
        queryparams
            page: int
            page_size: int

    Returns:
        json response: list of applied returns
    """

    serializer_class = ReturnAPPlyListSerializer
    queryset = Refund.objects.all()
    permission_classes = [AllStaffPermission]


class SendCustomMailAPIView(APIView):
    permission_classes = [AllStaffPermission]
    """
    APIView Class for sending custom mail

    Args:
        request: json_body
            {
                recipients: str,
                subject: str,
                body: str,
            }

    Methods:
        post(request)
            sending custom mail to the user
    """

    @extend_schema(request=SendCustomMailSerializer)
    def post(self, request):
        """
        Sending custom mail to the user
        ----------------------------------------------------------------

        Request_body
        ----------------------------------------------------------------
            request (json):
                {
                    recipients: str,
                    subject: str,
                    body: str,
                }

        Returns
        ----------------------------------------------------------------
            json response: sucess or failure messages
        """
        serializer = SendCustomMailSerializer(data=request.data)
        if serializer.is_valid():
            recipients = serializer.validated_data.get("recipients")
            subject = serializer.validated_data.get("subject")
            body = serializer.validated_data.get("body")
            html_content = render_to_string(
                "sendcustommail.html", {"email": recipients, "body": body}
            )
            email_subject = "Activate your account"
            SendThreadMail.send_html_mail(
                self, subject, html_content, [recipients], settings.EMAIL_HOST_USER
            )
        return Response({"status": "success", "message": "Mail Sent"})


class QuestionGenericCreateAPIView(generics.CreateAPIView):
    """
    Generic API View for asking questions
    ----------------------------------------------------------------

    Available to the logged in user (Customer Only)
    """

    permission_classes = [CustomerOnlyPermission]
    serializer_class = QuestionnaireSerializer
    queryset = Questionnaire.objects.all()

    def create(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer.save(enquirer=self.request.user))
        return Response(
            {
                "status": "success",
                "message": "question was created successfully",
            },
            status=status.HTTP_201_CREATED,
        )

    # def perform_create(self, serializer):
    #     return super().perform_create(serializer.save(enquirer=self.request.user))


class AnswerGenericAPIView(generics.UpdateAPIView):
    """
    Update API view class for adding answer by staff or merchant
    ----------------------------------------------------------------

    Available to Mechant and Staff
    """

    permission_classes = [MerchantAndStaffPermission]
    serializer_class = AnswerSerializer
    lookup_field = "question_id"

    def get_queryset(self):
        id = self.kwargs.get("question_id")
        question_object = get_object_or_404(Questionnaire, id=id)
        return question_object

    def update(self, request, *args, **kwargs):
        """
        For updating/answering a question
        ----------------------------------

        Must be staff or merchant to answer
        """
        instance = self.get_queryset()
        id = self.kwargs.get("question_id")
        store_name = get_store_name(request, id=id)
        if store_name is not None:
            serializer = self.serializer_class(instance, data=request.data)
            if serializer.is_valid():
                serializer.save(store_name=store_name)
                return Response(
                    {
                        "status": "success",
                        "message": "answer added successfully",
                    },
                    status=status.HTTP_200_OK,
                )
        else:
            return Response(
                {
                    "status": "failed",
                    "message": "You are not allowed to answer this question.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )


class QuestionnaireDestroyAPIView(generics.DestroyAPIView):
    """
    DestroyAPIView for deleting a Questionnaire
    """

    permission_classes = [AllStaffPermission]
    lookup_field = "id"

    def get_queryset(self):
        id = self.kwargs.get("id")
        question_object = get_object_or_404(Questionnaire, id=id)
        return question_object

    def delete(self, request, *args, **kwargs):
        """
        Deleting a Questionnaire
        """
        instance = self.get_queryset()
        instance.delete()
        return Response(
            {
                "status": "success",
                "message": "question deleted successfully",
            },
            status=status.HTTP_200_OK,
        )


class CMSQuestionGenericListAPIView(generics.ListAPIView):
    permission_classes = [MerchantAndStaffPermission]
    serializer_class = QuestionsOnlySerializer
    lookup_url_kwarg = "product_id"

    def get_queryset(self):
        product_id = self.kwargs.get("product_id")
        product_obj = get_object_or_404(Product, id=product_id)
        questions_objects = Questionnaire.objects.filter(product=product_obj).order_by(
            "id"
        )
        return questions_objects


class QuestionnaireGenericListAPIView(generics.ListAPIView):
    serializer_class = QuestionnaireListSerializer
    queryset = Questionnaire.objects.all()


class QuestionnaireProductListAPIView(generics.ListAPIView):
    serializer_class = QuestionnaireListSerializer
    lookup_url_kwarg = "product_id"

    def get_queryset(self):
        product_id = self.kwargs.get("product_id")
        product_obj = get_object_or_404(Product, id=product_id)
        questions_objects = Questionnaire.objects.filter(product=product_obj).order_by(
            "id"
        )
        return questions_objects
