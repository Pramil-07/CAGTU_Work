import { CipherAPI, urls } from '@cagtu-cms/data-access';
import {
    BackButton,
    Button,
    CreatableInputField,
    DateField,
    ErrorAlert,
    InputField,
    PageHeader,
    PaperBox,
    SelectField,
    SkeletonVacancyForm,
    SwitchCheckbox,
    TextEditor,
} from '@cagtu-cms/ui-shared';
import {
    BreadcrumbItems,
    careerSkillsOptions,
    categoryOptions,
    CipherUserContext,
    CreateVacancyFormValueProps,
    createVacancySchema,
    getFormatedDate,
    jobTypeOptions,
    VacancySchema,
} from '@cagtu-cms/util-formatter';
import { Grid, Text, Title } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { IconCalendarTime, IconCheck, IconX } from '@tabler/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Form, Formik, FormikHelpers } from 'formik';
import { useContext, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';

const urlsPath = urls?.cipher?.career;

const CreateCareer = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const { careerID } = useParams();
    const navigate = useNavigate();

    const [careerSkillsData, setCareerSkillsData] = useState([...careerSkillsOptions]);

    const [vacancyFormData, setVacancyFormData] = useState<CreateVacancyFormValueProps>({
        id: '',
        title: '',
        designation: '',
        description: '',
        category: '',
        no_of_opening: '',
        experience: '',
        skills: [],
        deadline: '',
        location: '',
        country: '',
        job_type: '',
        salary_range_first: '',
        salary_range_second: '',
        status: false,
    });

    const careerAPI = new CipherAPI(!careerID ? urlsPath?.create : urlsPath?.path);

    const { isFetching, isError } = useQuery([`career ${careerID}`, careerID], () => careerAPI.get(Number(careerID)), {
        enabled: !!careerID,
        onSuccess: (data) => {
            setVacancyFormData(mapToViewModal(data?.data?.data));
        },
    });

    const careerMutation = useMutation((data: VacancySchema) => careerAPI.store(data, Number(careerID)));

    const onCreateCareer = (data: VacancySchema, actions: FormikHelpers<CreateVacancyFormValueProps>) => {
        careerMutation.mutate(data, {
            onSuccess: (data) => {
                if (data.data.status === 'failure') {
                    actions.setFieldError('deadline', data?.data?.message?.deadline && data?.data?.message?.deadline[0]);
                    actions.setFieldError('title', data?.data?.message?.title && data?.data?.message?.title[0]);
                    showNotification({
                        title: 'Uh oh! something went wrong',
                        message: 'Sorry! There was a problem with your request',
                        color: 'red',
                        icon: <IconX size={18} />,
                    });
                } else {
                    actions.resetForm();
                    showNotification({
                        title: `Congrats! Career ${careerID ? 'Updated' : 'Created'}`,
                        message: careerID ? data.data.message ?? 'Career updated successfully' : data.data.message ?? 'Career created successfully',
                        color: 'green',
                        icon: <IconCheck size={18} />,
                    });
                    navigate('/cms/career', { replace: true });
                }
            },
            onError: (error: any) => {
                const {
                    data: {
                        message: { deadline, title },
                    },
                } = error.response;
                actions.setFieldError('deadline', deadline && deadline[0]);
                actions.setFieldError('title', title && title[0]);
                showNotification({
                    title: 'Uh oh! something went wrong',
                    message: 'Sorry! There was a problem with your request.',
                    color: 'red',
                    icon: <IconX size={18} />,
                });
            },
        });
    };

    const mapToViewModal = (value: CreateVacancyFormValueProps) => {
        return {
            id: value.id,
            title: value.title,
            designation: value.designation,
            description: value.description,
            experience: value.experience,
            no_of_opening: value.no_of_opening,
            category: value.category,
            location: value.location,
            country: value.country,
            job_type: value.job_type,
            skills: value.skills && JSON.parse(String(value.skills)),
            deadline: !value.deadline ? '' : (new Date(value.deadline) as unknown as string),
            status: value.status,
            salary_range_first: value.salary_range?.split(' ')[0],
            salary_range_second: value.salary_range?.split(' ')[2],
        };
    };

    const breadCrumbItems: BreadcrumbItems[] = [{ name: 'Career', href: '/cms/career' }];

    if (isError) {
        return <ErrorAlert />;
    }

    if (!careerID && !is_superuser && !user_permissions?.includes('add_vacancy')) {
        return <BlockedPageMessage />;
    }

    if (careerID && !is_superuser && !user_permissions?.includes('change_vacancy')) {
        return <BlockedPageMessage />;
    }

    return (
        <Formik
            enableReinitialize
            initialValues={vacancyFormData}
            validationSchema={createVacancySchema}
            onSubmit={async (values, actions) => {
                const dataToSend = {
                    ...JSON.parse(JSON.stringify(values)),
                    skills: JSON.stringify(values.skills),
                    deadline: getFormatedDate(new Date(values.deadline)),
                    salary_range: `${values.salary_range_first} - ${values.salary_range_second}`,
                };
                delete dataToSend.salary_range_first;
                delete dataToSend.salary_range_second;

                onCreateCareer(dataToSend, actions);
            }}>
            {({ setFieldValue, values, errors, touched, handleBlur }) => (
                <Form>
                    <PageHeader pageTitle="Create Vacancy" currentBreadcrumbName={careerID ? 'Edit' : 'Create'} breadCrumbItems={breadCrumbItems}>
                        <BackButton navigateTo="/cms/career" />
                        {!isFetching && <Button type="submit" name={careerID ? 'Save' : 'Create'} loading={careerMutation.isLoading} />}
                    </PageHeader>
                    {isFetching ? (
                        <SkeletonVacancyForm />
                    ) : (
                        <Grid gutter="lg">
                            <Grid.Col xl={8} md={7}>
                                <PaperBox>
                                    <Title order={5} sx={{ fontWeight: 600 }} mb={20}>
                                        Basic Information
                                    </Title>
                                    <InputField
                                        name="title"
                                        error={errors.title}
                                        touch={touched.title}
                                        labelName="Career Title"
                                        placeHolder="Enter career title"
                                        withAsterisk
                                    />
                                    <InputField
                                        name="designation"
                                        error={errors.designation}
                                        touch={touched.designation}
                                        labelName="Designation"
                                        placeHolder="Enter designation"
                                        withAsterisk
                                    />
                                    <SelectField
                                        name="category"
                                        labelName="Category"
                                        placeHolder="e.g. Frontend, Backend, Business"
                                        error={errors.category}
                                        touch={touched.category}
                                        options={categoryOptions}
                                        handleChange={(value) => setFieldValue('category', value)}
                                        withAsterisk
                                    />
                                    <TextEditor
                                        name="description"
                                        labelName="Description"
                                        value={values.description}
                                        onChange={(value: string) => {
                                            setFieldValue('description', value);
                                        }}
                                        error={errors.description}
                                        touch={touched.description}
                                        // onBlur={handleBlur}
                                        height={300}
                                        withAsterisk
                                    />
                                </PaperBox>
                            </Grid.Col>
                            <Grid.Col xl={4} md={5}>
                                <PaperBox>
                                    <Title order={5} sx={{ fontWeight: 600 }} mb={20}>
                                        Career Detail
                                    </Title>
                                    <Grid gutter={15}>
                                        <Grid.Col xl={6} md={12} py={0}>
                                            <InputField
                                                name="no_of_opening"
                                                error={errors.no_of_opening}
                                                touch={touched.no_of_opening}
                                                labelName="No.of Openings"
                                                placeHolder="e.g. 5"
                                                withAsterisk
                                            />
                                        </Grid.Col>
                                        <Grid.Col xl={6} md={12} py={0}>
                                            <InputField
                                                name="experience"
                                                error={errors.experience}
                                                touch={touched.experience}
                                                labelName="Experience"
                                                placeHolder="e.g. 5 years"
                                                withAsterisk
                                            />
                                        </Grid.Col>
                                    </Grid>
                                    <CreatableInputField
                                        name="skills"
                                        options={careerSkillsData}
                                        labelName="Skills"
                                        placeHolder="e.g. Photoshop, Illustrator, Figma"
                                        error={errors.skills as string}
                                        touch={touched.skills}
                                        value={values.skills}
                                        onChange={(value) => setFieldValue('skills', value)}
                                        handleCreate={(query) => {
                                            const newItem = { value: query, label: query };
                                            setCareerSkillsData((prev) => [...prev, newItem]);
                                            setFieldValue('skills', careerSkillsData);
                                            return newItem;
                                        }}
                                        handleCreateLabel={(value) => `+ Create ${value}`}
                                        withAsterisk
                                    />
                                    <DateField
                                        name="deadline"
                                        labelName="Deadline"
                                        placeHolder="Select Date"
                                        error={errors.deadline}
                                        touch={touched.deadline}
                                        icon={<IconCalendarTime size={18} stroke={1.75} />}
                                        handleChange={(value) => setFieldValue('deadline', value)}
                                        onBlur={handleBlur}
                                        withAsterisk
                                    />

                                    <InputField
                                        name="location"
                                        error={errors.location}
                                        touch={touched.location}
                                        labelName="Location"
                                        placeHolder="e.g. Buddhangar, Kathmandu, Nepal"
                                        withAsterisk
                                    />

                                    <InputField
                                        name="country"
                                        error={errors.country}
                                        touch={touched.country}
                                        labelName="Country"
                                        placeHolder="e.g. Australia"
                                        withAsterisk
                                    />

                                    <SelectField
                                        name="job_type"
                                        labelName="Job Type"
                                        placeHolder="e.g. Full Time"
                                        error={errors.job_type}
                                        touch={touched.job_type}
                                        options={jobTypeOptions}
                                        handleChange={(value) => setFieldValue('job_type', value)}
                                        withAsterisk
                                    />
                                    <Text size="sm" component="label" weight={500} mb={4} pb={8} sx={{ display: 'inline-block' }}>
                                        Salary Range
                                    </Text>
                                    <Grid gutter={15}>
                                        <Grid.Col xl={6} md={12} py={0}>
                                            <InputField
                                                name="salary_range_first"
                                                error={errors.salary_range_first}
                                                touch={touched.salary_range_first}
                                                placeHolder="e.g. 5000"
                                            />
                                        </Grid.Col>
                                        <Grid.Col xl={6} md={12} py={0}>
                                            <InputField
                                                name="salary_range_second"
                                                error={errors.salary_range_second}
                                                touch={touched.salary_range_second}
                                                placeHolder="e.g. 10000"
                                            />
                                        </Grid.Col>
                                    </Grid>
                                    <SwitchCheckbox name="status" checked={values.status} labelName="Job State (Active/Inactive)" mt={10} />
                                </PaperBox>
                            </Grid.Col>
                        </Grid>
                    )}
                </Form>
            )}
        </Formik>
    );
};

export default CreateCareer;
