from django.core.management import BaseCommand
from django.contrib.auth import get_user_model

# from apps.accountapp.models import Staff

User = get_user_model()


class Command(BaseCommand):
    """Django commands to  create a superuser."""

    def handle(self, *args, **options):
        user = User.objects.filter(username='test').first()
        if not user:
            user = User.objects.create_superuser(
                username='test',
                email='test@test.com',
                is_superuser=True,
                is_staff=True,
                password='Cagtu@1234',
                is_verified=True,
                is_email_verified=True,
                is_active=True,
            )
            user.set_password("Cagtu@1234")
            user.save()
        print(user)

        # staff, create = Staff.objects.get_or_create(
        #     user__username='admin',
        #     defaults={'user': user, 'phone': '+977980980989', 'role': 'admin'}
        # )
        # print(
        #     {'user': user.username, 'role': staff.role}
        # )
