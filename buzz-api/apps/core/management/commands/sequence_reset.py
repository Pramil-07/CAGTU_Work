from django.core.management import BaseCommand
from django.contrib.auth import get_user_model
from django.core.management.color import no_style
from django.db import connection
from django.contrib.contenttypes.models import ContentType
import django.apps

User = get_user_model()


class Command(BaseCommand):
    # def add_arguments(self, parser):
    #     parser.add_argument('app_label', type=str, help='adds the app name, eg: task')
    #     parser.add_argument('model', type=str, help='adds the model name, eg: service')

    @staticmethod
    def sequence_reset(model: list):
        sequence_sql = connection.ops.sequence_reset_sql(no_style(), model)
        with connection.cursor() as cursor:
            for sql in sequence_sql:
                cursor.execute(sql)

    def handle(self, *args, **options):
        # app_label = options.get('app_label')
        # model = options.get('model')
        # if app_label:
        #     ct = ContentType.objects.get(app_label=app_label, model=model)
        #     self.sequence_reset(ct.model_class())
        #     print(f'{model.capitalize()} sequence has been reset.')
        # else:
        self.sequence_reset(django.apps.apps.get_models())
        print('All models sequence has been reset.')


