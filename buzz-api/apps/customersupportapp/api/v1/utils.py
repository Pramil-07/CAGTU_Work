from django.core.exceptions import ObjectDoesNotExist
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework import status
from django.db.models import Count


from apps.accountapp.models import Merchant
from apps.productapp.models import Product
from apps.customersupportapp.models import Questionnaire


def get_store_name(request,id):
    try:
        product_objects = Questionnaire.objects.filter(id=id).annotate(ques_count=Count('id', distinct=True)).values("product")
        print("product objects", product_objects)
        product_user = Product.objects.filter(id__in=product_objects).annotate(user_count=Count('id', distinct=True)).values("user")
        print("product_user",product_user)
        print("bool", request.user.id in product_user)
        print("id", request.user.id)
        print("product user", product_user[0]['user'])
        try:
            if request.user.id==product_user[0]['user']:
                return request.user
               
            else:
                return None
        except Exception as e:
            print("Exception", e)
    except Exception as e:
        print("Exception", e)

      
 # try:
                #     merchant_obj = get_object_or_404(Merchant, user=request.user)   
                #     store_name = merchant_obj.merchant_name
                #     return request.user
                # except ObjectDoesNotExist:
                #     try:
                #         staff_obj = get_object_or_404(Staff, user=request.user)
                #         store_name = "BUZZ Mall"
                #     except Exception as e:
                #         return Response(
                #             {
                #                 "status": "failure",
                #                 "message": f"Error {e}"
                #             },
                #             status = status.HTTP_404_NOT_FOUND
                #         )