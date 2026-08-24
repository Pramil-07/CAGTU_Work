import * as Yup from 'yup';
import {
    confirmPasswordValidate,
    dateValidate,
    emailValidate,
    passwordValidate,
    phoneValidate,
    imageUploadValidate,
    stringReqOnly,
    stringValidate,
    urlValidate,
} from '../util/helper';

export const createUserSchema = Yup.object().shape({
    first_name: stringValidate,
    last_name: stringValidate,
    username: stringValidate,
    email: emailValidate,
    contact_number: phoneValidate,
    address: stringValidate,
    dob: dateValidate,
    employeeType: stringReqOnly,
    facebook_URL: urlValidate,
    linkedin_URL: urlValidate,
    twitter_URL: urlValidate,
    profile_image: imageUploadValidate,
});

export const createUserPasswordSchema = createUserSchema.shape({
    password: passwordValidate,
    confirm_password: confirmPasswordValidate,
});
