import { useEffect,  useState } from 'react';
import { CipherAPI, urls, http } from '@cagtu-cms/data-access';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDataLimit, getPageLimit, ProductFilterValuesProps, useDark } from '@cagtu-cms/util-formatter';
import {  ErrorAlert,  PageHeader, PaperBox, SwitchCheckbox, InputField,  FormModal, SelectField } from '@cagtu-cms/ui-shared';
import {
    IconCheck,
    IconCircleCheck,
    IconSelector,
    IconUserCheck,
    IconX,
} from '@tabler/icons';
import { FileUploader } from "react-drag-drop-files";
import { Form, Formik, FormikHelpers } from 'formik';
import { showNotification } from '@mantine/notifications';
import { Box, CloseButton, Divider, Grid, useMantineTheme, Title, Select, SimpleGrid, Button } from '@mantine/core';
import {
  Text,
  Loader,
  Notification,
  Stack,
  Center,
  Paper,
  Modal, FileInput
} from "@mantine/core";
import { ProductsResults } from '@cagtu-cms/util-formatter';
import Producttable from './Producttable';
import { values } from 'lodash';
const urlsPath = urls?.cipher?.product;
const urlsPaths = urls?.cipher?.merchant
    const urlssPath = urls?.cipher?.productUpload;

const filterFormInitialData: ProductFilterValuesProps ={
    category:"",
    shop: "",
    is_active: '',
}

