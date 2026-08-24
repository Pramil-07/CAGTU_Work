import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { ErrorAlert, PageHeader, PaperBox } from '@cagtu-cms/ui-shared';
import { CipherUserContext, getPageLimit, useDataLimit } from '@cagtu-cms/util-formatter';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useContext, useState } from 'react';
import BlockedPageMessage from '../components/common/BlockedPageMessage';
import ReferralListTable from './ReferralListTable';

const urlsPath = urls?.cipher.referral;

const ReferralList = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const [query, setQuery] = useState<string>('');
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');

    const referralAPI = new CipherAPI(urlsPath?.list);

    const { isLoading, isError, isSuccess, data, isFetching } = useQuery(['referral', page, limitChange], () =>
        referralAPI.list({ search: query, page, page_size: limitChange })
    );



    const onHandleSearch = (query: string) => {
        queryClient.prefetchQuery(['referral', page, limitChange], () => referralAPI.list({ search: query, page_size: limitChange }));
        setQuery(query);
        setPage(1);
    };


    if (isError) {
        return <ErrorAlert />;
    }

    if (!is_superuser && !user_permissions?.includes('view_referral')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            <PageHeader pageTitle="Referrals" />
            <PaperBox>
                <ReferralListTable
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
        </>
    );
};

export default ReferralList;
