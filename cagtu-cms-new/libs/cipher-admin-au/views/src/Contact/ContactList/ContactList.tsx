import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { Button, DateRangeField, ErrorAlert, PageHeader, PaperBox, SelectField } from '@cagtu-cms/ui-shared';
import {
    CipherUserContext,
    ContactFilterFormValuesProps,
    ContactResult,
    converDateFromIsonString,
    getFormatedDate,
    getPageLimit,
    useDark,
    useDataLimit,
} from '@cagtu-cms/util-formatter';
import { Box, CloseButton, Divider, Grid, Title, useMantineTheme, Modal, Text } from '@mantine/core';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Form, Formik } from 'formik';
import { useContext, useState } from 'react';
import ContactListTable from './ContactListTable';
import * as _ from 'lodash';
import { IconCalendar, IconCategory2, IconSelector } from '@tabler/icons';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';

const urlsPath = urls?.cipher?.contact;
const urlsContatCatPath = urls?.cipher?.contact?.category;

const filterFormInitialData: ContactFilterFormValuesProps = {
    contact_us_category_id: '',
    ordering: '',
    start_date: '',
    end_date: '',
    created_range: '',
};

const ContactList = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const queryClient = useQueryClient();
    const [query, setQuery] = useState<string>('');
    const [page, setPage] = useState(1);
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');
    const [contactCatOptions, setContactCatOptions] = useState<{ value: string; label: string }[]>([]);
    const [showFilter, setShowFilter] = useState(false);
    const [isFiltering, setIsFiltering] = useState(false);
    const [contactModal, setContactModal] = useState<boolean>(false);
    const [contactDetail, setContactDetail] = useState<ContactResult | null | undefined>();

    const [dark] = useDark();
    const theme = useMantineTheme();

    const [contactFilterFormData, setContactFilterFormData] = useState<ContactFilterFormValuesProps>({
        ...filterFormInitialData,
    });

    const contactAPI = new CipherAPI(urlsPath?.path);
    const contactOptionsAPI = new CipherAPI(urlsContatCatPath?.otpions);

    const { isLoading, isError, isSuccess, data, isFetching } = useQuery(['contact', page, limitChange, ...[filterFormInitialData]], () =>
        contactAPI.list({ search: query, page, page_size: limitChange, ...contactFilterFormData })
    );

    // Contact Category Options
    useQuery(['contactCat-options'], () => contactOptionsAPI.list(), {
        onSuccess: (data) => {
            const options = data?.data.map(({ id, name }: { id: number; name: string }) => {
                return {
                    value: String(id),
                    label: `${name}`,
                };
            });
            setContactCatOptions(options);
        },
    });

    const onHandleSearch = (query: string) => {
        queryClient.prefetchQuery(['contact', page, limitChange, ...[filterFormInitialData]], () =>
            contactAPI.list({ search: query, page_size: limitChange, ...contactFilterFormData })
        );
        setQuery(query);
        setPage(1);
    };

    const onFilterFormClear = async () => {
        setContactFilterFormData({ ...filterFormInitialData });
        await queryClient.prefetchQuery(['contact', page, limitChange, ...[filterFormInitialData]], () =>
            contactAPI.list({ page: 1, page_size: '10' })
        );
    };

    const onShowFilterForm = () => setShowFilter(true);
    const onShowFilterFormClose = () => {
        setShowFilter(false);
        setContactFilterFormData({ ...filterFormInitialData });
    };

    const handleDetail = (object: ContactResult) => {
        setContactModal(true);
        setContactDetail(object);
    };

    const handleContactModalClose = () => {
        setContactModal(false);
        setContactDetail(null);
    };

    if (isError) {
        return <ErrorAlert />;
    }

    if (!is_superuser && !user_permissions?.includes('view_contactus')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            <PageHeader pageTitle="Contact" />
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
                                initialValues={contactFilterFormData}
                                onSubmit={async (values) => {
                                    const dataToSend = {
                                        ...JSON.parse(JSON.stringify(values)),
                                        start_date: values?.start_date ? getFormatedDate(new Date(values?.start_date)) : '',
                                        end_date: values?.end_date ? getFormatedDate(new Date(values?.end_date)) : '',
                                    };

                                    delete dataToSend.created_range;

                                    setIsFiltering(true);
                                    setContactFilterFormData({ ...dataToSend });
                                    setPage(1);
                                    await queryClient.prefetchQuery(
                                        ['contact', page, limitChange, ...[filterFormInitialData]],
                                        () =>
                                            contactAPI.list({
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
                                                    placeHolder="Select created range"
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
                                                    name="contact_us_category_id"
                                                    placeHolder="Select contact category"
                                                    options={contactCatOptions}
                                                    handleChange={(value) => setFieldValue('contact_us_category_id', value)}
                                                    icon={<IconCategory2 size={18} stroke={1.75} />}
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
                <ContactListTable
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
                    handleDetail={handleDetail}
                    isFetching={isFetching}
                    query={query}
                />
            </PaperBox>
            <Modal
                opened={contactModal}
                onClose={handleContactModalClose}
                centered
                title={
                    <Title order={5} sx={{ fontWeight: 600 }}>
                        Contact Detail
                    </Title>
                }
                size="xl"
                overlayBlur={3}
                overlayOpacity={0.2}
                closeOnClickOutside={false}>
                <Grid gutter="md">
                    <Grid.Col md={4}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                            Full Name
                        </Text>
                        <Box>
                            <Text color="dimmed">{contactDetail?.full_name ?? '-'}</Text>
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={4}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                            Email
                        </Text>
                        <Box>
                            <Text color="dimmed">{contactDetail?.email ?? '-'}</Text>
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={4}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                            Phone
                        </Text>
                        <Box>
                            <Text color="dimmed">{contactDetail?.phone !== '' ? contactDetail?.phone ?? '-' : '-'}</Text>
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={4}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                            Contact Category
                        </Text>
                        <Box>
                            <Text color="dimmed">
                                {!_.isNull(contactDetail?.contact_us_category) ? contactDetail?.contact_us_category?.name : '-'}
                            </Text>
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={4}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                            Created On
                        </Text>
                        <Box>
                            <Text color="dimmed">
                                {!_.isNull(contactDetail?.created_at) ? converDateFromIsonString(new Date(String(contactDetail?.created_at))) : '-'}
                            </Text>
                        </Box>
                    </Grid.Col>
                    <Grid.Col>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                            Message
                        </Text>
                        <Box>
                            <Text color="dimmed">{_.upperFirst(contactDetail?.message)}</Text>
                        </Box>
                    </Grid.Col>
                </Grid>
            </Modal>
        </>
    );
};

export default ContactList;
