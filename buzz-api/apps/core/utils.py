from django.utils.crypto import get_random_string
import random
import string
import threading
from django.core.mail import EmailMessage, send_mass_mail, get_connection
from datetime import datetime
import fnmatch
from apps.activity.models import Activity
import re

class EmailThread(threading.Thread):
    def __init__(self, subject, html_content, recipient_list, sender):
        self.subject = subject
        self.recipient_list = recipient_list
        self.html_content = html_content
        self.sender = sender
        threading.Thread.__init__(self)

    def run(self):
        msg = EmailMessage(self.subject, self.html_content, self.sender, self.recipient_list)
        msg.content_subtype = 'html'
        msg.send()


class SendThreadMail():
    def send_html_mail(self, subject, html_content, recipient_list, sender):
        EmailThread(subject, html_content, recipient_list, sender).start()


def random_string_generator(size=10,
                            chars=string.ascii_lowercase + string.digits):
    return ''.join(random.choice(chars) for _ in range(size))


def create_activity(actor_content_type, actor_object_id, action_content_type,
                    action_object_id, action):
    return Activity.objects.create(
        actor_content_type=actor_content_type, actor_object_id=actor_object_id,
        action_content_type=action_content_type, action_object_id=action_object_id,
        action=action
    )


def generate_otp(length=6):
    return ''.join(random.choices("1234567890", k=length))


def unique_slug(instance, slug):
    model = instance.__class__
    unique_slug = slug
    while model.objects.filter(slug=unique_slug).exists():
        unique_slug = slug + get_random_string(length=4)

    return unique_slug


def unique_update_slugify(instance, created, slug):
    model = instance.__class__
    # if created:
    return f'{slug}-{int(datetime.now().timestamp())}'
    # else:
    #     while model.objects.filter(slug=unique_slug).exclude(id=instance.id).exists():
    #         unique_slug = slug + "-" + get_random_string(length=4)
    # return unique_slug

def generate_random_password(min_length=8, max_length=12) -> str:
    # Define the character set for the password
    char_set: str = string.ascii_uppercase + string.ascii_lowercase + string.digits + string.punctuation
    # Generate a random password length between min_length and max_length
    password_length: int = random.randint(min_length, max_length)
    password: list = [random.choice(string.ascii_uppercase), random.choice(string.ascii_lowercase),
                      random.choice(string.digits), random.choice(string.punctuation)]
    password += [random.choice(char_set) for _ in range(password_length - 4)]
    random.shuffle(password)
    return ''.join(password)

def get_matched_items(items: list, key: str) -> list:
    return [item for item in items if fnmatch.fnmatch(item, key)]