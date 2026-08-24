import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user(db):
    User = get_user_model()
    return User.objects.create_user(username='testuser', email='test@example.com', password='password')


@pytest.fixture
def auth_client(api_client, user):
    api_client.force_authenticate(user=user)
    return api_client


@pytest.fixture
def order(db, user):
    from apps.checkoutapp.models import Order

    order = Order.objects.create(user=user)
    # default values can be adjusted by individual tests
    return order


@pytest.fixture(autouse=True)
def enable_eager_celery(settings):
    # Run Celery tasks synchronously during tests
    settings.CELERY_TASK_ALWAYS_EAGER = True
    settings.CELERY_TASK_EAGER_PROPAGATES = True
    return settings
