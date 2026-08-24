import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { Button, ErrorAlert, FormModal, InputField, PageHeader, PaperBox, ProfileImageField, SwitchCheckbox } from '@cagtu-cms/ui-shared';
import {
    CipherUserContext,
    TrustedPartnersFormValuesProps,
    TrustedPartnersResult,
    getPageLimit,
    trustedPartnersSchema,
    useDataLimit,
} from '@cagtu-cms/util-formatter';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Form, Formik, FormikHelpers } from 'formik';
import { useContext, useState } from 'react';
import TrustedPartnersTable from './TrustedPartnersTable';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';

const urlsPath = urls?.cipher?.marketing?.trustedPartners;

const initialFormData: TrustedPartnersFormValuesProps = {
    id: null,
    alt_text: '',
    redirect_url: '',
    logo: [],
    profilePreviewUrl: [],
    is_active: false,
};

const TrustedPartnersList = () => {
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

    const [trustedPartnerFormData, setTrustedPartnerFormData] = useState<TrustedPartnersFormValuesProps>({
        ...initialFormData,
    });

    const formData: FormData = new FormData();

    const trustedPartnerAPI = new CipherAPI(urlsPath?.path);
    const trustedPartnerMultiDeleteAPI = new CipherAPI(urlsPath?.multipleDelete);

    const { isLoading, isError, isSuccess, data, isFetching } = useQuery(['partners', page, limitChange], () =>
        trustedPartnerAPI.list({ search: query, page, page_size: limitChange })
    );

    const trustedPartnerMutation = useMutation((data: FormData) => trustedPartnerAPI.store(data, Number(rowId)));

    const pageToFecth = data?.data?.result.length <= 1 ? page - 1 : page;
    const pageToFetchMultiple = data?.data?.result.length <= checked.length ? page - 1 : page;

    const trustedPartnerMultiDeleteMutation = useMutation((checkedIds: string[]) => trustedPartnerMultiDeleteAPI.store({ id: checkedIds }), {
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
                    title: 'Congrats! Partners Deleted',
                    message: data.data?.message,
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                const pageToSet = pageToFetchMultiple < 1 ? 1 : pageToFetchMultiple;
                if (pageToSet === page) queryClient.invalidateQueries(['partners', pageToSet, limitChange]);
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

    const trustedPartnerDeleteMutation = useMutation((id: number) => trustedPartnerAPI.delete(id), {
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
                    title: 'Congrats! Partners Deleted',
                    message: data.data?.message,
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                if (pageToSet === page) queryClient.invalidateQueries(['partners', pageToSet, limitChange]);
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

    const onCreateTrustedPartner = (
        formData: FormData,
        actions: FormikHelpers<TrustedPartnersFormValuesProps>,
        values: TrustedPartnersFormValuesProps
    ) => {
        trustedPartnerMutation.mutate(formData, {
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
                    delete values.profilePreviewUrl;
                    setFormModal(false);
                    setRowId(null);
                    showNotification({
                        title: `Congrats! Partners ${rowId ? 'Updated' : 'Created'} `,
                        message: rowId ? data.data.message ?? 'Partners updated successfully' : data.data.message ?? 'Partners created successfully',
                        color: 'green',
                        icon: <IconCheck size={18} />,
                    });
                    actions.resetForm();
                    const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                    if (pageToSet === page) queryClient.invalidateQueries(['partners', pageToSet, limitChange]);
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
        queryClient.prefetchQuery(['partners', page, limitChange], () => trustedPartnerAPI.list({ search: query, page_size: limitChange }));
        setQuery(query);
        setPage(1);
    };

    const onSelectAll = () => {
        const isSelectAll = isAllCheckboxSelected();
        if (isSelectAll) {
            setChecked([]);
        } else {
            const checkedRowId = data?.data?.result.map((part: TrustedPartnersResult) => String(part.id));
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
        const checkedRowId = data?.data?.result.map((part: TrustedPartnersResult) => String(part.id));
        const isAllSelected = checkedRowId.every((id: number) => checked.includes(String(id)));
        return isAllSelected;
    };

    const handleSingleDelete = (id: number) => {
        setDeleteModal(true);
        setRowId(id);
    };

    const handleCloseModal = () => {
        if (!trustedPartnerDeleteMutation.isLoading) {
            setDeleteModal(false);
            setRowId(null);
        }
    };

    const handleMultiDeleteCloseModal = () => {
        if (!trustedPartnerMultiDeleteMutation.isLoading) {
            setMultiDeleteModal(false);
        }
    };

    const handleFormClose = () => {
        if (!trustedPartnerMutation.isLoading) {
            setFormModal(false);
            setRowId(null);
            setTrustedPartnerFormData({
                ...initialFormData,
            });
        }
    };

    const handleFormModal = () => {
        setFormModal(true);
        setRowId(null);
    };

    const handleFormModalEdit = (object: TrustedPartnersFormValuesProps) => {
        setTrustedPartnerFormData(mapToViewModal(object));
        setFormModal(true);
        setRowId(object?.id);
    };

    const formDataValues = (values: TrustedPartnersFormValuesProps) => {
        formData.append('alt_text', values.alt_text);
        formData.append('redirect_url', values.redirect_url);
        formData.append('is_active', String(values.is_active));

        if (values.logo[0]?.name) {
            values.logo.forEach((file) => formData.append('logo', file));
        }
    };

    const mapToViewModal = (value: TrustedPartnersFormValuesProps) => {
        return {
            id: null,
            alt_text: value.alt_text,
            redirect_url: value.redirect_url,
            logo: value.logo,
            profilePreviewUrl: [{ src: value.logo }],
            is_active: value.is_active,
        };
    };

    if (isError) {
        return <ErrorAlert />;
    }

    if (!is_superuser && !user_permissions?.includes('view_trustedpartner')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            <PageHeader pageTitle="Trusted Partners">
                {(is_superuser || user_permissions?.includes('add_trustedpartner')) && <Button onClick={handleFormModal} name="Create" />}
            </PageHeader>
            <PaperBox>
                <TrustedPartnersTable
                    data={data?.data?.result}
                    page={page}
                    checked={checked}
                    isLoading={isLoading}
                    isSuccess={isSuccess}
                    total={data?.data?.total_pages}
                    isDeleteModalOpened={deleteModal}
                    isMultiDeleteModalOpened={multiDeleteModal}
                    isSingleDeleteMutationLoading={trustedPartnerDeleteMutation.isLoading}
                    isMultiDeleteMutationLoading={trustedPartnerMultiDeleteMutation.isLoading}
                    isAllCheckboxSelected={isAllCheckboxSelected}
                    isCheckboxSelect={isCheckboxSelect as unknown as undefined}
                    handleSelect={handleSelect as unknown as undefined}
                    handleSingleDelete={handleSingleDelete}
                    onSelectAll={onSelectAll}
                    onSetPage={setPage}
                    onClickDeleteAll={() => setMultiDeleteModal(true)}
                    onConfirmSingleDelete={() => trustedPartnerDeleteMutation.mutate(Number(rowId))}
                    onConfirmMultiDelete={() => trustedPartnerMultiDeleteMutation.mutate(checked)}
                    handleSingleDeleteCloseModal={handleCloseModal}
                    handleMultiDeleteCloseModal={handleMultiDeleteCloseModal}
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
                initialValues={trustedPartnerFormData}
                validationSchema={trustedPartnersSchema}
                onSubmit={(values, actions) => {
                    formDataValues(values);
                    onCreateTrustedPartner(formData, actions, values);
                }}>
                {({ errors, touched, handleSubmit, handleReset, values, setFieldValue, handleBlur }) => (
                    <FormModal
                        opened={formModal}
                        onClose={() => {
                            if (!trustedPartnerMutation.isLoading) {
                                handleReset();
                            }
                            handleFormClose();
                        }}
                        title={`${rowId ? 'Edit Partner' : 'Add Partner'}`}
                        onConfirm={handleSubmit}
                        confirmButtonText={`${rowId ? 'Save' : 'Add'}`}
                        loading={trustedPartnerMutation.isLoading}>
                        <Form>
                            <ProfileImageField
                                labelName="Logo"
                                name="logo"
                                profileImageData={values.profilePreviewUrl}
                                error={errors.logo as string}
                                handleBlur={handleBlur}
                                setFieldValue={setFieldValue}
                                withAsterisk
                            />
                            <InputField
                                name="alt_text"
                                error={errors.alt_text}
                                touch={touched.alt_text}
                                labelName="Partner Name"
                                placeHolder="e.g. Enter partner name"
                                withAsterisk
                            />
                            <InputField
                                name="redirect_url"
                                error={errors.redirect_url}
                                touch={touched.redirect_url}
                                labelName="Redirect URL"
                                placeHolder="e.g. https://example.com"
                                withAsterisk
                            />
                            <SwitchCheckbox
                                name="is_active"
                                checked={values.is_active}
                                onChange={(e) => setFieldValue('is_active', e.currentTarget.checked)}
                                labelName="Is Active?"
                                mt={20}
                            />
                        </Form>
                    </FormModal>
                )}
            </Formik>
        </>
    );
};

export default TrustedPartnersList;
