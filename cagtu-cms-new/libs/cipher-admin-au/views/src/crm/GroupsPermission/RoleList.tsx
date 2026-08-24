import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { ErrorAlert, FormModal, InputField, PaperBox } from '@cagtu-cms/ui-shared';
import { getDeleteUrl, getPageLimit, RoleResult, roleSchema, useDataLimit } from '@cagtu-cms/util-formatter';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Form, Formik } from 'formik';
import { useState } from 'react';
import RoleListTable from './RoleListTable';

const urlsPath = urls?.cipher?.user?.role;

const RoleList = () => {
    const [checked, setChecked] = useState<string[]>([]);
    const queryClient = useQueryClient();
    const [formModal, setFormModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [multiDeleteModal, setMultiDeleteModal] = useState(false);
    const [rowId, setRowId] = useState<number | null>();
    const [page, setPage] = useState(1);
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');

    const [roleFormData, setRoleFormData] = useState<RoleResult>({
        id: null,
        name: '',
    });

    const roleAPI = new CipherAPI(urlsPath?.path);
    const roleMultiDeleteAPI = new CipherAPI(urlsPath?.multipleDelete);

    const { isLoading, isError, isSuccess, data } = useQuery(['roles', page, limitChange], () => roleAPI.list({ page, page_size: limitChange }));
    const roleMutation = useMutation((data: RoleResult) => roleAPI.store(data, Number(rowId)));

    const pageToFecth = data?.data?.result.length <= 1 ? page - 1 : page;
    const pageToFetchMultiple = data?.data?.result.length <= checked.length ? page - 1 : page;

    const roleMultiDeleteMutation = useMutation(
        (checkedIds: string[]) => roleMultiDeleteAPI.multipleDeleteWithUrl(getDeleteUrl(checkedIds, urlsPath?.multipleDelete)),
        {
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
                        title: 'Congrats! Group Deleted',
                        message: data.data?.message,
                        color: 'green',
                        icon: <IconCheck size={18} />,
                    });
                    const pageToSet = pageToFetchMultiple < 1 ? 1 : pageToFetchMultiple;
                    if (pageToSet === page) queryClient.invalidateQueries(['roles', pageToSet, limitChange]);
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
        }
    );

    const roleDeleteMutation = useMutation((id: number) => roleAPI.delete(id), {
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
                    title: 'Congrats! Role Deleted',
                    message: data.data?.message,
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                if (pageToSet === page) queryClient.invalidateQueries(['roles', pageToSet, limitChange]);
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

    const onCreateRole = (data: any, actions: any) => {
        roleMutation.mutate(data, {
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
                        title: `Congrats! Group ${rowId ? 'Updated' : 'Created'}`,
                        message: rowId ? data.data.message ?? 'Group updated successfully' : data.data.message ?? 'Group created successfully',
                        color: 'green',
                        icon: <IconCheck size={18} />,
                    });
                    const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                    if (pageToSet === page) queryClient.invalidateQueries(['roles', pageToSet, limitChange]);
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
        queryClient.prefetchQuery(['roles', page, limitChange], () => roleAPI.list({ search: query, page_size: limitChange }));
    };

    const onSelectAll = () => {
        const isSelectAll = isAllCheckboxSelected();
        if (isSelectAll) {
            setChecked([]);
        } else {
            const checkedRowId = data?.data?.result.map((role: RoleResult) => String(role.id));
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
        const checkedRowId = data?.data?.result.map((role: RoleResult) => String(role.id));
        const isAllSelected = checkedRowId.every((id: string) => checked.includes(id));
        return isAllSelected;
    };

    const handleSingleDelete = (id: number) => {
        setDeleteModal(true);
        setRowId(id);
    };

    const handleCloseModal = () => {
        if (!roleDeleteMutation.isLoading) {
            setDeleteModal(false);
            setRowId(null);
        }
    };

    const handleMultiDeleteCloseModal = () => {
        if (!roleMultiDeleteMutation.isLoading) {
            setMultiDeleteModal(false);
        }
    };

    const handleFormClose = () => {
        if (!roleMutation.isLoading) {
            setFormModal(false);
            setRowId(null);
            setRoleFormData({
                id: null,
                name: '',
            });
        }
    };

    const handleFormModal = () => {
        setFormModal(true);
        setRowId(null);
    };

    const handleFormModalEdit = (object: RoleResult) => {
        setRoleFormData(mapToViewModal(object));
        setFormModal(true);
        setRowId(object?.id);
    };

    const mapToViewModal = (value: RoleResult) => {
        return {
            id: value.id,
            name: value.name,
        };
    };

    if (isError) {
        return <ErrorAlert />;
    }

    return (
        <>
            <PaperBox>
                <RoleListTable
                    data={data?.data?.result}
                    page={page}
                    checked={checked}
                    isLoading={isLoading}
                    isSuccess={isSuccess}
                    total={data?.data?.total_pages}
                    isDeleteModalOpened={deleteModal}
                    isMultiDeleteModalOpened={multiDeleteModal}
                    isSingleDeleteMutationLoading={roleDeleteMutation.isLoading}
                    isMultiDeleteMutationLoading={roleMultiDeleteMutation.isLoading}
                    isAllCheckboxSelected={isAllCheckboxSelected}
                    isCheckboxSelect={isCheckboxSelect as unknown as undefined}
                    handleSelect={handleSelect as unknown as undefined}
                    handleSingleDelete={handleSingleDelete}
                    onSelectAll={onSelectAll}
                    onSetPage={setPage}
                    onClickDeleteAll={() => setMultiDeleteModal(true)}
                    onConfirmSingleDelete={() => roleDeleteMutation.mutate(Number(rowId))}
                    onConfirmMultiDelete={() => roleMultiDeleteMutation.mutate(checked)}
                    handleSingleDeleteCloseModal={handleCloseModal}
                    handleMultiDeleteCloseModal={handleMultiDeleteCloseModal}
                    onHandleSearch={onHandleSearch}
                    handleFormModalEdit={handleFormModalEdit}
                    handleFormModal={handleFormModal}
                    limitChange={limitChange}
                    handleLimitChange={handleLimitChange}
                />
            </PaperBox>
            <Formik
                enableReinitialize
                initialValues={roleFormData}
                validationSchema={roleSchema}
                onSubmit={(values, actions) => {
                    onCreateRole(values, actions);
                }}>
                {({ errors, touched, handleSubmit, handleReset }) => (
                    <FormModal
                        opened={formModal}
                        onClose={() => {
                            if (!roleMutation.isLoading) {
                                handleReset();
                            }
                            handleFormClose();
                        }}
                        title={`${rowId ? 'Edit Group' : 'Add Group'}`}
                        onConfirm={handleSubmit}
                        confirmButtonText={`${rowId ? 'Save' : 'Add'}`}
                        loading={roleMutation.isLoading}>
                        <Form>
                            <InputField name="name" error={errors.name} touch={touched.name} labelName="Group Name" withAsterisk />
                        </Form>
                    </FormModal>
                )}
            </Formik>
        </>
    );
};

export default RoleList;
