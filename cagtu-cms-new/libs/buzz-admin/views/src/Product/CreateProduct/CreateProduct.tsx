import { API, urls } from '@cagtu-cms/data-access';
import {
    Breadcrumb,
    FileDropzone,
    InputField,
    PaperBox,
    SelectField,
    SelectInputField,
    SwitchCheckbox,
    TextAreaField,
    TextEditor,
} from '@cagtu-cms/ui-shared';
import {
    AttributesResult,
    BrandResult,
    BreadcrumbItems,
    CategoriesListProps,
    ProductAttributesResult,
    ProductFormValueProps,
    productSchema,
    ProductsResult,
    useDark,
    warrantyPeriodOptions,
} from '@cagtu-cms/util-formatter';
import { ActionIcon, Box, Button, Code, Grid, Group, Text, Title, Tooltip, useMantineTheme } from '@mantine/core';
import { Form, Formik } from 'formik';
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { showNotification } from '@mantine/notifications';
import { IconArrowNarrowLeft, IconCheck, IconHelp, IconX } from '@tabler/icons';

const CreateProduct = () => {
    const { productID } = useParams();
    const [dark] = useDark();
    const theme = useMantineTheme();
    const navigate = useNavigate();

    const [brandOptions, setBrandOptions] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState<{ value: string; label: string }[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>();
    const [isProductSubmitting, setIsProductSubmitting] = useState<boolean>(false);

    const [productFormData, setProductFormData] = useState<ProductFormValueProps>({
        id: null,
        name: '',
        description: '',
        brand: '',
        category: '',
        thumbnail_image: [],
        model_no: '',
        video_url: '',
        product_status: '',
        warranty_type: '',
        warranty_period: '',
        meta_title: '',
        meta_discription: '',
        meta_keyword: '',
        notes: '',
        is_active: false,
        no_brand: false,
        productPreviewUrl: [],
        product_attribute: {},
    });

    const brandsAPI = new API(urls?.buzz?.cms?.brand?.select);
    const categoryAPI = new API(urls?.buzz?.cms?.category?.path);
    const atrributesAPI = new API(`${urls?.buzz?.cms?.product?.attribute}/list`);
    const productAPI = new API(urls?.buzz?.cms?.product?.path);
    const fileStoreAPI = new API(urls?.filestore?.thumbnail);
    const productAttrAPI = new API(urls?.buzz?.cms?.product?.attribute);

    const thumbnailImgMutation = useMutation((data: FormData) => fileStoreAPI.store(data));
    const productMutation = useMutation((data: ProductsResult) => productAPI.store(data, Number(productID)));

    const productAttrMutation = useMutation((data: { attributes: ProductAttributesResult[]; productId: number }) =>
        productAttrAPI.storeWithIdAndData({ attributes: data.attributes }, data.productId)
    );

    const { isLoading, isError, isSuccess } = useQuery(['brands-select'], () => brandsAPI.list(), {
        onSuccess: ({ data }) => {
            const options = data.map((val: BrandResult) => {
                return {
                    value: String(val?.id),
                    label: val?.name,
                };
            });
            setBrandOptions(options);
        },
    });

    const {
        isLoading: attributesIsLoading,
        isError: attributesHasError,
        isSuccess: attributesIsSuccess,
        data: attributesData,
    } = useQuery([`attributes ${selectedCategoryId}`, selectedCategoryId], () => atrributesAPI.get(Number(selectedCategoryId)), {
        enabled: !!selectedCategoryId,
    });

    const {
        isLoading: catIsLoading,
        isError: catHasError,
        isSuccess: catIsSuccess,
    } = useQuery(['category-select'], () => categoryAPI.list(), {
        onSuccess: ({ data }) => {
            data.forEach((gParentValue: CategoriesListProps) => {
                const gParentname = gParentValue?.name;
                gParentValue?.sub_category.forEach((parentValue: NonNullable<CategoriesListProps['sub_category']>[0]) => {
                    const parentName = parentValue?.name;
                    setCategoryOptions((prevState) => [
                        ...prevState,
                        ...parentValue.sub_sub_category.map(
                            (childValue: NonNullable<CategoriesListProps['sub_category']>[0]['sub_sub_category'][0]) => ({
                                value: String(childValue?.id),
                                label: `${gParentname} > ${parentName} > ${childValue?.name}`,
                            })
                        ),
                    ]);
                });
            });
        },
    });

    const onCreateThumbnail = (formData: FormData, values: ProductFormValueProps) =>
        thumbnailImgMutation.mutate(formData, {
            onSuccess: (data) => {
                const dataToSend = {
                    ...JSON.parse(JSON.stringify(values)),
                    thumbnail_image: data?.data,
                };
                delete dataToSend.no_brand;
                delete dataToSend.productPreviewUrl;
                delete dataToSend.product_attribute;

                onCreateProduct(dataToSend, values);
            },
            onError: () => {
                showNotification({
                    title: 'Uh oh! something went wrong',
                    message: 'Sorry! There was a problem with your request.',
                    color: 'red',
                    icon: <IconX />,
                });
            },
        });

    const onCreateProduct = (data: any, values: ProductFormValueProps) => {
        productMutation.mutate(data, {
            onSuccess: (data) => {
                if (data.data.status === 'failure') {
                    showNotification({
                        title: 'Uh oh! something went wrong',
                        message: data.data.message.title[0],
                        color: 'red',
                        icon: <IconX />,
                    });
                } else {
                    const product_attribute: ProductAttributesResult[] = [];

                    Object.entries(values.product_attribute).forEach(([key, value]) => {
                        const attributeRow = attributesData?.data?.product_attribute.find((attribute: AttributesResult) => attribute.slug === key);
                        if (attributeRow) product_attribute.push({ attribute: attributeRow?.id, value: value as string });
                    });

                    onCreateProductAttribute({ attributes: product_attribute, productId: Number(data?.data?.product_id) });

                    showNotification({
                        title: 'Congrats! Product created',
                        message: data.data.message,
                        color: 'green',
                        icon: <IconCheck />,
                    });
                }
            },
            onError: () => {
                showNotification({
                    title: 'Uh oh! something went wrong',
                    message: 'Sorry! There was a problem with your request.',
                    color: 'red',
                    icon: <IconX />,
                });
            },
        });
    };

    const onCreateProductAttribute = (data: any) => {
        productAttrMutation.mutate(data, {
            onSuccess: () => {
                setIsProductSubmitting(false);
                navigate('/products', { replace: true });
            },
            onError: () => {
                setIsProductSubmitting(false);
                showNotification({
                    title: 'Uh oh! something went wrong',
                    message: 'Sorry! There was a problem with your request.',
                    color: 'red',
                    icon: <IconX />,
                });
            },
        });
    };

    const breadCrumbItems: BreadcrumbItems[] = [{ name: 'Products', href: '/products' }];

    return (
        <Formik
            enableReinitialize
            initialValues={productFormData}
            validationSchema={productSchema}
            onSubmit={async (values) => {
                const formData = new FormData();
                setIsProductSubmitting(true);

                if (values.thumbnail_image[0]?.name) {
                    values.thumbnail_image.forEach((file) => formData.append('image', file));
                    onCreateThumbnail(formData, values);
                } else {
                    const dataToSend = {
                        ...JSON.parse(JSON.stringify(values)),
                    };
                    delete dataToSend.no_brand;
                    delete dataToSend.productPreviewUrl;
                    delete dataToSend.product_attribute;

                    onCreateProduct(dataToSend, values);
                }
            }}>
            {({ setFieldValue, values, errors, touched, handleBlur }) => (
                <Form>
                    <Group position="apart" mb={30}>
                        <Box>
                            <Title order={4} sx={{ fontWeight: 600, color: dark ? theme.colors.gray[2] : theme.colors.dark[9] }}>
                                Create Product
                            </Title>
                            <Breadcrumb currentTitle="Create" items={breadCrumbItems} />
                        </Box>
                        <Group position="right">
                            <Button
                                type="button"
                                variant="white"
                                leftIcon={<IconArrowNarrowLeft size={16} />}
                                px={15}
                                sx={{
                                    background: `${dark && theme.colors.dark[4]}`,
                                    color: dark ? theme.colors.gray[0] : theme.colors.blue[6],
                                    height: 38,
                                    fontWeight: 500,
                                    fontSize: 13,
                                    minWidth: 120,
                                    '&:hover': {
                                        background: `${dark ? theme.colors.dark[5] : theme.colors.gray[3]}`,
                                    },
                                }}
                                onClick={() => navigate('/products', { replace: true })}>
                                Back
                            </Button>
                            <Button
                                type="submit"
                                loading={isProductSubmitting}
                                px={15}
                                sx={{ height: 38, fontWeight: 500, fontSize: 13, minWidth: 120 }}>
                                Create
                            </Button>
                        </Group>
                    </Group>
                    <Grid gutter={30}>
                        <Grid.Col xl={9} md={8}>
                            <PaperBox sx={{ marginBottom: 30 }}>
                                <Title order={5} sx={{ fontWeight: 600 }} mb={20}>
                                    Basic Information
                                </Title>
                                <InputField
                                    name="name"
                                    error={errors.name}
                                    touch={touched.name}
                                    labelName="Product Name"
                                    textMuted="A product name is required and recommended to be unique."
                                    placeHolder="Enter product name"
                                    onChange={(e) => {
                                        setFieldValue('name', e.target.value);
                                        setFieldValue('meta_title', e.target.value);
                                    }}
                                />
                                <SelectInputField
                                    name="category"
                                    labelName="Categories"
                                    placeHolder="e.g. Home Appliances > Vacumming &amp; Cleaning > Stick Vacuum"
                                    error={errors.category}
                                    touch={touched.category}
                                    value={values.category}
                                    options={categoryOptions}
                                    handleChange={(value) => {
                                        setFieldValue('category', value);
                                        setSelectedCategoryId(Number(value));
                                    }}
                                    textMuted="Set a brand or select no brand below if your product has no brand."
                                    searchable
                                    clearable
                                />
                                {!values.no_brand && (
                                    <SelectInputField
                                        name="brand"
                                        labelName="Brand"
                                        placeHolder="e.g. Nike"
                                        error={errors.brand}
                                        touch={touched.brand}
                                        options={brandOptions}
                                        handleChange={(value) => setFieldValue('brand', value)}
                                        textMuted="Set a brand or select no brand below if your product has no brand."
                                        searchable
                                        clearable
                                    />
                                )}
                                <SwitchCheckbox
                                    name="no_brand"
                                    checked={values.no_brand}
                                    onChange={(e) => setFieldValue('no_brand', e.currentTarget.checked)}
                                    labelName="No Brand"
                                    mb={20}
                                />
                                <InputField
                                    name="model_no"
                                    error={errors.model_no}
                                    touch={touched.model_no}
                                    labelName="Model Number"
                                    placeHolder="Enter model number"
                                />
                                <Text size="sm" component="label" weight={500} mb={4} sx={{ display: 'inline-block' }}>
                                    Product Description
                                </Text>
                                <TextEditor
                                    name="description"
                                    value={values.description}
                                    onChange={(value: string) => {
                                        setFieldValue('description', value);
                                    }}
                                    error={errors.description}
                                    touch={touched.description}
                                    onBlur={handleBlur}
                                    height={300}
                                    mb={20}
                                />
                                {attributesData?.data?.product_attribute.length && (
                                    <>
                                        <Title order={5} sx={{ fontWeight: 600 }} mb={10}>
                                            Product Atributes
                                        </Title>
                                        <Grid>
                                            {attributesData?.data?.product_attribute.map((prodAttr: AttributesResult, key: number) => (
                                                <Grid.Col md={4} key={key}>
                                                    {prodAttr?.type === 'text' && (
                                                        <InputField
                                                            name={`product_attribute.${String(prodAttr?.slug)}`}
                                                            labelName={
                                                                <>
                                                                    <span>{prodAttr?.name}</span>
                                                                    {prodAttr?.info && (
                                                                        <Tooltip
                                                                            label={prodAttr?.info}
                                                                            position="right"
                                                                            transition="fade"
                                                                            withArrow
                                                                            styles={{
                                                                                tooltip: {
                                                                                    fontSize: 12,
                                                                                    fontWeight: 500,
                                                                                    maxWidth: 250,
                                                                                },
                                                                            }}>
                                                                            <ActionIcon
                                                                                variant="light"
                                                                                radius="xl"
                                                                                size={24}
                                                                                color="gray"
                                                                                ml={2}
                                                                                sx={{
                                                                                    cursor: 'pointer',
                                                                                    position: 'relative',
                                                                                    top: 2,
                                                                                }}>
                                                                                <IconHelp size={14} />
                                                                            </ActionIcon>
                                                                        </Tooltip>
                                                                    )}
                                                                </>
                                                            }
                                                            placeHolder={`Enter ${prodAttr?.name}`}
                                                            rightSection={
                                                                <Text size="xs" sx={{ fontWeight: 500 }} color="gray">
                                                                    {prodAttr?.unit}
                                                                </Text>
                                                            }
                                                            sx={{ marginBottom: '0 !important' }}
                                                            styles={{ rightSection: { padding: '0 5px' } }}
                                                        />
                                                    )}
                                                    {prodAttr?.type === 'number' && (
                                                        <InputField
                                                            name={`product_attribute.${String(prodAttr?.slug)}`}
                                                            labelName={prodAttr?.name}
                                                            placeHolder={`Enter ${prodAttr?.name}`}
                                                            rightSection={
                                                                <Text size="xs" sx={{ fontWeight: 500 }} color="gray">
                                                                    {prodAttr?.unit}
                                                                </Text>
                                                            }
                                                            sx={{ marginBottom: '0 !important' }}
                                                            styles={{ rightSection: { padding: '0 5px' } }}
                                                        />
                                                    )}
                                                    {prodAttr?.type === 'select' && (
                                                        <SelectField
                                                            name={`product_attribute.${String(prodAttr?.slug)}`}
                                                            labelName={prodAttr?.name}
                                                            placeHolder="Select"
                                                            options={prodAttr?.options && JSON.parse(String(prodAttr?.options))}
                                                            handleChange={(value) =>
                                                                setFieldValue(`product_attribute.${String(prodAttr?.slug)}`, value)
                                                            }
                                                            searchable
                                                            sx={{ marginBottom: '0 !important' }}
                                                        />
                                                    )}
                                                </Grid.Col>
                                            ))}
                                        </Grid>
                                    </>
                                )}
                            </PaperBox>
                            <PaperBox>
                                <Title order={5} sx={{ fontWeight: 600 }} mb={20}>
                                    Meta Options
                                </Title>
                                <InputField
                                    name="meta_title"
                                    error={errors.meta_title}
                                    touch={touched.meta_title}
                                    labelName="Meta Title"
                                    textMuted="Set a meta tag title. Recommended to be simple and precise keywords."
                                    placeHolder="Enter meta title"
                                    readOnly
                                />
                                <TextAreaField
                                    name="meta_discription"
                                    error={errors.meta_discription}
                                    touch={touched.meta_discription}
                                    labelName="Meta Description"
                                    autoComplete="off"
                                    textMuted="Set a meta tag description to the product for increased SEO ranking."
                                    placeHolder="Type your meta description here..."
                                />
                                <InputField
                                    name="meta_keyword"
                                    error={errors.meta_keyword}
                                    touch={touched.meta_keyword}
                                    labelName="Meta Keyword"
                                    textMuted={
                                        <>
                                            <span>
                                                Set a list of keywords that the product is related to. Separate the keywords by adding a comma
                                            </span>
                                            <Code style={{ margin: '0 5px' }}>,</Code>
                                            <span>between each keyword.</span>
                                        </>
                                    }
                                    placeHolder="e.g. chair, modern, black"
                                />
                            </PaperBox>
                        </Grid.Col>
                        <Grid.Col xl={3} md={4}>
                            <PaperBox sx={{ marginBottom: 30 }}>
                                <Title order={5} sx={{ fontWeight: 600 }} mb={20}>
                                    Thumbnail Image
                                </Title>
                                <Text size="xs" component="div" mb={7} color={`${dark ? theme.colors.dark[2] : theme.colors.gray[6]}`}>
                                    This is the main image of your product. Only *.png, *.jpg and *.jpeg image files are accepted. Max file size 2MB.
                                    Obscene image is strictly prohibited.
                                </Text>
                                <FileDropzone
                                    name="thumbnail_image"
                                    error={errors.thumbnail_image as string}
                                    touch={touched.thumbnail_image as boolean}
                                    accept={['image/png', 'image/jpeg', 'image/jpg']}
                                    imagePreview="productPreviewUrl"
                                    maxSize={1024 * 1024}
                                    multiple={false}
                                />
                            </PaperBox>
                            <PaperBox sx={{ marginBottom: 30 }}>
                                <Title order={5} sx={{ fontWeight: 600 }} mb={20}>
                                    Video URL
                                </Title>
                                <InputField
                                    name="video_url"
                                    error={errors.video_url}
                                    touch={touched.video_url}
                                    textMuted="Set the video url of the product."
                                    sx={{ marginBottom: '0 !important' }}
                                    placeHolder="e.g. www.youtube.com/watch?v=eCrc_7Z_4xI"
                                />
                            </PaperBox>
                            <PaperBox sx={{ marginBottom: 30 }}>
                                <Title order={5} sx={{ fontWeight: 600 }} mb={20}>
                                    Product Status
                                </Title>
                                <SelectField
                                    name="product_status"
                                    placeHolder="e.g. Hot Deals"
                                    error={errors.product_status}
                                    touch={touched.product_status}
                                    options={['General', 'Sale', 'Featured', 'Hot Deals']}
                                    handleChange={(value) => setFieldValue('product_status', value)}
                                    textMuted="Set the product status of the product."
                                    searchable
                                    sx={{ marginBottom: '0 !important' }}
                                />
                            </PaperBox>

                            <PaperBox sx={{ marginBottom: 30 }}>
                                <Title order={5} sx={{ fontWeight: 600 }} mb={20}>
                                    Warranty
                                </Title>
                                <SelectField
                                    name="warranty_type"
                                    labelName="Warranty Type"
                                    placeHolder="e.g. Brand Warranty"
                                    error={errors.warranty_type}
                                    touch={touched.warranty_type}
                                    options={['No Warranty', 'Brand Warranty', 'Store Warranty']}
                                    handleChange={(value) => setFieldValue('warranty_type', value)}
                                    searchable
                                />
                                {values.warranty_type !== 'No Warranty' && (
                                    <SelectField
                                        name="warranty_period"
                                        labelName="Warranty Period"
                                        placeHolder="e.g. 1 year"
                                        error={errors.warranty_period}
                                        touch={touched.warranty_period}
                                        options={warrantyPeriodOptions}
                                        handleChange={(value) => setFieldValue('warranty_period', value)}
                                        searchable
                                        sx={{ marginBottom: '0 !important' }}
                                    />
                                )}
                            </PaperBox>
                            <PaperBox>
                                <Title order={5} sx={{ fontWeight: 600 }} mb={20}>
                                    Notes
                                </Title>
                                <TextAreaField
                                    name="notes"
                                    error={errors.notes}
                                    touch={touched.notes}
                                    autoComplete="off"
                                    textMuted="Set a note for product"
                                    sx={{ marginBottom: '0 !important' }}
                                />
                            </PaperBox>
                        </Grid.Col>
                    </Grid>
                </Form>
            )}
        </Formik>
    );
};

export default CreateProduct;
