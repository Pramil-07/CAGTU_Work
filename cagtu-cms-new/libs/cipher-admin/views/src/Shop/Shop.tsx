import { useState, useEffect } from 'react';
import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDataLimit, getPageLimit, ShopResult, useDark } from '@cagtu-cms/util-formatter';
import {  ErrorAlert,  PageHeader, PaperBox, Button, SwitchCheckbox, InputField,  FormModal, SelectField } from '@cagtu-cms/ui-shared';
import { Select, SimpleGrid } from '@mantine/core';
import {
    IconCheck,
    IconCircleCheck,
    IconForbid2,
    IconSelector,
    IconX,
} from '@tabler/icons';
import { Form, Formik, FormikHelpers } from 'formik';
import { showNotification } from '@mantine/notifications';
import { Box, CloseButton, Divider, Grid, useMantineTheme, Title, FileInput } from '@mantine/core';
import Shoptable from './Shoptable';
import { ShopFilterFormValuesProps } from '@cagtu-cms/util-formatter';

const urlsPath = urls?.cipher?.shop;    
const urlsPaths = urls?.cipher?.merchant
const filterFormInitialData: ShopFilterFormValuesProps = {
    is_active:'',
    category: "",
    status: "",
    name: ""
};
const initialFormData: ShopResult = {
    id:'',
    name:"",
    is_active:false,
    category: "",
    location:"",
    about: '',
    status: "",
    images: null,
    owner:""
  }

