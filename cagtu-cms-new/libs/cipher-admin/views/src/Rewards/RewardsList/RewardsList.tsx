import { Button, InputField, PageHeader, PaperBox, SelectField } from '@cagtu-cms/ui-shared';
import RewardsListTable from './RewardsListTable';
import { CipherUserContext, RewardsListFilterFormValuesProps, getPageLimit, useDark, useDataLimit } from '@cagtu-cms/util-formatter';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';
import { useContext, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { Box, CloseButton, Divider, Grid, useMantineTheme } from '@mantine/core';
import { Form, Formik } from 'formik';

const filterFormInitialData: RewardsListFilterFormValuesProps = {
    created_at_after: null,
    created_at_before: null,
    points_max: '',
    points_min: '',
    status: '',
};

const urlsPath = urls?.cipher?.rewards;

const RewardaList = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const [dark] = useDark();
    const theme = useMantineTheme();
    const queryClient = useQueryClient();
    const [query, setQuery] = useState<string>('');
    const [page, setPage] = useState(1);
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');
    const [showFilter, setShowFilter] = useState(false);
    const [isFiltering, setIsFiltering] = useState(false);
    const [rewardsListFilterFormData, setRewardsListFilterFormData] = useState<RewardsListFilterFormValuesProps>({
        ...filterFormInitialData,
    });

    // Rewards list get api
    const rewardsListAPI = new CipherAPI(urlsPath?.list);
    const {
        isLoading,
        isFetching,
        isSuccess,
        data: rewardsListData,
    } = useQuery(['rewards-list', page, limitChange, ...[rewardsListFilterFormData]], () =>
        rewardsListAPI.list({ search: query, page, page_size: limitChange, ...rewardsListFilterFormData })
    );

    //Rewards list search function
    const onHandleSearch = (query: string) => {
        queryClient.prefetchQuery(['rewards-list', page, limitChange, ...[rewardsListFilterFormData]], () =>
            rewardsListAPI.list({ search: query, page_size: limitChange, ...rewardsListFilterFormData })
        );
        setQuery(query);
        setPage(1);
    };

    //Rewards list filter form open function
    const onShowFilterForm = () => setShowFilter(true);

    //Rewards list filter clear function
    const onShowFilterFormClose = () => {
        setShowFilter(false);
        setRewardsListFilterFormData({ ...filterFormInitialData });
    };

    const onFilterFormClear = async () => {
        setRewardsListFilterFormData({ ...filterFormInitialData });
        await queryClient.prefetchQuery(['rewards-list', page, limitChange, ...[filterFormInitialData]], () =>
            rewardsListAPI.list({ search: query, page: 1, page_size: '10', ...filterFormInitialData })
        );
    };

    if (!is_superuser && !user_permissions?.includes('view_reward')) {
        return <BlockedPageMessage />;
    }
    return (
        <>
            <PageHeader pageTitle="Rewards List" />
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
                                initialValues={rewardsListFilterFormData}
                                onSubmit={async (values) => {
                                    const dataToSend: RewardsListFilterFormValuesProps = {
                                        ...values,
                                    };
                                    setIsFiltering(true);
                                    setRewardsListFilterFormData({ ...dataToSend });
                                    setPage(1);
                                    await queryClient.prefetchQuery(['rewards-list', page, limitChange, ...[dataToSend]], () =>
                                        rewardsListAPI.list({ search: query, page: 1, page_size: limitChange, ...dataToSend })
                                    );
                                    if (isSuccess) setIsFiltering(false);
                                }}>
                                {({ handleReset, setFieldValue, dirty, values }) => (
                                    <Form>
                                        <Grid mb={10}>
                                            <Grid.Col md={2}>
                                                <InputField
                                                    name="point_min"
                                                    placeHolder="Enter minimum point"
                                                    value={values?.points_min}
                                                    onChange={(e) => {
                                                        setFieldValue('points_min', e.target.value);
                                                    }}
                                                />
                                            </Grid.Col>
                                            <Grid.Col md={2}>
                                                <InputField
                                                    value={values?.points_max}
                                                    name="point_max"
                                                    placeHolder="Enter maximum point"
                                                    onChange={(e) => {
                                                        setFieldValue('points_max', e.target.value);
                                                    }}
                                                />
                                            </Grid.Col>
                                            <Grid.Col md={2}>
                                                <SelectField
                                                    name="status"
                                                    placeHolder="Select status"
                                                    options={[
                                                        {
                                                            value: 'earned',
                                                            label: 'Earned',
                                                        },
                                                        {
                                                            value: 'spent',
                                                            label: 'Spent',
                                                        },
                                                    ]}
                                                    handleChange={(value) => setFieldValue('status', value)}
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
                <RewardsListTable
                    data={rewardsListData?.data?.result}
                    page={page}
                    onSetPage={setPage}
                    limitChange={limitChange}
                    handleLimitChange={handleLimitChange}
                    query={query}
                    isLoading={isLoading}
                    isFetching={isFetching}
                    isSuccess={isSuccess}
                    onHandleSearch={onHandleSearch}
                    total={rewardsListData?.data?.total_pages}
                    onShowFilterForm={onShowFilterForm}
                />
            </PaperBox>
        </>
    );
};

export default RewardaList;
