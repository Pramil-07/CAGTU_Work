from django.core.exceptions import ObjectDoesNotExist, ValidationError
from rest_framework.response import Response
from apps.productapp.models import Brand, Category
from rest_framework import status


def validate_excel(request, product_datas):
    "For validating excel before adding products"
    count = 2
    try:
        for product in product_datas:
            count += 1
            
            if product["Category"] is None:
                return Response(
                            {
                            "status": "failure",
                            "message":f"Category not found at row {count}"
                            },
                            status=status.HTTP_404_NOT_FOUND
                        )
            else:
                try:
                    category_instance = Category.objects.get(id=product["Category"])
                    
                except ObjectDoesNotExist:
                    category_name = product["Category"]
                    return Response(
                            {
                            "status": "failure",
                            "message":f"{category_name} Category not found at row {count}"
                            },
                            status=status.HTTP_404_NOT_FOUND
                        )
            
            if product["Brand"] is None:
                    product_brand_instance = Brand.objects.get(name__exact="No brand")
            else:
                try:
                    product_brand_instance = Brand.objects.get(name__exact=product["Brand"])
                
                except Exception as e:
                    brand_name = product["Brand"]
                    return Response(
                            {
                            "status": "filure",
                            "message":f"{e} Please correct the name of the brand {brand_name} at row {count}"
                            },
                            status=status.HTTP_404_NOT_FOUND
                        )
            if product["Screen_size"] is None:
                return Response(
                            {
                            "status": "failure",
                            "message":f"Screen_size not found at row {count}"
                            },
                            status=status.HTTP_404_NOT_FOUND
                        )
            if product["Screen_type"] is None:
                return Response(
                            {
                            "status": "failure",
                            "message":f"Screen_type not found at row {count}"
                            },
                            status=status.HTTP_404_NOT_FOUND
                        )
            if product["Processor"] is None:
                return Response(
                            {
                            "status": "failure",
                            "message":f"Processor not found at row {count}"
                            },
                            status=status.HTTP_404_NOT_FOUND
                        )
            if product["Camera_front"] is None:
                return Response(
                            {
                            "status": "failure",
                            "message":f"Camera_front not found at row {count}"
                            },
                            status=status.HTTP_404_NOT_FOUND
                        )
            if product["Camera_back"] is None:
                return Response(
                            {
                            "status": "failure",
                            "message":f"Camera_back not found at row {count}"
                            },
                            status=status.HTTP_404_NOT_FOUND
                        )
    except Exception as e:
        print("Exception", e)
        
    return True

def validate_stock(stock_datas):
    """ 
    for validating stock data in excel sheet
    """
    count = 2
    
    for stock in stock_datas:
        count+=1
        if stock["RAM"] is None:
            return Response(
                        {
                        "status": "failure",
                        "message":f"RAM not found at row {count}"
                        },
                        status=status.HTTP_404_NOT_FOUND
                    )
        if stock["ROM"] is None:
            return Response(
                        {
                        "status": "failure",
                        "message":f"ROM not found at row {count}"
                        },
                        status=status.HTTP_404_NOT_FOUND
                    )
        if stock["Price"] is None:
            return Response(
                        {
                        "status": "failure",
                        "message":f"Price not found at row {count}"
                        },
                        status=status.HTTP_404_NOT_FOUND
                    )
        if stock["Color"] is None:
            return Response(
                        {
                        "status": "failure",
                        "message":f"Color not found at row {count}"
                        },
                        status=status.HTTP_404_NOT_FOUND
                    )
        if stock["Availability"] is None:
            return Response(
                        {
                        "status": "failure",
                        "message":f"Availability not found at row {count}"
                        },
                        status=status.HTTP_404_NOT_FOUND
                    )
        if stock["Size_unit"] is None:
            return Response(
                        {
                        "status": "failure",
                        "message":f"Size_unit not found at row {count}"
                        },
                        status=status.HTTP_404_NOT_FOUND
                    )
        if stock["Size"] is None:
            return Response(
                        {
                        "status": "failure",
                        "message":f"Size not found at row {count}"
                        },
                        status=status.HTTP_404_NOT_FOUND
                    )
        if stock["Quantity"] is None:
            return Response(
                        {
                        "status": "failure",
                        "message":f"Quantity not found at row {count}"
                        },
                        status=status.HTTP_404_NOT_FOUND
                    )
        return True