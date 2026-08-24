from rest_framework.generics import CreateAPIView
from drf_spectacular.utils import extend_schema
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import update_last_login
from rest_framework.permissions import AllowAny

from rest_framework.response import Response

from apps.accountapp.api.v1.serializers import CustomerRegistrationSerializer, UserLoginSerializer, \
    UserPasswordChangeSerializer
from apps.core.permissions import CustomerOnlyPermission

User = get_user_model()


@extend_schema(tags=['customer'])
class CustomerRegistrationAPIView(CreateAPIView):
    serializer_class = CustomerRegistrationSerializer
    permission_classes = (AllowAny,)


@extend_schema(tags=['customer'])
class CustomerLoginAPIView(CreateAPIView):
    serializer_class = UserLoginSerializer
    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        """
        **Customer Login**
        ----------------------------------------------------------------------------------------------------------------------

        Parameters:
        ---------------
            json_data:
                Request_body
                {
                    email : string
                    password : string
                }

        Returns:
        -----------------------------------------------------------------------------------------------------------------------
        json_data : Success or Failure Messages
        """
        serializer: UserLoginSerializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data.pop("user")
        refresh = RefreshToken.for_user(user)
        headers = self.get_success_headers(serializer.data)
        update_last_login(user, user)
        return Response({
            **serializer.data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, 200, headers=headers)


