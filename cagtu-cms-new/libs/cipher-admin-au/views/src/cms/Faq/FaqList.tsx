import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { Button, ErrorAlert, FormModal, InputField, PaperBox, SelectField, TextEditor } from '@cagtu-cms/ui-shared';
import { CipherUserContext, FaqFormValuesProps, FaqResult, getPageLimit, stringReqOnly, stringValidate, useDark, useDataLimit } from '@cagtu-cms/util-formatter';
import { showNotification } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Form, Formik, FormikHelpers } from 'formik';
import { useContext, useState } from 'react';
import FaqListTable from './FaqListTable';
import * as Yup from 'yup';
import { Box, CloseButton, Divider, Grid, useMantineTheme } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';

const urlsPath = urls?.cipher?.faq;
const urlsFaqTopicPath = urls?.cipher?.faq?.topic;

const initialFormData: FaqFormValuesProps = {
    id: null,
    topic: '',
    title: '',
    content: '',
};

const filterFormInitialData: { topic: string } = {
    topic: '',
};

const FaqList = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const [query, setQuery] = useState<string>('');
    const [checked, setChecked] = useState<string[]>([]);
    const queryClient = useQueryClient();
    const [formModal, setFormModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [multiDeleteModal, setMultiDeleteModal] = useState(false);
    const [rowId, setRowId] = useState<number | null>();
    const [faqTopicOptions, setFaqTopicOptions] = useState<{ value: string; label: string }[]>([]);
    const [page, setPage] = useState(1);
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');
    const [showFilter, setShowFilter] = useState(false);
    const [isFiltering, setIsFiltering] = useState(false);

    const [dark] = useDark();
    const theme = useMantineTheme();

    const [faqFormData, setFaqFormData] = useState<FaqFormValuesProps>({ ...initialFormData });
    const [faqFilterFormData, setFaqFilterFormData] = useState<{ topic: string }>({ ...filterFormInitialData });

    const faqAPI = new CipherAPI(urlsPath?.path);
    const faqTopicOptionsAPI = new CipherAPI(urlsFaqTopicPath?.path);
    const faqMultipleDeleteAPI = new CipherAPI(urlsPath?.multipleDelete);

    const { isLoading, isError, isSuccess, data, isFetching } = useQuery(['faq', page, limitChange, ...[filterFormInitialData]], () =>
        faqAPI.list({ search: query, page, page_size: limitChange, ...faqFilterFormData })
    );

    const faqMutation = useMutation((data: FaqFormValuesProps) => faqAPI.store({ ...data, status: 'Active' }, Number(rowId)));

    // Faq Topic Options
    useQuery(['faq-topic-options'], () => faqTopicOptionsAPI.list({ page: -1 }), {
        onSuccess: (data) => {
            const options = data?.data.map(({ id, topic }: { id: number; topic: string }) => {
                return {
                    value: String(id),
                    label: `${topic}`,
                };
            });
            setFaqTopicOptions(options);
        },
    });

    const pageToFecth = data?.data?.result.length <= 1 ? page - 1 : page;
    const pageToFetchMultiple = data?.data?.result.length <= checked.length ? page - 1 : page;

    const faqMultiDeleteMutation = useMutation((checkedIds: string[]) => faqMultipleDeleteAPI.store({ pk: checkedIds }), {
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
                    message: data.data?.message ?? 'Faq deleted successfully',
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                const pageToSet = pageToFetchMultiple < 1 ? 1 : pageToFetchMultiple;
                if (pageToSet === page) queryClient.invalidateQueries(['faq', pageToSet, limitChange]);
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

    const faqDeleteMutation = useMutation((id: string) => faqAPI.delete(id), {
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
                    message: data.data?.message ?? 'Faq deleted successfully',
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                if (pageToSet === page) queryClient.invalidateQueries(['faq', pageToSet, limitChange]);
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

    const onCreateFaq = (data: FaqFormValuesProps, actions: FormikHelpers<FaqFormValuesProps>) => {
        faqMutation.mutate(data, {
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
                    actions.resetForm();
                    setFormModal(false);
                    setRowId(null);
                    showNotification({
                        title: `Congrats! Faq ${rowId ? 'Updated' : 'Created'}`,
                        message: rowId ? data.data.message ?? 'Faq updated successfully' : data.data.message ?? 'Faq created successfully',
                        color: 'green',
                        icon: <IconCheck size={18} />,
                    });
                    const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                    if (pageToSet === page) queryClient.invalidateQueries(['faq', pageToSet, limitChange]);
                    else setPage(pageToSet);
                }
            },
            onError: (error: any) => {
                const {
                    data: { message },
                } = error.response;
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
        queryClient.prefetchQuery(['faq', page, limitChange, ...[filterFormInitialData]], () =>
            faqAPI.list({ search: query, page_size: limitChange, ...faqFilterFormData })
        );
        setQuery(query);
        setPage(1);
    };

    const onSelectAll = () => {
        const isSelectAll = isAllCheckboxSelected();
        if (isSelectAll) {
            setChecked([]);
        } else {
            const checkedRowId = data?.data?.result.map((faq: FaqResult) => String(faq.id));
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
        const checkedRowId = data?.data?.result.map((faq: FaqResult) => String(faq.id));
        const isAllSelected = checkedRowId.every((id: number) => checked.includes(String(id)));
        return isAllSelected;
    };

    const handleSingleDelete = (id: number) => {
        setDeleteModal(true);
        setRowId(id);
    };

    const handleCloseModal = () => {
        if (!faqDeleteMutation.isLoading) {
            setDeleteModal(false);
            setRowId(null);
        }
    };

    const handleMultiDeleteCloseModal = () => {
        if (!faqMultiDeleteMutation.isLoading) {
            setMultiDeleteModal(false);
        }
    };

    const handleFormClose = () => {
        if (!faqMutation.isLoading) {
            setFaqFormData({ ...initialFormData });
            setRowId(null);
            setFormModal(false);
        }
    };

    const handleFormModal = () => {
        setFormModal(true);
        setRowId(null);
    };

    const handleFormModalEdit = (object: FaqResult) => {
        setFaqFormData(mapToViewModal(object));
        setFormModal(true);
        setRowId(object?.id);
    };

    const mapToViewModal = (value: FaqResult) => {
        return {
            id: value?.id,
            topic: String(value?.topic?.id),
            title: value?.title,
            content: value?.content,
        };
    };

    const onFilterFormClear = async () => {
        setFaqFilterFormData({ ...filterFormInitialData });
        await queryClient.prefetchQuery(['faq', page, limitChange, ...[filterFormInitialData]], () => faqAPI.list({ page: 1, page_size: '10' }));
    };

    const onShowFilterForm = () => setShowFilter(true);
    const onShowFilterFormClose = () => {
        setShowFilter(false);
        setFaqFilterFormData({ ...filterFormInitialData });
    };

    if (isError) {
        return <ErrorAlert />;
    }

    if (!is_superuser && !user_permissions?.includes('view_faq')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
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
                                initialValues={faqFilterFormData}
                                onSubmit={async (values) => {
                                    setIsFiltering(true);
                                    setFaqFilterFormData({ ...values });
                                    setPage(1);
                                    await queryClient.prefetchQuery(['faq', page, limitChange, ...[filterFormInitialData]], () =>
                                        faqAPI.list({ ...values, page: 1, page_size: limitChange })
                                    );
                                    if (isSuccess) setIsFiltering(false);
                                }}>
                                {({ handleReset, setFieldValue, dirty }) => (
                                    <Form>
                                        <Grid mb={10}>
                                            <Grid.Col md={2}>
                                                <SelectField
                                                    name="topic"
                                                    placeHolder="Select topic"
                                                    options={faqTopicOptions}
                                                    handleChange={(value) => setFieldValue('topic', value)}
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
                <FaqListTable
                    data={data?.data?.result}
                    page={page}
                    checked={checked}
                    isLoading={isLoading}
                    isSuccess={isSuccess}
                    total={data?.data?.total_pages}
                    isDeleteModalOpened={deleteModal}
                    isMultiDeleteModalOpened={multiDeleteModal}
                    isSingleDeleteMutationLoading={faqDeleteMutation.isLoading}
                    isMultiDeleteMutationLoading={faqMultiDeleteMutation.isLoading}
                    isAllCheckboxSelected={isAllCheckboxSelected}
                    isCheckboxSelect={isCheckboxSelect as unknown as undefined}
                    handleSelect={handleSelect as unknown as undefined}
                    handleSingleDelete={handleSingleDelete}
                    onSelectAll={onSelectAll}
                    onSetPage={setPage}
                    onClickDeleteAll={() => setMultiDeleteModal(true)}
                    onConfirmSingleDelete={() => faqDeleteMutation.mutate(String(rowId))}
                    onConfirmMultiDelete={() => faqMultiDeleteMutation.mutate(checked)}
                    handleSingleDeleteCloseModal={handleCloseModal}
                    handleMultiDeleteCloseModal={handleMultiDeleteCloseModal}
                    onHandleSearch={onHandleSearch}
                    handleFormModalEdit={handleFormModalEdit}
                    limitChange={limitChange}
                    handleLimitChange={handleLimitChange}
                    handleFormModal={handleFormModal}
                    onShowFilterForm={onShowFilterForm}
                    isFetching={isFetching}
                    query={query}
                />
            </PaperBox>
            <Formik
                enableReinitialize
                initialValues={faqFormData}
                validationSchema={Yup.object().shape({
                    topic: stringReqOnly.nullable(true),
                    title: stringValidate,
                    content: stringValidate.min(12, 'Required field'),
                })}
                onSubmit={(values, actions) => {
                    onCreateFaq(values, actions);
                }}>
                {({ errors, touched, handleSubmit, handleReset, values, handleBlur, setFieldValue }) => (
                    <FormModal
                        opened={formModal}
                        onClose={() => {
                            if (!faqMutation.isLoading) {
                                handleReset();
                            }
                            handleFormClose();
                        }}
                        title={`${rowId ? 'Edit Faq' : 'Add Faq'}`}
                        onConfirm={handleSubmit}
                        confirmButtonText={`${rowId ? 'Save' : 'Add'}`}
                        loading={faqMutation.isLoading}
                        size={'60%'}>
                        <Form>
                            <SelectField
                                name="topic"
                                labelName="Faq Topic"
                                placeHolder="Select topic"
                                options={faqTopicOptions}
                                error={errors.topic}
                                touch={touched.topic}
                                handleChange={(value) => setFieldValue('topic', value)}
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
                            <TextEditor
                                name="content"
                                labelName="Description"
                                value={values.content}
                                onChange={(value: string) => {
                                    setFieldValue('content', value);
                                }}
                                error={errors.content}
                                touch={touched.content}
                                height={350}
                                sticky={false}
                                withAsterisk
                            />
                        </Form>
                    </FormModal>
                )}
            </Formik>
        </>
    );
};

export default FaqList;
