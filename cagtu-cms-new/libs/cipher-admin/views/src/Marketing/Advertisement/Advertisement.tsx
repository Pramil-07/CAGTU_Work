import { CipherAPI, urls } from '@cagtu-cms/data-access';
import {
    Button,
    ErrorAlert,
    FormModal,
    ImageUploadField,
    InputField,
    PageHeader,
    PaperBox,
    ProfileImageField,
    SelectField,
    SwitchCheckbox,
    TextAreaField,
    // TextAreaField,
} from '@cagtu-cms/ui-shared';
import {
    CipherUserContext,
    AdvertisementFormValuesProps,
    AdvertisementResult,
    getPageLimit,
    useDataLimit,
    advertisementSchema,
    getShape,
    getBehaviour,
    getSource,
    advertisementFilterFormValuesProps,
    useDark,
} from '@cagtu-cms/util-formatter';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Form, Formik, FormikHelpers } from 'formik';
import { useContext, useState } from 'react';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';
import AdvertisementTable from './AdvertisementTable';
import { Avatar, Badge, Box, CloseButton, Divider, Grid, Group, Modal, Text, Title, useMantineTheme } from '@mantine/core';

const urlsPath = urls?.cipher?.marketing?.advertisement;

const initialFormData: AdvertisementFormValuesProps = {
    id: null,
    title: '',
    content: '',
    source: null,
    type: 'image',
    is_closable: false,
    web_shape: '',
    behaviour: '',
    image: [],
    redirect_url: '',
    is_active: false,
    profilePreviewUrl: [],
    mobile_shape: '',
    page_url: '',
    priority: '',
};

const filterFormInitialData: advertisementFilterFormValuesProps = {
    source: '',
    type: '',
    shape: '',
    behaviour: '',
};

