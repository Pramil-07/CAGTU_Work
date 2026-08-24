from datetime import datetime, timedelta
from django.utils import timezone


def filter_orders_by_period(queryset, period='daily'):
    """
    Filter orders based on the period.
    period: 'daily', 'weekly', 'monthly'
    """
    now = timezone.now()

    if period == 'daily':
        start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
    elif period == 'weekly':
        start_date = now - timedelta(days=now.weekday())
        start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
    elif period == 'monthly':
        start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    else:
        raise ValueError("Invalid period. Use 'daily', 'weekly', or 'monthly'.")

    return queryset.filter(created_at__gte=start_date)
