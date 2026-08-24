from abc import ABC, abstractmethod
import boto3
import json

from django.conf import settings

__all__ = [
    'BaseSMSClient',
    'AwsClient',
]


class BaseSMSClient(ABC):
    def __init__(self):
        pass

    @abstractmethod
    def send_sms(self, phone_number: str, message: str):
        pass


class AwsClient(BaseSMSClient):
    def __init__(self):
        super().__init__()
        self.__key = settings.AWS_SNS_KEY
        self.__secret = settings.AWS_SNS_SECRET
        self.__region = settings.AWS_SNS_REGION
        self.__client = boto3.client(
            'sns',
            region_name=settings.AWS_SNS_REGION,
            aws_access_key_id=settings.AWS_SNS_KEY,
            aws_secret_access_key=settings.AWS_SNS_SECRET,
        )

    def send_sms(self, phone_number: str, message: str, message_type='Transactional'):
        """
        message_type: promotional / transactional

        must be one of: TopicArn, TargetArn,
        PhoneNumber, Message, Subject, MessageStructure,
        MessageAttributes, MessageDeduplicationId, MessageGroupId
        """
        response = self.__client.publish(
            PhoneNumber=phone_number,
            Message=message,

            MessageGroupId='CagtuOTP',

        )
        print(json.dumps(response, indent=2))
