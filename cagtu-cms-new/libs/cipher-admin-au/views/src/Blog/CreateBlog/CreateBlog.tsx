import { CipherAPI, urls } from '@cagtu-cms/data-access';
import {
    BackButton,
    Button,
    CreatableInputField,
    ErrorAlert,
    FileDropzone,
    InputField,
    PageHeader,
    PaperBox,
    SelectField,
    SkeletonBlogForm,
    SwitchCheckbox,
    TextEditor,
} from '@cagtu-cms/ui-shared';
import { blogCategoryOptions, BreadcrumbItems, CipherUserContext, CreateBlogFormValueProps, createBlogSchema } from '@cagtu-cms/util-formatter';
import { Grid, Text, Title, useMantineTheme } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Form, Formik, FormikHelpers } from 'formik';
import _ from 'lodash';
import { useContext, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';

const urlsPath = urls?.cipher?.blog;

const CreateBlog = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const { blogID } = useParams();
    const theme = useMantineTheme();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [blogCatData, setBlogCatData] = useState([...blogCategoryOptions]);
    const [blogTagData, setBlogTagData] = useState<{ value: string; label: string }[]>([]);

    const [blogFormData, setBlogFormData] = useState<CreateBlogFormValueProps>({
        id: '',
        title: '',
        content: '',
        blog_type: '',
        category: [],
        tags: [],
        comment: false,
        image: [],
        imagePreviewUrl: [],
        published_status: 'Unpublished',
    });

    //Blog API
    const blogAPI = new CipherAPI(!blogID ? urlsPath?.create : urlsPath?.path);

    //API for tags (both create and list)
    const blogTagsAPI = new CipherAPI(urlsPath?.tags?.path);

    //Tags list query
    const { isLoading: isTagsLoading } = useQuery([`blog-tags`], () => blogTagsAPI.list({ page: -1 }), {
        onSuccess(data) {
            const blogTagOption = data?.data?.map((val: { id: string; name: string }) => {
                return {
                    value: _.toString(val.id),
                    label: _.capitalize(val.name),
                };
            });
            setBlogTagData(blogTagOption);
        },
    });

    //Tags mutation query
    const tagsMutation = useMutation((data: FormData) => blogTagsAPI.store(data));

    //Tags create mutation
    const onTagsCreate = (tag: string, setFieldValue: any, values: CreateBlogFormValueProps) => {
        const formData: FormData = new FormData();
        formData.append('name', tag);
        tagsMutation.mutate(formData, {
            onSuccess: (data) => {
                showNotification({
                    title: `Congrats! Tags Created`,
                    message: data.data.message ?? 'New tag created successfully',
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                queryClient.invalidateQueries(['blog-tags']);
                setFieldValue('tags', [...(values.tags ?? []), _.toString(data?.data?.id)]);
            },
            onError: (error: any) => {
                if (error?.response?.data?.name) {
                    showNotification({
                        title: 'Uh oh! something went wrong',
                        message: error?.response?.data?.name,
                        color: 'red',
                        icon: <IconX size={18} />,
                    });
                } else {
                    showNotification({
                        title: 'Uh oh! something went wrong',
                        message: 'Sorry! There was a problem with your request.',
                        color: 'red',
                        icon: <IconX size={18} />,
                    });
                }
            },
        });
    };

    const formData: FormData = new FormData();
    const { isFetching, isError } = useQuery([`blog`, blogID], () => blogAPI.get(Number(blogID)), {
        enabled: !!blogID,
        onSuccess: (data) => {
            setBlogFormData(mapToViewModal(data?.data?.data));
        },
    });

    const blogMutation = useMutation((data: FormData) => blogAPI.store(data, Number(blogID)));

    const onCreateBlog = (formData: FormData, actions: FormikHelpers<CreateBlogFormValueProps>, values: CreateBlogFormValueProps) => {
        blogMutation.mutate(formData, {
            onSuccess: (data) => {
                if (data.data.status === 'failure') {
                    showNotification({
                        title: 'Uh oh! something went wrong',
                        message: data.data.message.title[0],
                        color: 'red',
                        icon: <IconX size={18} />,
                    });
                } else {
                    showNotification({
                        title: `Congrats! Blog ${blogID ? 'Updated' : 'Created'}`,
                        message: blogID ? data.data.message ?? 'Blog updated successfully' : data.data.message ?? 'Blog created successfully',
                        color: 'green',
                        icon: <IconCheck size={18} />,
                    });
                    delete values.imagePreviewUrl;
                    actions.resetForm();
                    navigate('/cms/blog', { replace: true });
                }
            },
            onError: () => {
                showNotification({
                    title: 'Uh oh! something went wrong',
                    message: 'Sorry! There was a problem with your request.',
                    color: 'red',
                    icon: <IconX size={18} />,
                });
            },
        });
    };

    const formDataValues = (values: CreateBlogFormValueProps) => {
        formData.append('title', values.title);
        formData.append('content', values.content);
        formData.append('blog_type', values.blog_type);
        formData.append('category', JSON.stringify(values.category));
        formData.append('comment', String(values.comment));
        formData.append('published_status', String(values.published_status));
        values.tags.forEach((val) => {
            formData.append('tags', val);
        });

        if (values.image[0]?.name) {
            values.image.forEach((file) => formData.append('image', file));
        }
    };

    const mapToViewModal = (value: CreateBlogFormValueProps) => {
        const categoryData = value.category && JSON.parse(String(value.category));

        const categoryOption = categoryData.map((val: unknown) => {
            return {
                value: String(val),
                label: String(val),
            };
        });

        setBlogCatData((prev) => [...prev, ...categoryOption]);

        return {
            id: value.id,
            title: value.title,
            content: value.content,
            blog_type: value.blog_type,
            category: value.category && JSON.parse(String(value.category)),
            tags: value.tags.map((tag: any) => _.toString(tag.id)),
            comment: value.comment,
            image: [value.image],
            imagePreviewUrl: [{ src: value.image }],
            published_status: value.published_status,
        };
    };

    const breadCrumbItems: BreadcrumbItems[] = [{ name: 'Blog', href: '/cms/blog' }];

    if (isError) {
        return <ErrorAlert />;
    }

    if (!blogID && !is_superuser && !user_permissions?.includes('add_blog')) {
        return <BlockedPageMessage />;
    }

    if (blogID && !is_superuser && !user_permissions?.includes('change_blog')) {
        return <BlockedPageMessage />;
    }

    return (
        <Formik
            enableReinitialize
            initialValues={blogFormData}
            validationSchema={createBlogSchema}
            onSubmit={async (values, actions) => {
                formDataValues(values);
                onCreateBlog(formData, actions, values);
            }}>
            {({ setFieldValue, values, errors, touched }) => (
                <Form>
                    <PageHeader pageTitle="Create Blog" currentBreadcrumbName={blogID ? 'Edit' : 'Create'} breadCrumbItems={breadCrumbItems}>
                        <BackButton navigateTo="/cms/blog" />
                        {!isFetching && <Button type="submit" name={blogID ? 'Save' : 'Create'} loading={blogMutation.isLoading} />}
                    </PageHeader>
                    {isFetching ? (
                        <SkeletonBlogForm />
                    ) : (
                        <Grid gutter="lg">
                            <Grid.Col xl={9} md={8}>
                                <PaperBox>
                                    <Title order={5} sx={{ fontWeight: 600 }} mb={10}>
                                        Blog Information
                                    </Title>
                                    <InputField
                                        name="title"
                                        error={errors.title}
                                        touch={touched.title}
                                        labelName="Title"
                                        placeHolder="Enter blog title"
                                        withAsterisk
                                    />
                                    <CreatableInputField
                                        name="category"
                                        options={blogCatData}
                                        labelName="Categories"
                                        placeHolder="e.g. Blockchain, Web3, Business, Information Technology"
                                        error={errors.category as string}
                                        touch={touched.category}
                                        value={values.category}
                                        onChange={(value) => setFieldValue('category', value)}
                                        handleCreate={(query) => {
                                            const newItem = { value: query, label: query };
                                            setBlogCatData((prev) => [...prev, newItem]);
                                            setFieldValue('category', blogCatData);
                                            return newItem;
                                        }}
                                        handleCreateLabel={(value) => `+ Create ${value}`}
                                    />
                                    <TextEditor
                                        name="content"
                                        labelName="Description"
                                        value={values.content}
                                        onChange={(value: string) => {
                                            setFieldValue('content', value);
                                        }}
                                        error={errors.content}
                                        touch={touched.content}
                                        // onBlur={handleBlur}
                                        height={400}
                                        withAsterisk
                                    />
                                </PaperBox>
                            </Grid.Col>
                            <Grid.Col xl={3} md={4}>
                                <PaperBox sx={{ marginBottom: theme.spacing.lg }}>
                                    <Title order={5} sx={{ fontWeight: 600 }} mb={10}>
                                        Feature Image{' '}
                                        <Text component="span" color="red">
                                            *
                                        </Text>
                                    </Title>
                                    <Text size="xs" component="div" mb={10} color="dimmed">
                                        This is the main image of your blog. Only *.png, *.jpg and *.jpeg image files are accepted. Max file size 1MB.
                                        Obscene image is strictly prohibited.
                                    </Text>
                                    <FileDropzone
                                        name="image"
                                        error={errors.image as string}
                                        touch={touched.image as boolean}
                                        accept={['image/png', 'image/jpeg', 'image/jpg']}
                                        imagePreview="imagePreviewUrl"
                                        maxSize={1024 * 1024}
                                        multiple={false}
                                    />
                                </PaperBox>
                                <PaperBox>
                                    {/* Commented for now as it was not implemented in backend yet */}
                                    {/* <SelectField
                                        name="blog_type"
                                        labelName="Types"
                                        placeHolder="e.g. Featured"
                                        error={errors.blog_type}
                                        touch={touched.blog_type}
                                        options={['Featured', 'General']}
                                        handleChange={(value) => setFieldValue('blog_type', value)}
                                    /> */}
                                    <CreatableInputField
                                        name="tags"
                                        options={blogTagData}
                                        labelName="Tags"
                                        placeHolder="Select or create a tag"
                                        textMuted="Tags can be selected from the list of available tags or new tags can be created by typing on select
                                        field."
                                        error={errors.tags as string}
                                        touch={touched.tags}
                                        value={values.tags}
                                        disabled={isTagsLoading || tagsMutation?.isLoading}
                                        onChange={(value) => {
                                            setFieldValue('tags', value);
                                        }}
                                        handleCreate={(query) => {
                                            onTagsCreate(query, setFieldValue, values);
                                            return '';
                                        }}
                                        handleCreateLabel={(value) => `+ Create ${value}`}
                                    />
                                    {/* Commented for now as it was not implemented in backend yet */}
                                    {/* <SwitchCheckbox name="comment" checked={values.comment} labelName="Show comment section" mb={15} /> */}
                                    <SwitchCheckbox
                                        name="published_status"
                                        checked={values.published_status === 'Published'}
                                        onChange={(e) => {
                                            const value = e.target.checked;

                                            if (value) {
                                                setFieldValue('published_status', 'Published');
                                            } else {
                                                setFieldValue('published_status', 'Unpublished');
                                            }
                                        }}
                                        labelName="Publish"
                                    />
                                </PaperBox>
                            </Grid.Col>
                        </Grid>
                    )}
                </Form>
            )}
        </Formik>
    );
};

export default CreateBlog;