const Advertisement = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const [dark] = useDark();
    const theme = useMantineTheme();
    const queryClient = useQueryClient();
    const [query, setQuery] = useState<string>('');
    const [formModal, setFormModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [rowId, setRowId] = useState<number | null>();
    const [page, setPage] = useState(1);
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');
    const [advertisementDetailModal, setAdvertisementDetailModal] = useState(false);
    const [advertisementDetail, setAdvertisementDetail] = useState<AdvertisementResult>();
    const [showFilter, setShowFilter] = useState(false);
    const [isFiltering, setIsFiltering] = useState(false);
    const [advertisementFilterFormData, setAdvertisementFilterFormData] = useState<advertisementFilterFormValuesProps>({
        ...filterFormInitialData,
    });

    const [advertisementFormData, setAdvertisementFormData] = useState<AdvertisementFormValuesProps>({
        ...initialFormData,
    });

    const formData: FormData = new FormData();

    const advertisementAPI = new CipherAPI(urlsPath?.path);

    const { isLoading, isError, isSuccess, data, isFetching } = useQuery(['advertisement', page, limitChange, ...[advertisementFilterFormData]], () =>
        advertisementAPI.list({ search: query, page, page_size: limitChange, ...advertisementFilterFormData })
    );

    const advertisementMutation = useMutation((data: FormData) => advertisementAPI.store(data, Number(rowId)));

    const pageToFecth = data?.data?.result.length <= 1 ? page - 1 : page;

    const advertisementDeleteMutation = useMutation((id: number) => advertisementAPI.delete(id), {
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
                    title: 'Congrats! Advertisement Deleted',
                    message: data.data?.message,
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                if (pageToSet === page) queryClient.invalidateQueries(['advertisement', pageToSet, limitChange]);
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

    const onCreateAdvertisement = (
        formData: FormData,
        actions: FormikHelpers<AdvertisementFormValuesProps>,
        values: AdvertisementFormValuesProps
    ) => {
        advertisementMutation.mutate(formData, {
            onSuccess: (data) => {
                actions.resetForm();
                setAdvertisementFormData({ ...initialFormData });
                setFormModal(false);
                setRowId(null);
                showNotification({
                    title: `Congrats! Advertisement ${rowId ? 'Updated' : 'Created'}`,
                    message: rowId
                        ? data.data.message ?? 'Advertisement updated successfully'
                        : data.data.message ?? 'Advertisement created successfully',
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                if (pageToSet === page) queryClient.invalidateQueries(['advertisement', pageToSet, limitChange]);
                else setPage(pageToSet);
            },
            onError: (error: any) => {
                const {
                    data: { message, image },
                } = error.response;
                actions.setFieldError('image', image && image[0]);
                showNotification({
                    title: 'Uh oh! something went wrong',
                    message: message ?? 'Sorry! There was a problem with your request.',
                    color: 'red',
                    icon: <IconX size={18} />,
                });
            },
        });
    };

    const onHandleSearch = (query: string) => {
        queryClient.prefetchQuery(['advertisement', page, limitChange, ...[advertisementFilterFormData]], () =>
            advertisementAPI.list({ search: query, page_size: limitChange, ...advertisementFilterFormData })
        );
        setQuery(query);
        setPage(1);
    };

    const handleSingleDelete = (id: number) => {
        setDeleteModal(true);
        setRowId(id);
    };

    const handleCloseModal = () => {
        if (!advertisementDeleteMutation.isLoading) {
            setDeleteModal(false);
            setRowId(null);
        }
    };

    const handleFormClose = () => {
        if (!advertisementMutation.isLoading) {
            setFormModal(false);
            setRowId(null);
            setAdvertisementFormData({
                ...initialFormData,
            });
        }
    };

    const handleFormModal = () => {
        setFormModal(true);
        setRowId(null);
    };

    const handleFormModalEdit = (object: AdvertisementResult) => {
        setAdvertisementFormData(mapToViewModal(object));
        setFormModal(true);
        setRowId(object?.id);
    };

    const formDataValues = (values: AdvertisementFormValuesProps) => {
        formData.append('title', values.title);
        formData.append('redirect_url', values.redirect_url);
        formData.append('page_url', values.page_url);
        formData.append('type', values.type);
        formData.append('web_shape', values.web_shape);
        if (values?.mobile_shape) {
            formData.append('mobile_shape', values.mobile_shape);
        }
        formData.append('priority', String(values.priority));
        formData.append('behaviour', values.behaviour);
        formData.append('content', values.content);
        formData.append('source', values.source as unknown as string);
        formData.append('is_closable', String(values.is_closable));
        formData.append('is_active', String(values.is_active));
        if (values.image[0]?.name) {
            values.image.forEach((file) => formData.append('image', file));
        }
    };

    const mapToViewModal = (value: AdvertisementResult) => {
        return {
            id: value?.id,
            image: value?.image,
            title: value?.title ?? '',
            content: value?.content ?? '',
            source: String(value?.source),
            type: value?.type ?? '',
            is_closable: value.is_closable ?? '',
            web_shape: value.web_shape,
            mobile_shape: value.mobile_shape,
            priority: String(value.priority),
            behaviour: value.behaviour,
            redirect_url: value.redirect_url,
            page_url: value.page_url,
            is_active: value?.is_active,
            profilePreviewUrl: [{ src: value.image }],
        };
    };

    //advertisement detail handle function
    const handleDetailModalOpen = (object: AdvertisementResult) => {
        setAdvertisementDetail(object);
        setAdvertisementDetailModal(true);
    };

    //advertisement detail close handle function
    const handleDetailModalClose = () => {
        setAdvertisementDetail(undefined);
        setAdvertisementDetailModal(false);
    };

    //advertisement filter form open function
    const onShowFilterForm = () => setShowFilter(true);

    const onShowFilterFormClose = () => {
        setShowFilter(false);
        setAdvertisementFilterFormData({ ...filterFormInitialData });
    };

    const onFilterFormClear = async () => {
        setAdvertisementFilterFormData({ ...filterFormInitialData });
        await queryClient.prefetchQuery(['advertisement', page, limitChange, ...[filterFormInitialData]], () =>
            advertisementAPI.list({ search: query, page: 1, page_size: '10', ...filterFormInitialData })
        );
    };

    if (isError) {
        return <ErrorAlert />;
    }

    if (!is_superuser && !user_permissions?.includes('view_advertisement')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            <PageHeader pageTitle="Advertisement">
                {(is_superuser || user_permissions?.includes('add_advertisement')) && <Button onClick={handleFormModal} name="Create" />}
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
                                initialValues={advertisementFilterFormData}
                                onSubmit={async (values) => {
                                    const dataToSend: advertisementFilterFormValuesProps = {
                                        ...values,
                                    };
                                    setIsFiltering(true);
                                    setAdvertisementFilterFormData({
                                        ...dataToSend,
                                    });
                                    setPage(1);
                                    await queryClient.prefetchQuery(['advertisement', page, limitChange, ...[dataToSend]], () =>
                                        advertisementAPI.list({ search: query, page: 1, page_size: limitChange, ...dataToSend })
                                    );
                                    if (isSuccess) setIsFiltering(false);
                                }}>
                                {({ handleReset, setFieldValue, dirty, values }) => (
                                    <Form>
                                        <Grid mb={10}>
                                            <Grid.Col md={2}>
                                                <SelectField
                                                    name="source"
                                                    placeHolder="Select Url Source"
                                                    withAsterisk
                                                    options={[
                                                        {
                                                            value: '0',
                                                            label: 'Internal',
                                                        },
                                                        {
                                                            value: '1',
                                                            label: 'External',
                                                        },
                                                    ]}
                                                    handleChange={(value) => setFieldValue('source', value)}
                                                />
                                            </Grid.Col>
                                            <Grid.Col md={2}>
                                                <SelectField
                                                    name="web_shape"
                                                    placeHolder="Select Advertisement Size For Web"
                                                    options={[
                                                        {
                                                            value: 'lg_thin',
                                                            label: 'Large Thin',
                                                        },
                                                        {
                                                            value: 'md_thin',
                                                            label: 'Medium Thin',
                                                        },
                                                        {
                                                            value: 'sm_thin',
                                                            label: 'Small Thin',
                                                        },
                                                        {
                                                            value: 'lg_card',
                                                            label: 'Large Card',
                                                        },
                                                        {
                                                            value: 'md_card',
                                                            label: 'Medium Card',
                                                        },
                                                        {
                                                            value: 'sm_card',
                                                            label: 'Small Card',
                                                        },
                                                        {
                                                            value: 'lg_tall',
                                                            label: 'Large Tall',
                                                        },
                                                        {
                                                            value: 'md_tall',
                                                            label: 'Medium Tall',
                                                        },
                                                        {
                                                            value: 'sm_tall',
                                                            label: 'Small Tall',
                                                        },
                                                    ]}
                                                    handleChange={(value) => setFieldValue('web_shape', value)}
                                                />
                                            </Grid.Col>
                                            <Grid.Col md={2}>
                                                <SelectField
                                                    name="behaviour"
                                                    placeHolder="Select a Behaviour"
                                                    options={[
                                                        {
                                                            value: 'new_tab',
                                                            label: 'New Tab',
                                                        },
                                                        {
                                                            value: 'modal',
                                                            label: 'Modal',
                                                        },
                                                        {
                                                            value: 'popup',
                                                            label: 'Popup',
                                                        },
                                                        {
                                                            value: 'vanishing',
                                                            label: 'Vanishing',
                                                        },
                                                        {
                                                            value: 'bg',
                                                            label: 'Background',
                                                        },
                                                    ]}
                                                    handleChange={(value) => setFieldValue('behaviour', value)}
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
                <AdvertisementTable
                    data={data?.data?.result}
                    page={page}
                    isLoading={isLoading}
                    isSuccess={isSuccess}
                    total={data?.data?.total_pages}
                    isDeleteModalOpened={deleteModal}
                    isSingleDeleteMutationLoading={advertisementDeleteMutation.isLoading}
                    handleSingleDelete={handleSingleDelete}
                    onSetPage={setPage}
                    onConfirmSingleDelete={() => advertisementDeleteMutation.mutate(Number(rowId))}
                    handleSingleDeleteCloseModal={handleCloseModal}
                    onHandleSearch={onHandleSearch}
                    handleFormModalEdit={handleFormModalEdit}
                    limitChange={limitChange}
                    handleLimitChange={handleLimitChange}
                    isFetching={isFetching}
                    handleDetailModalOpen={handleDetailModalOpen}
                    query={query}
                    onShowFilterForm={onShowFilterForm}
                />
            </PaperBox>
            <Formik
                enableReinitialize
                initialValues={advertisementFormData}
                validationSchema={advertisementSchema}
                onSubmit={(values, actions) => {
                    formDataValues(values);
                    onCreateAdvertisement(formData, actions, values);
                }}>
                {({ errors, touched, handleSubmit, handleReset, values, setFieldValue, handleBlur }) => (
                    <FormModal
                        opened={formModal}
                        size={'40%'}
                        onClose={() => {
                            if (!advertisementMutation.isLoading) {
                                handleReset();
                            }
                            handleFormClose();
                        }}
                        title={`${rowId ? 'Edit Advertisement' : 'Add Advertisement'}`}
                        onConfirm={handleSubmit}
                        confirmButtonText={`${rowId ? 'Save' : 'Add'}`}
                        loading={advertisementMutation.isLoading}>
                        <Form>
                            <ImageUploadField
                                labelName="Image"
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
                                placeHolder="Enter the title"
                                withAsterisk
                            />
                            <SelectField
                                name="web_shape"
                                placeHolder="Select advertisement size for web"
                                labelName="Advertisement Size For Web"
                                error={errors.web_shape}
                                touch={touched.web_shape}
                                options={[
                                    {
                                        value: 'lg_thin',
                                        label: 'Large Thin',
                                    },
                                    {
                                        value: 'md_thin',
                                        label: 'Medium Thin',
                                    },
                                    {
                                        value: 'sm_thin',
                                        label: 'Small Thin',
                                    },
                                    {
                                        value: 'lg_card',
                                        label: 'Large Card',
                                    },
                                    {
                                        value: 'md_card',
                                        label: 'Medium Card',
                                    },
                                    {
                                        value: 'sm_card',
                                        label: 'Small Card',
                                    },
                                    {
                                        value: 'lg_tall',
                                        label: 'Large Tall',
                                    },
                                    {
                                        value: 'md_tall',
                                        label: 'Medium Tall',
                                    },
                                    {
                                        value: 'sm_tall',
                                        label: 'Small Tall',
                                    },
                                ]}
                                handleChange={(value) => setFieldValue('web_shape', value)}
                                clearable
                            />
                            <SelectField
                                name="mobile_shape"
                                placeHolder="Select advertisement size for mobile"
                                labelName="Advertisement Size For Mobile"
                                error={errors.mobile_shape}
                                touch={touched.mobile_shape}
                                options={[
                                    {
                                        value: 'lg_thin',
                                        label: 'Large Thin',
                                    },
                                    {
                                        value: 'md_thin',
                                        label: 'Medium Thin',
                                    },
                                    {
                                        value: 'sm_thin',
                                        label: 'Small Thin',
                                    },
                                    {
                                        value: 'lg_card',
                                        label: 'Large Card',
                                    },
                                    {
                                        value: 'md_card',
                                        label: 'Medium Card',
                                    },
                                    {
                                        value: 'sm_card',
                                        label: 'Small Card',
                                    },
                                    {
                                        value: 'lg_tall',
                                        label: 'Large Tall',
                                    },
                                    {
                                        value: 'md_tall',
                                        label: 'Medium Tall',
                                    },
                                    {
                                        value: 'sm_tall',
                                        label: 'Small Tall',
                                    },
                                ]}
                                handleChange={(value) => setFieldValue('mobile_shape', value)}
                                clearable
                            />
                            <SelectField
                                name="priority"
                                placeHolder=" Select priority level with which ad sould be displayed"
                                labelName="Advertisement Display Priority"
                                error={errors.priority}
                                touch={touched.priority}
                                options={[
                                    {
                                        value: '1',
                                        label: '1st',
                                    },
                                    {
                                        value: '2',
                                        label: '2nd',
                                    },
                                    {
                                        value: '3',
                                        label: '3rd',
                                    },
                                    {
                                        value: '4',
                                        label: '4th',
                                    },
                                    {
                                        value: '5',
                                        label: '5th',
                                    },
                                ]}
                                handleChange={(value) => setFieldValue('priority', value)}
                                clearable
                            />
                            <SelectField
                                name="behaviour"
                                placeHolder="Select Behaviour To Open Tab"
                                labelName="Behaviour"
                                error={errors.behaviour}
                                touch={touched.behaviour}
                                withAsterisk
                                options={[
                                    {
                                        value: 'new_tab',
                                        label: 'New Tab',
                                    },
                                    {
                                        value: 'modal',
                                        label: 'Modal',
                                    },
                                    {
                                        value: 'popup',
                                        label: 'Popup',
                                    },
                                    {
                                        value: 'vanishing',
                                        label: 'Vanishing',
                                    },
                                    {
                                        value: 'bg',
                                        label: 'Background',
                                    },
                                ]}
                                handleChange={(value) => setFieldValue('behaviour', value)}
                                clearable
                            />
                            <TextAreaField
                                name="content"
                                labelName="Description"
                                placeHolder="Enter the description"
                                error={errors.content}
                                touch={touched.content}
                                withAsterisk
                            />
                            <InputField
                                name="page_url"
                                error={errors.page_url}
                                touch={touched.page_url}
                                labelName="Page URL"
                                placeHolder="Enter the page URL"
                                withAsterisk
                            />
                            <InputField
                                name="redirect_url"
                                error={errors.redirect_url}
                                touch={touched.redirect_url}
                                labelName="Advertisement Click Redirect URL"
                                placeHolder="Enter the redirect URL"
                                withAsterisk
                            />
                            <SelectField
                                name="source"
                                placeHolder="Select Url Source"
                                error={errors.source}
                                touch={touched.source}
                                labelName="Source"
                                withAsterisk
                                options={[
                                    {
                                        value: '0',
                                        label: 'Internal',
                                    },
                                    {
                                        value: '1',
                                        label: 'External',
                                    },
                                ]}
                                handleChange={(value) => setFieldValue('source', value)}
                                clearable
                            />
                            <SwitchCheckbox
                                name="is_closable"
                                checked={values.is_closable}
                                onChange={(e) => setFieldValue('is_closable', e.currentTarget.checked)}
                                labelName="Is Closable?"
                                mb={15}
                            />
                            <SwitchCheckbox
                                name="is_active"
                                checked={values.is_active}
                                onChange={(e) => setFieldValue('is_active', e.currentTarget.checked)}
                                labelName="Is Active?"
                                mb={15}
                            />
                        </Form>
                    </FormModal>
                )}
            </Formik>
            <Modal
                size={'60%'}
                opened={advertisementDetailModal}
                onClose={() => {
                    handleDetailModalClose();
                }}
                centered
                overlayBlur={3}
                overlayOpacity={0.2}
                closeOnClickOutside={false}
                title={
                    <Title order={5} sx={{ fontWeight: 600 }}>
                        Advertisement Details
                    </Title>
                }>
                <Group position="apart" align="normal">
                    <Avatar src={advertisementDetail?.image as unknown as string} alt="" sx={{ height: 'auto', width: '100%' }} />
                </Group>
                <Box my={20}>
                    <Divider variant="dashed" />
                    <Text weight={500} color="dimmed" my={5}>
                        Details :
                    </Text>
                    <Divider variant="dashed" />
                </Box>
                <Grid align="start" my={15}>
                    <Grid.Col md={3}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                            1. Title
                        </Text>
                        <Box>
                            <Text>{advertisementDetail?.title ?? ''}</Text>
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={3}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                            2. Type
                        </Text>
                        <Box>
                            <Text>{advertisementDetail?.type ?? ''}</Text>
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={3}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                            3. Is Closable?
                        </Text>
                        <Box>
                            <Badge radius={'xs'} color={advertisementDetail?.is_closable ? 'green' : 'red'}>
                                {advertisementDetail?.is_closable ? 'Yes' : 'No'}
                            </Badge>
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={3}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                            4. Is Active?
                        </Text>
                        <Box>
                            <Badge radius={'xs'} color={advertisementDetail?.is_active ? 'green' : 'red'}>
                                {advertisementDetail?.is_active ? 'Yes' : 'No'}
                            </Badge>
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={3}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                            5. Source
                        </Text>
                        <Box>
                            <Text>{String(advertisementDetail?.source) ? getSource(String(advertisementDetail?.source)) : ''}</Text>
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={3}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                            6. Web Shape
                        </Text>
                        <Box>
                            <Text>{advertisementDetail?.web_shape ? getShape(advertisementDetail?.web_shape) : ''}</Text>
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={3}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                            6. Mobile Shape
                        </Text>
                        <Box>
                            <Text>{advertisementDetail?.mobile_shape ? getShape(advertisementDetail?.mobile_shape) : ''}</Text>
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={3}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                            7. Behaviour
                        </Text>
                        <Box>
                            <Text>{advertisementDetail?.behaviour ? getBehaviour(advertisementDetail?.behaviour) : ''}</Text>
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={12}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                            8. Description
                        </Text>
                        <Box>
                            <Text>{advertisementDetail?.content ?? ''}</Text>
                        </Box>
                    </Grid.Col>
                </Grid>
            </Modal>
        </>
    );
};

export default Advertisement;
