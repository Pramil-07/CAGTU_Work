import { Button, ErrorAlert, FormModal, PageHeader, PaperBox, SwitchCheckbox, TextAreaField } from '@cagtu-cms/ui-shared';
import {
    CipherUserContext,
    HoroscopeFormValueProps,
    HoroscopeResult,
    cipherHoroscopeSchema,
    getEnglishHoroscopeName,
    getHoroscopeFormat,
    getNepaliHoroscopeName,
    getPageLimit,
    useDataLimit,
} from '@cagtu-cms/util-formatter';
import { useContext, useState } from 'react';
import HoroscopeListTable from './HoroscopeListTable';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CipherAPI, urls } from '@cagtu-cms/data-access';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';
import { Form, Formik, FormikHelpers } from 'formik';
import { Group, Select, Stack } from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons';
import { getFormatedDate } from '@cagtu-cms/util-formatter';
import _ from 'lodash';

const urlsPath = urls?.cipher?.horoscope;
const initialFormData: HoroscopeFormValueProps = {
    id: null as unknown as number,
    is_nepali: false,
    sign: null as unknown as number,
    type: null as unknown as number,
    start_date: '',
    end_date: '',
    description: '',
};

const horoscopeSignsOptionsEnglish = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((val: number) => {
    return { label: getEnglishHoroscopeName(val), value: `${val}` };
});

const horoscopeSignsOptionsNepali = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((val: number) => {
    return { label: getNepaliHoroscopeName(val), value: `${val}` };
});

const horoscopeTypeOptons = [1, 2, 3, 4].map((val: number) => {
    return { label: getHoroscopeFormat(val), value: `${val}` };
});

