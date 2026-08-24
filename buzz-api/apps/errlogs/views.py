import traceback
from django.http import HttpRequest, HttpResponse
from .models import ErrorLog


def simulate_and_log_error(request):

    try:

        result = 10 / 0
        return HttpResponse(f"Result: {result}")
    except Exception as e:
        # Log the error to the database
        ErrorLog.objects.create(
            error_type=e.__class__.__name__,
            message=str(e),
            stack_trace=traceback.format_exc(),
            request_path=request.path,
        )
        return HttpResponse(
            "An error occurred and has been logged to the database.", status=500
        )


def trigger_error(request: HttpRequest) -> HttpResponse:

    # This variable is not defined, which will raise a NameError.

    return HttpResponse("This message will not be seen.")
