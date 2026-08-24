import {  useContext,  useEffect,  useState } from 'react';
import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDataLimit, getPageLimit, CipherUserContext, ProductFilterValuesProps, useDark } from '@cagtu-cms/util-formatter';
import {  ErrorAlert,  PageHeader, PaperBox, Button, SwitchCheckbox, InputField,  FormModal, SelectField } from '@cagtu-cms/ui-shared';
import {
    IconCheck,
    IconCircleCheck,
    IconForbid2,
    IconSelector,
    IconUserCheck,
    IconX,
} from '@tabler/icons';
import { Form, Formik, FormikHelpers } from 'formik';
import { showNotification } from '@mantine/notifications';
import { Box, CloseButton, Divider, Grid, Loader, useMantineTheme, Title, Table, Select, Text, Alert, SimpleGrid } from '@mantine/core';
// import ApproveTable from './ApproveTable';
const urlsPath = urls?.cipher?.bankaccount;    

const filterFormInitialData: ProductFilterValuesProps ={
    category: "",
    shop: "",
    is_active: ''
}
const initialFormData: any = {
    product: '',
    name:"",
    product_status: "",
    discount_per : "",
    stock_quantity: 0,
    cost_price: 0,
    shop: '',
    is_active: true,
    description: "",
    category: "",
    local_currency: ''
    };
  
  const Approve = () => {
    const [query, setQuery] = useState<string>('');
    const [checked, setChecked] = useState<string[]>([]);
    const queryClient = useQueryClient();
    const [deleteModal, setDeleteModal] = useState(false);
    const [rowId, setRowId] = useState<string>('');
    const [page, setPage] = useState(1);
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');
    const [formModal, setFormModal] = useState(false);
    const [isFiltering, setIsFiltering] = useState(false);
    const approveListAPI = new CipherAPI(urlsPath?.path);
    const { isLoading, isError, isSuccess, data, isFetching } = useQuery(
    ['product', page, limitChange, query],
    () => approveListAPI.list({ page, page_size: limitChange, name: query
    })
    );

    const onHandleSearch = (query: string) => {
        queryClient.prefetchQuery(['product', page, limitChange, query], () => approveListAPI.list({page, page_size: limitChange, name: query }));
        setQuery(query);
        setPage(1);
    };
       const [productFilterFormData, setProductFilterFormData] = useState<ProductFilterValuesProps>({
            ...filterFormInitialData,
        });
    const [showFilter, setShowFilter] = useState(false);
    const onShowFilterForm = () => setShowFilter(true);
    const onShowFilterFormClose = () => {
        setShowFilter(false);
        setProductFilterFormData({ ...filterFormInitialData });
    }
   
    const handleFormModal = () => {
        setFormModal(true);
        setRowId('');
    };

    const handleFormClose = () => {
        if (!ProductMutation.isLoading) {
            setProductFormData({
                ...initialFormData,
            });
            setRowId('');
            setFormModal(false);
        }
    };

    const ProductMutation = useMutation((data: any) => 
      approveListAPI.store(data)
      );      
     
    const pageToFecth = data?.data?.results.length <= 1 ? page - 1 : page;
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
    const onSelectAll = () => {
            const isSelectAll = isAllCheckboxSelected();
            if (isSelectAll) {
                setChecked([]);
            } else {
                const checkedRowId = data?.data?.results.map((Product: any) => String(Product.id));
                setChecked(checkedRowId);
            }
        };

    const isAllCheckboxSelected = () => {
        const checkedRowId = data?.data?.results.map((Product: any) => String(Product.id));
        const isAllSelected = checkedRowId.every((id: string) => checked.includes(String(id)));
        return isAllSelected;
    };

  
        
    const handleCloseModal = () => {
        if (!ProductMutation.isLoading) {
            setDeleteModal(false);
            setRowId('');
        }
    };
    const onFilterFormClear = async () => {
        setProductFilterFormData({ ...filterFormInitialData });
        await queryClient.prefetchQuery(['product', page, limitChange, ...[filterFormInitialData]], () => approveListAPI.list({ page: 1, page_size: '10' }));
    };

     const handleFormModalEdit = (object: any) => {
            setProductFormData(mapToViewModal(object));
            setFormModal(true);
            setRowId(object.id);
        };

    const mapToViewModal = (value: any) => {
                return {
                    id: value?.id,
                    name:value?.name,
                    product_status: value?.product_status,
                    discount_per : value?.discount_per,
                    stock_quantity: value?.stock_quantity,
                    cost_price: value?.cost_price,
                    shop: value?.shop,
                    is_active: value?.is_active,
                    description: value?.description,
                    category: value?.category,
                    local_currency: value?.local_currency    
                    };
    };

    const onCreateProduct = (data: any, actions: FormikHelpers<any>) => {
        ProductMutation.mutate(data, {
                onSuccess: (data) => {
                    if (data.data.status === 'failure') {
                        setFormModal(false);
                        setRowId('');
                        showNotification({
                            title: 'Uh oh! something went wrong',
                            message: data.data.message.title[0],
                            color: 'red',
                            icon: <IconX size={18} />,
                        });
                      } 
                    else {
                        actions.resetForm();
                        setFormModal(false);
                        setRowId('');
                        showNotification({
                            title: `Congrats! Product ${rowId ? 'Updated' : 'Created'}`,
                            message: rowId ? 'Product updated successfully.' : data.data.message ?? 'Product created successfully.',
                            color: 'green',
                            icon: <IconCheck size={18} />,
                        });
                        const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                        if (pageToSet === page) queryClient.invalidateQueries(['product', pageToSet, limitChange]);
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

        const handleSingleDelete = (id: string) => {
            setDeleteModal(true);
            setRowId(id);
        };

  
    if (isError) {
        return <ErrorAlert />;
    }

     const [productFormData, setProductFormData] = useState<any>({
            ...initialFormData,
        });
return (
    <>
    <PageHeader pageTitle="Product">
    </PageHeader>

{/*        
    <PaperBox>
                <ApproveTable
                handleFormModal={handleFormModal}
                onShowFilterForm={onShowFilterForm}
                city={city} setCity={setCity} country={country} setCountry= {setCountry} user={user} setUser={setUser}
                    data={data?.data?.results}
                    page={page} 
                    checked={checked}
                    isLoading={isLoading}
                    handleFormModalEdit={handleFormModalEdit}
                    isSuccess={isSuccess}
                    onSelectAll={onSelectAll}
                    isDeleteModalOpened={deleteModal}
                    handleSingleDelete={handleSingleDelete}
                    total={data?.data?.total_pages}
                    onSetPage={setPage}
                    onHandleSearch={onHandleSearch}
                    isAllCheckboxSelected={isAllCheckboxSelected}
                    isCheckboxSelect={isCheckboxSelect as unknown as undefined}
                    handleSelect={handleSelect as unknown as undefined}
                    handleSingleDeleteCloseModal={handleCloseModal}
                    limitChange={limitChange}
                    handleLimitChange={handleLimitChange}
                    premium= {premium}
                    setPremium= {setPremium}
                    active={active}
                    setActive={setActive}
                    isFetching={isFetching}
                    query={query}
                />
            </PaperBox>

    */}
 
    </>
);
};
export default Approve;