const Shop = () => {
    const [query, setQuery] = useState<string>('');
    const [checked, setChecked] = useState<string[]>([]);
    const queryClient = useQueryClient();
    const [deleteModal, setDeleteModal] = useState(false);
    const [rowId, setRowId] = useState<string>('');
    const [page, setPage] = useState(1);
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');
    const [formModal, setFormModal] = useState(false);
    const shopListAPI = new CipherAPI(urlsPath?.path);
    const shopPost = new CipherAPI(urlsPath?.post)
    const metadataAPI = new CipherAPI(urlsPaths?.metadata)
    const [isFiltering, setIsFiltering] = useState(false);
    const [shopFormData, setShopFormData] = useState<ShopResult>({
      ...initialFormData,
    });
    const [isFiltered, setIsFiltered] = useState(false);
    const [filteredData, setFilteredData] = useState<any[]>([]);

    const [categoryOptions, setCategoryOptions] = useState<{ value: string; label: string; }[]>([]);
    const [productstatusOptionss, setProductstatusOptionss] = useState<{ value: string; label: string; }[]>([]);
    const [ownerNameOptionss, setOwnerNameOptionss] = useState<{ value: string; label: string; }[]>([]);
    // const [category, setCategory] = useState<string>('')
    // const [status, setStatus] = useState<string>("")
    const [dark] = useDark();
    const theme = useMantineTheme();
    const { data :metadata } = useQuery(
      ['metadata'],
      () => metadataAPI.list({ 
      })
      );
      console.log("category shop",shopFormData.category)
    const categories = metadata?.data?.shop_product_category 
    const products = metadata?.data?.shop_status_choices
    const owner = metadata?.data?.shop_product_owner
    const [submittedData, setSubmittedData] = useState<string>("");

    console.log("submitted data", submittedData)
     useEffect(()=>{
            if (categories && categories.length > 0) {
                const categoryOptions = categories.map((category:any) => ({
                    value: category.id,
                    label: category.name,
                }));
                console.log("ategory optiosn", categoryOptions)
                setCategoryOptions(categoryOptions);
                }
                if (products && products.length > 0) {
                  const productStatusOptions = products.map((p:any) => ({
                      value: p.value,
                      label: p.label
                  }));
                  setProductstatusOptionss(productStatusOptions);
                  }
                  if (owner && owner.length > 0) {
                    const ownerNameOptions = owner.map((p:any) => ({
                        value: p.id,
                        label: p.full_name
                    }));
                    setOwnerNameOptionss(ownerNameOptions);
                    }
                 

        
        },[categories, products, owner])
    
    const { isLoading, isError, isSuccess, data, isFetching } = useQuery(
      ['shop', page, limitChange, query],
      () => shopListAPI.list({ page, page_size: limitChange, full_name: query })
    );

    const onHandleSearch = (query: string) => {
      queryClient.prefetchQuery(['shop', page, limitChange, query], () =>
        shopListAPI.list({ page, page_size: limitChange, name: query })
      );
      setQuery(query);
      setPage(1);
    };
  
    const handleFormModal = () => {
      setFormModal(true);
      setRowId('');
    };
    const ShopMutation = useMutation((data: ShopResult) => {
    //     if (!data.name || data.name.trim() === "" || !data.category || !data.images || !data.location ) {
    //   showNotification({
    //     title: 'Error',
    //     message: 'Please fill all the required fields',
    //     color: 'red',
    //     icon: <IconX size={18} />,
    //   });
    //   throw new Error("Validation failed"); 
    // }
      const form  = new FormData();
      Object.keys(data).map((key:string )=> {    
          // @ts-ignore
          form.set(key, data[key] ?? null)
      })
      return shopPost.store(form, rowId, null,{
          'content-type' : 'multipart/form-data'
      })
      
    },
      {
    onError: (error) => {
      console.error("Mutation error:", error);
    }
  }
  )
  
    const handleFormClose = () => {
      if (!ShopMutation.isLoading) {
        setShopFormData({ ...initialFormData });
        setRowId('');
        setFormModal(false);
      }
    };
    const handleSingleDelete = (id: string) => {
        setDeleteModal(true);
        setRowId(id);
    };
    const [showFilter, setShowFilter] = useState(false);
    const [shopFilterFormData, setShopFilterFormData] = useState<ShopFilterFormValuesProps>({
        ...filterFormInitialData,
    });

    const onShowFilterForm = () => setShowFilter(true);
    const onShowFilterFormClose = () => {
        setShowFilter(false);
        setShopFilterFormData({ ...filterFormInitialData });
    }
  
    const pageToFecth = data?.data?.results.length <= 1 ? page - 1 : page;
  
    const isCheckboxSelect = (id: number) => checked.includes(String(id));
  
    const handleSelect = (id: number) => {
      const isChecked = isCheckboxSelect(id);
      if (isChecked) {
        setChecked(checked.filter((val) => val !== String(id)));
      } else {
        setChecked((prev) => [...prev, String(id)]);
      }
    };
  
    const onSelectAll = () => {
      const isSelectAll = isAllCheckboxSelected();
      if (isSelectAll) {
        setChecked([]);
      } else {
        const checkedRowId = data?.data?.results.map((Shop: ShopResult) => String(Shop.id));
        setChecked(checkedRowId);
      }
    };

    const isAllCheckboxSelected = () => {
      const checkedRowId = data?.data?.results.map((Shop: ShopResult) => String(Shop.id));
      return checkedRowId.every((id:any) => checked.includes(id));
    };
  
    const handleCloseModal = () => {
      if (!ShopMutation.isLoading) {
        setDeleteModal(false);
        setRowId('');
      }
    };
  
    const handleFormModalEdit = (object: ShopResult) => {
      setShopFormData(mapToViewModal(object));
      setFormModal(true);
      setRowId(object?.id);
    };

    const mapToViewModal = (value: ShopResult) => {
      
      
const categoryValue = categoryOptions.find(cat => cat.value === String(value.category))?.value || value.category;
const statusValue = productstatusOptionss.find(status => status.value === String(value.status))?.value || '';
const ownerValue = ownerNameOptionss.find(owner => owner.value === String(value.owner))?.value || '';

console.log("values", value)
      return {
        id: value?.id,
        is_active: value?.is_active,
        name: value?.name,
        category: categoryValue,
        location: value?.location,
        status: statusValue,
        about : value?.about,
        images: value?.images,
        owner:ownerValue
      };
    };

    const onFilterFormClear = async () => {
      setShopFilterFormData({ ...filterFormInitialData });
      setIsFiltered(false); 
      await queryClient.prefetchQuery(['shop', page, limitChange, ...[filterFormInitialData]], () =>
          shopListAPI.list({ page: 1, page_size: '10' })
      );
  };
  
    const onCreateShop = (data: any, actions: FormikHelpers<ShopResult>) => {
      ShopMutation.mutate(data, {
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
          } else {
            actions.resetForm();
            setFormModal(false);
            setRowId('');
            setSubmittedData(data?.data?.category); 
            showNotification({
              title: `Congrats! Shop ${rowId ? 'Updated' : 'Created'}`,
              message: rowId ? 'Shop updated successfully.' : data.data.message ?? 'Shop created successfully.',
              color: 'green',
              icon: <IconCheck size={18} />,
            });
  
            const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
            if (pageToSet === page) {
              queryClient.invalidateQueries(['shop', pageToSet, limitChange]);
            } else {
              setPage(pageToSet);
            }
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
  
    if (isError) {
      return <ErrorAlert />;
    }
  
    return (
      <>
        <PageHeader pageTitle="Shop">
        </PageHeader>
        {showFilter && (
                    <>
                        <Box sx={{
                                background: dark ? theme.colors.dark['4'] : theme.colors.gray['0'],
                                borderRadius: theme.radius.sm,
                                position: 'relative',
                            }}>
                            <CloseButton
                                radius="xl"
                                color="dark"
                                variant="light"
                                size="sm"
                                sx={{ position: 'absolute', top: -8, right: -8 }}
                                onClick={onShowFilterFormClose}
                            />
                            <Formik
                                initialValues={shopFilterFormData}
                                onSubmit={async (values) => {
                                    const dataToSend = {
                                        ...JSON.parse(JSON.stringify(values))
                                    };
                                    setIsFiltering(true);
                                    setShopFilterFormData({ ...dataToSend });
                                    setPage(1);
                                    setIsFiltered(true); 
                                    const filteredResponse = await queryClient.fetchQuery(['shop', page, limitChange, dataToSend], () =>
                                      shopListAPI.list({ ...dataToSend, page: 1, page_size: limitChange })
                                    );
                                    setFilteredData(filteredResponse?.data?.results || data?.data?.results); 
                                    if (isSuccess) setIsFiltering(false);
                                }}>
                                {({ handleReset, setFieldValue, dirty }) => (
                                    <Form>
                                        <Grid mb={10}>
                                        
                                            <Grid.Col md={2}>
                                                <SelectField
                                                    name="category"
                                                    placeHolder="Select Category"
                                                    options={categoryOptions}
                                                    handleChange={(value) => {
                                                        setFieldValue('category', value);
                                                    }}
                                                    icon={<IconForbid2 size={18} stroke={1.75} />}
                                                    clearable
                                                    style={{ marginBottom: 0 }}
                                                />
                                            </Grid.Col>
                                           
                                            <Grid.Col md={2}>
                                                <SelectField
                                                    name="is_active"
                                                    placeHolder="Select active"
                                                    options={[
                                                        { value: 'true', label: 'Active' },
                                                        { value: 'false', label: 'Inactive' },
                                                    ]}
                                                    handleChange={(value) => {
                                                        setFieldValue('is_active', value);
                                                    }}
                                                    icon={<IconCircleCheck size={18} stroke={1.75} />}
                                                    clearable
                                                    style={{ marginBottom: 0 }}
                                                />
                                            </Grid.Col>
                                            <Grid.Col md={2}>
                                                <SelectField
                                                    name="status"
                                                    placeHolder="Status"
                                                    options={productstatusOptionss}
                                                    handleChange={(value) => {
                                                        setFieldValue('status', value);
                                                    }}
                                                    icon={<IconSelector size={18} stroke={1.75} />}
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

        <PaperBox>
          <Shoptable
            data={isFiltered ? filteredData : data?.data?.results}
            page={page}
            onShowFilterForm={onShowFilterForm}
            checked={checked}
            isLoading={isLoading}
            handleFormModalEdit={handleFormModalEdit}
            handleFormModal={handleFormModal}
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
            isFetching={isFetching}
            query={query}
          />
        </PaperBox>

        <Formik
            enableReinitialize
            initialValues={shopFormData}
            onSubmit={(values, actions) => {
                onCreateShop(values, actions);
            }}
            >
            {({ handleSubmit, handleReset, values, setFieldValue }) => (
                <FormModal
                opened={formModal}
                onClose={() => {
                    if (!ShopMutation.isLoading) {
                    handleReset();
                    }
                    handleFormClose();
                }}
                title={`${rowId ? 'Edit Shop' : 'Add Shop'}`}
                size="xl"
                onConfirm={handleSubmit}
                confirmButtonText={`${rowId ? 'Save' : 'Add'}`}
                loading={ShopMutation.isLoading}
             >
                <Form>
            {/* Main Data */}
                    <Box>
                    <Title order={5} mb="sm">Basic Information</Title>

                          
                    <InputField name="name" labelName="Shop Name" placeHolder="Enter Shop name" withAsterisk />
                    {!rowId && (
                       <FileInput name='images' mb={22}  placeholder="Upload your Profile Image" label="Upload your Profile Image"  onChange={(file) => {
                        setFieldValue("images", file);
                        }} clearable withAsterisk  />
                    )

                    }
                    <SimpleGrid cols={3} mb={8} >
                  <Select
                  name="category"
                  value={values.category}
                  mb={10}
                  placeholder="Category Name"
                  onChange={(val: any) => setFieldValue('category', val)}
                  data={categoryOptions}

                  withAsterisk
                />
                    <Select
                        name="status" mb={10} 
                        placeholder="Status" onChange={(val: any) => setFieldValue('status', val)}
                        value={values.status}
                         data={productstatusOptionss} withAsterisk 
                        />
  <Select
                        name="owner" mb={10} value={values.owner}
                        placeholder="Owner Name" onChange={(val: any) => setFieldValue('owner', val)}
                         data={ownerNameOptionss} withAsterisk 
                        />
                        
                        
                   
                        
                    </SimpleGrid>
                   
                    <InputField name="location" labelName="Location" placeHolder="Enter Shop's Location"  />
                    <InputField name="about" labelName="Description" placeHolder="Enter Shop's Description"  />

                    <SwitchCheckbox
                    name="is_active"
                    checked={values.is_active}
                    labelName="Is Active?"
                    onChange={(e) => setFieldValue('is_active', e.currentTarget.checked)}
                    mb={15}
                />
                </Box>
                </Form>
    </FormModal>
  )}
</Formik>
      </>
    );
  };
  
  export default Shop;
  