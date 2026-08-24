ORDER_CHOICES = (
    ('None','None'),
    ('Ordered', 'Ordered'),
    ('Accepted', 'Accepted'),
    ('Being Delivered', 'Being Delivered'),
    ('Cancelled', 'Cancelled'),
    ('Received', 'Received'),
    ('Refund Requested', 'Refund Requested'),
    ('Refund Granted', 'Refund Granted'),)


ORDER_STATUS_CHOICES = (
    ("pending", "Pending"),
    ("accepted", "Accepted"),
    ("processing", "Processing"),
    ("shipped", "Shipped"),
    ("delivered", "Delivered"),
    ("cancelled", "Cancelled"),
    ("refund_requested", "Refund Requested"),
    ("refund_approved", "Refund Approved"),
    ("refund_denied", "Refund Denied"),
    ("refund_completed", "Refund Completed"),
)
