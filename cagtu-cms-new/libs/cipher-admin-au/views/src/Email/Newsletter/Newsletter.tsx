import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { Button, ErrorAlert, FormModal, PageHeader, PaperBox, SelectField } from '@cagtu-cms/ui-shared';
import { CipherUserContext, getPageLimit, stringReqOnly, useDataLimit } from '@cagtu-cms/util-formatter';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Form, Formik, FormikHelpers } from 'formik';
import { useContext, useState } from 'react';
import NewsletterTable from './NewsletterTable';
import * as Yup from 'yup';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';

const urlsPath = urls?.cipher?.email?.newsletter;
const urlsSendEmailPath = urls?.cipher?.email?.send;
const urlsEmailTempOptionsPath = urls?.cipher?.email?.template;

const Newsletter = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const queryClient = useQueryClient();
    const [query, setQuery] = useState<string>('');
    const [formModal, setFormModal] = useState(false);
    const [emailTempOptions, setEmailTeampOptions] = useState<{ value: string; label: string }[]>([]);
    const [page, setPage] = useState(1);
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');

    const newsletterAPI = new CipherAPI(urlsPath?.path);
    const sendEmailAPI = new CipherAPI(`${urlsSendEmailPath?.path}`);
    const emailTempOptionsAPI = new CipherAPI(urlsEmailTempOptionsPath?.path);

    const { isLoading, isError, isSuccess, data, isFetching } = useQuery(['newsletter', page, limitChange], () =>
        newsletterAPI.list({ search: query, page, page_size: limitChange })
    );

    // Email Template Options
    useQuery(['emailT-template-options'], () => emailTempOptionsAPI.list({ page: -1 }), {
        onSuccess: (data) => {
            const options = data?.data.map(({ id, name }: { id: number; name: string }) => {
                return {
                    value: String(id),
                    label: `${name}`,
                };
            });
            setEmailTeampOptions(options);
        },
    });

    const emailTempMutation = useMutation(({ template }: { template: number }) => sendEmailAPI.store({ template }));

    const onSendEmail = (template: number, actions: FormikHelpers<{ template: string }>) => {
        emailTempMutation.mutate(
            { template },
            {
                onSuccess: (data) => {
                    if (data.data.status === 'failure') {
                        setFormModal(false);
                        showNotification({
                            title: 'Uh oh! something went wrong',
                            message: data.data.message.title[0],
                            color: 'red',
                            icon: <IconX size={18} />,
                        });
                    } else {
                        actions.resetForm();
                        setFormModal(false);
                        showNotification({
                            title: 'Congrats! Email Sent',
                            message: data.data.message ?? 'Email sent successfully',
                            color: 'green',
                            icon: <IconCheck size={18} />,
                        });
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
            }
        );
    };

    const onHandleSearch = (query: string) => {
        queryClient.prefetchQuery(['newsletter', page, limitChange], () => newsletterAPI.list({ search: query, page_size: limitChange }));
    };

    const handleFormClose = () => {
        if (!emailTempMutation.isLoading) setFormModal(false);
    };

    const handleFormModal = () => setFormModal(true);

    if (isError) {
        return <ErrorAlert />;
    }

    if (!is_superuser && !user_permissions?.includes('view_newsletter')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            <PageHeader pageTitle="Newsletter">
                {(is_superuser || user_permissions?.includes('add_newsletter')) && <Button onClick={handleFormModal} name="Send Email" />}
            </PageHeader>
            <PaperBox>
                <NewsletterTable
                    data={data?.data?.result}
                    page={page}
                    isLoading={isLoading}
                    isSuccess={isSuccess}
                    total={data?.data?.total_pages}
                    onSetPage={setPage}
                    onHandleSearch={onHandleSearch}
                    limitChange={limitChange}
                    handleLimitChange={handleLimitChange}
                    isFetching={isFetching}
                    query={query}
                />
            </PaperBox>
            <Formik
                enableReinitialize
                initialValues={{ template: '' }}
                validationSchema={Yup.object().shape({
                    template: stringReqOnly,
                })}
                onSubmit={(values, actions) => {
                    onSendEmail(Number(values?.template), actions);
                }}>
                {({ errors, touched, handleSubmit, handleReset, setFieldValue }) => (
                    <FormModal
                        opened={formModal}
                        onClose={() => {
                            if (!emailTempMutation.isLoading) {
                                handleReset();
                            }
                            handleFormClose();
                        }}
                        title="Send Email"
                        onConfirm={handleSubmit}
                        confirmButtonText="Send"
                        loading={emailTempMutation.isLoading}>
                        <Form>
                            <SelectField
                                name="template"
                                labelName="Email Template"
                                placeHolder="Select email template"
                                error={errors.template}
                                touch={touched.template}
                                options={emailTempOptions}
                                handleChange={(value) => setFieldValue('template', value)}
                                searchable
                                clearable
                                withAsterisk
                            />
                        </Form>
                    </FormModal>
                )}
            </Formik>
        </>
    );
};

export default Newsletter;
