import { CipherAPI, urls } from '@cagtu-cms/data-access';
import {
    Button,
    DateField,
    DateRangeField,
    ErrorAlert,
    FormModal,
    InputField,
    PageHeader,
    PaperBox,
    ProfileImageField,
    SelectField,
    SwitchCheckbox,
    TextAreaField,
    ViewAnalyticsButton,
    Badge as CustomBadge,
    DateTimePicker,
} from '@cagtu-cms/ui-shared';
import {
    CipherUserContext,
    converDateFromIsonString,
    convertDateToIsoString,
    discountTypeOptions,
    getFormatedDate,
    getFormatedTimeAmPm,
    getPageLimit,
    offerTypeOptions,
    ServiceOfferFilterFormValuesProps,
    ServiceOfferFormValuesProps,
    ServiceOfferResult,
    serviceOfferSchema,
    useDark,
    useDataLimit,
} from '@cagtu-cms/util-formatter';
import {
    Accordion,
    ActionIcon,
    Avatar,
    Badge,
    Box,
    Checkbox,
    CloseButton,
    Divider,
    Grid,
    Group,
    List,
    Loader,
    Modal,
    Stack,
    Text,
    Title,
    useMantineTheme,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FieldArray, Form, Formik, FormikHelpers, getIn } from 'formik';
import { useContext, useState } from 'react';
import ServiceOfferTable from './ServiceOfferTable';
import * as _ from 'lodash';
import { upperCase } from 'lodash';
import {
    IconCalendar,
    IconCalendarDue,
    IconCalendarEvent,
    IconCategory,
    IconCheck,
    IconCircleCheck,
    IconCircleX,
    IconDiscount2,
    IconHourglassEmpty,
    IconPlus,
    IconSelector,
    IconTag,
    IconTool,
    IconUser,
    IconVectorTriangle,
    IconX,
} from '@tabler/icons';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';
import { object } from 'yup';
import DatePicker from 'react-datepicker';

const serviceOfferData: ServiceOfferFormValuesProps = {
    id: null,
    title: '',
    description: '',
    offer_rule: '',
    discount: '',
    discount_type: '',
    discount_limit: '',
    quantity: '',
    free: '',
    offer_type: '',
    code: '',
    redeem_points: '',
    start_date: '',
    end_date: '',
    country: '',
    image: [],
    profilePreviewUrl: [],
    // offer_scope: [
    //     {
    //         entity_service: '',
    //         service: '',
    //         category: '',
    //     },
    // ],
    entity_services: [],
    services: [],
    categories: [],
    is_common: false,
    is_consumable: false,
    is_active: false,
};

const filterFormInitialData: ServiceOfferFilterFormValuesProps = {
    created_range: '',
    date_from: '',
    date_to: '',
    created_by: '',
    offer_rule: '',
    ordering: '',
    is_consumable: '',
};

const urlsPath = urls?.cipher?.offer?.service;
const urlsOfferRulePath = urls?.cipher?.offer?.rule;
// const urlsOfferScopePath = urls?.cipher?.offer?.scope;
const urlsEntityPath = urls?.cipher?.task;
const urlsCountryPath = urls?.cipher?.locale?.country;
const urlsServicePath = urls?.cipher?.services;
const urlsCatPath = urls?.cipher?.category;
const urlsUserPath = urls?.cipher?.user;

