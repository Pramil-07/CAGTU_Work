from datetime import timezone

from django.db import models


class ErrorLog(models.Model):
    """
    Model to log detailed information about errors that occur in the application.
    This is useful for tracking and debugging issues during development.
    """

    timestamp = models.DateTimeField(
        auto_now=True, help_text="The date and time when the error occurred."
    )
    error_type = models.CharField(
        max_length=255,
        help_text="The type or class of the exception (e.g., ValueError, TypeError).",
    )
    message = models.TextField(
        help_text="The detailed error message associated with the exception."
    )
    stack_trace = models.TextField(
        blank=True,
        null=True,
        help_text="The full stack trace, providing context for the error.",
    )
    request_path = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="The URL path of the request that triggered the error.",
    )

    class Meta:
        ordering = ["-timestamp"]
        verbose_name = "Error Log"
        verbose_name_plural = "Error Logs"

    def __str__(self):
        """
        Returns a human-readable string representation of the error log.
        """
        return f"[{self.timestamp.strftime('%Y-%m-%d %H:%M:%S')}] {self.error_type} on {self.request_path}"
