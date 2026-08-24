import * as Yup from 'yup';
import { emailValidate, stringValidate, urlValidate, validateExistingSingleFile, validateLargeImageFile } from '../../util/helper';
import { stringReqOnly } from '../../util/helper';

export const successStoriesSchema = Yup.object().shape({
    full_name: stringValidate,
    email: emailValidate,
    specialities: stringValidate,
    content: Yup.string().min(300, 'Story description must be more than 300 characters').required('Required field'),
    profile_image: validateExistingSingleFile('profilePreviewUrl'),
});

export const trustedPartnersSchema = Yup.object().shape({
    alt_text: stringValidate,
    redirect_url: urlValidate.required('Required field'),
    logo: validateExistingSingleFile('profilePreviewUrl'),
});

export const endorsementSchema = Yup.object().shape(
    {
        title: stringValidate,
        url: urlValidate.required('Required field'),
        // description: stringValidate.notRequired().nullable(true),
        image: validateExistingSingleFile('profilePreviewUrl'),
        // categories: Yup.array().of(stringValidate).min(1, 'Required field').required('Required field'),
        categories: Yup.array()
            .when(['services'], {
                is: (services: string[]) => services && services.length < 1,
                then: Yup.array().min(1, 'Categories or service required field').nullable(true),
            })
            .nullable(true),
        services: Yup.array()
            .when(['categories'], {
                is: (categories: number[]) => categories && categories.length < 1,
                then: Yup.array().min(1, 'Service or categories required field').nullable(true),
            })
            .nullable(true),
    },
    [['categories', 'services']]
);

export const advertisementSchema = Yup.object().shape({
    title: stringValidate,
    content: stringValidate,
    source: stringReqOnly,
    type: stringReqOnly,
    // web_shape: stringReqOnly.nullable(),
    // mobile_shape: stringReqOnly.nullable(),
    behaviour: stringReqOnly,
    redirect_url: urlValidate.required('Required field'),
    page_url: stringReqOnly,
    image: validateLargeImageFile('profilePreviewUrl'),
});
