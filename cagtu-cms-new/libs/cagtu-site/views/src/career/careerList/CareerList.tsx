import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { Button, ErrorAlert, PageHeader, PaperBox } from '@cagtu-cms/ui-shared';
import { CipherUserContext, VacancySchema, getPageLimit, useDataLimit } from '@cagtu-cms/util-formatter';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CareerListTable from './CareerListTable';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';
import CareerDetailModal from './CareerDetail';

const urlsPath = urls?.cagtuSite.vacancy;

const CareerList = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const navigate = useNavigate();
    const [query, setQuery] = useState<string>('');
    const queryClient = useQueryClient();
    const [deleteModal, setDeleteModal] = useState(false);
    const [detailModal, setDetailModal] = useState(false);
    const [vacancyDetailData, setVacancyDetailData] = useState<VacancySchema>();
    const [rowId, setRowId] = useState<number | null>();
    const [page, setPage] = useState(1);
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');

    const careerAPI = new CipherAPI(urlsPath?.path);
    const careerSingleDelete = new CipherAPI(urlsPath?.path);

    const { isLoading, isError, isSuccess, data, isFetching } = useQuery(['careers', page, limitChange], () =>
        careerAPI.list({ search: query, page, page_size: limitChange })
    );

    const pageToFecth = data?.data?.result.length <= 1 ? page - 1 : page;

    const careerDeleteMutation = useMutation((id: number) => careerSingleDelete.delete(id), {
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
                    title: 'Congrats! Career Deleted',
                    message: data.data?.message,
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                if (pageToSet === page) queryClient.invalidateQueries(['careers', pageToSet, limitChange]);
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
        queryClient.prefetchQuery(['careers', page, limitChange], () => careerAPI.list({ search: query, page_size: limitChange }));
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

    const handleDetailModalOpen = (data: VacancySchema) => {
        setVacancyDetailData(data);
        setDetailModal(true);
    };

    const handleDetailModalClose = () => {
        setDetailModal(false);
    };

    if (isError) {
        return <ErrorAlert />;
    }

    if (!is_superuser && !user_permissions?.includes('view_vacancy')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            <PageHeader pageTitle="Career">
                {(is_superuser || user_permissions?.includes('add_vacancy')) && <Button onClick={() => navigate('/careers/create')} name="Create" />}
            </PageHeader>
            <PaperBox>
                <CareerListTable
                    data={data?.data?.result}
                    page={page}
                    isLoading={isLoading}
                    isSuccess={isSuccess}
                    total={data?.data?.total_pages}
                    isDeleteModalOpened={deleteModal}
                    isSingleDeleteMutationLoading={careerDeleteMutation.isLoading}
                    handleSingleDelete={handleSingleDelete}
                    onSetPage={setPage}
                    onConfirmSingleDelete={() => careerDeleteMutation.mutate(Number(rowId))}
                    handleSingleDeleteCloseModal={handleCloseModal}
                    onHandleSearch={onHandleSearch}
                    limitChange={limitChange}
                    handleLimitChange={handleLimitChange}
                    isFetching={isFetching}
                    query={query}
                    handleDetailModalOpen={handleDetailModalOpen}
                />
            </PaperBox>
            <CareerDetailModal
                opened={detailModal}
                onClose={handleDetailModalClose}
                title={'Vacancy detail'}
                data={vacancyDetailData}
                size={'50%'}
                overlayBlur={3}
                overlayOpacity={0.2}
            />
        </>
    );
};

export default CareerList;
