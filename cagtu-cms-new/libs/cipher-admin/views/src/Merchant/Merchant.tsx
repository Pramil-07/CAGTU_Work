import { useContext, useState, useEffect } from 'react';
import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDataLimit, getPageLimit, MerchantResult, CipherUserContext } from '@cagtu-cms/util-formatter';
import { ErrorAlert, PageHeader, PaperBox, Button, SwitchCheckbox, InputField, FormModal, SelectField } from '@cagtu-cms/ui-shared';
import { IconCheck, IconX } from '@tabler/icons';
import { Form, Formik, FormikHelpers } from 'formik';
import { showNotification } from '@mantine/notifications';
import MerchantTable from './MerchantTable';
import { Box, Title, FileInput, SimpleGrid, Modal, Anchor } from '@mantine/core';
import axios from 'axios';



const urlsPath = urls?.cipher?.merchant;


const initialFormData: MerchantResult = {
  id: '',
  owner: '',
  user: '',
  full_name: '',
  active_hour_start: '',
  active_hour_end: '',
  category: 0,
  logo: null,
  default_currency: '',
  city: '',
  country: '',
  address_line1: '',
  address_line2: '',
  commission: '',
  is_premium: false,
  extra_data: {
    businessName: '',
    legalStructure: '',
    industryType: '',
    taxId: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    bankName: '',
    accountNumber: '',
    paypalEmail: '',
    businessDescription: '',
    businessRegistration: null,
    taxDocuments: null,
    governmentId: null,
  },
};

