import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { Button, DateRangeField, ErrorAlert, PaperBox, SelectField } from '@cagtu-cms/ui-shared';
import {
    CipherUserContext,
    converDateFromIsonString,
    getFormatedDate,
    getPageLimit,
    useDark,
    useDataLimit,
    useIconColorMode,
    UserHistoryFilterFormValueProps,
    UserHistoryResult,
} from '@cagtu-cms/util-formatter';
import { Avatar, Box, CloseButton, Divider, Grid, Group, Loader, Modal, Text, Title, useMantineTheme } from '@mantine/core';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Form, Formik } from 'formik';
import { useContext, useState } from 'react';
import * as _ from 'lodash';
import HistoryTable from './HistoryTable';
import { IconCalendar, IconMail, IconPhone, IconSelector, IconUser } from '@tabler/icons';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';

const urlsPath = urls?.cipher?.user?.history;
const urlsUserPath = urls?.cipher?.user;

const filterFormInitialData: UserHistoryFilterFormValueProps = {
    created_range: '',
    start_date: '',
    end_date: '',
    ordering: '',
    user: '',
};

const Report = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const queryClient = useQueryClient();
    const [query, setQuery] = useState<string>('');
    const [page, setPage] = useState(1);
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');
    const [userOptions, setUserOptions] = useState<{ value: string; label: string }[]>([]);
    const [historyModal, setHistoryModal] = useState<boolean>(false);
    const [historyDetail, setHistoryDetail] = useState<UserHistoryResult | null | undefined>();
    const [searchUser, setSearchUser] = useState<string>(''); // Read the value from user select field after values enter i.e; more than 3 letter
    const [showFilter, setShowFilter] = useState(false);
    const [isFiltering, setIsFiltering] = useState(false);

    const [dark] = useDark();
    const theme = useMantineTheme();
    const [iconColorMode] = useIconColorMode();

    const [historyFilterFormData, setHistoryFilterFormData] = useState<UserHistoryFilterFormValueProps>({
        ...filterFormInitialData,
    });

    const historyAPI = new CipherAPI(urlsPath?.path);
    const userOptionsAPI = new CipherAPI(urlsUserPath?.path);

    const { isLoading, isError, isSuccess, data, isFetching } = useQuery(['deactivate-history', page, limitChange, ...[filterFormInitialData]], () =>
        historyAPI.list({ search: query, page, page_size: limitChange, ...historyFilterFormData })
    );

    // User Options
    const { isFetching: isUserFetching } = useQuery(['user-options'], () => userOptionsAPI.list({ page: -1, search: searchUser }), {
        enabled: !!searchUser,
        onSuccess: (data) => {
            const options = data?.data.map(({ id, username }: { id: number; username: string }) => {
                return {
                    value: String(id),
                    label: `${username}`,
                };
            });
            setUserOptions(options);
        },
    });

    const onHandleSearch = (query: string) => {
        queryClient.prefetchQuery(['deactivate-history', page, limitChange, ...[filterFormInitialData]], () =>
            historyAPI.list({ search: query, page_size: limitChange, ...historyFilterFormData })
        );
        setQuery(query);
        setPage(1);
    };

    const handleDetail = (object: UserHistoryResult) => {
        setHistoryModal(true);
        setHistoryDetail(object);
    };

    const handleReportModalClose = () => {
        setHistoryModal(false);
        setHistoryDetail(null);
    };

    const onFilterFormClear = async () => {
        setHistoryFilterFormData({ ...filterFormInitialData });
        await queryClient.prefetchQuery(['deactivate-history', page, limitChange, ...[filterFormInitialData]], () =>
            historyAPI.list({ page: 1, page_size: '10' })
        );
    };

    const onShowFilterForm = () => setShowFilter(true);
    const onShowFilterFormClose = () => {
        setShowFilter(false);
        setHistoryFilterFormData({ ...filterFormInitialData });
    };

    if (isError) {
        return <ErrorAlert />;
    }

    if (!is_superuser && !user_permissions?.includes('view_deactivatehistory')) {
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
                                initialValues={historyFilterFormData}
                                onSubmit={async (values) => {
                                    const dataToSend = {
                                        ...JSON.parse(JSON.stringify(values)),
                                        start_date: values?.start_date ? getFormatedDate(new Date(values?.start_date)) : '',
                                        end_date: values?.end_date ? getFormatedDate(new Date(values?.end_date)) : '',
                                    };

                                    delete dataToSend.created_range;

                                    setIsFiltering(true);
                                    setHistoryFilterFormData({ ...dataToSend });
                                    setPage(1);
                                    await queryClient.prefetchQuery(
                                        ['deactivate-history', page, limitChange, ...[filterFormInitialData]],
                                        () =>
                                            historyAPI.list({
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
                                                <DateRangeField
                                                    name="created_range"
                                                    placeHolder="Select date range"
                                                    icon={<IconCalendar size={18} stroke={1.75} />}
                                                    handleDateRange={(value) => {
                                                        setFieldValue('created_range', value);
                                                        setFieldValue('start_date', value[0]);
                                                        setFieldValue('end_date', value[1]);
                                                    }}
                                                    style={{ marginBottom: 0 }}
                                                />
                                            </Grid.Col>
                                            <Grid.Col md={2}>
                                                <SelectField
                                                    name="user"
                                                    placeHolder="Search user"
                                                    options={userOptions}
                                                    handleChange={(value) => setFieldValue('user', value)}
                                                    onSearchChange={(value) => {
                                                        if (value && value.length >= 3) {
                                                            setSearchUser(value);
                                                        } else {
                                                            setSearchUser('');
                                                        }
                                                    }}
                                                    rightSection={isUserFetching && <Loader size="xs" />}
                                                    icon={<IconUser size={18} stroke={1.75} />}
                                                    searchable
                                                    clearable
                                                    style={{ marginBottom: 0 }}
                                                />
                                            </Grid.Col>
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
                <HistoryTable
                    data={data?.data?.result}
                    page={page}
                    isLoading={isLoading}
                    isSuccess={isSuccess}
                    total={data?.data?.total_pages}
                    onSetPage={setPage}
                    onHandleSearch={onHandleSearch}
                    limitChange={limitChange}
                    handleLimitChange={handleLimitChange}
                    handleDetail={handleDetail}
                    onShowFilterForm={onShowFilterForm}
                    isFetching={isFetching}
                    query={query}
                />
            </PaperBox>
            <Modal
                opened={historyModal}
                onClose={handleReportModalClose}
                centered
                title={
                    <Title order={5} sx={{ fontWeight: 600 }}>
                        Deactivate History
                    </Title>
                }
                size="xl"
                overlayBlur={3}
                overlayOpacity={0.2}
                closeOnClickOutside={false}>
                <Group position="left" align="normal" mb={20}>
                    <Avatar src={`${historyDetail?.user?.profile_image ?? ''}`} alt="user-profile" size={100} radius="md" />
                    <Box>
                        <Title order={5} weight={600} mb={5}>
                            {`${historyDetail?.user?.first_name ?? ''} ${historyDetail?.user?.middle_name ?? ''} ${
                                historyDetail?.user?.last_name ?? ''
                            }`}
                            <Text color="dimmed" size={13} weight={400}>
                                @{historyDetail?.user?.username}
                            </Text>
                        </Title>
                        <Group spacing={5} mb={3}>
                            <IconMail size={16} stroke={1.75} color={iconColorMode} />
                            <Text color="dimmed">{historyDetail?.user?.email ?? '-'}</Text>
                        </Group>
                        <Group spacing={5}>
                            <IconPhone size={16} stroke={1.75} color={iconColorMode} />
                            <Text color="dimmed">{historyDetail?.user?.phone ?? '-'}</Text>
                        </Group>
                    </Box>
                </Group>
                <Divider mb={20} variant="dashed" />
                <Grid gutter="md">
                    <Grid.Col md={4}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                            Deactivated On
                        </Text>
                        <Box>
                            <Text color="dimmed">
                                {!_.isNull(historyDetail?.from_date) ? converDateFromIsonString(new Date(String(historyDetail?.from_date))) : '-'}
                            </Text>
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={4}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                            Reactivated on
                        </Text>
                        <Box>
                            <Text color="dimmed">
                                {!_.isNull(historyDetail?.to_date) ? converDateFromIsonString(new Date(String(historyDetail?.to_date))) : '-'}
                            </Text>
                        </Box>
                    </Grid.Col>
                    <Grid.Col>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                            Reason
                        </Text>
                        <Box>
                            <Text color="dimmed">{_.upperFirst(historyDetail?.reason)}</Text>
                        </Box>
                    </Grid.Col>
                </Grid>
            </Modal>
        </>
    );
};

export default Report;
