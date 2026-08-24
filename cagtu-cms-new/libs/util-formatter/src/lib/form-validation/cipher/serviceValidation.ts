import * as Yup from 'yup';
import { stringReqOnly, stringValidate } from '../../util/helper';

export const serviceSchema = Yup.object().shape({
    title: stringValidate.min(2, 'Must be 2 characters or more'),
    category: stringReqOnly.nullable(),
    meta_description: stringValidate.notRequired().nullable(true),
    meta_keyword: stringValidate.notRequired().nullable(true),
    images: Yup.array().max(5, 'Cannot upload more than 5 images'),
    videos: Yup.array().max(2, 'Cannot upload more than 2 videos'),
});
