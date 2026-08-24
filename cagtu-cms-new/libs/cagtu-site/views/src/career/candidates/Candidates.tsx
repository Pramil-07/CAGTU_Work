import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { ErrorAlert, PageHeader, PaperBox } from '@cagtu-cms/ui-shared';
import { CipherUserContext, getPageLimit, useDataLimit } from '@cagtu-cms/util-formatter';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { useContext, useState } from 'react';
import CandidatesModal from './CandidatesModal';
import CandidatesTable from './CandidatesTable';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';

const urlsPath = urls?.cagtuSite.career;
const Candidates = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const [query, setQuery] = useState<string>('');
    const queryClient = useQueryClient();
    const [deleteModal, setDeleteModal] = useState(false);
    const [rowId, setRowId] = useState<number | null>();
    const [candidateId, setCandidateId] = useState<number | null>();
    const [candidatesModal, setCandidatesModal] = useState(false);
    const [page, setPage] = useState(1);
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');

    const candidatesListAPI = new CipherAPI(urlsPath?.list);
    const candidateSingleDeleteAPI = new CipherAPI(urlsPath?.path);
    const candidatesDetailAPI = new CipherAPI(urlsPath?.path);

    const { isLoading, isError, isSuccess, data, isFetching } = useQuery(['candidates', page, limitChange], () =>
        candidatesListAPI.list({ search: query, page, page_size: limitChange })
    );

    const { isLoading: candidateDetailFetching, data: candidateData } = useQuery(
        ['candidates-detail', candidateId],
        () => candidatesDetailAPI.get(Number(candidateId)),
        {
            enabled: !!candidateId,
        }
    );

    const pageToFecth = data?.data?.result.length <= 1 ? page - 1 : page;

    const candidatesDeleteMutation = useMutation((id: number) => candidateSingleDeleteAPI.delete(id), {
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
                    title: 'Congrats! Candidate Deleted',
                    message: data.data?.message,
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                if (pageToSet === page) queryClient.invalidateQueries(['candidates', pageToSet]);
                else setPage(pageToSet);
            }
        },
        onError: () => {
            setDeleteModal(false);
            setRowId(null);
            showNotification({
                title: 'Uh oh! something went wrong',
                message: 'Sorry! There was a problem with your request.',
                color: 'red',
                icon: <IconX size={18} />,
            });
        },
    });

    const onHandleSearch = (query: string) => {
        queryClient.prefetchQuery(['candidates', page, limitChange], () => candidatesListAPI.list({ search: query, page, page_size: limitChange }));
        setQuery(query);
        setPage(1);
    };

    const handleSingleDelete = (id: number) => {
        setDeleteModal(true);
        setRowId(id);
    };

    const handleCloseModal = () => {
        setDeleteModal(false);
        setRowId(null);
    };

    const handleCandidatesDetail = (id: number) => {
        setCandidatesModal(true);
        setCandidateId(id);
    };

    const handleCandidatesModalClose = () => setCandidatesModal(false);

    if (isError) {
        return <ErrorAlert />;
    }

    if (!is_superuser && !user_permissions?.includes('view_candidate')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            <PageHeader pageTitle="Candidates" />
            <PaperBox>
                <CandidatesTable
                    data={data?.data?.result}
                    page={page}
                    isLoading={isLoading}
                    isSuccess={isSuccess}
                    total={data?.data?.total_pages}
                    isDeleteModalOpened={deleteModal}
                    isSingleDeleteMutationLoading={candidatesDeleteMutation.isLoading}
                    handleSingleDelete={handleSingleDelete}
                    onSetPage={setPage}
                    onConfirmSingleDelete={() => candidatesDeleteMutation.mutate(Number(rowId))}
                    handleSingleDeleteCloseModal={handleCloseModal}
                    onHandleSearch={onHandleSearch}
                    limitChange={limitChange}
                    handleLimitChange={handleLimitChange}
                    handleCandidatesDetail={handleCandidatesDetail}
                    isFetching={isFetching}
                    query={query}
                />
            </PaperBox>
            <CandidatesModal
                opened={candidatesModal}
                title="Candidate Detail"
                onClose={handleCandidatesModalClose}
                data={candidateData?.data}
                isLoading={candidateDetailFetching}
                overlayBlur={3}
                overlayOpacity={0.2}
                size={'50%'}
                closeOnClickOutside={false}
            />
        </>
    );
};

export default Candidates;