const Merchant = () => {
  const [query, setQuery] = useState<string>('');
  const [premium, setPremium] = useState<string>('title');
  const [city, setCity] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [active, setActive] = useState<string>('title');
  const [user, setUser] = useState<string>('');
  const [checked, setChecked] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const [deleteModal, setDeleteModal] = useState(false);
  const [rowId, setRowId] = useState<string>('');
  const [page, setPage] = useState(1);
  const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');
  const { user_permissions, is_superuser } = useContext(CipherUserContext);
  const [formModal, setFormModal] = useState(false);
  const [bulkModal, setBulkModal] = useState(false); // Added for bulk creation
  const[download,setDownload]= useState(false)


  const merchantAPI = new CipherAPI(urlsPath?.path);
  const postMerchant = new CipherAPI(urlsPath?.post);
  const bulkMerchantAPI = new CipherAPI('/cms-bulk-upload-merchant/');
  const downloadSampleFile= new CipherAPI('/merchant-bulk-excel/')
  const metadataAPI = new CipherAPI(urlsPath?.metadata);

  const { isLoading, isError, isSuccess, data, isFetching } = useQuery(
    ['merchant', page, limitChange, query, premium, active, city, user, country],
    () => merchantAPI.list({ page, page_size: limitChange, full_name: query, is_premium: premium, is_active: active, city: city, user: user, country: country })
  );

  const { data: metadata } = useQuery(['metadata'], () => metadataAPI.list({}));

  const [categoryOptions, setCategoryOptions] = useState<{ value: string; label: string }[]>([]);
  const [cityOptionss, setCityOptionss] = useState<{ value: string; label: string }[]>([]);
  const [countryOptionss, setCountryOptionss] = useState<{ value: string; label: string }[]>([]);
  const [ownerOptionss, setOwnerOptionss] = useState<{ value: string; label: string }[]>([]);
  const [currencyOptionss, setCurrencyOptionss] = useState<{ value: string; label: string }[]>([]);

  const categories = metadata?.data?.categories;
  const cities = metadata?.data?.cities;
  const countries = metadata?.data?.countries;
  const owners = metadata?.data?.users_with_profile_and_no_merchant;
  const currencies = metadata?.data?.local_currency;

        // const pageToFecth = data?.data?.result.length <= 1 ? page - 1 : page;


        // const isCheckboxSelect = (id: number) => checked.includes(String(id));


  useEffect(() => {
    if (cities && cities.length > 0) {
      const cityOptions = cities.map((city: any) => ({
        value: city.id,
        label: city.name,
      }));
      setCityOptionss(cityOptions);
    }
    if (countries && countries.length > 0) {
      const countryOptions = countries.map((country: any) => ({
        value: country.id,
        label: country.name,
      }));
      setCountryOptionss(countryOptions);
    }
    if (categories && categories.length > 0) {
      const categoryOptions = categories.map((category: any) => ({
        value: category.id,
        label: category.name,
      }));
      setCategoryOptions(categoryOptions);
    }
    if (currencies && currencies.length > 0) {
      const currencyOptions = currencies.map((c: any) => ({
        value: c.code,
        label: c.name,
      }));
      setCurrencyOptionss(currencyOptions);
    }
    if (owners && owners.length > 0) {
      const ownerOptions = owners.map((o: any) => ({
        value: o.id,
        label: o.username,
      }));
      setOwnerOptionss(ownerOptions);
    }
  }, [categories, cities, countries, owners, currencies]);

  const [merchantFormData, setMerchantFormData] = useState<MerchantResult>({
    ...initialFormData,
  });


  const onHandleSearch = (query: string) => {
    queryClient.prefetchQuery(['merchant', page, limitChange, query], () => merchantAPI.list({ page, page_size: limitChange, full_name: query }));
    setQuery(query);
    setPage(1);
  };

  const handleFormModal = () => {
    setFormModal(true);
    setRowId('');
  };

  const handleFormClose = () => {
    if (!MerchantMutation.isLoading) {
      setMerchantFormData({
        ...initialFormData,
      });
      setRowId('');
      setFormModal(false);
    }
  };


  const MerchantMutation = useMutation((data: MerchantResult) => {
    const form  = new FormData();
    Object.keys(data).map((key:string )=> {
        if(key == "extra_data"){
            form.set(key, JSON.stringify(data[key]) ) 
        }
        else{
        // @ts-ignore
        form.set(key, data[key] ?? null)
        }
    })
    return postMerchant.store(form, rowId, null,{
        'content-type' : 'multipart/form-data'
    })
})

  const BulkMerchantMutation = useMutation((file: File) => {
    const form = new FormData();
    form.append('merchants', file); // Adjust to 'excel_file' if backend requires

    // Debug: Log FormData contents
    // console.log('BulkMerchantMutation - FormData contents:');
    // for (const [key, value] of form.entries()) {
    //   console.log(`${key}:`, value);
    // }

    return bulkMerchantAPI.store(form, undefined, undefined, {
      'content-type': 'multipart/form-data',
    });
  });
  const downloadExcelFile = async () => {
    const response = await axios.get("/merchant/merchant-bulk-excel/", {
      responseType: 'blob', // Important for handling binary data
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'sample.xlsx'); // File name for download
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url); // Clean up

  return response.data;
  }

  const handleBulkCreate = (file: File | null) => {
    console.log('handleBulkCreate - File:', file); // Debug
    if (!file) {
      showNotification({
        title: 'Error',
        message: 'Please select an Excel file to upload',
        color: 'red',
        icon: <IconX size={18} />,
      });
      return;
    }

    const validExtensions = ['xlsx', 'xls'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!validExtensions.includes(fileExtension || '')) {
      showNotification({
        title: 'Error',
        message: 'Invalid file format. Please upload an Excel file (.xlsx or .xls)',
        color: 'red',
        icon: <IconX size={18} />,
      });
      return;
    }

    BulkMerchantMutation.mutate(file, {
      onSuccess: (response) => {
        console.log('Bulk upload success:', response.data); // Debug
        setBulkModal(false);
        showNotification({
          title: 'Success',
          message: response.data.message || 'Successfully created merchants',
          color: 'green',
          icon: <IconCheck size={18} />,
        });
        queryClient.invalidateQueries(['merchant', page, limitChange]);
      },
      onError: (error: any) => {
        console.error('Bulk upload error:', error); // Debug
        showNotification({
          title: 'Error',
          message: error.response?.data?.message || 'Failed to create merchants. Please check the file format and try again.',
          color: 'red',
          icon: <IconX size={18} />,
        });
      },
    });
  };

  const pageToFecth = data?.data?.result.length <= 1 ? page - 1 : page;

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
      const checkedRowId = data?.data?.result.map((Merchant: MerchantResult) => String(Merchant.id));
      setChecked(checkedRowId);
    }
  };

  const isAllCheckboxSelected = () => {
    const checkedRowId = data?.data?.result.map((Merchant: MerchantResult) => String(Merchant.id));
    const isAllSelected = checkedRowId.every((id: string) => checked.includes(String(id)));
    return isAllSelected;
  };

  const handleCloseModal = () => {
    if (!merchantDeleteMutation.isLoading) {
      setDeleteModal(false);
      setRowId('');
    }
  };

  const handleFormModalEdit = (object: MerchantResult) => {
    setMerchantFormData(mapToViewModal(object));
    setFormModal(true);
    setRowId(object.id);
  };

  const mapToViewModal = (value: MerchantResult) => {
    console.log("value merchat", value?.city)
    return {
      id: value?.id,
      full_name: value?.full_name,
      owner: value?.owner,
      user: value?.user,
      active_hour_start: value?.active_hour_start,
      active_hour_end: value?.active_hour_end,
      category: value?.category,
      logo: value?.logo,
      default_currency: value?.default_currency,
      city: value?.city,
      country: value?.country,
      address_line1: value.address_line1,
      address_line2: value.address_line2,
      commission: value?.commission,
      is_premium: value?.is_premium,
      extra_data: {
        businessName: value.extra_data.businessName,
        legalStructure: value.extra_data.legalStructure,
        industryType: value.extra_data.industryType,
        taxId: value.extra_data.taxId,
        ownerName: value.extra_data.ownerName,
        ownerEmail: value.extra_data.ownerEmail,
        ownerPhone: value.extra_data.ownerPhone,
        bankName: value.extra_data.bankName,
        accountNumber: value.extra_data.accountNumber,
        paypalEmail: value.extra_data.paypalEmail,
        businessDescription: value.extra_data.businessDescription,
        businessRegistration: value.extra_data.businessRegistration,
        taxDocuments: value.extra_data.taxDocuments,
        governmentId: value.extra_data.governmentId,
      },
    };
  };

  const onCreateMerchant = (data: any, actions: FormikHelpers<MerchantResult>) => {
    MerchantMutation.mutate(data, {
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
          showNotification({
            title: `Congrats! Merchant ${rowId ? 'Updated' : 'Created'}`,
            message: rowId ? 'Merchant updated successfully.' : data.data.message ?? 'Merchant created successfully.',
            color: 'green',
            icon: <IconCheck size={18} />,
          });
          console.log('onCreateMerchant - data:', data); // Debug
          const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
          if (pageToSet === page) queryClient.invalidateQueries(['merchant', pageToSet, limitChange]);
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

  // const handleSingleDelete = (id: string) => {
  //   setDeleteModal(true);
  //   setRowId(id);
  // };
 
  const merchantDeleteMutation = useMutation((id: string) => postMerchant.delete(id), {
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
          message: data.data?.message ?? 'Merchant deleted successfully.',
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

  if (isError) {
    return <ErrorAlert />;
  }

  return (
    <>
      <PageHeader pageTitle="Merchant">
        {(is_superuser || user_permissions?.includes('add_merchant')) && (
          <>
            <Button onClick={handleFormModal} name="Create" />
            <Button onClick={() => setBulkModal(true)} name="Bulk Create" />
          </>
        )}
      </PageHeader>

      <PaperBox>
        <MerchantTable
          city={city}
          setCity={setCity}
          country={country}
          setCountry={setCountry}
          user={user}
          setUser={setUser}
          data={data?.data?.result}
          page={page}
          checked={checked}
          isLoading={isLoading}
          handleFormModalEdit={handleFormModalEdit}
          isSuccess={isSuccess}
          onSelectAll={onSelectAll}
          isDeleteModalOpened={deleteModal}
          isSingleDeleteMutationLoading={merchantDeleteMutation.isLoading}
          onConfirmSingleDelete={() => merchantDeleteMutation.mutate(String(rowId))}
          // handleSingleDelete={handleSingleDelete}
          total={data?.data?.total_pages}
          onSetPage={setPage}
          onHandleSearch={onHandleSearch}
          isAllCheckboxSelected={isAllCheckboxSelected}
          isCheckboxSelect={isCheckboxSelect as unknown as undefined}
          handleSelect={handleSelect as unknown as undefined}
          handleSingleDeleteCloseModal={handleCloseModal}
          limitChange={limitChange}
          handleLimitChange={handleLimitChange}
          premium={premium}
          setPremium={setPremium}
          active={active}
          setActive={setActive}
          isFetching={isFetching}
          query={query}
        />
      </PaperBox>

      <Formik
        enableReinitialize
        initialValues={merchantFormData}
        // validationSchema={MerchantValidationSchema}
        onSubmit={(values, actions) => {
          onCreateMerchant(values, actions);
        }}
      >
        {({ handleSubmit, handleReset, values, setFieldValue }) => (
          <FormModal
            opened={formModal}
            onClose={() => {
              if (!MerchantMutation.isLoading) {
                handleReset();
              }
              handleFormClose();
            }}
            title={`${rowId ? 'Edit Merchant' : 'Add Merchant'}`}
            size="xl"
            onConfirm={handleSubmit}
            confirmButtonText={`${rowId ? 'Save' : 'Add'}`}
            loading={MerchantMutation.isLoading}
          >
            <Form>
              <Box>
                <Title order={5} mb="sm">Basic Information</Title>
                <InputField name="full_name" labelName="Full Name" placeHolder="Enter Merchant's full name" withAsterisk />
                {!rowId && (
                  <>
                    <FileInput
                      name="logo"
                      placeholder="Upload your business logo"
                      label="Upload your business logo"
                      mb="sm"
                      onChange={(file) => {
                        setFieldValue('logo', file);
                      }}
                      clearable
                      withAsterisk
                    />
                    <InputField name="active_hour_start" labelName="Active Hour Start" type="time" list="time-options" />
                    <InputField name="active_hour_end" labelName="Active Hour End" type="time" list="time-options" />
                  </>
                )}

                <SimpleGrid cols={3} mb="sm">
                  <SelectField
                    name="category"
                    labelName="Select a category"
                    placeHolder="Categories"
                    options={categoryOptions}
                    handleChange={(val: any) => {
                      setFieldValue('category', val);
                    }}
                    withAsterisk
                  />
                  <SelectField
                    name="city"
                    placeHolder="Cities"
                    options={cityOptionss}
                    withAsterisk
                    labelName="Select a city"
                    handleChange={(val: any) => setFieldValue('city', val)}
                  />
                  <SelectField
                    name="country"
                    placeHolder="Countries"
                    options={countryOptionss}
                    withAsterisk
                    labelName="Select a country"
                    handleChange={(val: any) => setFieldValue('country', val)}
                  />
                  {!rowId && (
                    <>
                      <SelectField
                        name="default_currency"
                        placeHolder="Select default currency"
                        withAsterisk
                        options={currencyOptionss}
                        labelName="Select a currency"
                        handleChange={(val: any) => setFieldValue('default_currency', val)}
                      />
                      <SelectField
                        name="user"
                        placeHolder="User"
                        handleChange={(val) => setFieldValue('user', val)}
                        options={ownerOptionss}
                        withAsterisk
                        labelName="Select a user"
                        nothingFound="All user profiles are merchants"
                      />
                      <SelectField
                        name="owner"
                        placeHolder="Owner"
                        handleChange={(val) => setFieldValue('owner', val)}
                        options={ownerOptionss}
                        withAsterisk
                        labelName="Select an owner"
                        nothingFound="All user profiles are merchants"
                      />
                    </>
                  )}
                </SimpleGrid>

                <SimpleGrid cols={2}>
                  <InputField name="address_line1" labelName="Address Line 1" withAsterisk />
                  <InputField name="address_line2" labelName="Address Line 2" withAsterisk />
                </SimpleGrid>

                <InputField
                  name="commission"
                  labelName="Commission"
                  min={0}
                  max={0.5}
                  placeHolder="Commission rate must be within 0 - 0.5"
                  type="number"
                  withAsterisk
                />
                <SwitchCheckbox
                  name="is_premium"
                  checked={values.is_premium}
                  labelName="Is Premium?"
                  onChange={(e) => setFieldValue('is_premium', e.currentTarget.checked)}
                  mb={15}
                />
              </Box>

              {!rowId && (
                <>
                  <Box>
                    <Title order={5} mb="sm">Business Information</Title>
                    <InputField name="extra_data.businessName" labelName="Business Name" />
                    <InputField name="extra_data.ownerPhone" labelName="Owner Phone" />
                    <InputField name="extra_data.legalStructure" labelName="Legal Structure" />
                    <InputField name="extra_data.taxDocuments" labelName="Tax ID/PAN Number" />
                  </Box>

                  <Box>
                    <Title order={5} mb="sm">Financial Info</Title>
                    <InputField name="extra_data.bankName" labelName="Bank Name" />
                    <InputField name="extra_data.accountNumber" labelName="Account Number" />
                    <InputField name="extra_data.paypalEmail" labelName="Paypal Email (Optional)" />
                  </Box>
                </>
              )}
            </Form>
          </FormModal>
        )}
      </Formik>

      <Modal
        opened={bulkModal}
        onClose={() => setBulkModal(false)}
        title="Bulk Merchant Creation"
        size="md"
      >
        <Formik
          initialValues={{ file: null }}
          onSubmit={(values) => {
            console.log('Formik submit - Values:', values); // Debug
            handleBulkCreate(values.file);
          }}
        >
          {({ setFieldValue, handleSubmit }) => (
            <Form>
              <Box>
                <FileInput
                  label="Upload Excel File"
                  placeholder="Select an Excel file"
                  accept=".xlsx,.xls"
                  onChange={(file) => {
                    console.log('FileInput change - File:', file); // Debug
                    setFieldValue('file', file);
                  }}
                  clearable
                  withAsterisk
                />
                <div className="mt-4 text-center">
                  <p className="text-gray-600 dark:text-gray-400">
                    Ensure your file matches the required format. Download sample file below.
                  </p>
                  <Anchor
                  onClick={downloadExcelFile}
                    // href="https://docs.google.com/spreadsheets/d/1pfSQehl2KhqKUNxdBa7bC0Mz_GdW84VrHF50r2I-cn0/export?format=xlsx"
                    download="sample_merchant_product_upload.xlsx"
                    className="text-orange-500 hover:underline cursor-pointer block mt-1"
                  >
                    Sample File
                  </Anchor>
                </div>
                <Button
                  type="submit"
                  name="Upload"
                  className="mt-4 w-full"
                  loading={BulkMerchantMutation.isLoading}
                >
                  Upload Merchants
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Modal>
    </>
  );
};

export default Merchant;