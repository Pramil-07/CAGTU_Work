from django.contrib.auth.models import User
from rest_framework.response import Response


class HookResponse:
    """
    Response for webhook for corresponding user
    get_hook(username) : for returning the hook of the corresponding user
    create_hook(username): for creating hook for the corresponding user
    """

    def get_hook_by_username(username):
        user = User.objects.get(username__iexact=username)
        return {
            "user": user,
            "event": "notification.added",
            "target": "http://0.0.0.0:8010/api/v1/webhook/",
            "status": "mock_hook"
        }
        return hook  # notification.added => http://0.0.0.0:8010/api/v1/webhook/

    def get_hook_by_id(id):
        user = User.objects.get(id=id)
        return {
            "user": user,
            "event": "notification.added",
            "target": "http://0.0.0.0:8010/api/v1/webhook/",
            "status": "mock_hook"
        }

    def create_hook(username):
        try:
            user = User.objects.get(username__iexact=username)

            return CustomResponse.successful(message="User hook created successfully.")
        except Exception as e:
            return CustomResponse.failed(message=f"Exception: {e}")


class CustomResponse:
    """
    Getting custom responses
    """

    def successful(message):
        return Response(
            {
                "status": "success",  # "status" : status.HTTP_200_OK,
                "message": message,
            }
        )

    def not_found(obj_name):
        return Response(
            {
                "status": "failure",  # "status" : status.HTTP_404_NOT_FOUND,
                "message": f"{obj_name} not found",
            }
        )

    def failed(message):
        return Response({"status": "failure", "message": message})

    def success_data(data):
        return Response({"status": "success", "data": data})
