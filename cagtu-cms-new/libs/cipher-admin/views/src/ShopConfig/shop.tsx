import {
    getPageLimit,
    PageTabNavbarOptions,
    TableColumnsProps,
    useBreadCrumbCurrentTitle,
    useDark,
    useDataLimit
} from '@cagtu-cms/util-formatter';
import { ActionIcon, Box, Flex, Group, Loader, Modal, Text, Title, Tooltip, useMantineTheme } from '@mantine/core'; 
import {
    Badge,
    Breadcrumb,
    Button,
    DataTable,
    FormModal,
    InputField,
    PageHeader,
    PaperBox,
    SwitchCheckbox
} from '@cagtu-cms/ui-shared';
import { Outlet } from 'react-router-dom';
import { CipherAPI, urls, http } from '@cagtu-cms/data-access';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { IconCheck, IconEdit, IconTrash, IconX } from '@tabler/icons';
import { Form, Formik, FormikHelpers } from 'formik';
import { showNotification } from '@mantine/notifications';

// Define the ShopConfig interface
export interface ShopConfig {
    id: number | null;
    is_premium: boolean;
    max_shops: number;
    max_products: number;
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
}

interface ShopApiResponse {
    result: ShopConfig[];
}

const Shop = () => {
    const [formModal, setFormModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false); // Track create vs edit mode
    const [selectedShop, setSelectedShop] = useState<ShopConfig | null>(null); // Store the shop being edited
    const [deleteModal, setDeleteModal] = useState(false); // Control delete confirmation modal
    const [shopToDelete, setShopToDelete] = useState<number | null>(null); // Store ID of shop to delete
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);

    // API endpoints
    const url = urls.cipher.shopLimit;
    const GETAPIENDPOINT = new CipherAPI(url.path); // For fetching shop configs
    const CREATEAPIENDPOINT = new CipherAPI(url.create); // For POST (create)

    // Custom update function for PATCH requests with /update/ suffix
    const updateShopConfig = async (data: FormData, id: number) => {
        return await http.patch(`/merchant/cms-merchant-limits/${id}/update/`, data);
    };

    // Custom delete function for DELETE requests with /delete/ suffix
    const deleteShopConfig = async (id: number) => {
        return await http.delete(`/merchant/cms-merchant-limits/${id}/delete/`);
    };

    // Initial form values
    const initialValues: ShopConfig = {
        id: null,
        is_premium: false,
        max_shops: 0,
        max_products: 0,
        created_at: '',
        updated_at: '',
    };

    // Table columns configuration
    const columns: TableColumnsProps[] = [
        { path: 'id', label: 'Type',  content: (object: any) => (
                object?.is_premium ? 'Premium Merchant' : 'Basic Merchant'
            ), },
        { path: 'max_shops', label: 'Max Shop Limit', style: { width: 200 } },
        { path: 'max_products', label: 'Max Product Limit', style: { width: 200 } },
        {
            path: 'is_premium',
            label: 'Is Premium',
            content: (object: any) => (
                <Badge name={object?.is_premium ? 'Yes' : 'No'} color={object?.is_premium ? 'green' : 'red'} />
            ),
            style: { width: 200 },
        },
       
        {
            path: 'actions',
            label: '',
            content: (object: ShopConfig) => (
                <Group position="right" spacing={5}>
                    <Tooltip label="Edit" position="bottom" styles={{ tooltip: { fontSize: 12, padding: '3px 8px', fontWeight: 500 } }}>
                        <ActionIcon
                            variant="light"
                            radius="xl"
                            size={30}
                            color="gray"
                            sx={{ cursor: 'pointer' }}
                            onClick={() => handleEditClick(object)} // Trigger edit mode
                        >
                            <IconEdit size={18} stroke={1.75} />
                        </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Delete" position="bottom" styles={{ tooltip: { fontSize: 12, padding: '3px 8px', fontWeight: 500 } }}>
                        <ActionIcon
                            variant="light"
                            radius="xl"
                            size={30}
                            color="red" // Indicate delete action
                            sx={{ cursor: 'pointer' }}
                            onClick={() => handleDeleteClick(object.id)} // Trigger delete confirmation
                        >
                            <IconTrash size={18} stroke={1.75} />
                        </ActionIcon>
                    </Tooltip>
                </Group>
            ),
            style: { width: 100 },
        },
    ];

    // Fetch shop configurations
    const fetchData = async (): Promise<ShopConfig[]> => {
        const { data }: { data: ShopApiResponse } = await GETAPIENDPOINT.list();
        return Array.isArray(data?.result) ? data.result : [];
    };

    // Mutations for create (POST), update (PATCH), and delete (DELETE)
    const createMutation = useMutation((data: FormData) => CREATEAPIENDPOINT.store(data));
    const updateMutation = useMutation(({ data, id }: { data: FormData; id: number }) => updateShopConfig(data, id));
    const deleteMutation = useMutation((id: number) => deleteShopConfig(id)); // Use custom delete function

    const { isLoading, isError, isSuccess, data = [], isFetching } = useQuery<ShopConfig[]>(['shop'], fetchData);
    const pageToFetch = data?.length <= 1 ? page - 1 : page;

    if (isLoading) return <Loader />;


    const handleEditClick = (shop: ShopConfig) => {
        setSelectedShop(shop);
        setIsEditing(true);
        setFormModal(true);
    };

    const handleDeleteClick = (id: number | null) => {
        if (id) {
            setShopToDelete(id);
            setDeleteModal(true);
        }
    };

    const handleDeleteConfirm = () => {
        if (shopToDelete) {
            deleteMutation.mutate(shopToDelete, {
                onSuccess: () => {
                    setDeleteModal(false);
                    setShopToDelete(null);
                    showNotification({
                        title: 'Success',
                        message: 'Shop config deleted successfully.',
                        color: 'green',
                        icon: <IconCheck size={18} />,
                    });
                    queryClient.invalidateQueries(['shop', page]) // Refresh the table
                },
                onError: (error: any) => {
                    setDeleteModal(false);
                    setShopToDelete(null);
                    showNotification({
                        title: 'Error',
                        message: error?.message || 'Failed to delete shop config.',
                        color: 'red',
                        icon: <IconX size={18} />,
                    });
                },
            });
        }
        fetchData()
    };



    const onSubmitShopConfig = (values: ShopConfig, actions: FormikHelpers<ShopConfig>) => {
        const formData = new FormData();
        formData.append('is_premium', values.is_premium.toString());
        formData.append('max_shops', values.max_shops.toString());
        formData.append('max_products', values.max_products.toString());


        if (isEditing && values.id) {
            // Update (PATCH)
            updateMutation.mutate({ data: formData, id: values.id }, {
                onSuccess: (data) => {
                    if (data.data.status === 'failure') {
                        setFormModal(false);
                        showNotification({
                            title: 'Uh oh! Something went wrong',
                            message: data.data.message.title[0] || 'An error occurred',
                            color: 'red',
                            icon: <IconX size={18} />,
                        });
                    } else {
                        actions.resetForm();
                        setFormModal(false);
                        setIsEditing(false);
                        setSelectedShop(null);
                        showNotification({
                            title: 'Congrats! Updated',
                            message: 'Shop config updated successfully.',
                            color: 'green',
                            icon: <IconCheck size={18} />,
                        });
                        const pageToSet = pageToFetch < 1 ? 1 : pageToFetch;
                        if (pageToSet === page) queryClient.invalidateQueries(['shop', pageToSet]);
                        else setPage(pageToSet);
                        queryClient.invalidateQueries(['shop']); // Refetch data
                    }
                },
                onError: (error: any) => {
                    setFormModal(false);
                    showNotification({
                        title: 'Error',
                        message: error?.message || 'Failed to update shop config.',
                        color: 'red',
                        icon: <IconX size={18} />,
                    });
                },
            });

        } else {
            // Create (POST)
            createMutation.mutate(formData, {
                onSuccess: (data) => {
                    if (data.data.status === 'failure') {
                        setFormModal(false);
                        showNotification({
                            title: 'Uh oh! Something went wrong',
                            message: data.data.message.title[0] || 'An error occurred',
                            color: 'red',
                            icon: <IconX size={18} />,
                        });
                    } else {
                        actions.resetForm();
                        setFormModal(false);
                        setIsEditing(false);
                        setSelectedShop(null);
                        showNotification({
                            title: 'Congrats! Created',
                            message: 'Shop config created successfully.',
                            color: 'green',
                            icon: <IconCheck size={18} />,
                        });
                        const pageToSet = pageToFetch < 1 ? 1 : pageToFetch;
                        if (pageToSet === page) queryClient.invalidateQueries(['shop', pageToSet]);
                        else setPage(pageToSet);
                        queryClient.invalidateQueries(['shop']); // Refetch data
                    }
                },
                onError: (error: any) => {
                    setFormModal(false);
                    showNotification({
                        title: 'Error',
                        message: error?.message || 'Failed to create shop config.',
                        color: 'red',
                        icon: <IconX size={18} />,
                    });
                },
            });
        }
    };


    const handleFormClose = () => {
        setFormModal(false);
        setIsEditing(false);
        setSelectedShop(null);
    };

    return (
        <>
            <PageHeader pageTitle="Shop Configuration">
                <Button name="Create" onClick={() => { setIsEditing(false); setSelectedShop(null); setFormModal(true); }} />
            </PageHeader>
            <PaperBox>
                <Box mb={8}>
                    <Title order={4} sx={{ fontWeight: 600 }}>
                        Shop Configuration
                    </Title>
                </Box>
                <DataTable data={Array.isArray(data) ? data : []} columns={columns} total={data.length} />
            </PaperBox>

            {/* Form Modal for Create/Edit */}
            <Formik
                enableReinitialize // Reinitialize form when selectedShop changes to populate data
                initialValues={selectedShop || initialValues} // Populate with selectedShop data if editing, else use default values
                onSubmit={onSubmitShopConfig}
            >
                {({ values, errors, touched, handleChange, handleSubmit }) => (
                    <FormModal
                        opened={formModal}
                        onClose={handleFormClose}
                        title={isEditing ? 'Edit Shop Config' : 'Create Shop Config'} // Dynamic title
                        onConfirm={handleSubmit} // Use Formik's handleSubmit
                        confirmButtonText={isEditing ? 'Update' : 'Submit'} // Dynamic button text
                        loading={createMutation.isLoading || updateMutation.isLoading} // Show loading state during mutation
                    >
                        <Form>
                            <SwitchCheckbox
                                name="is_premium"
                                checked={values.is_premium}
                                labelName="Is Premium"
                                mb={15}
                                onChange={handleChange}
                            />
                            <InputField
                                name="max_shops"
                                labelName="Max Shops"
                                placeHolder="Enter max shops"
                                value={values.max_shops}
                                withAsterisk
                                onChange={handleChange}
                            />
                            <InputField
                                name="max_products"
                                labelName="Max Products"
                                placeHolder="Enter max products"
                                value={values.max_products}
                                withAsterisk
                                onChange={handleChange}
                            />
                        </Form>
                    </FormModal>
                )}
            </Formik>

            {/* Delete Confirmation Modal */}
            <Modal
                opened={deleteModal}
                onClose={() => {
                    setDeleteModal(false);
                    setShopToDelete(null);
                }}
                title="Confirm Deletion"
                size="sm"
            >
                <Box>
                    <Text>Are you sure you want to delete this shop configuration?</Text>
                    <Group position="right" mt="md">
                        <Button
                            name={'Cancel'}
                            variant="outline"
                            onClick={() => {
                                setDeleteModal(false);
                                setShopToDelete(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button name={'Delete'} color="red" onClick={handleDeleteConfirm}>

                        </Button>
                    </Group>
                </Box>
            </Modal>
        </>
    );
};

export default Shop;
