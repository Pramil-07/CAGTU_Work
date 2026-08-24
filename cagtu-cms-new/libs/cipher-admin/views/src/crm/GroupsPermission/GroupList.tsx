import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { CreatableInputField, ErrorAlert, FormModal, InputField, PaperBox } from '@cagtu-cms/ui-shared';
import { CipherUserContext, GroupResult, getPageLimit, groupSchema, useDataLimit } from '@cagtu-cms/util-formatter';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Form, Formik } from 'formik';
import { useContext, useState } from 'react';
import GroupListTable from './GroupListTable';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';

const urlsPath = urls?.cipher?.user?.group;

const GroupList = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const queryClient = useQueryClient();
    const [query, setQuery] = useState<string>('');
    const [formModal, setFormModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [rowId, setRowId] = useState<number | null>();
    const [page, setPage] = useState(1);
    const [permissionOptions, setPermissionOptions] = useState([]);
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');

    const [groupFormData, setGroupFormData] = useState<GroupResult>({
        id: null,
        name: '',
        permissions: [],
    });

    const groupAPI = new CipherAPI(urlsPath?.path);
    const permissionAPI = new CipherAPI(urls?.cipher?.user?.permission?.path);

    const { isLoading, isError, isSuccess, data, isFetching } = useQuery(['groups', page, limitChange], () =>
        groupAPI.list({ search: query, page, page_size: limitChange })
    );

    useQuery(['permission-select'], () => permissionAPI.list(), {
        onSuccess: ({ data }) => {
            const options = data.map((val: GroupResult) => {
                return {
                    value: String(val?.id),
                    label: val?.name,
                };
            });
            setPermissionOptions(options);
        },
    });

    const groupMutation = useMutation((data: GroupResult) => groupAPI.store(data, Number(rowId)));

    const pageToFecth = data?.data?.result.length <= 1 ? page - 1 : page;

    const groupDeleteMutation = useMutation((id: number) => groupAPI.delete(id), {
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
                    title: 'Congrats! Group Deleted',
                    message: data.data?.message,
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                if (pageToSet === page) queryClient.invalidateQueries(['groups', pageToSet, limitChange]);
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

    const onCreateGroup = (data: any, actions: any) => {
        groupMutation.mutate(data, {
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
                        title: `Congrats! Role ${rowId ? 'Updated' : 'Created'}`,
                        message: rowId ? data.data.message ?? 'Role updated successfully' : data.data.message ?? 'Role created successfully',
                        color: 'green',
                        icon: <IconCheck size={18} />,
                    });
                    const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                    if (pageToSet === page) queryClient.invalidateQueries(['groups', pageToSet, limitChange]);
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
        queryClient.prefetchQuery(['groups', page, limitChange], () => groupAPI.list({ search: query, page_size: limitChange }));
        setQuery(query);
        setPage(1);
    };

    const handleSingleDelete = (id: number) => {
        setDeleteModal(true);
        setRowId(id);
    };

    const handleCloseModal = () => {
        if (!groupDeleteMutation.isLoading) {
            setDeleteModal(false);
            setRowId(null);
        }
    };

    const handleFormClose = () => {
        if (!groupMutation.isLoading) {
            setFormModal(false);
            setRowId(null);
            setGroupFormData({
                id: null,
                name: '',
                permissions: [],
            });
        }
    };

    const handleFormModal = () => {
        setFormModal(true);
        setRowId(null);
    };

    const handleFormModalEdit = (object: GroupResult) => {
        setGroupFormData(mapToViewModal(object));
        setFormModal(true);
        setRowId(object?.id);
    };

    const mapToViewModal = (value: GroupResult) => {
        const permissionOptions = value.permissions && value.permissions.map((val: any) => String(val?.id));
        return {
            id: value.id,
            name: value.name,
            permissions: permissionOptions,
        };
    };

    if (isError) {
        return <ErrorAlert />;
    }

    if (!is_superuser && !user_permissions?.includes('view_role')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            <PaperBox>
                <GroupListTable
                    data={data?.data?.result}
                    page={page}
                    isLoading={isLoading}
                    isSuccess={isSuccess}
                    total={data?.data?.total_pages}
                    isDeleteModalOpened={deleteModal}
                    isSingleDeleteMutationLoading={groupDeleteMutation.isLoading}
                    handleSingleDelete={handleSingleDelete}
                    onSetPage={setPage}
                    onConfirmSingleDelete={() => groupDeleteMutation.mutate(Number(rowId))}
                    handleSingleDeleteCloseModal={handleCloseModal}
                    onHandleSearch={onHandleSearch}
                    handleFormModalEdit={handleFormModalEdit}
                    handleFormModal={handleFormModal}
                    limitChange={limitChange}
                    handleLimitChange={handleLimitChange}
                    isFetching={isFetching}
                    query={query}
                />
            </PaperBox>
            <Formik
                enableReinitialize
                initialValues={groupFormData}
                validationSchema={groupSchema}
                onSubmit={(values, actions) => {
                    onCreateGroup(values, actions);
                }}>
                {({ errors, touched, handleSubmit, handleReset, setFieldValue, values }) => (
                    <FormModal
                        size="lg"
                        opened={formModal}
                        onClose={() => {
                            if (!groupMutation.isLoading) {
                                handleReset();
                            }
                            handleFormClose();
                        }}
                        title={`${rowId ? 'Edit Role' : 'Add Role'}`}
                        onConfirm={handleSubmit}
                        confirmButtonText={`${rowId ? 'Save' : 'Add'}`}
                        loading={groupMutation.isLoading}>
                        <Form>
                            <InputField name="name" error={errors.name} touch={touched.name} labelName="Role Name" withAsterisk />
                            <CreatableInputField
                                name="permissions"
                                options={permissionOptions}
                                labelName="Permissions"
                                placeHolder="e.g. Add Log Entry Delete Log Entry"
                                error={errors.permissions as string}
                                touch={touched.permissions}
                                value={values.permissions}
                                onChange={(value) => setFieldValue('permissions', value)}
                                searchable
                                clearable
                            />
                        </Form>
                    </FormModal>
                )}
            </Formik>
        </>
    );
};

export default GroupList;
