""""
The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('buzz/', include('buzz.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from apps.customersupportapp.api.v1.api import *

urlpatterns = (
    path("newsletter/subscribe/", NewsLetterSubscribeAPIView.as_view(), name="newslettersubscribeapi"),
    # path("newsletter/subscribtions/list/", NewsLetterSubscriptionsListAPIView.as_view(), name="newslettersubscriptionslistapi"),
    path("newsletter/subscribtions/list/", NewsLetterSubscriptionsGenericsListAPIView.as_view(), name="newslettersubscriptionslistapi"),
    path("newsletter/unsubscribe/<email>/", NewsletterUnsubscribeAPIView.as_view(), name="newsletterunsubscribeapi"),

    path("feedback/create/", FeedbackCreateAPIView.as_view(), name="feedbackcreateapi"),
    path("feedback/list/", FeedbackListAPIView.as_view(), name="feedbacklistapi"),

    path("contact/form/", ContactFormAPIView.as_view(), name="contactformapi"),
    path("contact/form/list/", ContactFormListAPIView.as_view(), name="contactformlistapi"),
    path("contact/form/status/<int:pk>/change/", ContactFormStatusChangeAPIView.as_view(), name="contactformstatuschangeapi"),
    path("contact/form/<int:pk>/delete/", ContactFormDeleteAPIView.as_view(), name="contactformdeleteapi"),
    path("contact/form/multiple-delete/", ContactFormMultipleDeleteAPIView.as_view(), name="contactformmultipledeleteapi"),

    path("newsletter/send_all/", SendMailToSubscibers.as_view(), name="sendmailtosubscriberapi"),
    path("return/apply/", ReturnApplyAPIView.as_view(), name="returnapplyapi"),
    path("return/", ReturnApplyList.as_view(), name="returnapplylistapi"),
    path("send-mail/", SendCustomMailAPIView.as_view(), name="sendmailapi"),
    path("questionnaire/question/", QuestionGenericCreateAPIView.as_view(), name="questionnaire"),
    path("questionnaire/answer/<int:question_id>/", AnswerGenericAPIView.as_view(), name="answer"),
    path("questionnaire/delete/<int:id>/", QuestionnaireDestroyAPIView.as_view(), name="questionnairedelete"),
    path("questionnaire/questions/<int:product_id>/", CMSQuestionGenericListAPIView.as_view(), name="questionslist"),
    path("questionnaire/", QuestionnaireGenericListAPIView.as_view(), name="questionnairelist"),
    path("questionnaire/<int:product_id>/", QuestionnaireProductListAPIView.as_view(), name="questionnaireproductlist"),
)

#   "total_pages": 2,
#   "count": 12,
#   "current": 1,
#   "next": "http://0.0.0.0:8011/api/v1/newsletter/subscribtions/list?page=2",
#   "previous": null,
#   "page_size": 1000,