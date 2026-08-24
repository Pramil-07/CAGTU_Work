import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { ErrorAlert, FormModal, InputField, PaperBox, SelectField, SelectInputField, SwitchCheckbox, TextEditor } from '@cagtu-cms/ui-shared';
import {
    discountTypeOptions,
    servicePackageSchema,
    ServicesPackageFormValuesProps,
    ServicesPackageResult,
    useIconColorMode,
} from '@cagtu-cms/util-formatter';
import { IconCirclePlus, IconCheck, IconCurrencyDollar, IconHourglassEmpty, IconRepeat, IconListDetails, IconTag, IconX } from '@tabler/icons';
import { Box, Checkbox, Grid, Group, List, Text, useMantineTheme } from '@mantine/core';
import { getHotkeyHandler } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Form, Formik, FormikHelpers } from 'formik';
import { useState } from 'react';
import SubscriptionPackageListTable from './SubscriptionPackageListTable';

const urlsPath = urls?.cipher?.services?.package;

const SubscriptionPackageList = () => {
    const [checked, setChecked] = useState<string[]>([]);
    const queryClient = useQueryClient();
    const [formModal, setFormModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [multiDeleteModal, setMultiDeleteModal] = useState(false);
    const [rowId, setRowId] = useState<number | null>();
    const [page, setPage] = useState(1);
    const [highlights, setHighlights] = useState<string[]>([]);
    // const [myServicesOptions, setMyServicesOptions] = useState<{ value: string; label: string }[]>([]);

    const theme = useMantineTheme();
    const [iconColorMode] = useIconColorMode();

    const [servicePackFormData, setServicePackFormData] = useState<ServicesPackageFormValuesProps>({
        id: null,
        title: '',
        // service: '',
        description: '',
        budget: '',
        no_of_revision: '',
        service_offered: '',
        service_offered_list: '',
        is_active: false,
        discount_type: '',
        discount_value: '',
        is_recommended: false,
        is_discount_offer: false,
    });

    const servicePackAPI = new CipherAPI(urlsPath?.path);
    // const myServicesListAPI = new CipherAPI(urls?.cipher?.services?.myServicesList);
    const servicePackMultiDeleteAPI = new CipherAPI(urlsPath?.multipleDelete);

    const { isLoading, isError, isSuccess, data } = useQuery(['service-packages', page], () => servicePackAPI.list({ page }));

    // Fetch the my services list
    // useQuery(['my-services'], () => myServicesListAPI.list({ page: -1 }), {
    //     onSuccess: (data) => {
    //         const servicesOptions = data?.data.map(({ id, title }: { id: number; title: string }) => {
    //             return {
    //                 value: String(id),
    //                 label: title,
    //             };
    //         });
    //         setMyServicesOptions(servicesOptions);
    //     },
    // });
    const servicePackMutation = useMutation((data: ServicesPackageResult) => servicePackAPI.store(data, Number(rowId)));

    const pageToFecth = data?.data?.result.length <= 1 ? page - 1 : page;
    const pageToFetchMultiple = data?.data?.result.length <= checked.length ? page - 1 : page;

    const servicePackMultiDeleteMutation = useMutation((checkedIds: string[]) => servicePackMultiDeleteAPI.store({ id: checkedIds }), {
        onSuccess: (data) => {
            if (data.data?.status === 'failure') {
                setMultiDeleteModal(false);
                showNotification({
                    title: 'Uh oh! something went wrong',
                    message: data.data?.message,
                    color: 'red',
                    icon: <IconX />,
                });
            } else {
                setMultiDeleteModal(false);
                setChecked([]);
                showNotification({
                    title: 'Congrats! Service Package Deleted',
                    message: data.data?.message,
                    color: 'green',
                    icon: <IconCheck />,
                });
                const pageToSet = pageToFetchMultiple < 1 ? 1 : pageToFetchMultiple;
                if (pageToSet === page) queryClient.invalidateQueries(['service-packages', pageToSet]);
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
                icon: <IconX />,
            });
        },
    });

    const servicePackDeleteMutation = useMutation((id: number) => servicePackAPI.delete(id), {
        onSuccess: (data) => {
            if (data.data?.status === 'failure') {
                setDeleteModal(false);
                setRowId(null);
                showNotification({
                    title: 'Uh oh! something went wrong',
                    message: data.data?.message,
                    color: 'red',
                    icon: <IconX />,
                });
            } else {
                setDeleteModal(false);
                setRowId(null);
                showNotification({
                    title: 'Congrats! Service Package Deleted',
                    message: data.data?.message,
                    color: 'green',
                    icon: <IconCheck />,
                });
                const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                if (pageToSet === page) queryClient.invalidateQueries(['service-packages', pageToSet]);
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
                icon: <IconX />,
            });
        },
    });

    const onCreateServicePack = (data: any, actions: FormikHelpers<ServicesPackageFormValuesProps>) => {
        servicePackMutation.mutate(data, {
            onSuccess: (data) => {
                if (data.data.status === 'failure') {
                    setFormModal(false);
                    setRowId(null);
                    showNotification({
                        title: 'Uh oh! something went wrong',
                        message: data.data.message.title[0],
                        color: 'red',
                        icon: <IconX />,
                    });
                } else {
                    actions.resetForm();
                    setFormModal(false);
                    setRowId(null);
                    showNotification({
                        title: 'Congrats! Service Package Created',
                        message: data.data.message,
                        color: 'green',
                        icon: <IconCheck />,
                    });
                    const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                    if (pageToSet === page) queryClient.invalidateQueries(['service-packages', pageToSet]);
                    else setPage(pageToSet);
                }
            },
            onError: (error: any) => {
                const {
                    data: { non_field_errors, message, detail },
                } = error.response;
                actions.setFieldError('title', non_field_errors && non_field_errors[0]);
                actions.setFieldError('is_recommended', detail);
                showNotification({
                    title: 'Uh oh! something went wrong',
                    message: message ?? 'Sorry! There was a problem with your request.',
                    color: 'red',
                    icon: <IconX />,
                });
            },
        });
    };

    const onHandleSearch = (query: string) => {
        queryClient.prefetchQuery(['service-packages', page], () => servicePackAPI.list({ search: query }));
    };

    const onSelectAll = () => {
        const isSelectAll = isAllCheckboxSelected();
        if (isSelectAll) {
            setChecked([]);
        } else {
            const checkedRowId = data?.data?.result.map((servicePack: ServicesPackageResult) => String(servicePack.id));
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
        const checkedRowId = data?.data?.result.map((servicePack: ServicesPackageResult) => String(servicePack.id));
        const isAllSelected = checkedRowId.every((id: number) => checked.includes(String(id)));
        return isAllSelected;
    };

    const handleSingleDelete = (id: number) => {
        setDeleteModal(true);
        setRowId(id);
    };

    const handleCloseModal = () => {
        if (!servicePackDeleteMutation.isLoading) {
            setDeleteModal(false);
            setRowId(null);
        }
    };

    const handleMultiDeleteCloseModal = () => {
        if (!servicePackMultiDeleteMutation.isLoading) {
            setMultiDeleteModal(false);
        }
    };

    const handleFormClose = () => {
        if (!servicePackMutation.isLoading) {
            setFormModal(false);
            setRowId(null);
            setServicePackFormData({
                id: null,
                title: '',
                // service: '',
                description: '',
                budget: '',
                no_of_revision: '',
                service_offered: '',
                service_offered_list: '',
                is_active: false,
                discount_type: '',
                discount_value: '',
                is_recommended: false,
                is_discount_offer: false,
            });
            setHighlights([]);
        }
    };

    const handleFormModal = () => {
        setFormModal(true);
        setRowId(null);
    };

    const handleFormModalEdit = (object: ServicesPackageResult) => {
        setServicePackFormData(mapToViewModal(object));
        setFormModal(true);
        setRowId(object?.id);
    };

    const mapToViewModal = (value: ServicesPackageResult) => {
        setHighlights(JSON.parse(value?.service_offered));
        return {
            id: null,
            // service: String(value?.service),
            title: value?.title,
            description: value?.description,
            budget: value?.budget,
            no_of_revision: value?.no_of_revision,
            service_offered: '',
            service_offered_list: '',
            is_active: value?.is_active,
            discount_type: value?.discount_type,
            discount_value: value?.discount_value ?? '',
            is_recommended: value?.is_recommended,
            is_discount_offer: value?.discount_value ? true : false,
        };
    };

    const onRemoveServiceOffered = (index: number) => {
        setHighlights((prevState) => prevState.filter((_, key) => key !== index));
    };

    const onCreateServiceOffered = (setFieldValue: any, setFieldError: any, values: any) =>
        getHotkeyHandler([
            [
                'Enter',
                () => {
                    if (highlights.includes(values.service_offered)) {
                        setFieldError('service_offered', 'Mention service offered is already created');
                    } else {
                        setFieldValue('service_offered', '');
                        setHighlights((prevState) => [...prevState, values.service_offered]);
                    }
                },
            ],
        ]);

    if (isError) {
        return <ErrorAlert />;
    }

    return (
        <>
            <PaperBox>
                <SubscriptionPackageListTable
                    data={data?.data?.result}
                    page={page}
                    checked={checked}
                    isLoading={isLoading}
                    isSuccess={isSuccess}
                    total={data?.data?.total_pages}
                    isDeleteModalOpened={deleteModal}
                    isMultiDeleteModalOpened={multiDeleteModal}
                    isSingleDeleteMutationLoading={servicePackDeleteMutation.isLoading}
                    isMultiDeleteMutationLoading={servicePackMultiDeleteMutation.isLoading}
                    isAllCheckboxSelected={isAllCheckboxSelected}
                    isCheckboxSelect={isCheckboxSelect as unknown as undefined}
                    handleSelect={handleSelect as unknown as undefined}
                    handleSingleDelete={handleSingleDelete}
                    onSelectAll={onSelectAll}
                    onSetPage={setPage}
                    onClickDeleteAll={() => setMultiDeleteModal(true)}
                    onConfirmSingleDelete={() => servicePackDeleteMutation.mutate(Number(rowId))}
                    onConfirmMultiDelete={() => servicePackMultiDeleteMutation.mutate(checked)}
                    handleSingleDeleteCloseModal={handleCloseModal}
                    handleMultiDeleteCloseModal={handleMultiDeleteCloseModal}
                    onHandleSearch={onHandleSearch}
                    handleFormModalEdit={handleFormModalEdit}
                    handleFormModal={handleFormModal}
                />
            </PaperBox>
            <Formik
                enableReinitialize
                initialValues={servicePackFormData}
                validationSchema={servicePackageSchema}
                onSubmit={(values, actions) => {
                    const dataToSend = {
                        ...JSON.parse(JSON.stringify(values)),
                        // service: Number(values.service),
                        service_offered: JSON.stringify(highlights),
                        discount_value: values.discount_value ? values.discount_value : null,
                    };
                    delete dataToSend.service_offered_list;
                    delete dataToSend.is_discount_offer;
                    onCreateServicePack(dataToSend, actions);
                }}>
                {({ errors, touched, handleSubmit, handleReset, values, setFieldValue, setFieldError, handleBlur }) => (
                    <FormModal
                        opened={formModal}
                        onClose={() => {
                            handleReset();
                            handleFormClose();
                        }}
                        title={`${rowId ? 'Edit Package' : 'Add Package'}`}
                        onConfirm={handleSubmit}
                        confirmButtonText={`${rowId ? 'Save' : 'Add'}`}
                        loading={servicePackMutation.isLoading}
                        size="xl">
                        <Form>
                            {/* <SelectInputField
                                name="service"
                                labelName="Service"
                                placeHolder="e.g. Gardening"
                                error={errors.service}
                                touch={touched.service}
                                options={myServicesOptions}
                                handleChange={(value) => setFieldValue('service', value)}
                                searchable
                                clearable
                            /> */}
                            <InputField
                                name="title"
                                error={errors.title}
                                touch={touched.title}
                                labelName="Package Tile"
                                placeHolder="e.g. Silver/Gold/Platinum"
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
                                onBlur={handleBlur}
                                height={250}
                            />
                            <Grid>
                                <Grid.Col md={6} py={0}>
                                    <InputField
                                        name="budget"
                                        error={errors.budget}
                                        touch={touched.budget}
                                        labelName="Budget"
                                        mt={20}
                                        placeHolder="e.g. 5000"
                                        icon={<IconCurrencyDollar />}
                                    />
                                </Grid.Col>
                                <Grid.Col md={6} py={0}>
                                    <InputField
                                        name="no_of_revision"
                                        error={errors.no_of_revision}
                                        touch={touched.no_of_revision}
                                        labelName="No.of Revision"
                                        placeHolder="e.g. 2"
                                        mt={20}
                                        icon={<IconRepeat />}
                                    />
                                </Grid.Col>
                            </Grid>
                            <Box mb={values.is_discount_offer ? 20 : 15} mt={10}>
                                <Checkbox
                                    name="is_discount_offer"
                                    label="Add Discount &amp; Offers"
                                    checked={values.is_discount_offer}
                                    onChange={(e) => {
                                        if (e.currentTarget.checked) {
                                            setFieldValue('discount_value', values.discount_value);
                                            setFieldValue('discount_type', values.discount_type);
                                            setFieldValue('is_discount_offer', e.currentTarget.checked);
                                        } else {
                                            setFieldValue('discount_value', '');
                                            setFieldValue('discount_type', '');
                                            setFieldValue('is_discount_offer', e.currentTarget.checked);
                                        }
                                    }}
                                    mb={20}
                                />
                                {values.is_discount_offer && (
                                    <Grid>
                                        <Grid.Col md={4} py={0}>
                                            <InputField
                                                name="discount_value"
                                                error={errors.discount_value}
                                                touch={touched.discount_value}
                                                placeHolder="Enter discount/offer amount"
                                                style={{ marginBottom: `${values.is_discount_offer && 0}` }}
                                                icon={<IconTag />}
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
                                                icon={<IconHourglassEmpty />}
                                                clearable
                                            />
                                        </Grid.Col>
                                    </Grid>
                                )}
                            </Box>
                            <Text size="sm" component="label" weight={500} mb={4} sx={{ display: 'inline-block' }}>
                                Service Offered
                            </Text>
                            <Text size="xs" mb={7} color={`${theme.colors['gray'][6]}`}>
                                This helps merchants to find about your requirements better.
                            </Text>
                            {highlights.length >= 1 && (
                                <List type="ordered" mb={10} mt={5} styles={{ item: { padding: `${4}px ${0}px`, fontSize: 13 } }}>
                                    {highlights.map((name, key) => (
                                        <Group key={key} position="apart">
                                            <List.Item>{name}</List.Item>
                                            {/* <FontAwesomeIcon
                                                icon={faXmark}
                                                onClick={() => onRemoveServiceOffered(key)}
                                                color={iconColorMode}
                                                style={{ cursor: 'pointer' }}
                                            /> */}
                                            <IconX onClick={() => onRemoveServiceOffered(key)} color={iconColorMode} style={{ cursor: 'pointer' }} />
                                        </Group>
                                    ))}
                                </List>
                            )}
                            <InputField
                                name="service_offered"
                                error={errors.service_offered}
                                touch={touched.service_offered}
                                placeHolder="e.g. Bring something screw driver"
                                rightSection={<IconCirclePlus size={22} stroke={1.75} />}
                                onKeyDown={onCreateServiceOffered(setFieldValue, setFieldError, values)}
                                icon={<IconListDetails />}
                            />
                            <SwitchCheckbox
                                name="is_recommended"
                                checked={values.is_recommended}
                                onChange={(e) => setFieldValue('is_recommended', e.currentTarget.checked)}
                                labelName="Is Recommended?"
                                mb={errors.is_recommended ? 5 : 15}
                                error={errors.is_recommended}
                            />
                            <SwitchCheckbox
                                name="is_active"
                                checked={values.is_active}
                                onChange={(e) => setFieldValue('is_active', e.currentTarget.checked)}
                                labelName="Is it Active?"
                                mb={20}
                            />
                        </Form>
                    </FormModal>
                )}
            </Formik>
        </>
    );
};

export default SubscriptionPackageList;
