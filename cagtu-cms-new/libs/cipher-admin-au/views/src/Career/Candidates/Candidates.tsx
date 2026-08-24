import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { ErrorAlert, PageHeader, PaperBox } from '@cagtu-cms/ui-shared';
import { CandidatesSchema, CipherUserContext, getPageLimit, useDataLimit } from '@cagtu-cms/util-formatter';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { useContext, useState } from 'react';
import CandidatesModal from '../../components/common/CandidatesModal';
import CandidatesTable from './CandidatesTable';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';

const urlsPath = urls?.cipher?.career?.candidate;

const Candidates = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const [query, setQuery] = useState<string>('');
    const [checked, setChecked] = useState<string[]>([]);
    const queryClient = useQueryClient();
    const [deleteModal, setDeleteModal] = useState(false);
    const [multiDeleteModal, setMultiDeleteModal] = useState(false);
    const [rowId, setRowId] = useState<number | null>();
    const [candidateId, setCandidateId] = useState<number | null>();
    const [candidatesModal, setCandidatesModal] = useState(false);
    const [page, setPage] = useState(1);
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');

    const candidatesListAPI = new CipherAPI(urlsPath?.list);
    const candidateSingleDeleteAPI = new CipherAPI(urls?.cipher?.career?.candidate?.singleDelete);
    const candidateMultipleDeleteAPI = new CipherAPI(urls?.cipher?.career?.candidate?.multipleDelete);
    const candidatesDetailAPI = new CipherAPI(urls?.cipher?.career?.candidate?.detail);

    const { isLoading, isError, isSuccess, data, isFetching } = useQuery(['candidates', page, limitChange], () =>
        candidatesListAPI.list({ keyword: query, page, page_size: limitChange })
    );

    const { isLoading: candidateDetailFetching, data: candidateData } = useQuery(
        ['candidates-detail', candidateId],
        () => candidatesDetailAPI.get(Number(candidateId)),
        {
            enabled: !!candidateId,
        }
    );

    const pageToFecth = data?.data?.result.length <= 1 ? page - 1 : page;
    const pageToFetchMultiple = data?.data?.result.length <= checked.length ? page - 1 : page;

    const candidatesMultipleDeleteMutation = useMutation((checkedIds: string[]) => candidateMultipleDeleteAPI.store({ pk: checkedIds }), {
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
                    title: 'Congrats! Candidate Deleted',
                    message: data.data?.message,
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                const pageToSet = pageToFetchMultiple < 1 ? 1 : pageToFetchMultiple;
                if (pageToSet === page) queryClient.invalidateQueries(['candidates', pageToSet]);
                else setPage(pageToSet);
            }
        },
        onError: () => {
            setMultiDeleteModal(false);
            showNotification({
                title: 'Uh oh! something went wrong',
                message: 'Sorry! There was a problem with your request.',
                color: 'red',
                icon: <IconX size={18} />,
            });
        },
    });

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
        queryClient.prefetchQuery(['candidates', page, limitChange], () => candidatesListAPI.list({ keyword: query, page_size: limitChange }));
        setQuery(query);
        setPage(1);
    };

    const onSelectAll = () => {
        const isSelectAll = isAllCheckboxSelected();
        if (isSelectAll) {
            setChecked([]);
        } else {
            const checkedRowId = data?.data?.result.map((candidate: CandidatesSchema) => String(candidate.id));
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
        const checkedRowId = data?.data?.result.map((candidate: CandidatesSchema) => String(candidate.id));
        const isAllSelected = checkedRowId.every((id: number) => checked.includes(String(id)));

        return isAllSelected;
    };

    const handleSingleDelete = (id: number) => {
        setDeleteModal(true);
        setRowId(id);
    };

    const handleCloseModal = () => {
        if (!candidatesMultipleDeleteMutation.isLoading) {
            setDeleteModal(false);
            setRowId(null);
        }
    };

    const handleMultiDeleteCloseModal = () => {
        if (!candidatesDeleteMutation.isLoading) {
            setMultiDeleteModal(false);
        }
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
                    checked={checked}
                    isLoading={isLoading}
                    isSuccess={isSuccess}
                    total={data?.data?.total_pages}
                    isDeleteModalOpened={deleteModal}
                    isMultiDeleteModalOpened={multiDeleteModal}
                    isSingleDeleteMutationLoading={candidatesDeleteMutation.isLoading}
                    isMultiDeleteMutationLoading={candidatesMultipleDeleteMutation.isLoading}
                    isAllCheckboxSelected={isAllCheckboxSelected}
                    isCheckboxSelect={isCheckboxSelect as unknown as undefined}
                    handleSelect={handleSelect as unknown as undefined}
                    handleSingleDelete={handleSingleDelete}
                    onSelectAll={onSelectAll}
                    onSetPage={setPage}
                    onClickDeleteAll={() => setMultiDeleteModal(true)}
                    onConfirmSingleDelete={() => candidatesDeleteMutation.mutate(Number(rowId))}
                    onConfirmMultiDelete={() => candidatesMultipleDeleteMutation.mutate(checked)}
                    handleSingleDeleteCloseModal={handleCloseModal}
                    handleMultiDeleteCloseModal={handleMultiDeleteCloseModal}
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
                title="Candidates Detail"
                onClose={handleCandidatesModalClose}
                data={candidateData?.data?.data}
                isLoading={candidateDetailFetching}
                overlayBlur={3}
                overlayOpacity={0.2}
                closeOnClickOutside={false}
            />
        </>
    );
};

export default Candidates;