const initialFormData: ProductsResults = {
    id:"",
    user: '',
    name:"",
    product_status: "",
    discount_per : "",
    stock_quantity: 0,
    cost_price: 0,
    shop: '',
    shop_id:"",
    SKU: "",
    is_active: true,
    description: "",
    category: '',
local_currency_details:{
    code:"",
    name:""
},
category_details	: {
  id: "",
  name:""
},
    local_currency: '',
    price:0,
    images: null,

    };

  const Product = () => {
    const [query, setQuery] = useState<string>('');
    const [checked, setChecked] = useState<string[]>([]);
    const queryClient = useQueryClient();
    const [deleteModal, setDeleteModal] = useState(false);
    const [rowId, setRowId] = useState<string>('');
    const [page, setPage] = useState(1);
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');
    const [formModal, setFormModal] = useState<boolean>(false);
    const [isFiltering, setIsFiltering] = useState(false);
    const productListAPI = new CipherAPI(urlsPath?.path);
    const productSearchAPI = new CipherAPI(urlsPath?.search)
    const productFilterAPI = new CipherAPI(urlsPath?.productsearch)
    const productPutAPI = new CipherAPI(urlsPath?.put)
    const metadataAPI = new CipherAPI(urlsPaths?.metadata)
    const [categoryOptions, setCategoryOptions] = useState<{ value: string; label: string; }[]>([]);
    const [currencyOptionss, setCurrencyOptionss] = useState<{ value: string; label: string; }[]>([]);
    const [productstatusOptionss, setProductstatusOptionss] = useState<{ value: string; label: string; }[]>([]);
    const [shopOptions, setShopOptions] = useState<{ value: string; label: string; }[]>([]);
    const [userOptionss, setUserOptionss] = useState<{ value: string; label: string; }[]>([]);
      const [sku, setSku] = useState('');
      // states for edit values

const [editID,setEditId ] = useState<string>("")
  const [productFormData, setProductFormData] = useState<ProductsResults>({
            ...initialFormData,
        });

    //Bulk product upload
      const [bulkModal, setBulkModal] = useState(false); // Added for bulk creation
  const productUploadPostAPI = new CipherAPI(urlssPath?.path);
  const productUploadGetAPI = new CipherAPI(urlssPath?.get);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean | null>(null);
  const fileTypes: string[] = ["XLSX", "XLS", "CSV"];

  const { data: fileData, isLoading: fileLoading } = useQuery(
    ["filedata"],
    () => productUploadGetAPI.list({})
  );
  const handleChange = (selectedFile: File) => {
         setFile(selectedFile);
        setSuccess(null);
  };

  const importProductSampleFile = async () => {
    await http
        .get(urlssPath?.get, {
            responseType: 'blob',
        })
        .then((res: any) => {
            const file = new File([res.data], `product_sample_upload_${new Date().toLocaleDateString()}.xlsx`);
            const url = window.URL.createObjectURL(file);
            const a = document.createElement('a');
            a.href = url;
            a.download = `product_sample_upload_${new Date().toLocaleDateString()}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        });
};
  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setSuccess(null);

    try {
      const form = new FormData();
      form.set("products", file);

      await productUploadPostAPI.store(form, rowId, null, {
        "content-type": "multipart/form-data",
      });
      setSuccess(true);
      setFile(null);
    } catch (error) {
      console.error("Upload failed:", error);
      setSuccess(false);
    } finally {
      setUploading(false);
    }
  };

    const [editSKU, setEditSku] = useState<string>("")
    const [dark] = useDark();
    const theme = useMantineTheme();

    const { isLoading, isError, isSuccess, data, isFetching } = useQuery(
    ['product', page, limitChange, query],
    () => productListAPI.list({ page, page_size: limitChange, name: query,
    })
    );

    const { data :metadata } = useQuery(
        ['metadata'],
        () => metadataAPI.list({
        })
        );

    const categories = metadata?.data?.shop_product_category
    const currencies = metadata?.data?.local_currency
    const shop = metadata?.data?.shop
    const products = metadata?.data?.products
    const users = metadata?.data?.users
    const [isFiltered, setIsFiltered] = useState(false);
    const [searchfilteredData, setsearchFilteredData] = useState<any[]>([]);
    const [filteredData, setFilteredData] = useState<any[]>([]);

    useEffect(()=>{
        if (categories && categories.length > 0) {
            const categoryOptions = categories.map((category:any) => ({
                value: category.id,
                label: category.name,
            }));
            setCategoryOptions(categoryOptions);
            }
            if (users && users.length > 0) {
                const userOptions = users.map((u:any) => ({
                    value: u.id,
                    label: u.full_name,
                }));
                setUserOptionss(userOptions);
                }
            if (shop && shop.length > 0) {
                const shopOptions = shop.map((shop:any) => ({
                    value: shop.id,
                    label: shop.name,
                }));
                setShopOptions(shopOptions);
                console.log("shopoprions", shopOptions)
                }
                if (products && products.length > 0) {
                    const productStatusOptions = products.map((p:any) => ({
                        value: p.product_status,
                        label: p.product_status
                    }));
                    setProductstatusOptionss(productStatusOptions);
                    }
            if (currencies && currencies.length > 0) {
                const currencyOptions = currencies.map((c:any) => ({
                    value: c.code,
                    label: c.name,
                }));
                setCurrencyOptionss(currencyOptions);
                }
    },[categories, currencies, products, shop, users])

    const onHandleSearch = async (query: string) => {
        setQuery(query);
        setPage(1);

        if (query) {
            const result = await queryClient.fetchQuery(
                ['product', page, limitChange, query],
                () => productSearchAPI.list({ page, page_size: limitChange, name: query })
            );
            setsearchFilteredData(result?.data?.results || [data?.data?.results]);
        } else {
            setsearchFilteredData([data?.data?.results]);
        }
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
    const productDeleteMutation = useMutation((product: string) => productListAPI.delete(product), {
        onSuccess: (data) => {
            if (data.data?.status === 'failure') {
                setDeleteModal(false);
                setRowId('');
                showNotification({
                    title: 'Uh oh! something went wrong',
                    message: data.data?.message,
                    color: 'red',
                    icon: <IconX size={18} />,
                });
            } else {
                setDeleteModal(false);
                setRowId('');
                showNotification({
                    title: 'Congrats!',
                    message: data.data?.message ?? 'Merchant deleted succefully.',
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                if (pageToSet === page) queryClient.invalidateQueries(['merchant', pageToSet, limitChange]);
                else setPage(pageToSet);
            }
        },
        onError: (error: any) => {
            const {
                data: { message },
            } = error.response;
            setDeleteModal(false);
            setRowId('');
            showNotification({
                title: 'Uh oh! something went wrong',
                message: message ?? 'Sorry! There was a problem with your request.',
                color: 'red',
                icon: <IconX size={18} />,
            });
        },
    });


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

   const ProductMutation = useMutation((data: any) => {
  if (rowId) {
    return productPutAPI.storeOne(data, rowId);
  } else {
    const form = new FormData();
      Object.keys(data).map((key:string )=> {
       // @ts-ignore
      form.set(key, data[key] ?? null);
    });
    return productListAPI.store(form, rowId, null, {
      'content-type': 'multipart/form-data',
    });
  }
});

    const pageToFecth = data?.data?.results.length <= 1 ? page - 1 : page;
    const isCheckboxSelect = (id: string) => checked.includes(String(id));
    const handleSelect = (id: string) => {
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
                const checkedRowId = data?.data?.results.map((Product: ProductsResults) => String(Product.id));
                setChecked(checkedRowId);
            }
        };

    const isAllCheckboxSelected = () => {
        const checkedRowId = data?.data?.results.map((Product: ProductsResults) => String(Product.id));
        const isAllSelected = checkedRowId.every((id: string) => checked.includes(String(id)));
        return isAllSelected;
    };

    const handleCloseModal = () => {
        if (!productDeleteMutation.isLoading) {
            setDeleteModal(false);
            setRowId('');
        }
    };
      const generateSKU = () => {
    const randomPart = Array.from({ length: 20 }, () =>
      Math.random().toString(36).charAt(2)
    ).join('');
    return `SJK${randomPart.toUpperCase()}`;
  };
  useEffect(() => {
    if (formModal && !rowId) {
      const newSku = generateSKU();
      setSku(newSku);
    }
  }, [formModal]);
    const onFilterFormClear = async () => {
        setProductFilterFormData({ ...filterFormInitialData });
        setIsFiltered(false);
        await queryClient.prefetchQuery(['product', page, limitChange, ...[filterFormInitialData]], () => productListAPI.list({ page: 1, page_size: '10' }));
    };

     const handleFormModalEdit = (object: ProductsResults) => {
            setProductFormData(mapToViewModal(object));
            setFormModal(true);
            setRowId(object?.id);
        };

    const mapToViewModal = (value: ProductsResults) => {
              setEditSku(value?.SKU)
              setEditId(value?.id)
              console.log("values", value)
              console.log("shop", value?.shop_id)
                return {
                    id:value?.id,
                    user:value?.user,
                    name:value?.name,
                    SKU: value?.SKU,
                    product_status: value?.product_status,
                    discount_per : value?.discount_per,
                    stock_quantity: value?.stock_quantity,
                    cost_price: value?.cost_price,
                    shop:value?.shop,
                    shop_id: value?.shop_id,
                    price:value?.price,
                    is_active: value?.is_active,
                    description: value?.description,
                    category: value?.category,
                   local_currency_details:{
                      code:value?.local_currency_details?.code,
                      name:value?.local_currency_details?.name
                  },
                  category_details	: {
  id: value?.category_details?.id,
  name: value?.category_details?.name
},
                    local_currency: value?.local_currency,
                    images: value?.images
                    };
    };

    const onCreateProduct = (data: any, actions: FormikHelpers<ProductsResults>) => {
        !rowId ? (data.SKU = sku) : (data.SKU = editSKU) // send the data in payload
        rowId && (data.id = editID)
        console.log("shop id", data.shop_id)
        console.log("shop ", data.shop)

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


return (
    <>
    <PageHeader pageTitle="Product">
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
                                    initialValues={productFilterFormData}
                                    onSubmit={async (values) => {
                                        const dataToSend = {
                                            ...JSON.parse(JSON.stringify(values))
                                        };
                                        setIsFiltering(true);
                                        setProductFilterFormData({ ...dataToSend });
                                        setPage(1);
                                        setIsFiltered(true);
                                        const filteredResponse = await queryClient.fetchQuery(['shop', page, limitChange, dataToSend], () =>
                                            productFilterAPI.list({ ...dataToSend, page: 1, page_size: limitChange })
                                          );
                                          setFilteredData(filteredResponse?.data?.results ||data?.data?.results);
                                        if (isSuccess) setIsFiltering(false);
                                    }}>
                                    {({ handleReset, setFieldValue, dirty }) => (
                                        <Form>
                                            <Grid mb={10}>
                                                <Grid.Col md={2}>
                                                    <SelectField
                                                        name="Product Category"
                                                        placeHolder="Select Product Category"
                                                        options={categoryOptions}
                                                        handleChange={(value) => {
                                                            setFieldValue('category', value);
                                                        }}
                                                        icon={<IconUserCheck size={18} stroke={1.75} />}
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
                                                        name="shop"
                                                        placeHolder="Select Shop Name"
                                                        options={shopOptions}
                                                        handleChange={(value) => {
                                                            setFieldValue('shop', value);
                                                        }}
                                                        icon={<IconSelector size={18} stroke={1.75} />}
                                                        clearable
                                                        style={{ marginBottom: 0 }}
                                                    />
                                                </Grid.Col>
                                                <Grid.Col md={2}>

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
                <Producttable
                handleFormModal={handleFormModal}
                onShowFilterForm={onShowFilterForm}
                data={
                    query
                      ? searchfilteredData
                      : isFiltered
                      ? filteredData
                      : data?.data?.results
                  }
                    page={page}
                    checked={checked}
                    isLoading={isLoading}
                    handleFormModalEdit={handleFormModalEdit}
                    isSuccess={isSuccess}
                    onSelectAll={onSelectAll}
                    isDeleteModalOpened={deleteModal}
                    isSingleDeleteMutationLoading={productDeleteMutation.isLoading}
                    onConfirmSingleDelete={() => productDeleteMutation.mutate(String(rowId))}
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
                    bulkModal={bulkModal}
                    setBulkModal={setBulkModal}
                />
            </PaperBox>

                    <Formik
                        enableReinitialize
                        initialValues={productFormData}
                        onSubmit={(values, actions) => {
                            onCreateProduct(values, actions);
                        }}
                        >
                        {({ handleSubmit, handleReset, values, setFieldValue }) => (
                            <FormModal
                            opened={formModal}
                            onClose={() => {
                                if (!ProductMutation.isLoading) {
                                handleReset();
                                }
                                handleFormClose();
                            }}
                            title={`${rowId ? 'Edit Product' : 'Add Product'}`}
                            size="xl"
                            onConfirm={handleSubmit}
                            confirmButtonText={`${rowId ? 'Save' : 'Add'}`}
                            loading={ProductMutation.isLoading}
                         >
                            <Form>
                                <Box>
                                <Title order={5} mb="sm">Basic Information</Title>
                                <InputField name="name" labelName="Product Name" placeHolder="Enter Product name" withAsterisk />
                                <InputField name="description" labelName="Description" placeHolder="Enter Description" withAsterisk />
                                  {!rowId && (
                                                       <FileInput name='images' mb={22}  placeholder="Upload your Product Image" label="Upload your Product Image"  onChange={(file: File) => {
                                                        setFieldValue("images", file);
                                                        }} clearable withAsterisk  />
                                                    )

                                                    }
                                <SimpleGrid cols={2}>
                                  <InputField name="cost_price" labelName="Cost Price" placeHolder="Enter Cost Price of Product" withAsterisk />
                                  <InputField name="price" labelName="Price" placeHolder="Enter Price of Product" withAsterisk />
                                </SimpleGrid>

                                <SimpleGrid cols={3}>
                                <Select value={values.product_status} // Bind to form value
                                    name="product_status"
                                    placeholder="Product Status" label="Product Status" onChange={(val: any) => setFieldValue('product_status', val)}
                                     data={productstatusOptionss} withAsterisk mb={9}
                                    />


                                      <Select
                                    name="user" label="Product User" value={values.user } // Bind to form value
                                    placeholder="Select Product User" onChange={(val: any) => setFieldValue('user', val)}
                                     data={userOptionss} disabled={!!rowId} withAsterisk
                                    />
                                  {
                                    !rowId && (
 <Select mb={10}
                                                        name="local_currency"
                                                        placeholder="Select Local Currency"
                                                        data={currencyOptionss}
                                                        onChange={(value) => {
                                                            setFieldValue('local_currency', value);
                                                        }}
                                                        value={ rowId ? values.local_currency_details.code : values.local_currency} // Bind to form value
                                                        label="Local Currency"
                                                        icon={<IconUserCheck size={18} stroke={1.75} />}
                                                        clearable
                                                        style={{ marginBottom: 0 }}

                                                    />
                                    )
                                  }
                                     {!rowId && (
 <Select
                                                        name="shop"
                                                        placeholder="Select shop"
                                                        label="Shop"
                                                        data={shopOptions}
                                                        onChange={(value) => {
                                                            setFieldValue('shop', value);
                                                        }}
                                                          disabled={!!rowId} // Disable if rowId exists
                                                        icon={<IconCircleCheck size={18} stroke={1.75} />}
                                                        clearable
                                                        withAsterisk
                                                    />
                                     )}

                                                               {!!rowId && (
 <Select
                                                        name="shop_id"
                                                        placeholder="Select shop"
                                                        label="Shop"
                                                        data={shopOptions}
                                                        onChange={(value) => {
                                                            setFieldValue('shop_id', value);
                                                        }}
                                                          disabled={!!rowId} // Disable if rowId exists
                                                        value={ values.shop_id} // Bind to form value
                                                        icon={<IconCircleCheck size={18} stroke={1.75} />}
                                                        clearable
                                                        withAsterisk
                                                    />
                                     )}

                                  <Select
                                                        name="category"
                                                        placeholder="Select product category "
                                                        data={categoryOptions}
                                                        label="Product Category "
                                                        onChange={(value) => {
                                                            setFieldValue('category', value);
                                                        }}
                                                        value={rowId ? values.category_details.id : values.category}   disabled={!!rowId} // Disable if rowId exists
// Bind to form value
                                                        icon={<IconCircleCheck size={18} stroke={1.75} />}
                                                        clearable withAsterisk
                                                        style={{ marginBottom: 12 }}
                                                    />


                                </SimpleGrid>
                               <SimpleGrid cols={3}>
                                  <InputField name='SKU' labelName="SKU for product" placeHolder='Product SKU' value={!rowId ? sku : editSKU} disabled  />
                                  <InputField name="stock_quantity" labelName="Enter Stock Quantity" placeHolder="Enter Stock Quantiity" withAsterisk />
                                  <InputField name="discount_per" labelName="Enter Discount Percent Quantity" placeHolder="Enter  Discount Percent" withAsterisk />
                               </SimpleGrid>


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
<Modal
  opened={bulkModal}
  onClose={() => setBulkModal(false)}
  title="Bulk Product Creation"
  size="md"
>
  <Formik
    initialValues={{ file: null }}
    onSubmit={(values) => {
      console.log('Formik submit - Values:', values); // Debug
    }}
  >
    {({ setFieldValue, handleSubmit }) => (
      <Form>
        <Box>
          <Text size="sm" className="text-gray-600 dark:text-gray-400">
            Sample file to ensure your file matches the required format:
          </Text>

          <Button
            color="blue"
            size="xs"
            my={6}
            onClick={() => {
              importProductSampleFile();
            }}
            disabled={fileLoading || !fileData}
          >
            {fileLoading ? <Loader size="xs" /> : "Download Sample File"}
          </Button>

          <Paper shadow="xs" p="xl">
            <FileUploader
              handleChange={()=>handleChange}
              name="file"
              types={fileTypes}
              maxSize={100}
            >
              <Center
                style={{
                  border: "2px dashed var(--mantine-color-gray-4)",
                  borderRadius: 8,
                  padding: 40,
                  backgroundColor: "var(--mantine-color-gray-0)",
                  cursor: "pointer",
                }}
              >
                <Stack align="left" spacing="xs">
                  <Text color="dimmed" size="sm">
                    Drag and drop your Excel or CSV file here
                  </Text>
                  <Text size="xs" color="gray">
                    or click to upload
                  </Text>
                </Stack>
              </Center>
            </FileUploader>

            {file && (
              <Stack spacing="xs" mt="md">
                <Text size="sm">Selected File: {file.name}</Text>
                <Button
                  onClick={handleUpload}
                  color="blue"
                  size="xs"
                  disabled={uploading}
                >
                  {uploading ? <Loader size="xs" color="white" /> : "Upload"}
                </Button>
              </Stack>
            )}
          </Paper>

          {success === true && (
            <Notification color="green" title="Success" onClose={() => setSuccess(null)}>
              Products Uploaded successfully!
            </Notification>
          )}

          {success === false && (
            <Notification color="red" title="Error" onClose={() => setSuccess(null)}>
              Failed to upload the file. Please try again.
            </Notification>
          )}
        </Box>
      </Form>
    )}
  </Formik>
</Modal>

    </>
);
};
export default Product;
