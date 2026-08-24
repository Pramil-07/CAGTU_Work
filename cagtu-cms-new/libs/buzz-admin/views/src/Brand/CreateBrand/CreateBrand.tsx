import { API, urls } from '@cagtu-cms/data-access';
import { Breadcrumb, FileDropzone, InputField, PaperBox, ProfileImageField } from '@cagtu-cms/ui-shared';
import { BrandFormValueProps, brandSchema, BreadcrumbItems, useDark } from '@cagtu-cms/util-formatter';
import { Alert, Box, Button, Container, Group, Text, Title, useMantineTheme } from '@mantine/core';
import { Form, Formik } from 'formik';
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { showNotification } from '@mantine/notifications';
import { IconAlertCircle, IconCheck, IconX } from '@tabler/icons';

const CreateBrand = () => {
    const { brandID } = useParams();
    const [dark] = useDark();
    const theme = useMantineTheme();
    const navigate = useNavigate();

    const [brandFormData, setBrandFormData] = useState<BrandFormValueProps>({
        id: null,
        name: '',
        image: [],
        banner: [],
        profilePreviewUrl: [],
        bannerPreviewUrl: [],
    });

    const brandAPI = new API(urls?.buzz?.cms?.brand?.path);

    const { isLoading, isError } = useQuery([`brand ${brandID}`, brandID], () => brandAPI.get(Number(brandID)), {
        enabled: !!brandID,
        onSuccess: (data) => {
            setBrandFormData(mapToViewModal(data?.data?.data));
        },
    });

    const blogPublishMutation = useMutation((data: FormData) => brandAPI.store(data, Number(brandID)));

    const onBrandCreate = (formData: FormData, actions: any, values: any) => {
        blogPublishMutation.mutate(formData, {
            onSuccess: (data) => {
                if (data.data.status === 'failure') {
                    showNotification({
                        title: 'Uh oh! something went wrong',
                        message: data.data.message.title[0],
                        color: 'red',
                        icon: <IconX />,
                    });
                } else {
                    showNotification({
                        title: 'Congrats! Brand created',
                        message: data.data.message,
                        color: 'green',
                        icon: <IconCheck />,
                    });
                    delete values.imagePreviewUrl;
                    actions.resetForm();
                    navigate('/brands', { replace: true });
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

    const mapToViewModal = (value: BrandFormValueProps) => {
        return {
            id: value.id,
            name: value.name,
            image: value.image,
            banner: [value.image],
            profilePreviewUrl: [{ src: value.image }],
            bannerPreviewUrl: [{ src: value.banner }],
        };
    };

    const breadCrumbItems: BreadcrumbItems[] = [{ name: 'Brands', href: '/brands' }];

    if (isError) {
        return (
            <Alert icon={<IconAlertCircle size={22} />} title="Bummer!" color="red">
                Something terrible happened!
            </Alert>
        );
    }

    return (
        <>
            <Group position="apart" mb={30}>
                <Box>
                    <Title order={4} sx={{ fontWeight: 600, color: dark ? theme.colors.gray[2] : theme.colors.dark[9] }}>
                        Create Brand
                    </Title>
                    <Breadcrumb currentTitle="Create" items={breadCrumbItems} />
                </Box>
            </Group>
            <PaperBox>
                <Formik
                    enableReinitialize
                    initialValues={brandFormData}
                    validationSchema={brandSchema}
                    onSubmit={async (values, actions) => {
                        const formData = new FormData();

                        formData.append('name', values.name);
                        if (values.image[0]?.name) {
                            values.image.forEach((file) => formData.append('image', file));
                        }
                        if (values.banner[0]?.name) {
                            values.banner.forEach((file) => formData.append('banner', file));
                        }

                        onBrandCreate(formData, actions, values);
                    }}>
                    {({ setFieldValue, values, errors, touched, handleBlur }) => (
                        <Form>
                            <Container size="sm">
                                <ProfileImageField
                                    labelName="Brand Logo"
                                    name="image"
                                    profileImageData={values.profilePreviewUrl}
                                    error={errors.image as string}
                                    handleBlur={handleBlur}
                                    setFieldValue={setFieldValue}
                                />
                                <InputField name="name" error={errors.name} touch={touched.name} labelName="Brand Name" />
                                <Text
                                    size="sm"
                                    component="label"
                                    weight={500}
                                    mb={4}
                                    color={dark ? theme.colors.dark[0] : theme.colors.gray[9]}
                                    sx={{ display: 'inline-block' }}>
                                    Banner Image
                                </Text>
                                <FileDropzone
                                    name="banner"
                                    error={errors.banner as string}
                                    touch={touched.banner as boolean}
                                    accept={['image/png', 'image/jpeg', 'image/jpg']}
                                    imagePreview="bannerPreviewUrl"
                                    maxSize={1024 * 1024}
                                    multiple={false}
                                    style={{ marginBottom: 20 }}
                                />
                                <Button
                                    type="submit"
                                    loading={blogPublishMutation.isLoading}
                                    px={15}
                                    sx={{ height: 38, fontWeight: 500, minWidth: 120 }}>
                                    {brandID ? 'Save' : 'Create'}
                                </Button>
                            </Container>
                        </Form>
                    )}
                </Formik>
            </PaperBox>
        </>
    );
};

export default CreateBrand;
