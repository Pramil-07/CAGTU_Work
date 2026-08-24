import * as Yup from 'yup';
import { emailValidate, passwordValidate, phoneValidate, stringValidate } from '../../util/helper';

export const usersSchema = Yup.object().shape(
    {
        // username: stringValidate,
        first_name: stringValidate,
        middle_name: stringValidate.notRequired().nullable(true),
        last_name: stringValidate,
        email: Yup.string()
            .when(['phone'], {
                is: (phone: string) => !phone,
                then: emailValidate.nullable(true),
            })
            .nullable(true),
        phone: Yup.string()
            .when(['email'], {
                is: (reward_points: string) => !reward_points,
                then: phoneValidate.nullable(true),
            })
            .nullable(true),
    },
    [['email', 'phone']]
);

export const userPasswordSchema = usersSchema.shape({
    password: passwordValidate,
});
