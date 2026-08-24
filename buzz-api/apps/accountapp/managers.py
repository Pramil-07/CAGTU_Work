from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import Group


class UserManager(BaseUserManager):
    use_in_migrations = True

    @classmethod
    def normalize_email(cls, email : dict | None) -> str | None:
        """
        Normalize the email address by lowercasing the domain part of it.
        """
        email = email or ''
        try:
            email_name, domain_part = email.strip().rsplit('@', 1)
        except ValueError:
            pass
        else:
            email = email_name + '@' + domain_part.lower()
        return email

    def _create_user(self, **kwargs: dict):
        """
        Creates and saves a User with the given credentials
        :param kwargs: extra keyword arguments if needed
        :return: a User instance is returned.
        """
        password = kwargs.pop('password', None)
        if not (kwargs.get('email') or kwargs.get('phone') or kwargs.get('username')):
            raise ValueError('None of email address, phone, or user is provided')
        if kwargs.get('email'):
            kwargs['email'] = self.normalize_email(kwargs['email'])
        user = self.model(**kwargs)
        user.set_password(password)
        user.save(using=self._db)
        user.groups.add(Group.objects.get_or_create(name='Tasker')[0])
        return user

    def create_user(self, **kwargs):
        kwargs.setdefault('is_superuser', False)
        return self._create_user(**kwargs)

    def create_superuser(self, username, password, **extra_fields):
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('is_staff', True)

        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        user = self._create_user(username=username, password=password, **extra_fields)
        user.groups.add(Group.objects.get_or_create(name='Superuser')[0])
        return user
