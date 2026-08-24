import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { ErrorAlert, PageHeader, PaperBox } from '@cagtu-cms/ui-shared';
import {
    CipherUserContext,
    ContactFilterFormValuesProps,
    ContactResult,
    converDateFromIsonString,
    getPageLimit,
    useDataLimit,
} from '@cagtu-cms/util-formatter';
import { Title, Modal, Text, Grid, Box } from '@mantine/core';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useContext, useState } from 'react';
import ContactListTable from './ContactListTable';
import * as _ from 'lodash';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';

const urlsPath = urls?.cagtuSite.contact;
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
    const [contactModal, setContactModal] = useState<boolean>(false);
    const [contactDetail, setContactDetail] = useState<ContactResult | null | undefined>();

    const contactAPI = new CipherAPI(urlsPath?.list);

    const { isLoading, isError, isSuccess, data, isFetching } = useQuery(['contact', page, limitChange, ...[filterFormInitialData]], () =>
        contactAPI.list({ search: query, page, page_size: limitChange })
    );

    const onHandleSearch = (query: string) => {
        queryClient.prefetchQuery(['contact', page, limitChange, ...[filterFormInitialData]], () =>
            contactAPI.list({ search: query, page_size: limitChange })
        );
        setQuery(query);
        setPage(1);
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
                            <Text color="dimmed">{contactDetail?.first_name + ' ' + contactDetail?.last_name ?? '-'}</Text>
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
