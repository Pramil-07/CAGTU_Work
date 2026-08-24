import * as Yup from 'yup';
import { numberValidate, stringReqOnly, stringValidate } from '../util/helper';

export const createVacancySchema = Yup.object().shape({
    title: stringValidate,
    designation: stringReqOnly,
    description: Yup.string().min(12, 'Must be more than 1 word').required('Required field'),
    category: stringReqOnly,
    no_of_opening: numberValidate,
    experience: stringReqOnly,
    skills: Yup.array().of(stringValidate).min(1, 'Required field').required('Required field'),
    deadline: Yup.date().min(new Date(), 'Deadline must be greater than today.').required('Required field').nullable(),
    location: stringValidate,
    country: stringValidate,
    job_type: stringReqOnly,
    salary_range_first: numberValidate.notRequired(),
    salary_range_second: numberValidate.moreThan(Yup.ref('salary_range_first'), 'Must be more than previous range').notRequired(),
});

export default createVacancySchema;
