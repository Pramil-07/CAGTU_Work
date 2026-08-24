from rest_framework.response import Response


class CustomResponse:
    @staticmethod
    def created(message):
        return Response(
            {
                "status": "success",  # "status" : "status.HTTP_201_CREATED",
                "message": message,
            }
        )

    @staticmethod
    def successful(message):
        return Response(
            {
                "status": "success",  # "status" : status.HTTP_200_OK,
                "message": message,
            }
        )

    @staticmethod
    def accepted(message):
        return Response(
            {
                "status": "success",  # "status" : status.HTTP_202_ACCEPTED,
                "message": message,
            }
        )

    @staticmethod
    def not_found(obj_name):
        return Response(
            {
                "status": "failure",  # "status" : status.HTTP_404_NOT_FOUND,
                "message": f"{obj_name} not found",
            }
        )

    @staticmethod
    def failed(message):
        return Response({"status": "failure", "message": message})

    @staticmethod
    def success_data(data):
        return Response({"status": "success", "data": data})
