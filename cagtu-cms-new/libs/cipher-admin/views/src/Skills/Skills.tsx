import { Button, ErrorAlert, FormModal, InputField, PageHeader, PaperBox } from '@cagtu-cms/ui-shared';
import { CipherUserContext, SkillsFormValuesProps, getPageLimit, skillsSchema, useDataLimit } from '@cagtu-cms/util-formatter';
import { useContext, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CipherAPI, urls } from '@cagtu-cms/data-access';
import BlockedPageMessage from '../components/common/BlockedPageMessage';
import SkillsTable from './SkillsTable';
import { Form, Formik, FormikHelpers } from 'formik';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons';

const initialFormData: SkillsFormValuesProps = {
    name: '',
};

const urlsPath = urls?.cipher?.skills;

const Skills = () => {
    const queryClient = useQueryClient();
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const [formModal, setFormModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [rowId, setRowId] = useState<number | null>();
    const [query, setQuery] = useState<string>('');
    const [page, setPage] = useState(1);
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');
    const [skillsFormData, setSkillsFormData] = useState<SkillsFormValuesProps>({
        ...initialFormData,
    });

    //skills list query
    const skillsAPI = new CipherAPI(urlsPath?.path);

    const { isLoading, isError, isSuccess, data, isFetching } = useQuery(['skills', page, limitChange], () =>
        skillsAPI.list({ search: query, page, page_size: limitChange })
    );

    const pageToFecth = data?.data?.result?.length <= 1 ? page - 1 : page;

    const skillsMutation = useMutation((data: SkillsFormValuesProps) => skillsAPI.store(data, Number(rowId)));
    const onCreateTopSkills = (data: SkillsFormValuesProps, actions: FormikHelpers<SkillsFormValuesProps>) => {
        skillsMutation.mutate(data, {
            onSuccess: (data) => {
                actions.resetForm();
                setFormModal(false);
                setRowId(null);
                showNotification({
                    title: `Congrats! New Skill is Created`,
                    message: data.data.message ?? 'New skill created successfully',
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });

                const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                if (pageToSet === page) queryClient.invalidateQueries(['skills', pageToSet, limitChange]);
                else setPage(pageToSet);
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

    //skill search function
    const onHandleSearch = (query: string) => {
        queryClient.prefetchQuery(['skills', page, limitChange], () => skillsAPI.list({ search: query, page_size: limitChange }));
        setQuery(query);
        setPage(1);
    };

    const handleFormModal = () => {
        setFormModal(true);
    };

    const handleFormClose = () => {
        if (!skillsMutation.isLoading) {
            setFormModal(false);
            setRowId(null);
            setSkillsFormData({
                ...initialFormData,
            });
        }
    };

    const skillsDeleteMutation = useMutation((id: number) => skillsAPI.delete(id), {
        onSuccess: (data) => {
            setDeleteModal(false);
            setRowId(null);
            showNotification({
                title: 'Congrats! Skill Deleted',
                message: data?.data?.message ?? '',
                color: 'green',
                icon: <IconCheck size={18} />,
            });
            const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
            if (pageToSet === page) queryClient.invalidateQueries(['skills', pageToSet, limitChange]);
            else setPage(pageToSet);
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
                icon: <IconX size={18} />,
            });
        },
    });

    const handleSingleDelete = (id: number) => {
        setDeleteModal(true);
        setRowId(id);
    };

    const handleCloseModal = () => {
        if (!skillsDeleteMutation.isLoading) {
            setDeleteModal(false);
            setRowId(null);
        }
    };

    if (isError) {
        return <ErrorAlert />;
    }

    if (!is_superuser && !user_permissions?.includes('view_skill')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            <PageHeader pageTitle="Skills">
                {(is_superuser || user_permissions?.includes('add_skill')) && <Button onClick={handleFormModal} name="Create" />}
            </PageHeader>
            <PaperBox>
                <SkillsTable
                    isFetching={isFetching}
                    isLoading={isLoading}
                    data={data?.data?.result}
                    total={data?.data?.total_pages}
                    isSuccess={isSuccess}
                    onSetPage={setPage}
                    page={page}
                    limitChange={limitChange}
                    handleLimitChange={handleLimitChange}
                    query={query}
                    onHandleSearch={onHandleSearch}
                    handleSingleDelete={handleSingleDelete}
                    isDeleteModalOpened={deleteModal}
                    handleSingleDeleteCloseModal={handleCloseModal}
                    isSingleDeleteMutationLoading={skillsDeleteMutation.isLoading}
                    onConfirmSingleDelete={() => skillsDeleteMutation.mutate(Number(rowId))}
                />
            </PaperBox>
            <Formik
                enableReinitialize
                initialValues={skillsFormData}
                validationSchema={skillsSchema}
                onSubmit={(values, actions) => {
                    const dataToSend = {
                        ...JSON.parse(JSON.stringify(values)),
                    };
                    onCreateTopSkills(dataToSend, actions);
                }}>
                {({ errors, touched, handleSubmit, handleReset }) => (
                    <FormModal
                        opened={formModal}
                        onClose={() => {
                            if (!skillsMutation.isLoading) {
                                handleReset();
                            }
                            handleFormClose();
                        }}
                        title={'Add Skill'}
                        onConfirm={handleSubmit}
                        confirmButtonText={'Add'}
                        loading={skillsMutation.isLoading}>
                        <Form>
                            <InputField
                                placeHolder="Enter New Skill eg: House Keeping, Gardening"
                                name={'name'}
                                error={errors?.name}
                                touch={touched?.name}
                            />
                        </Form>
                    </FormModal>
                )}
            </Formik>
        </>
    );
};

export default Skills;
