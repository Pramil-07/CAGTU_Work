import * as Yup from 'yup';
import { phoneValidate, imageUploadValidate, stringReqOnly, stringValidate, urlValidate } from '../util/helper';

export const careerProfileSchema = Yup.object().shape({
    first_name: stringValidate,
    last_name: stringValidate,
    contact_number: phoneValidate,
    address: stringValidate,
    dob: Yup.date().nullable().notRequired(),
    facebook_URL: urlValidate,
    linkedin_URL: urlValidate,
    twitter_URL: urlValidate,
    profile_image: imageUploadValidate,
});

export const profileSchema = careerProfileSchema.shape({
    employeeType: stringReqOnly,
});
