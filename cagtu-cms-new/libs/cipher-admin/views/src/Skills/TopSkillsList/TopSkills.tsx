import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { Button, CreatableInputField, ErrorAlert, FormModal, PageHeader, PaperBox, SelectInputField } from '@cagtu-cms/ui-shared';
import { CipherUserContext, TopSkillsFormValuesProps, TopSkillsResult, getPageLimit, topSkillsSchema, useDataLimit } from '@cagtu-cms/util-formatter';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Form, Formik, FormikHelpers } from 'formik';
import { useContext, useState } from 'react';
import TopSkillsTable from './TopSkillsTable';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';

const urlsPath = urls?.cipher?.topSkills;
const skillPath = urls?.cipher?.skills;

const initialFormData: TopSkillsFormValuesProps = {
    id: null,
    skills: [],
    country: '',
};

const TopSkills = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const [query, setQuery] = useState<string>('');
    const [checked, setChecked] = useState<string[]>([]);
    const queryClient = useQueryClient();
    const [formModal, setFormModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [multiDeleteModal, setMultiDeleteModal] = useState(false);
    const [rowId, setRowId] = useState<number | null>();
    const [page, setPage] = useState(1);
    const [countryOptions, setCountryOptions] = useState<{ value: string; label: string }[]>([]);
    const [skillsOptions, setSkillsOptions] = useState<{ value: string; label: string }[]>([]);
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');

    const [topSkillsFormData, setTopSkillsFormData] = useState<TopSkillsFormValuesProps>({
        ...initialFormData,
    });

    const topSkillsAPI = new CipherAPI(urlsPath?.path);
    const topSkillsMultiDeleteAPI = new CipherAPI(urlsPath?.multipleDelete);
    const countryOptionsAPI = new CipherAPI(urls?.cipher?.locale?.country?.options);

    //skills list query
    const skillsAPI = new CipherAPI(skillPath?.path);
    const { isLoading: skillsLoading } = useQuery(['skills'], () => skillsAPI.list({ page: 1, page_size: 10000 }), {
        onSuccess: (response) => {
            const filteredSkillOptions = response?.data?.result?.map((skill: { name: string }) => {
                return {
                    value: skill.name ?? '',
                    label: skill.name ?? '',
                };
            });
            setSkillsOptions(filteredSkillOptions);
        },
        enabled: formModal,
    });

    const { isLoading, isError, isSuccess, data, isFetching } = useQuery(['top-skills', page, limitChange], () =>
        topSkillsAPI.list({ search: query, page, page_size: limitChange })
    );

    const topSkillsMutation = useMutation((data: TopSkillsFormValuesProps) => topSkillsAPI.store(data, Number(rowId)));

    // Fetch the country list from the API
    useQuery(['country-options'], () => countryOptionsAPI.list(), {
        onSuccess: (data) => {
            const options = data?.data.map(({ code, name }: { code: string; name: string }) => {
                return {
                    value: code,
                    label: name,
                };
            });
            setCountryOptions(options);
        },
    });

    const pageToFecth = data?.data?.result.length <= 1 ? page - 1 : page;
    const pageToFetchMultiple = data?.data?.result.length <= checked.length ? page - 1 : page;

    const topSkillsMultiDeleteMutation = useMutation((checkedIds: string[]) => topSkillsMultiDeleteAPI.store({ pk: checkedIds }), {
        onSuccess: (data) => {
            if (data.data?.status === 'failure') {
                setMultiDeleteModal(false);
                showNotification({
                    title: 'Uh oh! something went wrong',
                    message: data.data?.message,
                    color: 'red',
                    icon: <IconX size={18} />,
                });
            } else {
                setMultiDeleteModal(false);
                setChecked([]);
                showNotification({
                    title: 'Congrats! Top Skills Deleted',
                    message: data.data?.message,
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                const pageToSet = pageToFetchMultiple < 1 ? 1 : pageToFetchMultiple;
                if (pageToSet === page) queryClient.invalidateQueries(['top-skills', pageToSet, limitChange]);
                else setPage(pageToSet);
            }
        },
        onError: (error: any) => {
            const {
                data: { message },
            } = error.response;
            setMultiDeleteModal(false);
            showNotification({
                title: 'Uh oh! something went wrong',
                message: message ?? 'Sorry! There was a problem with your request.',
                color: 'red',
                icon: <IconX size={18} />,
            });
        },
    });

    const topSkillsDeleteMutation = useMutation((id: number) => topSkillsAPI.delete(id), {
        onSuccess: (data) => {
            if (data.data?.status === 'failure') {
                setDeleteModal(false);
                setRowId(null);
                showNotification({
                    title: 'Uh oh! something went wrong',
                    message: data.data?.message,
                    color: 'red',
                    icon: <IconX size={18} />,
                });
            } else {
                setDeleteModal(false);
                setRowId(null);
                showNotification({
                    title: 'Congrats! Top Skills Deleted',
                    message: data.data?.message,
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                if (pageToSet === page) queryClient.invalidateQueries(['top-skills', pageToSet, limitChange]);
                else setPage(pageToSet);
            }
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

    const onCreateTopSkills = (data: TopSkillsFormValuesProps, actions: FormikHelpers<TopSkillsFormValuesProps>) => {
        topSkillsMutation.mutate(data, {
            onSuccess: (data) => {
                if (data.data.status === 'failure') {
                    setFormModal(false);
                    setRowId(null);
                    showNotification({
                        title: 'Uh oh! something went wrong',
                        message: data.data.message.title[0],
                        color: 'red',
                        icon: <IconX size={18} />,
                    });
                } else {
                    actions.resetForm();
                    setFormModal(false);
                    setRowId(null);
                    showNotification({
                        title: `Congrats! Top Skills ${rowId ? 'Updated' : 'Created'}`,
                        message: rowId
                            ? data.data.message ?? 'Top skills updated successfully'
                            : data.data.message ?? 'Top skills created successfully',
                        color: 'green',
                        icon: <IconCheck size={18} />,
                    });
                    const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                    if (pageToSet === page) queryClient.invalidateQueries(['top-skills', pageToSet, limitChange]);
                    else setPage(pageToSet);
                }
            },
            onError: (error: any) => {
                const {
                    data: { message, skills, country },
                } = error.response;
                actions.setFieldError('skills', skills && skills[0]);
                actions.setFieldError('country', country && country[0]);
                showNotification({
                    title: 'Uh oh! something went wrong',
                    message: message ?? 'Sorry! There was a problem with your request.',
                    color: 'red',
                    icon: <IconX size={18} />,
                });
            },
        });
    };

    const onHandleSearch = (query: string) => {
        queryClient.prefetchQuery(['top-skills', page, limitChange], () => topSkillsAPI.list({ search: query, page_size: limitChange }));
        setQuery(query);
        setPage(1);
    };

    const onSelectAll = () => {
        const isSelectAll = isAllCheckboxSelected();
        if (isSelectAll) {
            setChecked([]);
        } else {
            const checkedRowId = data?.data?.result.map((topSkill: TopSkillsResult) => String(topSkill.id));
            setChecked(checkedRowId);
        }
    };

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

    const isAllCheckboxSelected = () => {
        const checkedRowId = data?.data?.result.map((topSkill: TopSkillsResult) => String(topSkill.id));
        const isAllSelected = checkedRowId.every((id: number) => checked.includes(String(id)));
        return isAllSelected;
    };

    const handleSingleDelete = (id: number) => {
        setDeleteModal(true);
        setRowId(id);
    };

    const handleCloseModal = () => {
        if (!topSkillsDeleteMutation.isLoading) {
            setDeleteModal(false);
            setRowId(null);
        }
    };

    const handleMultiDeleteCloseModal = () => {
        if (!topSkillsMultiDeleteMutation.isLoading) {
            setMultiDeleteModal(false);
        }
    };

    const handleFormClose = () => {
        if (!topSkillsMutation.isLoading) {
            setFormModal(false);
            setRowId(null);
            setTopSkillsFormData({
                ...initialFormData,
            });
        }
    };

    const handleFormModal = () => {
        setFormModal(true);
        setRowId(null);
    };

    const handleFormModalEdit = (object: TopSkillsResult) => {
        setTopSkillsFormData(mapToViewModal(object));
        setFormModal(true);
        setRowId(object?.id);
    };

    const mapToViewModal = (value: TopSkillsResult) => {
        // setSkillsOptions(JSON.parse(String(value.skills)));
        return {
            id: null,
            skills: JSON.parse(String(value.skills)),
            country: value?.country?.code,
        };
    };

    if (isError) {
        return <ErrorAlert />;
    }

    if (!is_superuser && !user_permissions?.includes('view_topskill')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            <PageHeader pageTitle="Top Skills">
                {(is_superuser || user_permissions?.includes('add_topskill')) && <Button onClick={handleFormModal} name="Create" />}
            </PageHeader>
            <PaperBox>
                <TopSkillsTable
                    data={data?.data?.result}
                    page={page}
                    checked={checked}
                    isLoading={isLoading}
                    isSuccess={isSuccess}
                    total={data?.data?.total_pages}
                    isDeleteModalOpened={deleteModal}
                    isMultiDeleteModalOpened={multiDeleteModal}
                    isSingleDeleteMutationLoading={topSkillsDeleteMutation.isLoading}
                    isMultiDeleteMutationLoading={topSkillsMultiDeleteMutation.isLoading}
                    isAllCheckboxSelected={isAllCheckboxSelected}
                    isCheckboxSelect={isCheckboxSelect as unknown as undefined}
                    handleSelect={handleSelect as unknown as undefined}
                    handleSingleDelete={handleSingleDelete}
                    onSelectAll={onSelectAll}
                    onSetPage={setPage}
                    onClickDeleteAll={() => setMultiDeleteModal(true)}
                    onConfirmSingleDelete={() => topSkillsDeleteMutation.mutate(Number(rowId))}
                    onConfirmMultiDelete={() => topSkillsMultiDeleteMutation.mutate(checked)}
                    handleSingleDeleteCloseModal={handleCloseModal}
                    handleMultiDeleteCloseModal={handleMultiDeleteCloseModal}
                    onHandleSearch={onHandleSearch}
                    handleFormModalEdit={handleFormModalEdit}
                    limitChange={limitChange}
                    handleLimitChange={handleLimitChange}
                    isFetching={isFetching}
                    query={query}
                />
            </PaperBox>
            <Formik
                enableReinitialize
                initialValues={topSkillsFormData}
                validationSchema={topSkillsSchema}
                onSubmit={(values, actions) => {
                    const dataToSend = {
                        ...JSON.parse(JSON.stringify(values)),
                        skills: JSON.stringify(values.skills),
                    };
                    onCreateTopSkills(dataToSend, actions);
                }}>
                {({ errors, touched, handleSubmit, handleReset, values, setFieldValue }) => (
                    <FormModal
                        opened={formModal}
                        onClose={() => {
                            if (!topSkillsMutation.isLoading) {
                                handleReset();
                            }
                            handleFormClose();
                        }}
                        title={`${rowId ? 'Edit Top Skills' : 'Add Top Skills'}`}
                        onConfirm={handleSubmit}
                        confirmButtonText={`${rowId ? 'Save' : 'Add'}`}
                        loading={topSkillsMutation.isLoading}>
                        <Form>
                            <CreatableInputField
                                name="skills"
                                options={skillsOptions}
                                labelName="Skills"
                                placeHolder="e.g. Doctor, Engineer, Nurse"
                                error={errors.skills as string}
                                touch={touched.skills}
                                value={values.skills}
                                onChange={(value) => setFieldValue('skills', value)}
                                handleCreate={(query) => {
                                    const newItem = { value: query, label: query };
                                    setSkillsOptions((prev) => [...prev, newItem]);
                                    setFieldValue('skills', skillsOptions);
                                    return newItem;
                                }}
                                handleCreateLabel={(value) => `+ Create ${value}`}
                                withAsterisk
                            />
                            <SelectInputField
                                name="country"
                                labelName="Country"
                                placeHolder="e.g. Nepal/Australia"
                                error={errors.country}
                                touch={touched.country}
                                options={countryOptions}
                                handleChange={(value) => {
                                    setFieldValue('country', value);
                                }}
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

export default TopSkills;