const ServiceOffer = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const [query, setQuery] = useState<string>('');
    const [checked, setChecked] = useState<string[]>([]);
    const queryClient = useQueryClient();
    const [formModal, setFormModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [multiDeleteModal, setMultiDeleteModal] = useState(false);
    const [rowId, setRowId] = useState<number | null>();
    const [page, setPage] = useState(1);
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');
    const [offerRuleOptions, setOfferRuleOptions] = useState<{ value: string; label: string }[]>([]);
    const [searchEntityService, setSearchEntityService] = useState<string>(''); // Read the value from entity service select field after values enter i.e; more than 3 letter
    const [entityServiceOptions, setEntityServiceOptions] = useState<{ value: string; label: string }[]>([]);
    const [searchScopeEntity, setSearchScopeEntity] = useState<string>(''); // Read the value from entity service select field after values enter i.e; more than 3 letter
    const [scopeEntityOptions, setScopeEntityOptions] = useState<{ value: string; label: string }[]>([]);
    const [countryOptions, setCountryOptions] = useState<{ value: string; label: string }[]>([]);
    const [searchService, setSearchService] = useState<string>(''); // Read the value from service select field after values enter i.e; more than 3 letter
    const [serviceOptions, setServiceOptions] = useState<{ value: string; label: string }[]>([]);
    const [searchCategory, setSearchCategory] = useState<string>(''); // Read the value from category select field after values enter i.e; more than 3 letter
    const [categoryOptions, setCategoryOptions] = useState<{ value: string; label: string }[]>([]);
    const [searchCreateddBy, setSearchCreateddBy] = useState<string>(''); // Read the value from user select field after values enter i.e; more than 3 letter
    const [userOptions, setUserOptions] = useState<{ value: string; label: string }[]>([]);
    const [offerRuleID, setOfferRuleID] = useState<number | null>(null);
    const [currEntIndex, setCurrEntIndex] = useState<number | null>(null);
    const [showFilter, setShowFilter] = useState(false);
    const [isFiltering, setIsFiltering] = useState(false);
    const [serviceOfferDetailModal, setServiceOfferDetailModal] = useState(false);
    const [serviceOfferDetail, setServiceOfferDetail] = useState<ServiceOfferResult>();

    const [dark] = useDark();
    const theme = useMantineTheme();

    const [serviceOfferFormData, setServiceOfferFormData] = useState<ServiceOfferFormValuesProps>({
        ...serviceOfferData,
    });

    const [serviceOfferFilterFormData, setServiceOfferFilterFormData] = useState<ServiceOfferFilterFormValuesProps>({
        ...filterFormInitialData,
    });

    const formData: FormData = new FormData();

    const serviceOfferAPI = new CipherAPI(urlsPath?.path);
    // const offerScopeAPI = new CipherAPI(urlsOfferScopePath?.path);
    const offerRuleOptionsAPI = new CipherAPI(urlsOfferRulePath?.options);
    const offerRuleTypeAPI = new CipherAPI(urlsOfferRulePath?.path);
    const serviceOfferMultiDeleteAPI = new CipherAPI(urlsPath?.multipleDelete);
    const entityServiceOptionsAPI = new CipherAPI(urlsEntityPath?.entityPath);
    const countryOptionsAPI = new CipherAPI(urlsCountryPath?.options);
    const categoryOptionsAPI = new CipherAPI(urlsCatPath?.selectOptions);
    const serviceOptionsAPI = new CipherAPI(urlsServicePath?.path);
    const userOptionsAPI = new CipherAPI(urlsUserPath?.path);

    const { isLoading, isError, isSuccess, data, isFetching } = useQuery(['serviceoffer', page, limitChange, ...[filterFormInitialData]], () =>
        serviceOfferAPI.list({ search: query, page, page_size: limitChange, ...serviceOfferFilterFormData })
    );

    // User Options
    const { isFetching: isUserFetching } = useQuery(['user-options'], () => userOptionsAPI.list({ page: -1, search: searchCreateddBy }), {
        enabled: !!searchCreateddBy,
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

    useQuery(['offer-rule-options'], () => offerRuleOptionsAPI.list(), {
        onSuccess: (data) => {
            const options = data?.data.map(({ id, title }: { id: number; title: string }) => {
                return {
                    value: String(id),
                    label: title,
                };
            });
            setOfferRuleOptions(options);
        },
    });

    const { isFetching: isOfferRuleLoading, data: offerRuleData } = useQuery(['offer-rule-type'], () => offerRuleTypeAPI.get(Number(offerRuleID)), {
        enabled: !!offerRuleID,
    });

    // Fetch the entity service list from the API
    const { isFetching: isEntityServiceFetching } = useQuery(
        ['entityService-options'],
        () => entityServiceOptionsAPI.list({ page: -1, is_requested: false, search: searchEntityService }),
        {
            enabled: !!searchEntityService,
            onSuccess: (data) => {
                const options = data?.data.map(({ id, title }: { id: string; title: string }) => {
                    return {
                        value: String(id),
                        label: String(title),
                    };
                });
                setEntityServiceOptions((prevVal) => {
                    const uniqueData = _.uniqBy([...options, ...prevVal], function (e) {
                        return e.value;
                    });
                    return uniqueData;
                });
            },
        }
    );

    // Fetch the entity service list from the API
    const { isFetching: isScopeEntityFetching } = useQuery(
        ['offerScope-entityService-options'],
        () => entityServiceOptionsAPI.list({ page: -1, is_requested: false, search: searchScopeEntity }),
        {
            enabled: !!searchScopeEntity,
            onSuccess: (data) => {
                const options = data?.data.map(({ id, title }: { id: string; title: string }) => {
                    return {
                        value: String(id),
                        label: String(title),
                    };
                });
                setScopeEntityOptions((prevVal) => {
                    const uniqueData = _.uniqBy([...options, ...prevVal], function (e) {
                        return e.value;
                    });
                    return uniqueData;
                });
            },
        }
    );

    // Fetch the country list from the API
    useQuery(['country-options'], () => countryOptionsAPI.list(), {
        onSuccess: (data) => {
            const countryOptions = data?.data.map(({ code, name }: { code: string; name: string }) => {
                return {
                    value: code,
                    label: name,
                };
            });
            setCountryOptions((prevVal) => {
                const uniqueData = _.uniqBy([...countryOptions, ...prevVal], function (e) {
                    return e.value;
                });
                return uniqueData;
            });
        },
    });

    // Fetch the service list from the API as the per user keywords request
    const { isFetching: isServiceFetching } = useQuery(['service-options'], () => serviceOptionsAPI.list({ page: -1, search: searchService }), {
        enabled: !!searchService,
        onSuccess: (data) => {
            const options = data?.data.map(({ id, title }: { id: number; title: string }) => {
                return {
                    value: String(id),
                    label: title,
                };
            });
            setServiceOptions((prevVal) => {
                const uniqueData = _.uniqBy([...options, ...prevVal], function (e) {
                    return e.value;
                });
                return uniqueData;
            });
        },
    });

    // Fetch the category list from the API as the per user keywords request
    const { isFetching: isCategoryFetching } = useQuery(['category-options'], () => categoryOptionsAPI.list({ search: searchCategory }), {
        enabled: !!searchCategory,
        onSuccess: (data) => {
            const categoryOptions = data?.data.map(({ id, name }: { id: number; name: string }) => {
                return {
                    value: String(id),
                    label: name,
                };
            });
            setCategoryOptions((prevVal) => {
                const uniqueData = _.uniqBy([...categoryOptions, ...prevVal], function (e) {
                    return e.value;
                });
                return uniqueData;
            });
        },
    });

    const serviceOfferMutation = useMutation((data: FormData) => serviceOfferAPI.store(data, Number(rowId)));
    // const offerScopeMutation = useMutation((data: ServiceOfferFormValuesProps['offer_scope']) => offerScopeAPI.store({ offer_scope: data }));

    const pageToFecth = data?.data?.result.length <= 1 ? page - 1 : page;
    const pageToFetchMultiple = data?.data?.result.length <= checked.length ? page - 1 : page;

    const serviceOfferMultiDeleteMutation = useMutation((checkedIds: string[]) => serviceOfferMultiDeleteAPI.store({ pk: checkedIds }), {
        onSuccess: (data) => {
            if (data.data?.status === 'failure') {
                setMultiDeleteModal(false);
                showNotification({
                    title: 'Uh oh! something went wrong',
                    message: data.data?.message,
                    color: 'red',
                    icon: <IconX size={18} />,
                });
            } else {
                setMultiDeleteModal(false);
                setChecked([]);
                showNotification({
                    title: 'Congrats!',
                    message: data.data?.message ?? 'Service office deleted succefully.',
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                const pageToSet = pageToFetchMultiple < 1 ? 1 : pageToFetchMultiple;
                if (pageToSet === page) queryClient.invalidateQueries(['serviceoffer', pageToSet, limitChange]);
                else setPage(pageToSet);
            }
        },
        onError: (error: any) => {
            const {
                data: { message },
            } = error.response;
            setMultiDeleteModal(false);

            showNotification({
                title: 'Uh oh! something went wrong',
                message: message ?? 'Sorry! There was a problem with your request.',
                color: 'red',
                icon: <IconX size={18} />,
            });
        },
    });

    const serviceOfferDeleteMutation = useMutation((id: string) => serviceOfferAPI.delete(id), {
        onSuccess: (data) => {
            if (data.data?.status === 'failure') {
                setDeleteModal(false);
                setRowId(null);
                showNotification({
                    title: 'Uh oh! something went wrong',
                    message: data.data?.message,
                    color: 'red',
                    icon: <IconX size={18} />,
                });
            } else {
                setDeleteModal(false);
                setRowId(null);
                showNotification({
                    title: 'Congrats!',
                    message: data.data?.message ?? 'Service offer deleted succefully.',
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                if (pageToSet === page) queryClient.invalidateQueries(['serviceoffer', pageToSet, limitChange]);
                else setPage(pageToSet);
            }
        },
        onError: (error: any) => {
            const {
                data: { message },
            } = error.response;
            setDeleteModal(false);
            setRowId(null);
            showNotification({
                title: 'Uh oh! something went wrong',
                message: message ?? 'Sorry! There was a problem with your request.',
                color: 'red',
                icon: <IconX size={18} />,
            });
        },
    });

    const onCreateServiceOffer = (formData: FormData, values: ServiceOfferFormValuesProps, actions: FormikHelpers<ServiceOfferFormValuesProps>) => {
        serviceOfferMutation.mutate(formData, {
            onSuccess: (data) => {
                if (data.data.status === 'failure') {
                    setFormModal(false);
                    setRowId(null);
                    showNotification({
                        title: 'Uh oh! something went wrong',
                        message: data.data.message.title[0],
                        color: 'red',
                        icon: <IconX size={18} />,
                    });
                } else {
                    delete values?.profilePreviewUrl;
                    actions.resetForm();
                    setFormModal(false);
                    setRowId(null);
                    showNotification({
                        title: `Congrats! Service Offer ${rowId ? 'Updated' : 'Created'}`,
                        message: rowId ? 'Service offer updated successfully.' : data.data.message ?? 'Service offer created successfully.',
                        color: 'green',
                        icon: <IconCheck size={18} />,
                    });
                    const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                    if (pageToSet === page) queryClient.invalidateQueries(['serviceoffer', pageToSet, limitChange]);
                    else setPage(pageToSet);
                    // if (values.offer_scope && values.offer_scope.length === 0) {
                    //     delete values?.profilePreviewUrl;
                    //     delete values?.offer_scope;
                    //     actions.resetForm();
                    //     setFormModal(false);
                    //     setRowId(null);
                    //     showNotification({
                    //         title: 'Congrats!',
                    //         message: rowId ? 'Service offer updated successfully.' : data.data.message ?? 'Service offer created successfully.',
                    //         color: 'green',
                    //         icon: <IconCheck size={18} />,
                    //     });
                    //     const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                    //     if (pageToSet === page) queryClient.invalidateQueries(['serviceoffer', pageToSet, limitChange]);
                    //     else setPage(pageToSet);
                    // } else {
                    //     const dataToSend = values?.offer_scope?.map((value) => ({ ...value, offer: 15 }));
                    //     onCreateOfferScope(dataToSend, actions);
                    // }
                }
            },
            onError: (error: any) => {
                const {
                    data: {
                        message,
                        image,
                        quantity,
                        discount,
                        discount_type,
                        discount_limit,
                        free,
                        code,
                        start_date,
                        end_date,
                        categories,
                        services,
                        entity_services,
                        redeem_points,
                        offer_type,
                    },
                } = error.response;
                actions.setFieldError('image', image && image[0]);
                actions.setFieldError('quantity', quantity && quantity[0]);
                actions.setFieldError('discount', discount && discount[0]);
                actions.setFieldError('discount_type', discount_type && discount_type[0]);
                actions.setFieldError('discount_limit', discount_limit && discount_limit[0]);
                actions.setFieldError('free', free && free[0]);
                actions.setFieldError('code', code);
                actions?.setFieldError('start_date', start_date);
                actions?.setFieldError('end_date', end_date);
                actions?.setFieldError('categories', categories);
                actions?.setFieldError('services', services);
                actions?.setFieldError('entity_services', entity_services);
                actions?.setFieldError('redeem_points', redeem_points);
                actions?.setFieldError('offer_type', offer_type);

                showNotification({
                    title: 'Uh oh! something went wrong',
                    message: message ?? 'Sorry! There was a problem with your request.',
                    color: 'red',
                    icon: <IconX size={18} />,
                });
            },
        });
    };

    // const onCreateOfferScope = (data: ServiceOfferFormValuesProps['offer_scope'], actions: FormikHelpers<ServiceOfferFormValuesProps>) => {
    //     offerScopeMutation.mutate(data, {
    //         onSuccess: (data) => {
    //             if (data.data.status === 'failure') {
    //                 setFormModal(false);
    //                 setRowId(null);
    //                 showNotification({
    //                     title: 'Uh oh! something went wrong',
    //                     message: data.data.message.title[0],
    //                     color: 'red',
    //                     icon: <IconX size={18} />,
    //                 });
    //             } else {
    //                 actions.resetForm();
    //                 setFormModal(false);
    //                 setRowId(null);
    //                 showNotification({
    //                     title: 'Congrats!',
    //                     message: rowId ? 'Service offer updated successfully.' : data.data.message ?? 'Service offer created successfully.',
    //                     color: 'green',
    //                     icon: <IconCheck size={18} />,
    //                 });
    //                 const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
    //                 if (pageToSet === page) queryClient.invalidateQueries(['serviceoffer', pageToSet, limitChange]);
    //                 else setPage(pageToSet);
    //             }
    //         },
    //         onError: (error: any) => {
    //             const {
    //                 data: { message },
    //             } = error.response;
    //             showNotification({
    //                 title: 'Uh oh! something went wrong',
    //                 message: message ?? 'Sorry! There was a problem with your request.',
    //                 color: 'red',
    //                 icon: <IconX size={18} />,
    //             });
    //         },
    //     });
    // };

    const onHandleSearch = (query: string) => {
        queryClient.prefetchQuery(['serviceoffer', page, limitChange, ...[filterFormInitialData]], () =>
            serviceOfferAPI.list({ search: query, page_size: limitChange, ...serviceOfferFilterFormData })
        );
        setQuery(query);
        setPage(1);
    };

    const onSelectAll = () => {
        const isSelectAll = isAllCheckboxSelected();
        if (isSelectAll) {
            setChecked([]);
        } else {
            const checkedRowId = data?.data?.result.map((serviceOffer: ServiceOfferResult) => String(serviceOffer.id));
            setChecked(checkedRowId);
        }
    };

    const isCheckboxSelect = (id: number) => checked.includes(String(id));

    const handleSelect = (id: number) => {
        const isChecked = isCheckboxSelect(id);
        if (isChecked) {
            const filterCheckedList = checked.filter((val) => val !== String(id));
            setChecked(filterCheckedList);
        } else {
            setChecked((prevValue) => [...prevValue, String(id)]);
        }
    };

    const isAllCheckboxSelected = () => {
        const checkedRowId = data?.data?.result.map((serviceOffer: ServiceOfferResult) => String(serviceOffer.id));
        const isAllSelected = checkedRowId.every((id: number) => checked.includes(String(id)));
        return isAllSelected;
    };

    const handleSingleDelete = (id: number) => {
        setDeleteModal(true);
        setRowId(id);
    };

    const handleCloseModal = () => {
        if (!serviceOfferDeleteMutation.isLoading) {
            setDeleteModal(false);
            setRowId(null);
        }
    };

    const handleMultiDeleteCloseModal = () => {
        if (!serviceOfferMultiDeleteMutation.isLoading) {
            setMultiDeleteModal(false);
        }
    };

    const handleFormClose = () => {
        if (!serviceOfferMutation.isLoading) {
            setServiceOfferFormData({
                ...serviceOfferData,
            });
            setRowId(null);
            setFormModal(false);
        }
    };

    const handleFormModal = () => {
        setFormModal(true);
        setRowId(null);
    };

    const handleOfferRuleType = (id: number) => {
        setOfferRuleID(id);
        queryClient.prefetchQuery(['offer-rule-type'], () => offerRuleTypeAPI.get(Number(id)));
    };

    const handleFormModalEdit = (object: ServiceOfferResult) => {
        setServiceOfferFormData(mapToViewModal(object));
        setFormModal(true);
        setRowId(object?.id);
    };

    const formDataValues = (values: ServiceOfferFormValuesProps) => {
        values?.title && formData.append('title', values?.title);
        formData.append('description', values?.description);
        formData.append('offer_rule', values?.offer_rule);
        formData.append('discount', values?.discount);
        formData.append('discount_type', values?.discount_type || '');
        formData.append('discount_limit', values?.discount_limit);
        formData.append('quantity', values?.quantity);
        formData.append('free', values?.free);
        formData.append('offer_type', values?.offer_type ?? 'basic');
        values.code && formData.append('code', upperCase(values?.code));
        values.redeem_points && formData.append('redeem_points', upperCase(values?.redeem_points));
        values.start_date && formData.append('start_date', convertDateToIsoString(new Date(values.start_date)));
        values.end_date && formData.append('end_date', values.end_date ? convertDateToIsoString(new Date(values.end_date)) : '');
        formData.append('country', values?.country);
        formData.append('is_common', String(values?.is_common));
        formData.append('is_consumable', String(values?.is_consumable));
        formData.append('is_active', String(values?.is_active));

        if (!_.isEmpty(values?.entity_services?.[0]) && !values?.is_common)
            values?.entity_services?.forEach((val) => formData.append('entity_services', val ?? ['']));

        if (!_.isEmpty(values?.services?.[0]) && !values?.is_common) values?.services?.forEach((val) => formData.append('services', val ?? ''));

        if (!_.isEmpty(values?.categories?.[0]) && !values?.is_common) values?.categories?.forEach((val) => formData.append('categories', val ?? ''));

        if (values.image[0]?.name) values.image.forEach((file) => formData.append('image', file));
    };

    const mapToViewModal = (value: ServiceOfferResult) => {
        const servicesOptions = value.services && value.services.map((val: any) => String(val?.id));
        const categoriesOptions = value.categories && value.categories.map((val: any) => String(val?.id));
        const entityServicesOptions = value.entity_services && value.entity_services.map((val: any) => String(val?.id));

        const findCurrentEntityService = [{ ...value.free }];
        const findCurrentScopedEntityService = [...value.entity_services];
        const findCurrentService = [...value.services];
        const findCurrentCategories = [...value.categories];
        const formatCurrentEntityService =
            findCurrentEntityService &&
            findCurrentEntityService.map(({ id, title }) => {
                return {
                    value: String(id),
                    label: String(title),
                };
            });
        const formatCurrentScopedEntityService =
            findCurrentScopedEntityService &&
            findCurrentScopedEntityService.map(({ id, title }) => {
                return {
                    value: String(id),
                    label: String(title),
                };
            });
        const formatCurrentService =
            findCurrentService &&
            findCurrentService.map(({ id, title }) => {
                return {
                    value: String(id),
                    label: String(title),
                };
            });
        const formatCurrentCategories =
            findCurrentCategories &&
            findCurrentCategories.map(({ id, name }) => {
                return {
                    value: String(id),
                    label: String(name),
                };
            });
        if (!searchEntityService) {
            setEntityServiceOptions(formatCurrentEntityService);
        }
        if (!searchScopeEntity) {
            setScopeEntityOptions(formatCurrentScopedEntityService);
        }
        if (!searchService) {
            setServiceOptions(formatCurrentService);
        }
        if (!searchCategory) {
            setCategoryOptions(formatCurrentCategories);
        }

        return {
            id: value?.id,
            title: value.title,
            description: value?.description ?? '',
            offer_rule: String(value?.offer_rule?.id),
            discount: value?.discount ?? '',
            discount_type: value?.discount_type,
            discount_limit: value?.discount_limit ?? '',
            offer_type: value?.offer_type,
            code: value?.code ?? '',
            redeem_points: value?.redeem_points ?? '',
            quantity: value?.quantity ?? '',
            free: _.isNull(value?.free) ? '' : String(value?.free?.id),
            services: [...servicesOptions],
            categories: [...categoriesOptions],
            entity_services: [...entityServicesOptions],
            start_date: _.isNull(value?.start_date) ? '' : (new Date(value?.start_date) as unknown as string),
            end_date: _.isNull(value?.end_date) ? '' : (new Date(value?.end_date) as unknown as string),
            country: _.isNull(value?.country) ? '' : value?.country?.code,
            image: value?.image as unknown[],
            profilePreviewUrl: [{ src: value?.image }],
            is_consumable: value?.is_consumable,
            is_common: Number(value?.redeem_points) ? false : value?.is_common,
            is_active: value?.is_active,
        };
    };

    const onFilterFormClear = async () => {
        setServiceOfferFilterFormData({ ...filterFormInitialData });
        await queryClient.prefetchQuery(['serviceoffer', page, limitChange, ...[filterFormInitialData]], () =>
            serviceOfferAPI.list({ page: 1, page_size: '10' })
        );
    };

    const onShowFilterForm = () => setShowFilter(true);
    const onShowFilterFormClose = () => {
        setShowFilter(false);
        setServiceOfferFilterFormData({ ...filterFormInitialData });
    };

    //Service Offer detail handle function
    const handleDetailModalOpen = (object: ServiceOfferResult) => {
        setServiceOfferDetail(object);
        setServiceOfferDetailModal(true);
    };

    if (isError) {
        return <ErrorAlert />;
    }

    if (!is_superuser && !user_permissions?.includes('view_offer')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            <PageHeader pageTitle="Service Offer">
                <ViewAnalyticsButton navigateTo="/analytics/offer" />
                {(is_superuser || user_permissions?.includes('add_offer')) && <Button onClick={handleFormModal} name="Create" />}
            </PageHeader>
            <PaperBox>
                {showFilter && (
                    <>
                        <Box
                            sx={{
                                background: dark ? theme.colors.dark['4'] : theme.colors.gray['0'],
                                borderRadius: theme.radius.sm,
                                position: 'relative',
                            }}
                            p={20}>
                            <CloseButton
                                radius="xl"
                                color="dark"
                                variant="light"
                                size="sm"
                                sx={{ position: 'absolute', top: -8, right: -8 }}
                                onClick={onShowFilterFormClose}
                            />
                            <Formik
                                initialValues={serviceOfferFilterFormData}
                                onSubmit={async (values) => {
                                    const dataToSend: ServiceOfferFilterFormValuesProps = {
                                        ...values,
                                        date_from: values?.date_from ? getFormatedDate(new Date(values?.date_from)) : '',
                                        date_to: values?.date_to ? getFormatedDate(new Date(values?.date_to)) : '',
                                    };

                                    delete dataToSend?.created_range;

                                    setIsFiltering(true);
                                    setServiceOfferFilterFormData({ ...dataToSend });
                                    setPage(1);
                                    await queryClient.prefetchQuery(['serviceoffer', page, limitChange, ...[filterFormInitialData]], () =>
                                        serviceOfferAPI.list({ ...dataToSend, page: 1, page_size: limitChange })
                                    );
                                    if (isSuccess) setIsFiltering(false);
                                }}>
                                {({ handleReset, setFieldValue, dirty }) => (
                                    <Form>
                                        <Grid mb={10}>
                                            <Grid.Col md={2}>
                                                <DateRangeField
                                                    name="created_range"
                                                    placeHolder="Select created range"
                                                    icon={<IconCalendar size={18} stroke={1.75} />}
                                                    handleDateRange={(value) => {
                                                        setFieldValue('created_range', value);
                                                        setFieldValue('date_from', value[0]);
                                                        setFieldValue('date_to', value[1]);
                                                    }}
                                                    style={{ marginBottom: 0 }}
                                                />
                                            </Grid.Col>
                                            <Grid.Col md={2}>
                                                <SelectField
                                                    name="created_by"
                                                    placeHolder="Search created by"
                                                    options={userOptions}
                                                    handleChange={(value) => setFieldValue('created_by', value)}
                                                    onSearchChange={(value) => {
                                                        if (value && value.length >= 3) {
                                                            setSearchCreateddBy(value);
                                                        } else {
                                                            setSearchCreateddBy('');
                                                        }
                                                    }}
                                                    rightSection={isUserFetching && <Loader size="xs" />}
                                                    icon={<IconUser size={18} stroke={1.75} />}
                                                    searchable
                                                    clearable
                                                    style={{ marginBottom: 0 }}
                                                />
                                            </Grid.Col>
                                            <Grid.Col md={2}>
                                                <SelectField
                                                    name="offer_rule"
                                                    placeHolder="Select offer rule"
                                                    options={offerRuleOptions}
                                                    handleChange={(value) => setFieldValue('offer_rule', value)}
                                                    icon={<IconVectorTriangle size={18} stroke={1.75} />}
                                                    clearable
                                                    searchable
                                                    style={{ marginBottom: 0 }}
                                                />
                                            </Grid.Col>
                                            <Grid.Col md={2}>
                                                <SelectField
                                                    name="is_consumable"
                                                    placeHolder="Select consumable"
                                                    options={[
                                                        { value: 'true', label: 'Yes' },
                                                        { value: 'false', label: 'No' },
                                                    ]}
                                                    handleChange={(value) => {
                                                        setFieldValue('is_consumable', value);
                                                    }}
                                                    icon={<IconCircleCheck size={18} stroke={1.75} />}
                                                    clearable
                                                    style={{ marginBottom: 0 }}
                                                />
                                            </Grid.Col>
                                            <Grid.Col md={2}>
                                                <SelectField
                                                    name="ordering"
                                                    placeHolder="Order by"
                                                    options={[
                                                        { value: 'created_at', label: 'Last to Latest' },
                                                        { value: '-created_at', label: 'Latest to Last' },
                                                    ]}
                                                    handleChange={(value) => {
                                                        setFieldValue('ordering', value);
                                                    }}
                                                    icon={<IconSelector size={18} stroke={1.75} />}
                                                    clearable
                                                    style={{ marginBottom: 0 }}
                                                />
                                            </Grid.Col>
                                        </Grid>
                                        <Button type="submit" name="Filter" loading={isFiltering} disabled={!dirty} />
                                        <Button
                                            type="button"
                                            name="Clear Filter"
                                            onClick={() => {
                                                handleReset();
                                                onFilterFormClear();
                                            }}
                                            variant="light"
                                            ml={10}
                                            disabled={!dirty}
                                        />
                                    </Form>
                                )}
                            </Formik>
                        </Box>
                        <Divider my={20} variant="dashed" />
                    </>
                )}
                <ServiceOfferTable
                    data={data?.data?.result}
                    page={page}
                    checked={checked}
                    isLoading={isLoading}
                    isSuccess={isSuccess}
                    total={data?.data?.total_pages}
                    isDeleteModalOpened={deleteModal}
                    isMultiDeleteModalOpened={multiDeleteModal}
                    isSingleDeleteMutationLoading={serviceOfferDeleteMutation.isLoading}
                    isMultiDeleteMutationLoading={serviceOfferMultiDeleteMutation.isLoading}
                    isAllCheckboxSelected={isAllCheckboxSelected}
                    isCheckboxSelect={isCheckboxSelect as unknown as undefined}
                    handleSelect={handleSelect as unknown as undefined}
                    handleSingleDelete={handleSingleDelete}
                    onSelectAll={onSelectAll}
                    onSetPage={setPage}
                    onClickDeleteAll={() => setMultiDeleteModal(true)}
                    onConfirmSingleDelete={() => serviceOfferDeleteMutation.mutate(String(rowId))}
                    onConfirmMultiDelete={() => serviceOfferMultiDeleteMutation.mutate(checked)}
                    handleSingleDeleteCloseModal={handleCloseModal}
                    handleMultiDeleteCloseModal={handleMultiDeleteCloseModal}
                    onHandleSearch={onHandleSearch}
                    handleFormModalEdit={handleFormModalEdit}
                    limitChange={limitChange}
                    handleLimitChange={handleLimitChange}
                    onShowFilterForm={onShowFilterForm}
                    isFetching={isFetching}
                    query={query}
                    handleDetailModalOpen={handleDetailModalOpen}
                />
            </PaperBox>
            <Formik
                enableReinitialize
                initialValues={serviceOfferFormData}
                validationSchema={serviceOfferSchema}
                onSubmit={(values, actions) => {
                    formDataValues(values);
                    onCreateServiceOffer(formData, values, actions);
                }}>
                {({ errors, touched, handleSubmit, handleReset, values, setFieldValue, handleBlur }) => {
                    const checkServiceCategoriesLength =
                        values?.services && values?.services?.length < 1 && values?.categories && values?.categories?.length < 1;
                    const checkEntityServiceCategoriesLength =
                        values?.entity_services && values?.entity_services?.length < 1 && values?.categories && values?.categories?.length < 1;
                    const checkEntityServiceAndServiceLength =
                        values?.entity_services && values?.entity_services?.length < 1 && values?.services && values?.services?.length < 1;
                    return (
                        <FormModal
                            opened={formModal}
                            onClose={() => {
                                if (!serviceOfferMutation.isLoading) {
                                    handleReset();
                                }
                                handleFormClose();
                            }}
                            title={`${rowId ? 'Edit Service Offer' : 'Add Service Offer'}`}
                            onConfirm={handleSubmit}
                            confirmButtonText={`${rowId ? 'Save' : 'Add'}`}
                            loading={serviceOfferMutation.isLoading}
                            size="xl">
                            <Form>
                                <ProfileImageField
                                    labelName="Upload Image"
                                    name="image"
                                    profileImageData={values.profilePreviewUrl}
                                    error={errors.image as string}
                                    handleBlur={handleBlur}
                                    setFieldValue={setFieldValue}
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
                                <TextAreaField
                                    name="description"
                                    labelName="Description"
                                    placeHolder="Enter the description"
                                    error={errors.description}
                                    touch={touched.description}
                                />
                                <SelectField
                                    name="offer_rule"
                                    labelName="Offer Rule"
                                    placeHolder="Select type"
                                    error={errors.offer_rule}
                                    touch={touched.offer_rule}
                                    options={offerRuleOptions}
                                    handleChange={(value) => {
                                        handleOfferRuleType(Number(value));
                                        setFieldValue('offer_rule', value);
                                    }}
                                    icon={<IconVectorTriangle size={18} stroke={1.75} />}
                                    rightSection={isOfferRuleLoading && <Loader size="xs" />}
                                    withAsterisk
                                />
                                {offerRuleData?.data?.has_discount && (
                                    <Grid>
                                        <Grid.Col md={4} py={0}>
                                            <InputField
                                                name="discount"
                                                labelName="Discount"
                                                error={errors.discount}
                                                touch={touched.discount}
                                                placeHolder="Enter discount amount"
                                                icon={<IconTag size={18} stroke={1.75} />}
                                                withAsterisk
                                            />
                                        </Grid.Col>
                                        <Grid.Col md={4} py={0}>
                                            <SelectField
                                                name="discount_type"
                                                labelName="Discount Type"
                                                placeHolder="e.g. Percentage/Amount"
                                                options={discountTypeOptions}
                                                error={errors.discount_type}
                                                touch={touched.discount_type}
                                                handleChange={(value) => {
                                                    setFieldValue('discount_type', value);
                                                }}
                                                icon={<IconHourglassEmpty size={18} stroke={1.75} />}
                                                clearable
                                                withAsterisk
                                            />
                                        </Grid.Col>
                                        <Grid.Col md={4} py={0}>
                                            <InputField
                                                name="discount_limit"
                                                labelName="Discount Limit"
                                                error={errors.discount_limit}
                                                touch={touched.discount_limit}
                                                placeHolder="Enter discount limit"
                                                icon={<IconTag size={18} stroke={1.75} />}
                                                withAsterisk
                                            />
                                        </Grid.Col>
                                    </Grid>
                                )}
                                {offerRuleData?.data?.has_quantity && (
                                    <InputField
                                        name="quantity"
                                        labelName="Quantity"
                                        error={errors.quantity}
                                        touch={touched.quantity}
                                        placeHolder="Enter quantity"
                                        icon={<IconTag size={18} stroke={1.75} />}
                                        withAsterisk
                                    />
                                )}
                                {offerRuleData?.data?.has_free_items && (
                                    <SelectField
                                        name="free"
                                        labelName="Free"
                                        placeHolder="Search entity service"
                                        options={entityServiceOptions}
                                        error={errors.free}
                                        touch={touched.free}
                                        handleChange={(value) => setFieldValue('free', value)}
                                        onSearchChange={(value) => {
                                            if (value && value.length >= 3) {
                                                setSearchEntityService(value);
                                            } else {
                                                setSearchEntityService('');
                                            }
                                        }}
                                        rightSection={isEntityServiceFetching && <Loader size="xs" />}
                                        icon={<IconTag size={18} stroke={1.75} />}
                                        searchable
                                        clearable
                                        withAsterisk
                                    />
                                )}
                                <Grid>
                                    <Grid.Col md={values?.offer_type === 'promo_code' ? 4 : 6} py={0}>
                                        <SelectField
                                            name="offer_type"
                                            labelName="Offer Type"
                                            placeHolder="e.g. Gift Card/Promocode"
                                            options={offerTypeOptions}
                                            error={errors.offer_type}
                                            touch={touched.offer_type}
                                            handleChange={(value) => {
                                                setFieldValue('offer_type', value);
                                                if (value !== 'promo_code') {
                                                    setFieldValue('redeem_points', '');
                                                    setFieldValue('is_common', false);
                                                }
                                            }}
                                            icon={<IconDiscount2 size={18} stroke={1.75} />}
                                            clearable
                                            withAsterisk
                                        />
                                    </Grid.Col>
                                    {values?.offer_type === 'promo_code' && (
                                        <Grid.Col md={4} py={0}>
                                            <InputField
                                                name="redeem_points"
                                                labelName="Redeem point"
                                                error={errors.redeem_points}
                                                touch={touched.redeem_points}
                                                placeHolder="Enter redeem point"
                                                icon={<IconTag size={18} stroke={1.75} />}
                                                withAsterisk
                                            />
                                        </Grid.Col>
                                    )}
                                    <Grid.Col md={values?.offer_type === 'promo_code' ? 4 : 6} py={0}>
                                        <InputField
                                            name="code"
                                            labelName="Promocode"
                                            error={errors.code}
                                            touch={touched.code}
                                            placeHolder="e.g: NEWYEAR2022/HALLOWEIN2022"
                                            icon={<IconTag size={18} stroke={1.75} />}
                                            withAsterisk={
                                                values?.offer_type === 'promo_code' ||
                                                values?.offer_type === 'coupon' ||
                                                values?.offer_type === 'scratch_card'
                                            }
                                        />
                                    </Grid.Col>
                                </Grid>
                                <Grid gutter={15} mb={10}>
                                    <Grid.Col span={6} py="0">
                                        {/* <DateField
                                            name="start_date"
                                            labelName="Start Date"
                                            placeHolder="Select Start Date"
                                            error={errors.start_date}
                                            touch={touched.start_date}
                                            icon={<IconCalendarEvent size={18} stroke={1.75} />}
                                            minDate={new Date()}
                                            handleChange={(value) => setFieldValue('start_date', value ? convertDateToIsoString(value) : null)}
                                            onBlur={handleBlur}
                                            withAsterisk
                                            clearable
                                        /> */}
                                        <DateTimePicker
                                            label="Offer starts on"
                                            error={touched?.start_date && errors?.start_date ? errors?.start_date : ''}
                                            placeholderText="Select start date and time"
                                            selected={values?.start_date ? new Date(values?.start_date) : null}
                                            timeIntervals={5}
                                            onChange={(date) => setFieldValue('start_date', date)}
                                            showTimeSelect
                                            dateFormat="MMMM d, yyyy h:mm aa"
                                            minDate={new Date()}
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={6} py="0">
                                        {/* <DateField
                                            name="end_date"
                                            labelName="End Date"
                                            placeHolder="Select End Date"
                                            error={errors.end_date}
                                            touch={touched.end_date}
                                            icon={<IconCalendarDue size={18} stroke={1.75} />}
                                            minDate={new Date()}
                                            handleChange={(value) => setFieldValue('end_date', value ? convertDateToIsoString(value) : null)}
                                            clearable
                                        /> */}
                                        <DateTimePicker
                                            label="Offer Ends on"
                                            error={touched?.end_date && errors?.end_date ? errors?.end_date : ''}
                                            placeholderText="Select end date and time"
                                            selected={values?.end_date ? new Date(values?.end_date) : null}
                                            timeIntervals={5}
                                            onChange={(date) => setFieldValue('end_date', date)}
                                            showTimeSelect
                                            dateFormat="MMMM d, yyyy h:mm aa"
                                            minDate={new Date()}
                                        />
                                    </Grid.Col>
                                </Grid>
                                <SelectField
                                    name="country"
                                    labelName="Country"
                                    placeHolder="e.g. Nepal/USA/Australia"
                                    options={countryOptions}
                                    handleChange={(value) => {
                                        setFieldValue('country', value);
                                    }}
                                    searchable
                                    clearable
                                />
                                {!Number(values?.redeem_points) && (
                                    <SwitchCheckbox
                                        name="is_common"
                                        checked={values?.is_common}
                                        onChange={(e) => setFieldValue('is_common', e.currentTarget.checked)}
                                        labelName="Is Common"
                                        mb={15}
                                    />
                                )}
                                {!values?.is_common && (
                                    <>
                                        <Title order={6} weight={600} mb={10}>
                                            Offer Scope
                                        </Title>
                                        <Divider mb={20} variant="dashed" />
                                        <Text size="sm" component="label" weight={500} mb={4} sx={{ display: 'inline-block' }}>
                                            Entity Services{' '}
                                            {checkServiceCategoriesLength && (
                                                <Text component="span" color="red">
                                                    *
                                                </Text>
                                            )}
                                        </Text>
                                        <FieldArray name="entity_services">
                                            {({ remove, push }) => (
                                                <Box>
                                                    <Grid gutter={10} mb={5}>
                                                        {values?.entity_services &&
                                                            values?.entity_services.map((_, idx) => (
                                                                <Grid.Col key={idx} span={4}>
                                                                    <Group position="left" spacing={5}>
                                                                        <SelectField
                                                                            name={`entity_services.${idx}`}
                                                                            placeHolder="Search entity service"
                                                                            options={scopeEntityOptions}
                                                                            handleChange={(value) => setFieldValue(`entity_services.${idx}`, value)}
                                                                            error={getIn(errors, `entity_services.${idx}`)}
                                                                            touch={getIn(touched, `entity_services.${idx}`)}
                                                                            onSearchChange={(value) => {
                                                                                if (value && value.length >= 3) {
                                                                                    setCurrEntIndex(idx);
                                                                                    setSearchScopeEntity(value);
                                                                                } else {
                                                                                    setCurrEntIndex(null);
                                                                                    setSearchScopeEntity('');
                                                                                }
                                                                            }}
                                                                            rightSection={
                                                                                isScopeEntityFetching && currEntIndex === idx && <Loader size="xs" />
                                                                            }
                                                                            icon={<IconTag size={18} stroke={1.75} />}
                                                                            searchable
                                                                            clearable
                                                                            style={{ marginBottom: 0, width: '88%' }}
                                                                        />

                                                                        <ActionIcon
                                                                            variant="light"
                                                                            radius="xl"
                                                                            size="sm"
                                                                            color="gray"
                                                                            onClick={() => remove(idx)}
                                                                            sx={{
                                                                                cursor: 'pointer',
                                                                            }}>
                                                                            <IconCircleX size={18} stroke={1.75} />
                                                                        </ActionIcon>
                                                                    </Group>
                                                                </Grid.Col>
                                                            ))}
                                                    </Grid>
                                                    {Number(values?.redeem_points) &&
                                                    values?.entity_services &&
                                                    values?.entity_services?.length < 1 ? (
                                                        <Button
                                                            name="Add"
                                                            variant="light"
                                                            leftIcon={<IconPlus size={18} stroke={1.75} />}
                                                            onClick={() => push('')}
                                                            mt={5}
                                                            mb={20}
                                                        />
                                                    ) : !Number(values?.redeem_points) ? (
                                                        <Button
                                                            name="Add"
                                                            variant="light"
                                                            leftIcon={<IconPlus size={18} stroke={1.75} />}
                                                            onClick={() => push('')}
                                                            mt={5}
                                                            mb={20}
                                                        />
                                                    ) : (
                                                        ''
                                                    )}
                                                </Box>
                                            )}
                                        </FieldArray>
                                        {!Number(values?.redeem_points) && (
                                            <>
                                                <Text size="sm" component="label" weight={500} mb={4} sx={{ display: 'inline-block' }}>
                                                    Services{' '}
                                                    {checkEntityServiceCategoriesLength && (
                                                        <Text component="span" color="red">
                                                            *
                                                        </Text>
                                                    )}
                                                </Text>
                                                <FieldArray name="services">
                                                    {({ remove, push }) => (
                                                        <Box>
                                                            <Grid gutter={10} mb={5}>
                                                                {values?.services &&
                                                                    values?.services.map((_, idx) => (
                                                                        <Grid.Col key={idx} span={4}>
                                                                            <Group position="left" spacing={5}>
                                                                                <SelectField
                                                                                    name={`services.${idx}`}
                                                                                    placeHolder="Search service"
                                                                                    options={serviceOptions}
                                                                                    handleChange={(value) => setFieldValue(`services.${idx}`, value)}
                                                                                    error={getIn(errors, `services.${idx}`)}
                                                                                    touch={getIn(touched, `services.${idx}`)}
                                                                                    onSearchChange={(value) => {
                                                                                        if (value && value.length >= 3) {
                                                                                            setCurrEntIndex(idx);
                                                                                            setSearchService(value);
                                                                                        } else {
                                                                                            setSearchService('');
                                                                                        }
                                                                                    }}
                                                                                    rightSection={
                                                                                        isServiceFetching &&
                                                                                        currEntIndex === idx && <Loader size="xs" />
                                                                                    }
                                                                                    icon={<IconTool size={18} stroke={1.75} />}
                                                                                    searchable
                                                                                    clearable
                                                                                    style={{ marginBottom: 0, width: '88%' }}
                                                                                />
                                                                                <ActionIcon
                                                                                    variant="light"
                                                                                    radius="xl"
                                                                                    size="sm"
                                                                                    color="gray"
                                                                                    onClick={() => remove(idx)}
                                                                                    sx={{
                                                                                        cursor: 'pointer',
                                                                                    }}>
                                                                                    <IconCircleX size={18} stroke={1.75} />
                                                                                </ActionIcon>
                                                                            </Group>
                                                                        </Grid.Col>
                                                                    ))}
                                                            </Grid>
                                                            <Button
                                                                name="Add"
                                                                variant="light"
                                                                leftIcon={<IconPlus size={18} stroke={1.75} />}
                                                                onClick={() => push('')}
                                                                mt={5}
                                                                mb={20}
                                                            />
                                                        </Box>
                                                    )}
                                                </FieldArray>
                                                <Text size="sm" component="label" weight={500} mb={4} sx={{ display: 'inline-block' }}>
                                                    Categories{' '}
                                                    {checkEntityServiceAndServiceLength && (
                                                        <Text component="span" color="red">
                                                            *
                                                        </Text>
                                                    )}
                                                </Text>
                                                <FieldArray name="categories">
                                                    {({ remove, push }) => (
                                                        <Box>
                                                            <Grid gutter={10} mb={5}>
                                                                {values?.categories &&
                                                                    values?.categories.map((_, idx) => (
                                                                        <Grid.Col key={idx} span={4}>
                                                                            <Group position="left" spacing={5}>
                                                                                <SelectField
                                                                                    name={`categories.${idx}`}
                                                                                    placeHolder="Search category"
                                                                                    options={categoryOptions}
                                                                                    handleChange={(value) =>
                                                                                        setFieldValue(`categories.${idx}`, value)
                                                                                    }
                                                                                    error={getIn(errors, `categories.${idx}`)}
                                                                                    touch={getIn(touched, `categories.${idx}`)}
                                                                                    onSearchChange={(value) => {
                                                                                        if (value && value.length >= 3) {
                                                                                            setCurrEntIndex(idx);
                                                                                            setSearchCategory(value);
                                                                                        } else {
                                                                                            setSearchCategory('');
                                                                                        }
                                                                                    }}
                                                                                    rightSection={
                                                                                        isCategoryFetching &&
                                                                                        currEntIndex === idx && <Loader size="xs" />
                                                                                    }
                                                                                    icon={<IconCategory size={18} stroke={1.75} />}
                                                                                    searchable
                                                                                    clearable
                                                                                    style={{ marginBottom: 0, width: '88%' }}
                                                                                />
                                                                                <ActionIcon
                                                                                    variant="light"
                                                                                    radius="xl"
                                                                                    size="sm"
                                                                                    color="gray"
                                                                                    onClick={() => remove(idx)}
                                                                                    sx={{
                                                                                        cursor: 'pointer',
                                                                                    }}>
                                                                                    <IconCircleX size={18} stroke={1.75} />
                                                                                </ActionIcon>
                                                                            </Group>
                                                                        </Grid.Col>
                                                                    ))}
                                                            </Grid>
                                                            <Button
                                                                name="Add"
                                                                variant="light"
                                                                leftIcon={<IconPlus size={18} stroke={1.75} />}
                                                                onClick={() => push('')}
                                                                mt={5}
                                                                mb={20}
                                                            />
                                                        </Box>
                                                    )}
                                                </FieldArray>
                                            </>
                                        )}
                                    </>
                                )}
                                {/* <Box mb={30}>
                                <Title order={6} weight={600} mb={10}>
                                    Offer Scope
                                </Title>
                                <Divider mb={20} variant="dashed" />
                                <FieldArray name="offer_scope">
                                    {({ remove, push }) => (
                                        <Box>
                                            {values?.offer_scope &&
                                                values?.offer_scope.map((_, idx) => (
                                                    <Grid key={idx} gutter={15}>
                                                        <Grid.Col span={4} py={0}>
                                                            <SelectField
                                                                name={`offer_scope.${idx}.entity_service`}
                                                                placeHolder="Search entity service"
                                                                options={scopeEntityOptions}
                                                                handleChange={(value) => setFieldValue(`offer_scope.${idx}.entity_service`, value)}
                                                                error={getIn(errors, `offer_scope.${idx}.entity_service`)}
                                                                touch={getIn(touched, `offer_scope.${idx}.entity_service`)}
                                                                onSearchChange={(value) => {
                                                                    if (value && value.length >= 3) {
                                                                        setSearchScopeEntity(value);
                                                                    } else {
                                                                        setSearchScopeEntity('');
                                                                    }
                                                                }}
                                                                rightSection={isScopeEntityFetching && <Loader size="xs" />}
                                                                icon={<IconTag size={18} stroke={1.75} />}
                                                                searchable
                                                                clearable
                                                            />
                                                        </Grid.Col>
                                                        <Grid.Col span={4} py={0}>
                                                            <SelectField
                                                                name={`offer_scope.${idx}.service`}
                                                                placeHolder="Search service"
                                                                options={serviceOptions}
                                                                handleChange={(value) => setFieldValue(`offer_scope.${idx}.service`, value)}
                                                                error={getIn(errors, `offer_scope.${idx}.service`)}
                                                                touch={getIn(touched, `offer_scope.${idx}.service`)}
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
                                                            />
                                                        </Grid.Col>
                                                        <Grid.Col span={3} py={0}>
                                                            <SelectField
                                                                name={`offer_scope.${idx}.category`}
                                                                placeHolder="Search category"
                                                                options={categoryOptions}
                                                                handleChange={(value) => setFieldValue(`offer_scope.${idx}.category`, value)}
                                                                error={getIn(errors, `offer_scope.${idx}.category`)}
                                                                touch={getIn(touched, `offer_scope.${idx}.category`)}
                                                                onSearchChange={(value) => {
                                                                    if (value && value.length >= 3) {
                                                                        setSearchCategory(value);
                                                                    } else {
                                                                        setSearchCategory('');
                                                                    }
                                                                }}
                                                                rightSection={isCategoryFetching && <Loader size="xs" />}
                                                                icon={<IconCategory size={18} stroke={1.75} />}
                                                                searchable
                                                                clearable
                                                            />
                                                        </Grid.Col>
                                                        <Grid.Col span={1}>
                                                            <IconCircleX size={18} stroke={1.75} color={iconColorMode} onClick={() => remove(idx)} />
                                                        </Grid.Col>
                                                    </Grid>
                                                ))}
                                            <Button
                                                name="Add"
                                                variant="light"
                                                leftIcon={<IconPlus size={18} stroke={1.75} />}
                                                onClick={() => push({ entity_service: '', service: '', category: '' })}
                                            />
                                        </Box>
                                    )}
                                </FieldArray>
                            </Box> */}
                                <SwitchCheckbox
                                    name="is_consumable"
                                    checked={values.is_consumable}
                                    onChange={(e) => setFieldValue('is_consumable', e.currentTarget.checked)}
                                    labelName="Is Consumable"
                                    my={15}
                                />
                                <SwitchCheckbox
                                    name="is_active"
                                    checked={values.is_active}
                                    onChange={(e) => setFieldValue('is_active', e.currentTarget.checked)}
                                    labelName="Is Active"
                                    mb={15}
                                />
                            </Form>
                        </FormModal>
                    );
                }}
            </Formik>
            <Modal
                size={'60%'}
                opened={serviceOfferDetailModal}
                onClose={() => {
                    setServiceOfferDetail(undefined);
                    setServiceOfferDetailModal(false);
                }}
                centered
                overlayBlur={3}
                overlayOpacity={0.2}
                closeOnClickOutside={false}
                title={
                    <Title order={5} sx={{ fontWeight: 600 }}>
                        Service Offer Details
                    </Title>
                }>
                <Group position="apart" align="start">
                    <Stack>
                        <Avatar
                            src={`${serviceOfferDetail?.image ?? ''}`}
                            alt="user-profile"
                            sx={{
                                width: '200px',
                                height: 'auto',
                            }}
                        />
                        <Stack align="flex-start" spacing={5}>
                            <Text weight={600}>{serviceOfferDetail?.title ?? ''}</Text>
                            {serviceOfferDetail?.code && <Badge radius={'xs'}>{serviceOfferDetail?.code}</Badge>}
                        </Stack>
                    </Stack>
                    <Stack align="flex-start" spacing={5}>
                        <Text weight={500} size={'xs'}>
                            Created at : {serviceOfferDetail?.created_at ? converDateFromIsonString(serviceOfferDetail?.created_at) : '_'}
                        </Text>
                        <Text weight={500} size={'xs'}>
                            Updated at : {serviceOfferDetail?.updated_at ? converDateFromIsonString(serviceOfferDetail?.updated_at) : '_'}
                        </Text>
                    </Stack>
                </Group>
                <Grid align="start" mt={15}>
                    <Grid.Col md={12} mt={10}>
                        <Divider variant="dashed" />
                        <Text weight={500} color="dimmed" my={5}>
                            Offer Details :
                        </Text>
                        <Divider variant="dashed" />
                    </Grid.Col>
                    <Grid.Col md={3}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                            1. Offer Starts On
                        </Text>
                        <Box>
                            {serviceOfferDetail?.start_date ? (
                                <Badge radius={'xs'} color="green">
                                    {converDateFromIsonString(serviceOfferDetail?.start_date)} {getFormatedTimeAmPm(serviceOfferDetail?.start_date)}
                                </Badge>
                            ) : (
                                '_'
                            )}
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={3}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                            2. Offer Ends On
                        </Text>
                        <Box>
                            {serviceOfferDetail?.end_date ? (
                                <Badge radius={'xs'} color="red">
                                    {converDateFromIsonString(serviceOfferDetail?.end_date)} {getFormatedTimeAmPm(serviceOfferDetail?.end_date)}
                                </Badge>
                            ) : (
                                '-'
                            )}
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={3}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                            3. Offer Type
                        </Text>
                        <Box>
                            <Text>{serviceOfferDetail?.offer_type?.replace('_', ' ') ?? '-'}</Text>
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={3}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                            4. Redeem Points
                        </Text>
                        <Box>
                            <Text>{serviceOfferDetail?.redeem_points ?? '-'}</Text>
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={3}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                            5. Offer Created By
                        </Text>
                        <Box>
                            <Group position="left" spacing={10}>
                                <Avatar src={`${serviceOfferDetail?.created_by?.profile_image ?? ''}`} alt="user-profile" radius="xl" size={30} />
                                <Box>
                                    <Text fw={500}>{serviceOfferDetail?.created_by?.full_name ?? ''}</Text>
                                    <Text color="dimmed">
                                        {!_.isEmpty(serviceOfferDetail?.created_by?.email)
                                            ? serviceOfferDetail?.created_by?.email
                                            : '@' + serviceOfferDetail?.created_by?.username}
                                    </Text>
                                </Box>
                            </Group>
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={3}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                            6. Offer Code
                        </Text>
                        <Box>
                            <Text weight={500}>{serviceOfferDetail?.code ?? '-'}</Text>
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={3}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                            7. Discount Type
                        </Text>
                        <Box>
                            <Text>{serviceOfferDetail?.discount_type ?? '-'}</Text>
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={3}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                            8. Discount
                        </Text>
                        <Box>
                            <Text size={20} weight={500}>
                                {serviceOfferDetail?.entity_services[0]?.currency?.symbol ?? ''}{' '}
                                {serviceOfferDetail?.discount ? Number(serviceOfferDetail?.discount) : '-'}
                            </Text>
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={3}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                            9. Discount Limit
                        </Text>
                        <Box>
                            <Text size={20} weight={500}>
                                {serviceOfferDetail?.entity_services[0]?.currency?.symbol ?? ''}{' '}
                                {serviceOfferDetail?.discount_limit ? Number(serviceOfferDetail?.discount_limit) : '-'}
                            </Text>
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={3}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                            10. Is Active?
                        </Text>
                        <Box>
                            <CustomBadge
                                name={serviceOfferDetail?.is_active ? 'Yes' : 'No'}
                                color={serviceOfferDetail?.is_active ? 'green' : 'red'}
                            />
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={3}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                            11. Is Common?
                        </Text>
                        <Box>
                            <CustomBadge
                                name={serviceOfferDetail?.is_common ? 'Yes' : 'No'}
                                color={serviceOfferDetail?.is_common ? 'green' : 'red'}
                            />
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={3}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                            12. Is Consumable?
                        </Text>
                        <Box>
                            <CustomBadge
                                name={serviceOfferDetail?.is_consumable ? 'Yes' : 'No'}
                                color={serviceOfferDetail?.is_consumable ? 'green' : 'red'}
                            />
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={12}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                            13. Description
                        </Text>
                        <Box>
                            <Text sx={{ whiteSpace: 'break-spaces' }}>{serviceOfferDetail?.description ?? '-'}</Text>
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={12} mt={10}>
                        <Divider variant="dashed" />
                        <Text weight={500} color="dimmed" my={5}>
                            Offer Rule :
                        </Text>
                        <Divider variant="dashed" />
                    </Grid.Col>
                    <Grid.Col md={3}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                            1. Title
                        </Text>
                        <Box>
                            <Text>{serviceOfferDetail?.offer_rule?.title ?? '-'}</Text>
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={3}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                            2. Is Active?
                        </Text>
                        <Box>
                            <CustomBadge
                                name={serviceOfferDetail?.offer_rule?.is_active ? 'Yes' : 'No'}
                                color={serviceOfferDetail?.offer_rule?.is_active ? 'green' : 'red'}
                            />
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={3}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                            3. Has Discount?
                        </Text>
                        <Box>
                            <CustomBadge
                                name={serviceOfferDetail?.offer_rule?.has_discount ? 'Yes' : 'No'}
                                color={serviceOfferDetail?.offer_rule?.has_discount ? 'green' : 'red'}
                            />
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={3}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                            4. Has Free Items?
                        </Text>
                        <Box>
                            <CustomBadge
                                name={serviceOfferDetail?.offer_rule?.has_free_items ? 'Yes' : 'No'}
                                color={serviceOfferDetail?.offer_rule?.has_free_items ? 'green' : 'red'}
                            />
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={3}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                            5. Has Quantity?
                        </Text>
                        <Box>
                            <CustomBadge
                                name={serviceOfferDetail?.offer_rule?.has_quantity ? 'Yes' : 'No'}
                                color={serviceOfferDetail?.offer_rule?.has_quantity ? 'green' : 'red'}
                            />
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={9}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                            6. Description
                        </Text>
                        <Box>
                            <Text>{serviceOfferDetail?.description ?? '-'}</Text>
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={12} mt={10}>
                        <Divider variant="dashed" />
                        <Text weight={500} color="dimmed" my={5}>
                            Related entity Services :
                        </Text>
                        <Divider variant="dashed" />
                    </Grid.Col>
                    <Grid.Col md={12}>
                        <Accordion chevronPosition="right" variant="contained">
                            {serviceOfferDetail?.entity_services?.map((service, index) => (
                                <Accordion.Item value={service.id} key={service?.id}>
                                    <Accordion.Control>
                                        <Group spacing={5}>
                                            <Text weight={500}>{index + 1}.</Text>
                                            <Text weight={500}>{service?.title}</Text>
                                        </Group>
                                    </Accordion.Control>
                                    <Accordion.Panel>
                                        <List type="ordered">
                                            <List.Item>Title : {service?.title ?? '_'}</List.Item>
                                            <List.Item>
                                                Budget :{' '}
                                                {service?.is_range
                                                    ? `${service?.currency?.symbol ?? ''} ${
                                                          service?.budget_from ? Number(service?.budget_from) : '-'
                                                      } ${service?.budget_to ? Number(service?.budget_to) : '-'}`
                                                    : `${service?.currency?.symbol ?? ''} ${
                                                          service?.budget_from ? Number(service?.budget_from) : '-'
                                                      }`}
                                            </List.Item>
                                            <List.Item>
                                                Payable :{' '}
                                                {service?.is_range
                                                    ? `${service?.currency?.symbol ?? ''} ${
                                                          service?.payable_from ? Number(service?.payable_from) : '-'
                                                      } ${service?.payable_to ? Number(service?.payable_to) : '-'}`
                                                    : `${service?.currency?.symbol ?? ''} ${
                                                          service?.payable_from ? Number(service?.payable_from) : '-'
                                                      }`}
                                            </List.Item>
                                            <List.Item>Created By : {service?.created_by?.full_name}</List.Item>
                                            <List.Item>Service : {service?.service?.title ?? '-'}</List.Item>
                                            <List.Item>Category : {service?.service?.category?.name ?? '-'}</List.Item>
                                        </List>
                                    </Accordion.Panel>
                                </Accordion.Item>
                            ))}
                        </Accordion>
                    </Grid.Col>
                </Grid>
            </Modal>
        </>
    );
};

export default ServiceOffer;
