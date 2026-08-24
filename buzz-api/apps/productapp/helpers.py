def modify_input_for_multiple_files(product_id,image):
    dict = {}
    dict['products']=product_id
    dict['image'] = image
    return dict

def modify_input_for_multiple_color(hex_code,*image):
    dict = {}
    dict['hex_code'] = hex_code
    dict['image'] = image
    return dict