import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { Button, ErrorAlert, FormModal, PageHeader, PaperBox, SelectField, TextEditor } from '@cagtu-cms/ui-shared';
import { CipherUserContext, LegalFormValuesProps, LegalResult, getPageLimit, stringReqOnly, useDataLimit } from '@cagtu-cms/util-formatter';
import { showNotification } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Form, Formik, FormikHelpers } from 'formik';
import { useContext, useState } from 'react';
import LegalListTable from './LegalListTable';
import * as Yup from 'yup';
import { IconCheck, IconX } from '@tabler/icons';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';

const urlsPath = urls?.cipher?.legal;

const initialFormData: LegalFormValuesProps = {
    id: null,
    title: '',
    content: '',
};

const LegalList = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const [query, setQuery] = useState<string>('');
    const queryClient = useQueryClient();
    const [formModal, setFormModal] = useState(false);
    const [rowId, setRowId] = useState<number | null>();
    const [page, setPage] = useState(1);
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');

    const [legalFormData, setLegalFormData] = useState<LegalFormValuesProps>({
        ...initialFormData,
    });

    const legalAPI = new CipherAPI(urlsPath?.path);

    const { isLoading, isError, isSuccess, data, isFetching } = useQuery(['legal', page, limitChange], () =>
        legalAPI.list({ search: query, page, page_size: limitChange })
    );

    const legalMutation = useMutation((data: LegalFormValuesProps) => legalAPI.store(data, Number(rowId)));

    const pageToFecth = data?.data?.result.length <= 1 ? page - 1 : page;

    const onCreateLegal = (data: LegalFormValuesProps, actions: FormikHelpers<LegalFormValuesProps>) => {
        legalMutation.mutate(data, {
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
                    setLegalFormData({ ...initialFormData });
                    setFormModal(false);
                    setRowId(null);
                    showNotification({
                        title: `Congrats! Content ${rowId ? 'Updated' : 'Created'}`,
                        message: rowId ? data.data.message ?? 'Content updated successfully' : data.data.message ?? 'Content created successfully',
                        color: 'green',
                        icon: <IconCheck size={18} />,
                    });
                    const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                    if (pageToSet === page) queryClient.invalidateQueries(['legal', pageToSet, limitChange]);
                    else setPage(pageToSet);
                }
            },
            onError: (error: any) => {
                const {
                    data: { message, title },
                } = error.response;
                actions.setFieldError('title', title && title[0]);
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
        queryClient.prefetchQuery(['legal', page, limitChange], () => legalAPI.list({ search: query, page_size: limitChange }));
        setQuery(query);
        setPage(1);
    };

    const handleFormClose = () => {
        if (!legalMutation.isLoading) {
            setFormModal(false);
            setRowId(null);
            setLegalFormData({
                ...initialFormData,
            });
        }
    };

    const handleFormModal = () => {
        setFormModal(true);
        setRowId(null);
    };

    const handleFormModalEdit = (object: LegalResult) => {
        setLegalFormData(mapToViewModal(object));
        setFormModal(true);
        setRowId(object?.id);
    };

    const mapToViewModal = (value: LegalResult) => {
        return {
            id: value?.id,
            title: value?.title,
            content: value?.content,
        };
    };

    if (isError) {
        return <ErrorAlert />;
    }

    if (!is_superuser && !user_permissions?.includes('view_content')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            <PageHeader pageTitle="Legal">
                {(is_superuser || user_permissions?.includes('add_content')) && <Button onClick={handleFormModal} name="Create" />}
            </PageHeader>
            <PaperBox>
                <LegalListTable
                    data={data?.data?.result}
                    page={page}
                    isLoading={isLoading}
                    isSuccess={isSuccess}
                    total={data?.data?.total_pages}
                    onSetPage={setPage}
                    onHandleSearch={onHandleSearch}
                    handleFormModalEdit={handleFormModalEdit}
                    limitChange={limitChange}
                    handleLimitChange={handleLimitChange}
                    isFetching={isFetching}
                    query={query}
                />
            </PaperBox>
            <Formik
                enableReinitialize
                initialValues={legalFormData}
                validationSchema={Yup.object().shape({
                    title: stringReqOnly.nullable(true),
                    content: Yup.string().min(12, 'Required field').required('Required field'),
                })}
                onSubmit={(values, actions) => {
                    onCreateLegal(values, actions);
                }}>
                {({ errors, touched, handleSubmit, handleReset, values, setFieldValue }) => (
                    <FormModal
                        opened={formModal}
                        onClose={() => {
                            if (!legalMutation.isLoading) {
                                handleReset();
                            }
                            handleFormClose();
                        }}
                        title={`${rowId ? 'Edit Legal' : 'Add Legal'}`}
                        onConfirm={handleSubmit}
                        confirmButtonText={`${rowId ? 'Save' : 'Add'}`}
                        loading={legalMutation.isLoading}
                        size={'70%'}>
                        <Form>
                            <SelectField
                                name="title"
                                error={errors.title}
                                touch={touched.title}
                                labelName="Title"
                                placeHolder="Select title"
                                options={[
                                    { value: 'Terms & Conditions', label: 'Terms & Conditions' },
                                    { value: 'Privacy Policy', label: 'Privacy Policy' },
                                    { value: 'Data Deletion', label: 'Data Deletion' },
                                ]}
                                handleChange={(value) => setFieldValue('title', value)}
                                searchable
                                clearable
                                withAsterisk
                            />
                            <TextEditor
                                name="content"
                                labelName="Content"
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

export default LegalList;
