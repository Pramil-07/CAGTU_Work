from rest_framework import serializers
from rest_framework.response import Response

from apps.productapp.models import *


def create_product_mobile(request, product_datas, image_data, added_by):
    """
    For creating a product object and returns product objects
    """
    count = 0
    product_objects_list = []
    
    for product in product_datas:
        product_objects = {}  
        image_url = [image_data[count]]
        count += 1
        
        try:
            if product["Is_Active"] is None:
                is_active = True
            elif product["Is_Active"] == "Yes":
                is_active = True
            else:
                is_active = False
                
            if product["Brand"] is None:
                product_brand_instance = Brand.objects.get(name__exact="No brand")
            else:
                product_brand_instance = Brand.objects.get(name__exact=product["Brand"])
                
                if not product_brand_instance:
                    print("Brand not found")
                    raise serializers.ValidationError("Brand not found")

            category_instance = Category.objects.get(id=product["Category"])
            if not category_instance:
                print("category not found")
                raise serializers.ValidationError("Category not found")
            try:
                product_obj = Product.objects.create(
                    is_active=is_active,
                    name=product["Name"],
                    model_no=product["Model_no"],
                    thumbnail_image=image_url,
                    video_url=product["Video_url"],
                    product_status=product["Product_status"],
                    description=product["Description"],
                    warranty_type=product["Warranty_type"],
                    warranty_period=product["Warranty_period"],
                    notes=product["Notes"],
                    meta_title=product["Meta_title"],
                    meta_description=product["Meta_description"],
                    meta_keyword=product["Meta_keyword"],
                    brand=product_brand_instance,
                    category=category_instance,
                    added_by=added_by,
                    user=request.user,
                    type="product",
                    status="Pending",   
                )
                
                key_name = product["Product Number"]
                product_objects[key_name] = product_obj
                product_objects_list.append(product_objects)

                try:
                    screen_size_obj = Attribute.objects.get(name__exact="Screen_size")
                    screen_type_obj = Attribute.objects.get(name__exact="Screen_type")
                    processor_obj = Attribute.objects.get(name__exact="Processor")
                    camera_front_obj = Attribute.objects.get(name__exact="Camera_front")
                    camera_back_obj = Attribute.objects.get(name__exact="Camera_back")
                except Exception as e:
                    print("Exception ", e)
                    
                Product_Attribute.objects.create(
                    attribute=screen_size_obj,
                    product=product_obj,
                    value=product["Screen_size"],
                )
                Product_Attribute.objects.create(
                    attribute=screen_type_obj,
                    product=product_obj,
                    value=product["Screen_type"],
                )
                Product_Attribute.objects.create(
                    attribute=processor_obj,
                    product=product_obj,
                    value=product["Processor"],
                )
                Product_Attribute.objects.create(
                    attribute=camera_front_obj,
                    product=product_obj,
                    value=product["Camera_front"],
                )
                Product_Attribute.objects.create(
                    attribute=camera_back_obj,
                    product=product_obj,
                    value=product["Camera_back"],
                )
            except  Exception as e:
                print("Exception", e)

        except Exception as e:
            return Response({
                "status": "failed",
                "message":f"Error {e}"
            })
            
    return product_objects_list   


def create_mobile_stock(data, stock_image_data, stock_data):
    """
    for creation of multiple stocks for corresponding products
    """
    count = 0
    try:
        for stock in stock_data:
            stock_image_url = [stock_image_data[count]]
            count+=1
            
            if stock["Is_default"] is None:
                is_default = False
            elif stock["Is_default"] == "Yes":
                is_default = True
            else:
                is_default = False
                
            if stock["Availability"] is None:
                availability = False
            elif stock["Availability"] == "Yes":
                availability = True
            else:
                availability = False
            
            product_number = stock["Product_code"]
            index = int(product_number) - 1 
            stock_obj = Stock.objects.create(
                    mrp=stock["MRP"],
                    price=stock["Price"],
                    color=stock["Color"],
                    availability=availability,
                    size_unit=stock["Size_unit"],
                    size=stock["Size"],
                    quantity=stock["Quantity"],
                    image=stock_image_url,
                    is_default=is_default,
                    product=data[index][product_number],
                )
            
            ram_obj = StockAttribute.objects.get(name__exact="RAM")
            rom_obj = StockAttribute.objects.get(name__exact="ROM")

            Stock_StockAttribute.objects.create(
                attribute=ram_obj,
                stock=stock_obj,
                value=stock["RAM"]
            )
            Stock_StockAttribute.objects.create(
                attribute=rom_obj,
                stock=stock_obj,
                value=stock["ROM"]
            )
    except Exception as e:
        print("Exception", e)