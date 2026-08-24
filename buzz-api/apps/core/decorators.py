import datetime
from django.contrib.auth import get_user_model

User = get_user_model()

# def is_user_suspended(func):
#     def inner(self, *args, **kwargs):
#         if UserSuspension.objects.filter(user=self.request.user, to_date__gt=datetime.datetime.now()).exists():
#             raise PermissionDenied({
#                 'status': 'failure',
#                 'message': 'Your account is suspended and restricted to perform this action.'
#             })
#         else:
#             return func(self, *args, *kwargs)
#
#     return inner