const HoroscopeList = () => {
    const queryClient = useQueryClient();
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const [query, setQuery] = useState<string>('');
    const [page, setPage] = useState(1);
    const [rowId, setRowId] = useState<number | null>();
    const [formModal, setFormModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');
    const [horoscopeFormData, setHoroscopeFormData] = useState<HoroscopeFormValueProps>({
        ...initialFormData,
    });

    //horoscope list api and query
    const horoscopeListApi = new CipherAPI(urlsPath?.path);
    const { isLoading, isError, isSuccess, data, isFetching } = useQuery(['horoscope', page, limitChange], () =>
        horoscopeListApi.list({ search: query, page, page_size: limitChange })
    );

    //function to handle opeaning modal and handling functionality related for horoscope add and edit
    const handleFormModal = () => {
        setRowId(null);
        setFormModal(true);
        setHoroscopeFormData({
            ...initialFormData,
        });
    };

    //function to handle closinf modal and handling functionality related for horoscope add and edit
    const handleFormClose = () => {
        setHoroscopeFormData({
            ...initialFormData,
        });
        setRowId(null);
        setFormModal(false);
    };

    //function to handle horoscope edit
    const handleFormModalEdit = (object: HoroscopeResult) => {
        setHoroscopeFormData(mapToViewModal(object));
        setFormModal(true);
        setRowId(object?.id);
    };

    //mapping function for horoscope edit
    const mapToViewModal = (value: HoroscopeResult) => {
        return {
            id: value?.id,
            sign: value?.sign,
            description: value?.description,
            is_nepali: value?.is_nepali,
            start_date: value?.start_date,
            end_date: value?.end_date,
            type: value?.type,
        };
    };

    //Horoscope add and edit action mutation
    const horoscopeApi = new CipherAPI(urlsPath?.path);
    const horoscopeMutation = useMutation((data: HoroscopeFormValueProps) => horoscopeApi.store(data, Number(rowId)));
    const pageToFecth = data?.data?.result.length <= 1 ? page - 1 : page;
    const onHandleSubmit = (data: HoroscopeFormValueProps, actions: FormikHelpers<HoroscopeFormValueProps>) => {
        horoscopeMutation.mutate(data, {
            onSuccess: (data) => {
                actions.resetForm();
                setFormModal(false);
                setRowId(null);
                showNotification({
                    title: `Congrats! Task Recommend ${rowId ? 'Updated' : 'Created'}`,
                    message: rowId
                        ? data.data.message ?? 'Task recommend updated successfully'
                        : data.data.message ?? 'Task recommend created successfully',
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                if (pageToSet === page) queryClient.invalidateQueries(['horoscope', pageToSet, limitChange]);
                else setPage(pageToSet);
            },
            onError: (error: any) => {
                const {
                    data: { message },
                } = error.response;

                _.keys(error?.response?.data).forEach((errKey) => {
                    actions.setFieldError(errKey, `${error?.response?.data[errKey]}`);
                });

                showNotification({
                    title: 'Uh oh! something went wrong',
                    message: message ?? 'Sorry! There was a problem with your request.',
                    color: 'red',
                    icon: <IconX size={18} />,
                });
            },
        });
    };

    //Horoscope delete action
    const horoscopeDeleteMutation = useMutation((id: string) => horoscopeApi.delete(id), {
        onSuccess: (data) => {
            setDeleteModal(false);
            setRowId(null);
            showNotification({
                title: 'Congrats!',
                message: data.data?.message,
                color: 'green',
                icon: <IconCheck size={18} />,
            });
            const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
            if (pageToSet === page) queryClient.invalidateQueries(['horoscope', pageToSet, limitChange]);
            else setPage(pageToSet);
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

    const handleSingleDelete = (id: number) => {
        setDeleteModal(true);
        setRowId(id);
    };

    const handleCloseModal = () => {
        if (!horoscopeDeleteMutation.isLoading) {
            setDeleteModal(false);
            setRowId(null);
        }
    };

    //search function
    const onHandleSearch = (query: string) => {
        queryClient.prefetchQuery(['horoscope', page, limitChange], () => horoscopeApi.list({ search: query, page_size: limitChange }));
        setQuery(query);
        setPage(1);
    };

    if (isError) {
        return <ErrorAlert />;
    }

    if (!is_superuser && !user_permissions?.includes('view_horoscope')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            <PageHeader pageTitle="Horoscope">
                {(is_superuser || user_permissions?.includes('add_horoscope')) && <Button onClick={handleFormModal} name="Create" />}
            </PageHeader>
            <PaperBox>
                <HoroscopeListTable
                    isFetching={isFetching}
                    data={data?.data?.result}
                    query={query}
                    isDeleteModalOpened={deleteModal}
                    isSingleDeleteMutationLoading={horoscopeDeleteMutation.isLoading}
                    handleSingleDelete={handleSingleDelete}
                    onConfirmSingleDelete={() => horoscopeDeleteMutation.mutate(String(rowId))}
                    handleSingleDeleteCloseModal={handleCloseModal}
                    onHandleSearch={onHandleSearch}
                    handleFormModalEdit={handleFormModalEdit}
                    total={data?.data?.total_pages}
                    isLoading={isLoading}
                    limitChange={limitChange}
                    handleLimitChange={handleLimitChange}
                    isSuccess={isSuccess}
                    page={page}
                    onSetPage={setPage}
                />
            </PaperBox>
            <Formik
                enableReinitialize
                initialValues={horoscopeFormData}
                validationSchema={cipherHoroscopeSchema}
                onSubmit={(values, actions) => {
                    onHandleSubmit(values, actions);
                }}>
                {({ errors, touched, handleSubmit, handleReset, values, setFieldValue }) => (
                    <FormModal
                        opened={formModal}
                        onClose={() => {
                            if (!horoscopeMutation?.isLoading) {
                                handleReset();
                                handleFormClose();
                            }
                        }}
                        title={`${rowId ? 'Edit Horoscope' : 'Add Horoscope'}`}
                        onConfirm={handleSubmit}
                        confirmButtonText={`${rowId ? 'Save' : 'Add'}`}
                        loading={horoscopeMutation?.isLoading}
                        size={'xl'}>
                        <Form>
                            <Stack spacing={20}>
                                <SwitchCheckbox name="is_nepali" checked={values.is_nepali} labelName="Is Nepali?" />
                                <Select
                                    name="sign"
                                    data={values?.is_nepali ? horoscopeSignsOptionsNepali : horoscopeSignsOptionsEnglish}
                                    label="Sign"
                                    placeholder="Choose horoscope sign"
                                    error={errors.sign && touched.sign}
                                    value={String(values.sign)}
                                    onChange={(value) => setFieldValue('sign', value)}
                                    searchable
                                    clearable
                                    styles={{
                                        input: { minHeight: 42, padding: `${2}px ${30}px ${2}px ${12}px` },
                                        error: { fontSize: 13, fontWeight: 500 },
                                    }}
                                />
                                <TextAreaField
                                    name="icon"
                                    error={errors.description}
                                    touch={touched.description}
                                    value={values?.description}
                                    onChange={(e) => setFieldValue('description', e.target.value)}
                                    labelName="Description"
                                    autoComplete="off"
                                    placeHolder="Enter content for horoscope"
                                    height={250}
                                />
                                <Select
                                    name="type"
                                    data={horoscopeTypeOptons}
                                    label="Display Type"
                                    placeholder="Choose display type"
                                    error={errors.type && touched.type}
                                    value={String(values.type)}
                                    onChange={(value) => setFieldValue('type', value)}
                                    searchable
                                    clearable
                                    styles={{
                                        input: { minHeight: 42, padding: `${2}px ${30}px ${2}px ${12}px` },
                                        error: { fontSize: 13, fontWeight: 500 },
                                    }}
                                />
                                <Group grow mb={20}>
                                    {Number(values?.type) !== 1 && (
                                        <DatePicker
                                            error={errors?.start_date}
                                            value={values?.start_date ? new Date(values?.start_date) : null}
                                            onChange={(value) => {
                                                setFieldValue('start_date', getFormatedDate(value as Date));
                                            }}
                                            placeholder="Pick a start date"
                                            label="Start on"
                                        />
                                    )}

                                    <DatePicker
                                        error={errors?.end_date}
                                        value={values?.end_date ? new Date(values?.end_date) : null}
                                        onChange={(value) => {
                                            setFieldValue('end_date', getFormatedDate(value as Date));
                                        }}
                                        placeholder="Pick a end date"
                                        label="Ends on"
                                    />
                                </Group>
                            </Stack>
                        </Form>
                    </FormModal>
                )}
            </Formik>
        </>
    );
};

export default HoroscopeList;
