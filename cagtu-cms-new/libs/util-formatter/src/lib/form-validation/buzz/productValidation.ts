import * as Yup from 'yup';
import { stringNotReqValidate, stringReqOnly, stringValidate, urlValidate } from '../../util/helper';

export const productSchema = Yup.object().shape({
    name: Yup.string().min(15, 'Product name must be 15 character').required('Required field'),
    brand: Yup.string().when('no_brand', {
        is: false,
        then: stringReqOnly.nullable(),
    }),
    description: Yup.string().min(12, 'Required field').required('Required field'),
    category: stringReqOnly.nullable(),
    thumbnail_image: Yup.array().length(1, 'Required Field'),
    model_no: stringValidate,
    video_url: urlValidate,
    product_status: stringReqOnly.nullable(),
    warranty_type: stringReqOnly,
    warranty_period: Yup.string().when('warranty_type', {
        is: 'No Warranty',
        then: stringReqOnly.notRequired(),
        otherwise: stringReqOnly,
    }),
    meta_discription: stringValidate,
    notes: stringNotReqValidate,
    meta_keyword: stringValidate,
});
