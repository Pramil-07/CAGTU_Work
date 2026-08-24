import * as Yup from 'yup';

export const loginSchema = Yup.object().shape({
    username: Yup.string().min(3, 'Invalid username').required('Required field'),
    password: Yup.string().required('Required field'),
});

export const buzzLoginSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Required field'),
    password: Yup.string().required('Required field'),
});
