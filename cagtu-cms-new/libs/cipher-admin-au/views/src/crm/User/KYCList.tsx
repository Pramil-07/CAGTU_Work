import { Divider, Box, CloseButton, Grid, useMantineTheme } from '@mantine/core';
import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { Button, ErrorAlert, PaperBox, SelectField } from '@cagtu-cms/ui-shared';
import { CipherUserContext, KYCDocUnverifyResult, KYCFilterFormValueProps, getPageLimit, useDark, useDataLimit } from '@cagtu-cms/util-formatter';
import { showNotification } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useContext, useState } from 'react';
import KYCDetailModal from '../../components/common/KYCDetailModal';
import KYCListTable from './KYCListTable';
import { Form, Formik } from 'formik';
import { IconBuilding, IconCheck, IconChecklist, IconHomeCheck, IconSelector, IconX } from '@tabler/icons';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';

const urlsPath = urls?.cipher?.user?.kyc;

const filterFormInitialData: KYCFilterFormValueProps = {
    address_verified: '',
    kyc_verified: '',
    // company: '',
    // company_address_verified: '',
    // company_kyc_verified: '',
    ordering: '',
};

const KYCList = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const queryClient = useQueryClient();
    const [query, setQuery] = useState<string>('');
    const [rowId, setRowId] = useState<number | null>();
    const [page, setPage] = useState(1);
    const [kycModal, setKycModal] = useState<boolean>(false);
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');
    const [showFilter, setShowFilter] = useState(false);
    const [isFiltering, setIsFiltering] = useState(false);

    const [dark] = useDark();
    const theme = useMantineTheme();

    const [kycFilterFormData, setKycFilterFormData] = useState<KYCFilterFormValueProps>({
        ...filterFormInitialData,
    });

    const kycAPI = new CipherAPI(urlsPath?.path);
    const kycListAPI = new CipherAPI(urlsPath?.list);
    const kycDocVerifyAPI = new CipherAPI(urlsPath?.docVerify);
    const companyProfileVerifyAPI = new CipherAPI(urlsPath?.companyProfileVerify);
    const bankDetailVerifyAPI = new CipherAPI(urlsPath?.bankDetailVerify);

    const { isLoading, isError, isSuccess, data, isFetching } = useQuery(['kyc', page, limitChange, ...[filterFormInitialData]], () =>
        kycListAPI.list({ search: query, page, page_size: limitChange, ...kycFilterFormData })
    );
    const { isFetching: kycDetailLoading, data: kycData } = useQuery(['kyc-detail'], () => kycAPI.get(Number(rowId)), {
        enabled: !!rowId,
    });

    const kycAddVerifyMutation = useMutation((kycAddVerify: boolean) => kycAPI.save({ is_address_verified: kycAddVerify }, Number(rowId)), {
        onSuccess: (data) => {
            showNotification({
                title: 'Congrats! Address Verified',
                message: data.data.message,
                color: 'green',
                icon: <IconCheck size={18} />,
            });
            queryClient.invalidateQueries(['kyc-detail']);
            queryClient.invalidateQueries(['kyc', page, limitChange, ...[filterFormInitialData]])
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

    const kycAddUnverifyMutation = useMutation<any, void, { is_address_verified: boolean; comment: string }>(
        ({ is_address_verified, comment }) => kycAPI.save({ is_address_verified, comment }, Number(rowId)),
        {
            onSuccess: (data) => {
                showNotification({
                    title: 'Congrats! Comment sent successfully',
                    message: data.data.message,
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                queryClient.invalidateQueries(['kyc-detail']);
                queryClient.invalidateQueries(['kyc', page, limitChange, ...[filterFormInitialData]])
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

    const kycCompanyAddVerifyMutation = useMutation(
        (kycCompanyAddVerify: boolean) => kycAPI.save({ is_company_address_verified: kycCompanyAddVerify }, Number(rowId)),
        {
            onSuccess: (data) => {
                showNotification({
                    title: 'Congrats! Company Address Verified',
                    message: data.data.message,
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                queryClient.invalidateQueries(['kyc-detail']);
                queryClient.invalidateQueries(['kyc', page, limitChange, ...[filterFormInitialData]])
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

    const kycCompanyAddUnverifyMutation = useMutation<any, void, { is_company_address_verified: boolean; company_address_comment: string }>(
        ({ is_company_address_verified, company_address_comment }) =>
            kycAPI.save({ is_company_address_verified, company_address_comment }, Number(rowId)),
        {
            onSuccess: (data) => {
                showNotification({
                    title: 'Congrats! Comment sent Successfully',
                    message: data.data.message,
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                queryClient.invalidateQueries(['kyc-detail']);
                queryClient.invalidateQueries(['kyc', page, limitChange, ...[filterFormInitialData]])
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

    const kycDocVerifyMutation = useMutation<any, void, { is_verified: boolean; id: number }>(
        ({ is_verified, id }) => kycDocVerifyAPI.save({ is_verified: is_verified }, id),
        {
            onSuccess: (data) => {
                showNotification({
                    title: 'Congrats! KYC Document Verified',
                    message: data.data.message,
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                queryClient.invalidateQueries(['kyc-detail']);
                queryClient.invalidateQueries(['kyc', page, limitChange, ...[filterFormInitialData]])
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

    const kycDocUnVerifyMutation = useMutation<any, void, KYCDocUnverifyResult>(
        ({ is_verified, comment, id }) => kycDocVerifyAPI.save({ is_verified, comment }, id),
        {
            onSuccess: (data) => {
                showNotification({
                    title: 'Congrats! Comment sent successfully',
                    message: data.data.message,
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                queryClient.invalidateQueries(['kyc-detail']);
                queryClient.invalidateQueries(['kyc', page, limitChange, ...[filterFormInitialData]])
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

    const companyProfileVerifyMutation = useMutation<any, void, { is_profile_verified: boolean; id: number }>(
        ({ is_profile_verified, id }) => companyProfileVerifyAPI.save({ is_profile_verified: is_profile_verified }, id),
        {
            onSuccess: (data) => {
                showNotification({
                    title: 'Congrats! Company Profile Verified',
                    message: data.data.message,
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                queryClient.invalidateQueries(['kyc-detail']);
                queryClient.invalidateQueries(['kyc', page, limitChange, ...[filterFormInitialData]])
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

    const bankDetailVerifyMutation = useMutation<any, void, { is_verified: boolean; id: number }>(
        ({ is_verified, id }) => bankDetailVerifyAPI.save({ is_verified: is_verified }, id),
        {
            onSuccess: (data) => {
                showNotification({
                    title: 'Congrats! Bank Detail Verified',
                    message: data.data.message,
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                queryClient.invalidateQueries(['kyc-detail']);
                queryClient.invalidateQueries(['kyc', page, limitChange, ...[filterFormInitialData]])
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

    const onHandleSearch = (query: string) => {
        queryClient.prefetchQuery(['kyc', page, limitChange, ...[filterFormInitialData]], () =>
            kycListAPI.list({ search: query, page_size: limitChange, ...kycFilterFormData })
        );
        setQuery(query);
        setPage(1);
    };

    const handleKYCDetail = (id: number) => {
        setKycModal(true);
        setRowId(id);
    };
    const handleKycModalClose = () => {
        setKycModal(false);
        setRowId(null);
    };

    const onFilterFormClear = async () => {
        setKycFilterFormData({ ...filterFormInitialData });
        await queryClient.prefetchQuery(['kyc', page, limitChange, ...[filterFormInitialData]], () => kycListAPI.list({ page: 1, page_size: '10' }));
    };

    const onShowFilterForm = () => setShowFilter(true);
    const onShowFilterFormClose = () => {
        setShowFilter(false);
        setKycFilterFormData({ ...filterFormInitialData });
    };

    if (isError) {
        return <ErrorAlert />;
    }

    if (!is_superuser && !user_permissions?.includes('view_kyc')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            <PaperBox>
                {showFilter && (
                    <>
                        <Box
                            sx={{
                                background: dark ? theme.colors.dark['4'] : theme.colors.gray['0'],
                                borderRadius: theme.radius.sm,
                                position: 'relative',
                            }}
                            p={20}>
                            <CloseButton
                                radius="xl"
                                color="dark"
                                variant="light"
                                size="sm"
                                sx={{ position: 'absolute', top: -8, right: -8 }}
                                onClick={onShowFilterFormClose}
                            />
                            <Formik
                                initialValues={kycFilterFormData}
                                onSubmit={async (values) => {
                                    setIsFiltering(true);
                                    setKycFilterFormData({ ...values });
                                    setPage(1);
                                    await queryClient.prefetchQuery(['kyc', page, limitChange, ...[filterFormInitialData]], () =>
                                        kycListAPI.list({ ...values, page: 1, page_size: limitChange })
                                    );
                                    if (isSuccess) setIsFiltering(false);
                                }}>
                                {({ handleReset, setFieldValue, dirty }) => (
                                    <Form>
                                        <Grid mb={10}>
                                            <Grid.Col md={2}>
                                                <SelectField
                                                    name="address_verified"
                                                    placeHolder="Address verified"
                                                    options={[
                                                        { value: 'true', label: 'Yes' },
                                                        { value: 'false', label: 'No' },
                                                    ]}
                                                    handleChange={(value) => {
                                                        setFieldValue('address_verified', value);
                                                    }}
                                                    icon={<IconHomeCheck size={18} stroke={1.75} />}
                                                    clearable
                                                    style={{ marginBottom: 0 }}
                                                />
                                            </Grid.Col>
                                            <Grid.Col md={2}>
                                                <SelectField
                                                    name="kyc_verified"
                                                    placeHolder="KYC verified"
                                                    options={[
                                                        { value: 'true', label: 'Yes' },
                                                        { value: 'false', label: 'No' },
                                                    ]}
                                                    handleChange={(value) => {
                                                        setFieldValue('kyc_verified', value);
                                                    }}
                                                    icon={<IconChecklist size={18} stroke={1.75} />}
                                                    clearable
                                                    style={{ marginBottom: 0 }}
                                                />
                                            </Grid.Col>
                                            {/* <Grid.Col md={2}>
                                                <SelectField
                                                    name="company"
                                                    placeHolder="Is company"
                                                    options={[
                                                        { value: 'true', label: 'Yes' },
                                                        { value: 'false', label: 'No' },
                                                    ]}
                                                    handleChange={(value) => {
                                                        setFieldValue('company', value);
                                                    }}
                                                    icon={<IconBuilding size={18} stroke={1.75} />}
                                                    clearable
                                                    style={{ marginBottom: 0 }}
                                                />
                                            </Grid.Col>
                                            <Grid.Col md={2}>
                                                <SelectField
                                                    name="company_address_verified"
                                                    placeHolder="Company address verified"
                                                    options={[
                                                        { value: 'true', label: 'Yes' },
                                                        { value: 'false', label: 'No' },
                                                    ]}
                                                    handleChange={(value) => {
                                                        setFieldValue('company_address_verified', value);
                                                    }}
                                                    icon={<IconHomeCheck size={18} stroke={1.75} />}
                                                    clearable
                                                    style={{ marginBottom: 0 }}
                                                />
                                            </Grid.Col>
                                            <Grid.Col md={2}>
                                                <SelectField
                                                    name="company_kyc_verified"
                                                    placeHolder="Company kyc verified"
                                                    options={[
                                                        { value: 'true', label: 'Yes' },
                                                        { value: 'false', label: 'No' },
                                                    ]}
                                                    handleChange={(value) => {
                                                        setFieldValue('company_kyc_verified', value);
                                                    }}
                                                    icon={<IconChecklist size={18} stroke={1.75} />}
                                                    clearable
                                                    style={{ marginBottom: 0 }}
                                                />
                                            </Grid.Col> */}
                                            <Grid.Col md={2}>
                                                <SelectField
                                                    name="ordering"
                                                    placeHolder="Order by"
                                                    options={[
                                                        { value: 'created_at', label: 'Last to Latest' },
                                                        { value: '-created_at', label: 'Latest to Last' },
                                                    ]}
                                                    handleChange={(value) => {
                                                        setFieldValue('ordering', value);
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
                <KYCListTable
                    data={data?.data?.result}
                    page={page}
                    isLoading={isLoading}
                    isSuccess={isSuccess}
                    total={data?.data?.total_pages}
                    onSetPage={setPage}
                    onHandleSearch={onHandleSearch}
                    handleKYCDetail={handleKYCDetail}
                    limitChange={limitChange}
                    handleLimitChange={handleLimitChange}
                    onShowFilterForm={onShowFilterForm}
                    isFetching={isFetching}
                    query={query}
                />
            </PaperBox>
            <KYCDetailModal
                opened={kycModal}
                onClose={handleKycModalClose}
                title="KYC Detail"
                data={kycData?.data}
                isLoading={kycDetailLoading}
                size="xl"
                overlayBlur={3}
                overlayOpacity={0.2}
                closeOnClickOutside={false}
                handleAddVerify={kycAddVerifyMutation}
                handleAddUnverify={kycAddUnverifyMutation}
                handleCompanyAddVerify={kycCompanyAddVerifyMutation}
                handleCompanyAddUnverify={kycCompanyAddUnverifyMutation}
                handleKycDocVerify={kycDocVerifyMutation}
                handleKycDocUnverify={kycDocUnVerifyMutation}
                handleCompanyProfileVerify={companyProfileVerifyMutation}
                handleBankDetailVerify={bankDetailVerifyMutation}
            />
        </>
    );
};

export default KYCList;
