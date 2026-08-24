import * as Yup from 'yup';
import { passwordValidate } from '../util/helper';

export const changePasswordSchema = Yup.object().shape({
    old_password: passwordValidate,
    new_password1: passwordValidate,
    new_password2: Yup.string()
        .when('new_password1', {
            is: (val: string) => (val && val.length > 0 ? true : false),
            then: Yup.string().oneOf([Yup.ref('new_password1')], 'Password must match'),
        })
        .required('Required field'),
});
