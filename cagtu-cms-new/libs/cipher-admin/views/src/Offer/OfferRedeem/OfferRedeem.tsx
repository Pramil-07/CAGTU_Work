import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { Button, DateField, ErrorAlert, PageHeader, PaperBox, SelectField, SelectInputField } from '@cagtu-cms/ui-shared';
import { CipherUserContext, getFormatedDate, getPageLimit, OfferRedeemFilterFormValuesProps, useDark, useDataLimit } from '@cagtu-cms/util-formatter';
import { Box, CloseButton, Divider, Grid, Loader, useMantineTheme } from '@mantine/core';
import { IconCalendarDue, IconCornerUpRightDouble, IconSelector, IconStatusChange, IconUser } from '@tabler/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Form, Formik } from 'formik';
import { useContext, useState } from 'react';
import OfferRedeemTable from './OfferRedeemTable';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';

const urlsPath = urls?.cipher?.offer?.redeem;
const urlsUserPath = urls?.cipher?.user;

const filterFormInitialData: OfferRedeemFilterFormValuesProps = {
    redeem_by: '',
    redeem_date: '',
    ordering: '',
    is_active: '',
    is_redeemed: '',
};

const OfferRedeem = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const queryClient = useQueryClient();
    const [query, setQuery] = useState<string>('');
    const [page, setPage] = useState(1);
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');
    const [showFilter, setShowFilter] = useState(false);
    const [isFiltering, setIsFiltering] = useState(false);
    const [searchRedeemBy, setSearchRedeemBy] = useState<string>(''); // Read the value from user select field after values enter i.e; more than 3 letter
    const [redeemByOptions, setRedeemByOptions] = useState<{ value: string; label: string }[]>([]);

    const [dark] = useDark();
    const theme = useMantineTheme();

    const [offerRedeemFilterFormData, setOfferRedeemFilterFormData] = useState<OfferRedeemFilterFormValuesProps>({
        ...filterFormInitialData,
    });

    const offerRedeemAPI = new CipherAPI(urlsPath?.path);
    const userOptionsAPI = new CipherAPI(urlsUserPath?.path);

    const { isLoading, isError, isSuccess, data, isFetching } = useQuery(['offer-redeem', page, limitChange, ...[filterFormInitialData]], () =>
        offerRedeemAPI.list({
            search: query,
            page,
            page_size: limitChange,
            ...offerRedeemFilterFormData,
        })
    );

    const onHandleSearch = (query: string) => {
        queryClient.prefetchQuery(['offer-redeem', page, limitChange, ...[filterFormInitialData]], () =>
            offerRedeemAPI.list({
                search: query,
                page_size: limitChange,
                ...offerRedeemFilterFormData,
            })
        );
        setQuery(query);
        setPage(1);
    };

    // Fetch the user list from the API as the per user keywords request
    const { isFetching: isUserFetching } = useQuery(['redeemby-options'], () => userOptionsAPI.list({ page: -1, search: searchRedeemBy }), {
        enabled: !!searchRedeemBy,
        onSuccess: (data) => {
            const options = data?.data.map(({ id, username }: { id: number; username: string }) => {
                return {
                    value: String(id),
                    label: `${username}`,
                };
            });
            setRedeemByOptions(options);
        },
    });

    const onFilterFormClear = async () => {
        setOfferRedeemFilterFormData({ ...filterFormInitialData });
        await queryClient.prefetchQuery(['offer-redeem', page, limitChange, ...[filterFormInitialData]], () =>
            offerRedeemAPI.list({
                page: 1,
                page_size: '10',
            })
        );
    };

    const onShowFilterForm = () => setShowFilter(true);
    const onShowFilterFormClose = () => {
        setShowFilter(false);
        setOfferRedeemFilterFormData({ ...filterFormInitialData });
    };

    if (isError) {
        return <ErrorAlert />;
    }

    if (!is_superuser && !user_permissions?.includes('view_offerredeem')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            <PageHeader pageTitle="Offer Redeemption" />
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
                                initialValues={offerRedeemFilterFormData}
                                onSubmit={async (values) => {
                                    const dataToSend = {
                                        ...JSON.parse(JSON.stringify(values)),
                                        redeem_date: values?.redeem_date ? getFormatedDate(new Date(values?.redeem_date)) : '',
                                    };
                                    delete dataToSend.date_range;

                                    setIsFiltering(true);
                                    setOfferRedeemFilterFormData({ ...dataToSend });
                                    setPage(1);
                                    await queryClient.prefetchQuery(
                                        ['offer-redeem', page, limitChange, ...[filterFormInitialData]],
                                        () =>
                                            offerRedeemAPI.list({
                                                ...dataToSend,
                                                page: 1,
                                                page_size: limitChange,
                                            }),
                                        {}
                                    );
                                    if (isSuccess) setIsFiltering(false);
                                }}>
                                {({ handleReset, setFieldValue, dirty }) => (
                                    <Form>
                                        <Grid mb={10}>
                                            <Grid.Col md={2}>
                                                <DateField
                                                    name="end_date"
                                                    placeHolder="Select end date"
                                                    icon={<IconCalendarDue size={18} stroke={1.75} />}
                                                    handleChange={(value) => setFieldValue('end_date', value)}
                                                    style={{ marginBottom: 0 }}
                                                />
                                            </Grid.Col>
                                            <Grid.Col md={2}>
                                                <SelectInputField
                                                    name="redeem_by"
                                                    placeHolder="Search redeem by"
                                                    options={redeemByOptions}
                                                    handleChange={(value) => setFieldValue('redeem_by', value)}
                                                    onSearchChange={(value) => {
                                                        if (value && value.length >= 3) {
                                                            setSearchRedeemBy(value);
                                                        } else {
                                                            setSearchRedeemBy('');
                                                        }
                                                    }}
                                                    rightSection={isUserFetching && <Loader size="xs" />}
                                                    icon={<IconUser size={18} stroke={1.75} />}
                                                    searchable
                                                    clearable
                                                    withAsterisk
                                                    style={{ marginBottom: 0 }}
                                                />
                                            </Grid.Col>
                                            <Grid.Col md={2}>
                                                <SelectField
                                                    name="is_redeemed"
                                                    placeHolder="Select redeemed"
                                                    options={[
                                                        { value: 'true', label: 'Yes' },
                                                        { value: 'false', label: 'No' },
                                                    ]}
                                                    handleChange={(value) => {
                                                        setFieldValue('is_redeemed', value);
                                                    }}
                                                    icon={<IconCornerUpRightDouble size={18} stroke={1.75} />}
                                                    clearable
                                                    style={{ marginBottom: 0 }}
                                                />
                                            </Grid.Col>
                                            <Grid.Col md={2}>
                                                <SelectField
                                                    name="is_active"
                                                    placeHolder="Select status"
                                                    options={[
                                                        { value: 'true', label: 'Yes' },
                                                        { value: 'false', label: 'No' },
                                                    ]}
                                                    handleChange={(value) => {
                                                        setFieldValue('is_active', value);
                                                    }}
                                                    icon={<IconStatusChange size={18} stroke={1.75} />}
                                                    clearable
                                                    style={{ marginBottom: 0 }}
                                                />
                                            </Grid.Col>
                                            <Grid.Col md={2}>
                                                <SelectField
                                                    name="ordering"
                                                    placeHolder="Sort by"
                                                    options={[
                                                        { value: 'redeem_date', label: 'Last to Latest' },
                                                        { value: '-redeem_date', label: 'Latest to Last' },
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
                <OfferRedeemTable
                    data={data?.data?.result}
                    page={page}
                    isLoading={isLoading}
                    isSuccess={isSuccess}
                    total={data?.data?.total_pages}
                    onSetPage={setPage}
                    onHandleSearch={onHandleSearch}
                    limitChange={limitChange}
                    handleLimitChange={handleLimitChange}
                    onShowFilterForm={onShowFilterForm}
                    isfetching={isFetching}
                    query={query}
                />
            </PaperBox>
        </>
    );
};

export default OfferRedeem;
