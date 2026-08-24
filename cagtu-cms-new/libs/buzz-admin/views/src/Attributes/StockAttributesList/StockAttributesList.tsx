import { API, urls } from '@cagtu-cms/data-access';
import { Breadcrumb, CreatableInputField, ErrorAlert, FormModal, InputField, PaperBox, SelectInputField, TextAreaField } from '@cagtu-cms/ui-shared';
import { attributesSchema, getDeleteUrl, inputTypeOptions, AttributesResult, useDark, useDataLimit, InputType, getPageLimit } from '@cagtu-cms/util-formatter';
import { Box, Button, Group, Title, useMantineTheme } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Form, Formik } from 'formik';
import { useState } from 'react';
import ProductAttributesListTable from './../ProductAttributesList/ProductAttributesListTable';

const StockAttributesList = () => {
    const [dark] = useDark();
    const theme = useMantineTheme();

    const [checked, setChecked] = useState<string[]>([]);
    const queryClient = useQueryClient();
    const [formModal, setFormModal] = useState<boolean>(false);
    const [deleteModal, setDeleteModal] = useState<boolean>(false);
    const [multiDeleteModal, setMultiDeleteModal] = useState<boolean>(false);
    const [rowId, setRowId] = useState<number | null>();
    const [page, setPage] = useState<number>(1);
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');
    const [selectOptions, setSelectOptions] = useState<{ value: string; label: string }[]>([]);

    const [stockAttrFormData, setStockAttrFormData] = useState<AttributesResult>({
        id: null,
        name: '',
        unit: '',
        type: '',
        info: '',
        options: [],
    });

    const stockAttrAPI = new API(urls?.buzz?.cms?.attributes?.stock?.path);
    const stockAttrMultipleDeleteAPI = new API(urls?.buzz?.cms?.attributes?.stock?.multipleDelete);

    const { isLoading, isError, isSuccess, data } = useQuery(['stock-attributes', page], () => stockAttrAPI.list({ page }));
    const stockAttrMutation = useMutation((data: AttributesResult) => stockAttrAPI.store(data, Number(rowId)));

    const pageToFecth = data?.data?.result.length <= 1 ? page - 1 : page;
    const pageToFetchMultiple = data?.data?.result.length <= checked.length ? page - 1 : page;

    const stockAttrMultipleDeleteMutation = useMutation(
        (checkedIds: string[]) =>
            stockAttrMultipleDeleteAPI.multipleDeleteWithUrl(getDeleteUrl(checkedIds, urls?.buzz?.cms?.attributes?.stock?.multipleDelete)),
        {
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
                        title: 'Congrats! Stock Attributes Deleted',
                        message: data.data?.message,
                        color: 'green',
                        icon: <IconCheck />,
                    });
                    const pageToSet = pageToFetchMultiple < 1 ? 1 : pageToFetchMultiple;
                    if (pageToSet === page) queryClient.invalidateQueries(['stock-attributes', pageToSet]);
                    else setPage(pageToSet);
                }
            },
            onError: (error: any) => {
                const {
                    data: { message },
                } = error.response;

                setMultiDeleteModal(false);
                setChecked([]);
                showNotification({
                    title: 'Uh oh! something went wrong',
                    message: message ?? 'Sorry! There was a problem with your request.',
                    color: 'red',
                    icon: <IconX />,
                });
            },
        }
    );

    const stockAttrDeleteMutation = useMutation((id: number) => stockAttrAPI.delete(id), {
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
                    title: 'Congrats! Stock Attributes Deleted',
                    message: data.data?.message,
                    color: 'green',
                    icon: <IconCheck />,
                });
                const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                if (pageToSet === page) queryClient.invalidateQueries(['stock-attributes', pageToSet]);
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

    const onCreateStockAttr = (data: any, actions: any) => {
        stockAttrMutation.mutate(data, {
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
                        title: 'Congrats! Stock Attributes Created',
                        message: data.data.message,
                        color: 'green',
                        icon: <IconCheck />,
                    });
                    const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                    if (pageToSet === page) queryClient.invalidateQueries(['stock-attributes', pageToSet]);
                    else setPage(pageToSet);
                }
            },
            onError: (error: any) => {
                const {
                    data: { name, type },
                } = error.response;

                actions.setFieldError('name', name && name[0]);
                actions.setFieldError('type', type && type[0]);

                showNotification({
                    title: 'Uh oh! something went wrong',
                    message: 'Sorry! There was a problem with your request.',
                    color: 'red',
                    icon: <IconX />,
                });
            },
        });
    };

    const onHandleSearch = (query: string) => {
        queryClient.prefetchQuery(['stock-attributes', page], () => stockAttrAPI.list({ search: query }));
    };

    const onSelectAll = () => {
        const isSelectAll = isAllCheckboxSelected();
        if (isSelectAll) {
            setChecked([]);
        } else {
            const checkedRowId = data?.data?.result.map((stockAttr: AttributesResult) => String(stockAttr.id));
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
        const checkedRowId = data?.data?.result.map((stockAttr: AttributesResult) => String(stockAttr.id));
        const isAllSelected = checkedRowId.every((id: number) => checked.includes(String(id)));

        return isAllSelected;
    };

    const handleSingleDelete = (id: number) => {
        setDeleteModal(true);
        setRowId(id);
    };

    const handleCloseModal = () => {
        if (!stockAttrDeleteMutation.isLoading) {
            setDeleteModal(false);
            setRowId(null);
        }
    };

    const handleMultiDeleteCloseModal = () => {
        if (!stockAttrMultipleDeleteMutation.isLoading) {
            setMultiDeleteModal(false);
        }
    };

    const handleFormClose = () => {
        if (!stockAttrMutation.isLoading) {
            setFormModal(false);
            setRowId(null);
            setStockAttrFormData({
                id: null,
                name: '',
                unit: '',
                type: '',
                info: '',
                options: [],
            });
        }
    };

    const handleFormModal = () => {
        setFormModal(true);
        setRowId(null);
    };

    const handleFormModalEdit = (object: AttributesResult) => {
        setStockAttrFormData(mapToViewModal(object));
        setFormModal(true);
        setRowId(object?.id);
    };

    const mapToViewModal = (value: AttributesResult) => {
        return {
            id: value.id,
            name: value.name,
            unit: value.unit,
            type: value.type,
            info: value.info,
            options: value.options && JSON.parse(String(value.options)),
        };
    };

    if (isError) {
        return <ErrorAlert />;
    }

    return (
        <>
            <Group position="apart" mb={30}>
                <Box>
                    <Title order={4} sx={{ fontWeight: 600, color: dark ? theme.colors.gray[2] : theme.colors.dark[9] }}>
                        Stock Attributes
                    </Title>
                    <Breadcrumb currentTitle="Stock Attributes" />
                </Box>
                <Button onClick={handleFormModal} px={15} sx={{ height: 38, fontWeight: 500, minWidth: 120 }}>
                    Create
                </Button>
            </Group>
            <PaperBox>
                <ProductAttributesListTable
                    data={data?.data?.result}
                    page={page}
                    checked={checked}
                    isLoading={isLoading}
                    isSuccess={isSuccess}
                    total={data?.data?.total_pages}
                    isDeleteModalOpened={deleteModal}
                    isMultiDeleteModalOpened={multiDeleteModal}
                    isSingleDeleteMutationLoading={stockAttrDeleteMutation.isLoading}
                    isMultiDeleteMutationLoading={stockAttrMultipleDeleteMutation.isLoading}
                    isAllCheckboxSelected={isAllCheckboxSelected}
                    isCheckboxSelect={isCheckboxSelect as unknown as undefined}
                    handleSelect={handleSelect as unknown as undefined}
                    handleSingleDelete={handleSingleDelete}
                    onSelectAll={onSelectAll}
                    onSetPage={setPage}
                    onClickDeleteAll={() => setMultiDeleteModal(true)}
                    onConfirmSingleDelete={() => stockAttrDeleteMutation.mutate(Number(rowId))}
                    onConfirmMultiDelete={() => stockAttrMultipleDeleteMutation.mutate(checked)}
                    handleSingleDeleteCloseModal={handleCloseModal}
                    handleMultiDeleteCloseModal={handleMultiDeleteCloseModal}
                    onHandleSearch={onHandleSearch}
                    handleFormModalEdit={handleFormModalEdit}
                    limitChange={limitChange}
                    handleLimitChange={handleLimitChange}
                />
            </PaperBox>
            <Formik
                enableReinitialize
                initialValues={stockAttrFormData}
                validationSchema={attributesSchema}
                onSubmit={(values, actions) => {
                    const dataToSend = {
                        ...JSON.parse(JSON.stringify(values)),
                        type: values.type.toLowerCase(),
                        options: !values.options ? null : JSON.stringify(values.options),
                    };
                    onCreateStockAttr(dataToSend, actions);
                }}>
                {({ errors, touched, handleSubmit, handleReset, setFieldValue, values }) => (
                    <FormModal
                        opened={formModal}
                        onClose={() => {
                            handleReset();
                            handleFormClose();
                        }}
                        title={`${rowId ? 'Edit Stock Attributes' : 'Add Stock Attributes'}`}
                        onConfirm={handleSubmit}
                        confirmButtonText={`${rowId ? 'Save' : 'Add'}`}
                        loading={stockAttrMutation.isLoading}>
                        <Form>
                            <InputField
                                name="name"
                                error={errors.name}
                                touch={touched.name}
                                labelName="Attributes Name"
                                placeHolder="e.g: RAM, ROM"
                                withAsterisk
                            />
                            <SelectInputField
                                name="type"
                                labelName="Types"
                                placeHolder="Select types"
                                error={errors.type}
                                touch={touched.type}
                                options={inputTypeOptions}
                                handleChange={(value) => setFieldValue('type', value)}
                                withAsterisk
                            />
                            {values.type === InputType.SELECT ? (
                                <CreatableInputField
                                    name="options"
                                    options={selectOptions}
                                    labelName="Create Options"
                                    placeHolder="Create"
                                    error={errors.options}
                                    touch={touched.options}
                                    value={values.options}
                                    onChange={(value) => setFieldValue('options', value)}
                                    handleCreate={(value) => {
                                        // if (!values.options?.includes(value)) setFieldValue('options', [...(values.options as any[]), value]);
                                        // else setFieldValue('options', [...values.options]);
                                        const newItem = { value: value, label: value };
                                        setSelectOptions((prev) => [...prev, newItem]);
                                        setFieldValue('options', values.options);
                                        return newItem;
                                    }}
                                    handleCreateLabel={(value) => `+ Create ${value}`}
                                    withAsterisk={values.type === InputType.SELECT}
                                />
                            ) : (
                                <InputField
                                    name="unit"
                                    error={errors.unit}
                                    touch={touched.unit}
                                    labelName="Unit"
                                    placeHolder="e.g: KG, Inch, GB, MB"
                                />
                            )}
                            <TextAreaField name="info" error={errors.info} touch={touched.info} labelName="Field Info" autoComplete="off" />
                        </Form>
                    </FormModal>
                )}
            </Formik>
        </>
    );
};

export default StockAttributesList;
