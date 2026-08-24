import { CipherAPI, urls } from '@cagtu-cms/data-access';
import {
    BackButton,
    Button,
    DateField,
    ErrorAlert,
    InputField,
    MultiFileDropzone,
    PageHeader,
    PaperBox,
    SelectField,
    SelectInputField,
    SwitchCheckbox,
    TextEditor,
    TimeField,
} from '@cagtu-cms/ui-shared';
import {
    BreadcrumbItems,
    budgetTypeOptions,
    CipherUserContext,
    convertTimeStringToDateString,
    discountTypeOptions,
    getFormatedDate,
    getFormatedTime,
    getPayableAmount,
    getReceivableAmount,
    TaskFormValuesProps,
    TaskResult,
    taskSchema,
    useIconColorMode,
} from '@cagtu-cms/util-formatter';
import { Alert, Box, Checkbox, Grid, Group, List, Loader, Radio, Text, Title, useMantineTheme } from '@mantine/core';
import { getHotkeyHandler } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Form, Formik, FormikHelpers } from 'formik';
import { useContext, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as _ from 'lodash';
import {
    IconAlertCircle,
    IconBuildingSkyscraper,
    IconCalendarDue,
    IconCalendarEvent,
    IconCheck,
    IconClock,
    IconCoin,
    IconCurrencyDollar,
    IconHourglassEmpty,
    IconNotes,
    IconTag,
    IconTool,
    IconUser,
    IconUserSearch,
    IconWorld,
    IconX,
} from '@tabler/icons';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';

const urlsPath = urls?.cipher?.task;
const urlsCityPath = urls?.cipher?.locale?.city;
const urlsCountryPath = urls?.cipher?.locale?.country;
const urlsCurrPath = urls?.cipher?.locale?.currency;
const urlsServicePath = urls?.cipher?.services;
const urlsUserPath = urls?.cipher?.user;
const urlsFileStorePath = urls?.cipher?.task?.filestore;

const CreateTask = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const { taskID } = useParams();
    const theme = useMantineTheme();
    const navigate = useNavigate();

    const [commission, setCommission] = useState<string | undefined>('');
    const [highlights, setHighlights] = useState<string[]>([]);
    const [iconColorMode] = useIconColorMode();
    // const [recursionRow, setRecursionRow] = useState<number[]>([]);
    const [searchCity, setSearchCity] = useState<string>(''); // Read the value from city select field after values enter i.e; more than 3 letter
    const [countryOptions, setCountryOptions] = useState<{ value: string; label: string }[]>([]);
    const [cityOptions, setCityOptions] = useState<{ value: string; label: string }[]>([]);
    const [searchCurrency, setSearchCurrency] = useState<string>(''); // Read the value from currency select field after values enter i.e; more than 3 letter
    const [currencyOptions, setCurrencyOptions] = useState<{ value: string; label: string }[]>([]);
    const [searchService, setSearchService] = useState<string>(''); // Read the value from service select field after values enter i.e; more than 3 letter
    const [serviceOptions, setServiceOptions] = useState<{ value: string; label: string; id?: string; commission?: string }[]>([]);
    const [searchUser, setSearchUser] = useState<string>(''); // Read the value from user select field after values enter i.e; more than 3 letter
    const [userOptions, setUserOptions] = useState<{ value: string; label: string }[]>([]);
    const [isTaskSubmitting, setIsTaskSubmitting] = useState<boolean>(false);
    const [userID, setUserID] = useState<string>('');
    const [countryID, setCountryID] = useState<string>('');

    const [taskFormData, setTaskFormData] = useState<TaskFormValuesProps>({
        id: '',
        title: '',
        description: '',
        user: '',
        service: '',
        city: '',
        country: '',
        currency: '',
        recursion_type: '',
        start_date: '',
        start_time: '',
        end_date: '',
        end_time: '',
        budget_type: '',
        budget_from: '',
        budget_to: '',
        location: '',
        highlights_list: '',
        revisions: '',
        discount_type: '',
        discount_value: '',
        no_of_reservation: '',
        budget_select: 'fixed',
        task_type: 'client',
        is_requested: true,
        is_professional: false,
        is_online: false,
        is_negotiable: false,
        share_location: false,
        is_discount_offer: false,
        videos: [],
        videosPreviewUrl: [],
        images: [],
        imagePreviewUrl: [],
    });

    const taskEntityAPI = new CipherAPI(taskID ? urlsPath?.path : `${urlsPath?.entityPath}${userID}/`);
    const countryOptionsAPI = new CipherAPI(urlsCountryPath?.options);
    const cityOptionsAPI = new CipherAPI(urlsCityPath?.options);
    const currencyOptionsAPI = new CipherAPI(urlsCurrPath?.options);
    const serviceOptionsAPI = new CipherAPI(urlsServicePath?.path);
    const userOptionsAPI = new CipherAPI(urlsUserPath?.path);
    const fileStoreAPI = new CipherAPI(urlsFileStorePath);

    const filestoreMutation = useMutation((data: FormData) => fileStoreAPI.store(data));
    const taskMutation = useMutation((data: TaskFormValuesProps) => taskEntityAPI.store(data, taskID));

    const { isFetching, isError } = useQuery([`task`, taskID], () => taskEntityAPI.get(String(taskID)), {
        enabled: !!taskID,
        onSuccess: (data) => {
            setTaskFormData(mapToViewModal(data?.data));
        },
    });

    // Fetch the country list from the API
    useQuery(['country-options'], () => countryOptionsAPI.list(), {
        onSuccess: (data) => {
            const options = data?.data.map(({ code, name }: { code: string; name: string }) => {
                return {
                    value: code,
                    label: name,
                };
            });
            setCountryOptions(options);
        },
    });

    // Fetch the city list from the API as the per user keywords request
    const { isFetching: isCityFetching } = useQuery(['city-options'], () => cityOptionsAPI.list({ search: searchCity, country: countryID }), {
        enabled: !!(countryID && searchCity),
        onSuccess: (data) => {
            const cityOptions = data?.data.map(({ id, name }: { id: number; name: string }) => {
                return {
                    value: String(id),
                    label: name,
                };
            });
            setCityOptions(cityOptions);
        },
    });

    // Fetch the currency list from the API as the per user keywords request
    const { isFetching: isCurrencyFetching } = useQuery(['currency-options'], () => currencyOptionsAPI.list({ search: searchCurrency }), {
        enabled: !!searchCurrency,
        onSuccess: (data) => {
            const options = data?.data.map(({ code, name }: { code: string; name: string }) => {
                return {
                    value: code,
                    label: name,
                };
            });
            setCurrencyOptions(options);
        },
    });

    // Fetch the service list from the API as the per user keywords request
    const { isFetching: isServiceFetching } = useQuery(['service-options'], () => serviceOptionsAPI.list({ page: -1, search: searchService }), {
        enabled: !!searchService,
        onSuccess: (data) => {
            const options = data?.data.map(({ id, title, commission }: { id: number; title: string; commission: string }) => {
                return {
                    value: String(id),
                    label: title,
                    commission: commission,
                };
            });
            setServiceOptions(options);
        },
    });

    // Fetch the service list from the API as the per user keywords request
    const { isFetching: isUserFetching } = useQuery(['users-options'], () => userOptionsAPI.list({ page: -1, search: searchUser }), {
        enabled: !!searchUser,
        onSuccess: (data) => {
            const options = data?.data.map(({ id, username }: { id: number; username: string }) => {
                return {
                    value: String(id),
                    label: `${username}`,
                };
            });
            setUserOptions(options);
        },
    });

    const onCreateThumbnail = (
        formData: FormData,
        formDataVideos: FormData,
        values: TaskFormValuesProps,
        actions: FormikHelpers<TaskFormValuesProps>
    ) => {
        if (values.images.some((val) => val?.path) && values.videos && !values.videos.some((val) => val?.path)) {
            filestoreMutation.mutate(formData, {
                onSuccess: (data) => {
                    const getImagesId = values?.images.filter((val) => !val.path).map((val) => val?.id);
                    const getVideosId = values?.videos && values?.videos.filter((val) => !val.path).map((val) => val?.id);
                    const dataToSend = {
                        ...JSON.parse(JSON.stringify(values)),
                        highlights: highlights,
                        budget_from: values.budget_from ? values.budget_from : null,
                        discount_value: values.discount_value ? values.discount_value : null,
                        revisions: values.revisions ? values.revisions : 1,
                        no_of_reservation: values.no_of_reservation ? values.no_of_reservation : 1,
                        start_date: values.start_date ? getFormatedDate(new Date(values.start_date)) : null,
                        end_date: values.end_date ? getFormatedDate(new Date(values.end_date)) : null,
                        start_time: values.start_time ? getFormatedTime(new Date(values.start_time)) : null,
                        end_time: values.end_time ? getFormatedTime(new Date(values.end_time)) : null,
                        images: [...getImagesId, ...(data?.data?.data ?? [])],
                        videos: [...(getVideosId || [])],
                    };
                    delete dataToSend.imagePreviewUrl;
                    delete dataToSend.videosPreviewUrl;
                    delete dataToSend.highlights_list;
                    delete dataToSend.is_discount_offer;
                    delete dataToSend.budget_select;
                    delete dataToSend.country;
                    delete dataToSend.task_type;
                    delete dataToSend.user;

                    onCreateTask(dataToSend, actions);
                },
                onError: (err) => {
                    setIsTaskSubmitting(false);
                    showNotification({
                        title: 'Uh oh! something went wrong',
                        message: 'Sorry! There was a problem with your request.',
                        color: 'red',
                        icon: <IconX size={18} />,
                    });
                },
            });
        } else if (!values.images.some((val) => val?.path) && values.videos && values.videos.some((val) => val?.path)) {
            filestoreMutation.mutate(formDataVideos, {
                onSuccess: (data) => {
                    const getImagesId = values?.images.filter((val) => !val.path).map((val) => val?.id);
                    const getVideosId = values?.videos && values?.videos.filter((val) => !val.path).map((val) => val?.id);
                    const dataToSend = {
                        ...JSON.parse(JSON.stringify(values)),
                        highlights: highlights,
                        budget_from: values.budget_from ? values.budget_from : null,
                        discount_value: values.discount_value ? values.discount_value : null,
                        revisions: values.revisions ? values.revisions : 1,
                        no_of_reservation: values.no_of_reservation ? values.no_of_reservation : 1,
                        start_date: values.start_date ? getFormatedDate(new Date(values.start_date)) : null,
                        end_date: values.end_date ? getFormatedDate(new Date(values.end_date)) : null,
                        start_time: values.start_time ? getFormatedTime(new Date(values.start_time)) : null,
                        end_time: values.end_time ? getFormatedTime(new Date(values.end_time)) : null,
                        images: [...getImagesId],
                        videos: [...(getVideosId || []), ...(data?.data?.data ?? [])],
                    };
                    delete dataToSend.videosPreviewUrl;
                    delete dataToSend.imagePreviewUrl;
                    delete dataToSend.highlights_list;
                    delete dataToSend.is_discount_offer;
                    delete dataToSend.budget_select;
                    delete dataToSend.country;
                    delete dataToSend.task_type;
                    delete dataToSend.user;

                    onCreateTask(dataToSend, actions);
                },
                onError: () => {
                    setIsTaskSubmitting(false);
                    showNotification({
                        title: 'Uh oh! something went wrong',
                        message: 'Sorry! There was a problem with your request.',
                        color: 'red',
                        icon: <IconX size={18} />,
                    });
                },
            });
        } else if (values.images.some((val) => val?.path) && values.videos && values.videos.some((val) => val?.path)) {
            filestoreMutation.mutate(formData, {
                onSuccess: ({ data: imagesData }) => {
                    const getImagesId = values?.images.filter((val) => !val.path).map((val) => val?.id);

                    filestoreMutation.mutate(formDataVideos, {
                        onSuccess: (data) => {
                            const getVideosId = values?.videos && values?.videos.filter((val) => !val.path).map((val) => val?.id);
                            const dataToSend = {
                                ...JSON.parse(JSON.stringify(values)),
                                highlights: highlights,
                                budget_from: values.budget_from ? values.budget_from : null,
                                discount_value: values.discount_value ? values.discount_value : null,
                                revisions: values.revisions ? values.revisions : 1,
                                no_of_reservation: values.no_of_reservation ? values.no_of_reservation : 1,
                                start_date: values.start_date ? getFormatedDate(new Date(values.start_date)) : null,
                                end_date: values.end_date ? getFormatedDate(new Date(values.end_date)) : null,
                                start_time: values.start_time ? getFormatedTime(new Date(values.start_time)) : null,
                                end_time: values.end_time ? getFormatedTime(new Date(values.end_time)) : null,
                                images: [...getImagesId, ...(imagesData?.data ?? [])],
                                videos: [...(getVideosId || []), ...(data?.data?.data ?? [])],
                            };
                            delete dataToSend.videosPreviewUrl;
                            delete dataToSend.imagePreviewUrl;
                            delete dataToSend.highlights_list;
                            delete dataToSend.is_discount_offer;
                            delete dataToSend.budget_select;
                            delete dataToSend.country;
                            delete dataToSend.task_type;
                            delete dataToSend.user;

                            onCreateTask(dataToSend, actions);
                        },
                        onError: () => {
                            setIsTaskSubmitting(false);
                            showNotification({
                                title: 'Uh oh! something went wrong',
                                message: 'Sorry! There was a problem with your request.',
                                color: 'red',
                                icon: <IconX size={18} />,
                            });
                        },
                    });
                },
                onError: () => {
                    setIsTaskSubmitting(false);
                    showNotification({
                        title: 'Uh oh! something went wrong',
                        message: 'Sorry! There was a problem with your request.',
                        color: 'red',
                        icon: <IconX size={18} />,
                    });
                },
            });
        }
    };

    const onCreateTask = (data: any, actions: FormikHelpers<TaskFormValuesProps>) => {
        taskMutation.mutate(data, {
            onSuccess: (data) => {
                if (data.data.status === 'failure') {
                    setIsTaskSubmitting(false);
                    showNotification({
                        title: 'Uh oh! something went wrong',
                        message: data.data.message.title[0],
                        color: 'red',
                        icon: <IconX size={18} />,
                    });
                } else {
                    showNotification({
                        title: `Congrats! Entity Service ${taskID ? 'Updated' : 'Created'}`,
                        message: taskID
                            ? data.data.message ?? 'Entity service updated successfully'
                            : data.data.message ?? 'Entity service created successfully',
                        color: 'green',
                        icon: <IconCheck size={18} />,
                    });
                    setIsTaskSubmitting(false);
                    actions.resetForm();
                    navigate('/task/entity-service', { replace: true });
                }
            },
            onError: (error: any) => {
                const {
                    data: { message, currency, city, budget_type },
                } = error.response;
                actions.setFieldError('currency', currency && currency[0]);
                actions.setFieldError('city', city && city[0]);
                actions.setFieldError('budget_type', budget_type && budget_type[0]);
                setIsTaskSubmitting(false);
                showNotification({
                    title: 'Uh oh! something went wrong',
                    message: message ?? 'Sorry! There was a problem with your request.',
                    color: 'red',
                    icon: <IconX size={18} />,
                });
            },
        });
    };

    const mapToViewModal = (value: TaskResult) => {
        const getServiceImages =
            value?.images &&
            value?.images.map((val) => {
                const fileName = _.split(val?.name, '/');
                return {
                    id: val?.id,
                    src: val?.media,
                    file: {
                        name: _.last(fileName),
                        size: val?.size,
                        type: val?.media_type,
                    },
                };
            });

        const getServiceVideos =
            value?.videos &&
            value?.videos.map((val) => {
                const fileName = _.split(val?.name, '/');
                return {
                    id: val?.id,
                    src: val?.media,
                    file: {
                        name: _.last(fileName),
                        size: val?.size,
                        type: val?.media_type,
                    },
                };
            });

        const findCurrentUser = [{ ...value.created_by }];
        const findCurrentService = [{ ...value.service }];
        const findCurrentCity = [{ ...value.city }];
        const findCurrentCurrency = [{ ...value.currency }];

        const formatCurrentUser = findCurrentUser.map(({ id, username }) => {
            return {
                value: String(id),
                label: String(username),
            };
        });
        if (!searchUser) {
            setUserOptions(formatCurrentUser);
        }

        const formatCurrentService = findCurrentService.map(({ id, title }) => {
            return {
                value: String(id),
                label: String(title),
            };
        });
        if (!searchService) {
            setServiceOptions(formatCurrentService);
        }

        const formatCurrentCity = findCurrentCity.map(({ id, name }) => {
            return {
                value: String(id),
                label: String(name),
            };
        });
        if (!searchCity) {
            setCityOptions(formatCurrentCity);
        }
        const formatCurrentCurrency = findCurrentCurrency.map(({ code, name }) => {
            return {
                value: String(code),
                label: String(name),
            };
        });
        if (!searchCurrency) {
            setCurrencyOptions(formatCurrentCurrency);
        }

        setHighlights(value?.highlights);

        setCommission(value?.service?.commission ?? '');

        return {
            id: String(value.id),
            title: value?.title,
            description: value?.description,
            user: String(value?.created_by?.id),
            service: String(value?.service?.id),
            country: String(value?.city?.country?.code),
            city: String(value?.city?.id),
            currency: String(value?.currency?.code),
            recursion_type: '',
            start_date: _.isNull(value.start_date) ? '' : (new Date(value.start_date) as unknown as string),
            end_date: _.isNull(value.end_date) ? '' : (new Date(value.end_date) as unknown as string),
            start_time: _.isNull(value.start_time) ? '' : convertTimeStringToDateString(String(value.start_time)),
            end_time: _.isNull(value.end_time) ? '' : convertTimeStringToDateString(String(value.end_time)),
            budget_type: value?.budget_type,
            budget_from: Number(value?.budget_from) ?? '',
            budget_to: Number(value?.budget_to),
            location: value?.location,
            highlights_list: '',
            revisions: String(value?.revisions),
            discount_type: value?.discount_type,
            discount_value: Number(value?.discount_value) ?? 0,
            no_of_reservation: String(value?.no_of_reservation),
            budget_select: value?.budget_from ? 'custom' : 'fixed',
            task_type: value?.is_requested ? 'client' : 'tasker',
            is_requested: value?.is_requested,
            is_professional: value?.is_professional,
            is_online: value?.is_online,
            is_negotiable: value?.is_negotiable,
            share_location: value?.share_location,
            is_discount_offer: value?.discount_value ? true : false,
            videos: value?.videos as any[],
            videosPreviewUrl: getServiceVideos as any[],
            images: value?.images as any[],
            imagePreviewUrl: getServiceImages as any[],
        };
    };

    const onRemoveHighlights = (index: number) => {
        setHighlights((prevState) => prevState.filter((_, key) => key !== index));
    };

    const onCreateHighlights = (setFieldValue: any, setFieldError: any, values: TaskFormValuesProps) =>
        getHotkeyHandler([
            [
                'Enter',
                () => {
                    if (highlights.includes(values.highlights_list)) {
                        setFieldError('highlights_list', 'Mention highlights is already created');
                    } else {
                        setFieldValue('highlights_list', '');
                        setHighlights((prevState) => [...prevState, values.highlights_list]);
                    }
                },
            ],
        ]);

    // const onCreateRecursionRow = (setFieldValue: any) => {
    //     recursionRow.length < 1 ? recursionRow.push(0) : recursionRow.push(recursionRow.length);
    //     const row = recursionRow.length - 1;
    //     setFieldValue(`task_detail.${row}.recursion_type`, '');
    //     setFieldValue(`task_detail.${row}.day`, '');
    //     setFieldValue(`task_detail.${row}.start_date`, new Date().toString());
    //     setFieldValue(`task_detail.${row}.start_time`, '');
    //     setRecursionRow([...recursionRow]);
    // };

    // const onRemoveRecursionRow = (index: number) => {
    //     setRecursionRow((prevState) => prevState.filter((_, key) => key !== index));
    // };

    const breadCrumbItems: BreadcrumbItems[] = [{ name: 'Entity Service', href: '/task/entity-service' }];

    if (isError) {
        return <ErrorAlert />;
    }

    if (taskID && !is_superuser && !user_permissions?.includes('view_entityservice')) {
        return <BlockedPageMessage />;
    }
    if (!taskID && !is_superuser && !user_permissions?.includes('view_entityservice')) {
        return <BlockedPageMessage />;
    }

    return (
        <Formik
            enableReinitialize
            initialValues={taskFormData}
            validationSchema={taskSchema}
            onSubmit={(values, actions) => {
                const formData = new FormData();
                const formDataVideos = new FormData();
                setIsTaskSubmitting(true);
                if (values.images.some((val) => val?.path) || (values.videos && values.videos.some((val) => val?.path))) {
                    values.images.forEach((file) => {
                        if (file?.path) formData.append('medias', file);
                    });
                    values.videos &&
                        values.videos.forEach((file) => {
                            if (file?.path) formDataVideos.append('medias', file);
                        });
                    onCreateThumbnail(formData, formDataVideos, values, actions);
                } else {
                    const getImagesId = values?.images.map((val) => val?.id);
                    const getVideosId = values?.videos && values?.videos.map((val) => val?.id);
                    const dataToSend = {
                        ...JSON.parse(JSON.stringify(values)),
                        highlights: highlights,
                        budget_from: values.budget_from ? values.budget_from : null,
                        discount_value: values.discount_value ? values.discount_value : null,
                        revisions: values.revisions ? values.revisions : 1,
                        no_of_reservation: values.no_of_reservation ? values.no_of_reservation : 1,
                        start_date: values.start_date ? getFormatedDate(new Date(values.start_date)) : null,
                        end_date: values.end_date ? getFormatedDate(new Date(values.end_date)) : null,
                        start_time: values.start_time ? getFormatedTime(new Date(values.start_time)) : null,
                        end_time: values.end_time ? getFormatedTime(new Date(values.end_time)) : null,
                        images: getImagesId,
                        videos: getVideosId,
                    };
                    delete dataToSend.videosPreviewUrl;
                    delete dataToSend.imagePreviewUrl;
                    delete dataToSend.highlights_list;
                    delete dataToSend.is_discount_offer;
                    delete dataToSend.budget_select;
                    delete dataToSend.country;
                    delete dataToSend.task_type;
                    delete dataToSend.user;

                    onCreateTask(dataToSend, actions);
                }
            }}>
            {({ errors, touched, values, setFieldValue, handleBlur, setFieldError, handleSubmit }) => (
                <Form onSubmit={handleSubmit}>
                    <PageHeader
                        pageTitle={taskID ? 'Edit Entity Service' : 'Create Entity Service'}
                        currentBreadcrumbName={taskID ? 'Edit' : 'Create'}
                        breadCrumbItems={breadCrumbItems}>
                        <BackButton navigateTo="/task/entity-service" />
                        {!isFetching && <Button type="submit" name={taskID ? 'Save' : 'Create'} loading={isTaskSubmitting} />}
                    </PageHeader>
                    <Grid gutter="lg">
                        <Grid.Col xl={7} md={7}>
                            <PaperBox>
                                <Title order={5} sx={{ fontWeight: 600 }} mb={20}>
                                    Task Information
                                </Title>
                                <Radio.Group
                                    value={values.task_type}
                                    onChange={(e) => {
                                        if (e === 'tasker') {
                                            setFieldValue('is_requested', false);
                                            setFieldValue('task_type', e);
                                            setFieldValue('start_date', null);
                                            setFieldValue('end_date', null);
                                            setFieldValue('start_time', null);
                                            setFieldValue('end_time', null);
                                        } else {
                                            setFieldValue('is_requested', true);
                                            setFieldValue('task_type', e);
                                            setFieldValue('discount_value', '');
                                            setFieldValue('discount_type', '');
                                            setFieldValue('is_discount_offer', false);
                                        }
                                    }}
                                    label="Post a task as"
                                    spacing="lg"
                                    offset={5}
                                    mb={20}>
                                    <Radio value="client" label="Client" />
                                    <Radio value="tasker" label="Tasker" />
                                </Radio.Group>
                                <SelectInputField
                                    name="user"
                                    labelName="User"
                                    placeHolder="Select username"
                                    error={errors.user}
                                    touch={touched.user}
                                    options={userOptions}
                                    textMuted="Write at least 3 letter to get the user"
                                    handleChange={(value) => {
                                        if (!taskID) {
                                            setFieldValue('user', value);
                                            setUserID(value);
                                        }
                                    }}
                                    onSearchChange={(value) => {
                                        if (value && value.length >= 3 && !taskID) {
                                            setSearchUser(value);
                                        } else {
                                            setSearchUser('');
                                        }
                                    }}
                                    rightSection={isUserFetching && <Loader size="xs" />}
                                    icon={<IconUserSearch size={18} stroke={1.75} />}
                                    searchable
                                    clearable
                                    disabled={Boolean(taskID)}
                                    withAsterisk
                                />
                                <SelectInputField
                                    name="service"
                                    labelName="Service"
                                    placeHolder="e.g. Plumbing &amp; Repair"
                                    error={errors.service}
                                    touch={touched.service}
                                    options={serviceOptions}
                                    textMuted="Write at least 3 letter to get the service"
                                    handleChange={(value) => {
                                        setFieldValue('service', value);
                                        const val = serviceOptions.filter((val) => val?.value === value);
                                        setCommission(val[0]?.commission);
                                    }}
                                    onSearchChange={(value) => {
                                        if (value && value.length >= 3) {
                                            setSearchService(value);
                                        } else {
                                            setSearchService('');
                                        }
                                    }}
                                    rightSection={isServiceFetching && <Loader size="xs" />}
                                    icon={<IconTool size={18} stroke={1.75} />}
                                    searchable
                                    clearable
                                    withAsterisk
                                />
                                <InputField
                                    name="title"
                                    error={errors.title}
                                    touch={touched.title}
                                    labelName="Title"
                                    placeHolder="Enter title"
                                    withAsterisk
                                />
                                <InputField
                                    name="location"
                                    error={errors.location}
                                    touch={touched.location}
                                    labelName="Address"
                                    placeHolder="e.g. Buddhanagar, Kathmandu, Nepal"
                                />
                                <Text size="sm" component="label" weight={500} mb={4} sx={{ display: 'inline-block' }}>
                                    Requirements
                                </Text>
                                <Text size="xs" mb={7} color="gray.6">
                                    This helps {values?.is_requested ? 'tasker' : 'client'} to find about your requirements better.
                                </Text>
                                {highlights.length >= 1 && (
                                    <List type="ordered" mb={10} mt={5} styles={{ item: { padding: `${4}px ${0}px`, fontSize: 13 } }}>
                                        {highlights.map((name, key) => (
                                            <Group key={key} position="apart">
                                                <List.Item>{name}</List.Item>
                                                <IconX
                                                    size={14}
                                                    onClick={() => onRemoveHighlights(key)}
                                                    style={{ cursor: 'pointer' }}
                                                    color={iconColorMode}
                                                />
                                            </Group>
                                        ))}
                                    </List>
                                )}
                                <InputField
                                    name="highlights_list"
                                    error={errors.highlights_list}
                                    touch={touched.highlights_list}
                                    placeHolder="e.g. Bring something screw driver"
                                    // rightSection={
                                    //     <ThemeIcon variant="light" radius="xl" size={24} color="gray.7">
                                    //         <IconPlus size={16} stroke={2} />
                                    //     </ThemeIcon>
                                    // }
                                    onKeyDown={onCreateHighlights(setFieldValue, setFieldError, values)}
                                    icon={<IconNotes size={18} stroke={1.75} />}
                                />
                                <Grid gutter={30}>
                                    {/* <Grid.Col md={6} pb={0}>
                                        <InputField
                                            name="revisions"
                                            labelName="Revisions"
                                            error={errors.revisions}
                                            touch={touched.revisions}
                                            placeHolder="e.g. 1"
                                        />
                                    </Grid.Col> */}
                                    {/* <Grid.Col md={6} pb={0}>
                                        <InputField
                                            name="no_of_reservation"
                                            labelName={values?.is_requested ? 'No.of Reservation' : 'No.of Reservation Allowed'}
                                            // textMuted={
                                            //     values?.is_requested
                                            //         ? 'Enter the number of reservation you want to do'
                                            //         : 'Enter the number of reservation that can be done at a time'
                                            // }
                                            error={errors.no_of_reservation}
                                            touch={touched.no_of_reservation}
                                            placeHolder="e.g. 1"
                                            icon={<IconUser size={18} stroke={1.75} />}
                                        />
                                    </Grid.Col> */}
                                    <Grid.Col md={12} pb={0}>
                                        <SelectInputField
                                            name="country"
                                            labelName="Country"
                                            placeHolder="e.g. Nepal/Australia"
                                            error={errors.country}
                                            touch={touched.country}
                                            options={countryOptions}
                                            handleChange={(value) => {
                                                if (value) {
                                                    setFieldValue('country', value);
                                                    setCountryID(value);
                                                } else {
                                                    setFieldValue('country', '');
                                                    setFieldValue('city', '');
                                                    setCountryID('');
                                                }
                                            }}
                                            icon={<IconWorld size={18} stroke={1.75} />}
                                            searchable
                                            clearable
                                            withAsterisk
                                        />
                                    </Grid.Col>
                                </Grid>
                                <Grid gutter={30}>
                                    <Grid.Col md={6}>
                                        <SelectInputField
                                            name="city"
                                            labelName="City"
                                            placeHolder="e.g. Kathmandu"
                                            error={errors.city}
                                            touch={touched.city}
                                            options={cityOptions}
                                            textMuted="Write at least 3 letter to get the city for selected country"
                                            handleChange={(value) => {
                                                if (values.country) {
                                                    setFieldValue('city', value);
                                                }
                                            }}
                                            onSearchChange={(value) => {
                                                if (value && value.length >= 3) {
                                                    setSearchCity(value);
                                                } else {
                                                    setSearchCity('');
                                                }
                                            }}
                                            rightSection={isCityFetching && <Loader size="xs" />}
                                            icon={<IconBuildingSkyscraper size={18} stroke={1.75} />}
                                            disabled={!values.country}
                                            searchable
                                            clearable
                                            withAsterisk
                                        />
                                    </Grid.Col>
                                    <Grid.Col md={6}>
                                        <SelectInputField
                                            name="currency"
                                            labelName="Currency"
                                            placeHolder="e.g. Dollar/Yen/Rupee"
                                            error={errors.currency}
                                            touch={touched.currency}
                                            options={currencyOptions}
                                            textMuted="Write at least 3 letter to get the currency"
                                            handleChange={(value) => {
                                                setFieldValue('currency', value);
                                            }}
                                            onSearchChange={(value) => {
                                                if (value && value.length >= 3) {
                                                    setSearchCurrency(value);
                                                } else {
                                                    setSearchCurrency('');
                                                }
                                            }}
                                            rightSection={isCurrencyFetching && <Loader size="xs" />}
                                            icon={<IconCoin size={18} stroke={1.75} />}
                                            searchable
                                            clearable
                                            withAsterisk
                                        />
                                    </Grid.Col>
                                </Grid>
                                <Radio.Group
                                    value={values.budget_select}
                                    onChange={(e) => {
                                        if (e === 'fixed') {
                                            setFieldValue('budget_from', '');
                                            setFieldValue('budget_select', e);
                                        } else {
                                            setFieldValue('budget_select', e);
                                        }
                                    }}
                                    label="Budget"
                                    spacing="lg"
                                    offset={5}
                                    mb={20}
                                    withAsterisk>
                                    <Radio value="fixed" label="Fixed" />
                                    <Radio value="custom" label="Custom" />
                                </Radio.Group>
                                <Grid gutter={15}>
                                    <Grid.Col xs={12} color="dimmed">
                                        Note: Please select service first to enable budget to and budget from{' '}
                                    </Grid.Col>
                                    {values.budget_select === 'custom' && (
                                        <Grid.Col span={3}>
                                            <InputField
                                                disabled={!commission}
                                                name="budget_from"
                                                error={errors.budget_from}
                                                touch={touched.budget_from}
                                                placeHolder="Budget From"
                                                icon={<IconCurrencyDollar size={18} stroke={1.75} />}
                                            />
                                        </Grid.Col>
                                    )}
                                    <Grid.Col span={3}>
                                        <InputField
                                            disabled={!commission}
                                            name="budget_to"
                                            error={errors.budget_to}
                                            touch={touched.budget_to}
                                            placeHolder="Budget To"
                                            icon={<IconCurrencyDollar size={18} stroke={1.75} />}
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={3}>
                                        <SelectField
                                            name="budget_type"
                                            placeHolder="e.g. Hourly/Monthly/Daily"
                                            error={errors.budget_type}
                                            touch={touched.budget_type}
                                            options={budgetTypeOptions}
                                            handleChange={(value) => {
                                                setFieldValue('budget_type', value);
                                            }}
                                            icon={<IconHourglassEmpty size={18} stroke={1.75} />}
                                            clearable
                                        />
                                    </Grid.Col>
                                </Grid>
                                {values?.budget_select === 'custom' && values?.budget_from && values?.budget_to && commission && (
                                    <Alert mb={15} icon={<IconAlertCircle size="1rem" />}>
                                        Your {values?.task_type === 'client' ? 'task' : values?.task_type === 'tasker' ? 'service' : ''} will be
                                        posted for the price of approximately about{' '}
                                        {values?.task_type === 'client'
                                            ? getPayableAmount(String(values?.budget_from), String(commission)) +
                                              ' to ' +
                                              getPayableAmount(String(values?.budget_to), String(commission))
                                            : values?.task_type === 'tasker'
                                            ? getReceivableAmount(String(values?.budget_from), String(commission)) +
                                              ' to ' +
                                              getReceivableAmount(String(values?.budget_to), String(commission))
                                            : ''}
                                    </Alert>
                                )}
                                {values?.budget_select === 'fixed' && values?.budget_to && commission && (
                                    <Alert mb={15} icon={<IconAlertCircle size="1rem" />}>
                                        Your {values?.task_type === 'client' ? 'task' : values?.task_type === 'tasker' ? 'service' : ''} will be
                                        posted for the price of approximately about{' '}
                                        {values?.task_type === 'client'
                                            ? getPayableAmount(String(values?.budget_to), String(commission))
                                            : values?.task_type === 'tasker'
                                            ? getReceivableAmount(String(values?.budget_to), String(commission))
                                            : ''}
                                    </Alert>
                                )}
                                <TextEditor
                                    name="description"
                                    labelName="Description"
                                    value={values.description}
                                    onChange={(value: string) => {
                                        setFieldValue('description', value);
                                    }}
                                    error={errors.description}
                                    touch={touched.description}
                                    onBlur={handleBlur}
                                    height={250}
                                    sticky={false}
                                />
                                <Box mt={20}>
                                    <Checkbox
                                        name="is_discount_offer"
                                        label="Add Discount &amp; Offers"
                                        checked={values.is_discount_offer}
                                        onChange={(e) => {
                                            if (!values?.is_requested) {
                                                if (e.currentTarget.checked) {
                                                    setFieldValue('discount_value', values.discount_value);
                                                    setFieldValue('discount_type', values.discount_type);
                                                    setFieldValue('is_discount_offer', e.currentTarget.checked);
                                                } else {
                                                    setFieldValue('discount_value', '');
                                                    setFieldValue('discount_type', '');
                                                    setFieldValue('is_discount_offer', e.currentTarget.checked);
                                                }
                                            }
                                        }}
                                        disabled={values.is_requested}
                                        mb={values.is_requested ? 10 : 20}
                                    />
                                    {values.is_requested && (
                                        <Text size="xs" color="orange" weight={500} mb={20}>
                                            Note: Task must be as a 'tasker' to use this feature
                                        </Text>
                                    )}
                                    {values.is_discount_offer && (
                                        <Grid>
                                            <Grid.Col md={4} py={0}>
                                                <InputField
                                                    name="discount_value"
                                                    error={errors.discount_value}
                                                    touch={touched.discount_value}
                                                    placeHolder="Enter discount/offer amount"
                                                    style={{ marginBottom: `${values.is_discount_offer && 0}` }}
                                                    icon={<IconTag size={18} stroke={1.75} />}
                                                />
                                            </Grid.Col>
                                            <Grid.Col md={4} py={0}>
                                                <SelectField
                                                    name="discount_type"
                                                    placeHolder="e.g. Percentage/Amount"
                                                    error={errors.discount_type}
                                                    touch={touched.discount_type}
                                                    options={discountTypeOptions}
                                                    handleChange={(value) => {
                                                        setFieldValue('discount_type', value);
                                                    }}
                                                    style={{ marginBottom: `${values.is_discount_offer && 0}` }}
                                                    icon={<IconHourglassEmpty size={18} stroke={1.75} />}
                                                    clearable
                                                />
                                            </Grid.Col>
                                        </Grid>
                                    )}
                                </Box>
                            </PaperBox>
                        </Grid.Col>
                        <Grid.Col xl={5} md={5}>
                            <PaperBox sx={{ marginBottom: theme.spacing.lg }}>
                                <Title order={5} sx={{ fontWeight: 600 }} mb={20}>
                                    When do you need this done?
                                </Title>
                                <Grid gutter={15}>
                                    <Grid.Col span={7} py="0">
                                        <DateField
                                            name="start_date"
                                            labelName="Start Date"
                                            placeHolder="Select Start Date"
                                            error={errors.start_date}
                                            touch={touched.start_date}
                                            icon={<IconCalendarEvent size={18} stroke={1.75} />}
                                            minDate={new Date()}
                                            handleChange={(value) => {
                                                if (values.is_requested) {
                                                    setFieldValue('start_date', value);
                                                }
                                            }}
                                            onBlur={handleBlur}
                                            disabled={!values.is_requested}
                                            withAsterisk={values.is_requested}
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={5} py="0">
                                        <TimeField
                                            format="12"
                                            labelName="Stat Time"
                                            name="start_time"
                                            handleChange={(value) => {
                                                setFieldValue('start_time', value);
                                            }}
                                            icon={<IconClock size={18} stroke={1.75} />}
                                            timePlaceholder="00"
                                            error={errors.start_time}
                                            touch={touched.start_time}
                                            onBlur={handleBlur}
                                            disabled={!values.is_requested}
                                            withAsterisk={values.is_requested}
                                        />
                                    </Grid.Col>
                                </Grid>
                                <Grid gutter={15}>
                                    <Grid.Col span={7} py="0">
                                        <DateField
                                            name="end_date"
                                            labelName="End Date"
                                            placeHolder="Select End Date"
                                            error={errors.end_date}
                                            touch={touched.end_date}
                                            icon={<IconCalendarDue size={18} stroke={1.75} />}
                                            minDate={new Date()}
                                            handleChange={(value) => setFieldValue('end_date', value)}
                                            disabled={!values.is_requested}
                                            withAsterisk={values.is_requested}
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={5} py="0">
                                        <TimeField
                                            format="12"
                                            labelName="End Time"
                                            name="end_time"
                                            handleChange={(value) => {
                                                if (values.is_requested) {
                                                    setFieldValue('end_time', value);
                                                }
                                            }}
                                            icon={<IconClock size={18} stroke={1.75} />}
                                            timePlaceholder="00"
                                            error={errors.end_time}
                                            touch={touched.end_time}
                                            onBlur={handleBlur}
                                            disabled={!values.is_requested}
                                            withAsterisk={values.is_requested}
                                        />
                                    </Grid.Col>
                                </Grid>
                                {!values.is_requested && (
                                    <Text size="xs" color="orange" weight={500}>
                                        Note: Task must be as a 'client' to use this feature
                                    </Text>
                                )}
                            </PaperBox>
                            <PaperBox sx={{ marginBottom: theme.spacing.lg }}>
                                <Title order={5} sx={{ fontWeight: 600 }} mb={20}>
                                    Images &amp; Videos
                                </Title>
                                <MultiFileDropzone
                                    name="images"
                                    labelName="Upload your images"
                                    textMuted="More than 5 images are not allowed to upload. File supported: .jpeg, .jpg, .png. Maximum size 4MB."
                                    error={errors.images as string}
                                    touch={touched.images as boolean}
                                    imagePreview="imagePreviewUrl"
                                    maxFiles={5}
                                    maxSize={4}
                                    multiple
                                    showFileDetail
                                />
                                <MultiFileDropzone
                                    name="videos"
                                    labelName="Upload your videos"
                                    textMuted="More than 2 videos are not allowed to upload. File supported: .mp4. Maximum size 50MB."
                                    error={errors.videos}
                                    touch={touched.videos}
                                    imagePreview="videosPreviewUrl"
                                    accept={['video/mp4']}
                                    maxFiles={2}
                                    maxSize={50}
                                    multiple
                                    showFileDetail
                                />
                            </PaperBox>
                            <PaperBox>
                                <SwitchCheckbox
                                    name="is_negotiable"
                                    checked={values.is_negotiable}
                                    onChange={(e) => setFieldValue('is_negotiable', e.currentTarget.checked)}
                                    labelName="Is Negotiable?"
                                    mb={15}
                                />
                                <SwitchCheckbox
                                    name="is_professional"
                                    checked={values.is_professional}
                                    onChange={(e) => setFieldValue('is_professional', e.currentTarget.checked)}
                                    labelName="Is Professional?"
                                    mb={15}
                                />
                                <SwitchCheckbox
                                    name="is_online"
                                    checked={values.is_online}
                                    onChange={(e) => setFieldValue('is_online', e.currentTarget.checked)}
                                    labelName="Is Online?"
                                    mb={15}
                                />
                                <SwitchCheckbox
                                    name="share_location"
                                    checked={values.share_location}
                                    onChange={(e) => setFieldValue('share_location', e.currentTarget.checked)}
                                    labelName="Share Location?"
                                />
                                {/* <SwitchCheckbox
                                    name="is_recursion"
                                    checked={values.is_recursion}
                                    onChange={(e) => setFieldValue('is_recursion', e.currentTarget.checked)}
                                    labelName="Is Recursion"
                                />
                                <SwitchCheckbox
                                    name="is_everyday"
                                    checked={values.is_everyday}
                                    onChange={(e) => setFieldValue('is_everyday', e.currentTarget.checked)}
                                    labelName="Is Everyday"
                                    mt={15}
                                /> */}
                                {/* {!values.is_everyday && (
                                    <Box>
                                        <Text size="sm" component="label" mt={20} weight={500} mb={4} pb={8} sx={{ display: 'block' }}>
                                            How often?
                                        </Text>
                                        {recursionRow &&
                                            recursionRow.map((rw, idx) => (
                                                <Grid key={idx} gutter={15}>
                                                    <Grid.Col span={2} py={0}>
                                                        <SelectField
                                                            name={`task_detail.${rw}.recursion_type`}
                                                            placeHolder="Select"
                                                            error={getIn(errors, `task_detail.${rw}.recursion_type`)}
                                                            touch={getIn(touched, `task_detail.${rw}.recursion_type`)}
                                                            options={['Day', 'Date']}
                                                            handleChange={(value) => setFieldValue(`task_detail.${rw}.recursion_type`, value)}
                                                        />
                                                    </Grid.Col>
                                                    {getIn(values, `task_detail.${rw}.recursion_type`) === 'Day' && (
                                                        <Grid.Col span={4} py={0}>
                                                            <SelectInputField
                                                                name={`task_detail.${rw}.day`}
                                                                placeHolder="e.g. Sunday"
                                                                error={getIn(errors, `task_detail.${rw}.day`)}
                                                                touch={getIn(touched, `task_detail.${rw}.day`)}
                                                                options={weekDaysOptions}
                                                                handleChange={(value) => setFieldValue(`task_detail.${rw}.day`, value)}
                                                            />
                                                        </Grid.Col>
                                                    )}
                                                    {getIn(values, `task_detail.${rw}.recursion_type`) === 'Date' && (
                                                        <Grid.Col span={4} py={0}>
                                                            <DateField
                                                                name={`task_detail.${rw}.start_date`}
                                                                placeHolder="Select Date"
                                                                error={getIn(errors, `task_detail.${rw}.start_date`)}
                                                                touch={getIn(touched, `task_detail.${rw}.start_date`)}
                                                                value={new Date(getIn(values, `task_detail.${rw}.start_date`))}
                                                                handleChange={(value) => setFieldValue(`task_detail.${rw}.start_date`, value)}
                                                            />
                                                        </Grid.Col>
                                                    )}
                                                    <Grid.Col span={5} py={0}>
                                                        <TimeRangeInput
                                                            format="12"
                                                            name={`task_detail.${rw}.start_time`}
                                                            onChange={(value) => {
                                                            setFieldValue(`task_detail.${rw}.start_time`, value);
                                                            }}
                                                            // error={
                                                            //     getIn(errors, `task_detail.${rw}.start_time`) &&
                                                            //     getIn(touched, `task_detail.${rw}.start_time`)
                                                            //         ? errors
                                                            //         : null
                                                            // }
                                                            onBlur={handleBlur}
                                                            mb={20}
                                                            styles={{
                                                                input: { height: 44 },
                                                                error: { fontSize: 13, fontWeight: 500 },
                                                                inputWrapper: { height: 44 },
                                                            }}
                                                        />
                                                    </Grid.Col>
                                                    <Grid.Col span={1}>
                                                        <FontAwesomeIcon
                                                            icon={faCircleXmark}
                                                            color={iconColorMode}
                                                            fontSize={22}
                                                            style={{ margin: `${4}px ${0}px`, cursor: 'pointer' }}
                                                            onClick={() => {
                                                                onRemoveRecursionRow(idx);
                                                                setFieldValue(
                                                                    'task_detail',
                                                                    values.task_detail &&
                                                                        values.task_detail.filter((el) => el !== getIn(values, `task_detail.${rw}`))
                                                                );
                                                            }}
                                                        />
                                                    </Grid.Col>
                                                </Grid>
                                            ))}
                                        <Button
                                            name="Add"
                                            variant="light"
                                            leftIcon={<FontAwesomeIcon icon={faPlus} fontSize={16} />}
                                            onClick={() => onCreateRecursionRow(setFieldValue)}
                                        />
                                    </Box>
                                )} */}
                            </PaperBox>
                        </Grid.Col>
                    </Grid>
                </Form>
            )}
        </Formik>
    );
};

export default CreateTask;
