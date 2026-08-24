from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema
from firebase_admin.messaging import Message
from fcm_django.models import FCMDevice

from apps.core.permissions import CustomerOnlyPermission

from .serializers import NotificationCreateSerializer
from apps.notifications.models import Notification
from apps.notifications.utils import HookResponse, CustomResponse


class NotificationCreateAPIView(APIView):
    """
    api for creating notifications
    """
    serializer_class = NotificationCreateSerializer
    permission_classes = [CustomerOnlyPermission]  # this permission for test purpose

    @extend_schema(summary="Creating notification",tags=["Notification"])
    def post(self, request):
        """
        Notification Crate API is used to create notifications
        -----------------------------------------------------------

       Parameter:
        ------------
            json_data {
                email :string
                actions_performed : string
                details : string
                }
        Returns:
        ------------------------------------------------------------
        JSON Response : Success or Failure Messages
    """
        HookResponse.get_hook_by_username(username=request.user)

        serializer = NotificationCreateSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            email = serializer.validated_data.get("email")
            actions_perfomed = serializer.validated_data.get("actions_performed")
            details = serializer.validated_data.get("details")
            notification_obj = Notification.objects.create(
                user=request.user,
                email=email,
                actions_performed=actions_perfomed,
                details=details,
            )
            notification_obj.save()
            return CustomResponse.successful(message="Notification created successfully.")


class WebhookReceivedAPIView(APIView):

    @extend_schema(summary="test for webhooks", tags=["Webhook-recieved-test"])
    def post(self, request):
        """
        Receiving webhooks
        ------------------------------
        """
        
        try:
            actions_performed = request.data["data"]["actions_performed"]
            details = request.data["data"]["details"]
            message_obj = Message(
                data={
                    "status": "success",
                    "body": details,
                    "title": actions_performed
                }
            )
            device = FCMDevice.objects.all().first()  # filter can be used to send to specific devices or user 
            device.send_message(message_obj)
            return CustomResponse.successful(message="Webhook received successfully.")
        
        except Exception as e:
            # print("Exception", e)
            return CustomResponse.failed(message=f"Exception: {e}")


class MessageAPIView(APIView):

    @extend_schema(tags=["Message - FCM"])
    def post(self,request):
        """ 
        Sending message using FCM if needed to be sent explicitly
        """
        message_obj = Message(
                data={
                    "status": "success",
                    "body": "fcm-django working",
                    "title": "order"
                }
            )
        device = FCMDevice.objects.all().first()
        device.send_message(message_obj)
        return CustomResponse.successful(message="sent notification")