import traceback
from django.utils.deprecation import MiddlewareMixin
from apps.errlogs.models import ErrorLog

class ErrorLoggingMiddleware(MiddlewareMixin):
    """
    Middleware to catch unhandled exceptions and save them to the ErrorLog model,
    but avoids creating duplicate entries for the same error type/message/path.
    """

    def process_exception(self, request, exception):
        error_type = type(exception).__name__
        message = str(exception)
        request_path = request.path

        # Check if this error already exists in the database
        exists = ErrorLog.objects.filter(
            error_type=error_type,
            message=message,
            request_path=request_path
        ).exists()

        if not exists:
            stack_trace = "".join(traceback.format_exception(type(exception), exception, exception.__traceback__))
            ErrorLog.objects.create(
                error_type=error_type,
                message=message,
                stack_trace=stack_trace,
                request_path=request_path,
            )

        return None
