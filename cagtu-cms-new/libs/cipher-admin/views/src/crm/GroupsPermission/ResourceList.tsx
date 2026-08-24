import { API, urls } from '@cagtu-cms/data-access';
import { PaperBox } from '@cagtu-cms/ui-shared';
import { Group, Title } from '@mantine/core';
import { useNotifications } from '@mantine/notifications';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import ResourceListTable from './ResourceListTable';

const urlsPath = urls?.cipher?.resource;

const ResourceList = () => {
    const [checked, setChecked] = useState<string[]>([]);
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);

    const resourceAPI = new API(urlsPath?.path);

    // const { isLoading, isError, isSuccess, data } = useQuery(['resources', page], () => resourceAPI.list({ page }));

    const onHandleSearch = (query: string) => {
        queryClient.prefetchQuery(['resources', page], () => resourceAPI.list({ search: query }));
    };

    // if (isError) {
    //     return <ErrorAlert />;
    // }

    return (
        <PaperBox>
            <Group position="apart">
                <Title order={4}>Resources list</Title>
            </Group>
            {/* <ResourceListTable
                    data={data?.data?.result}
                    page={page}
                    checked={checked}
                    isLoading={isLoading}
                    isSuccess={isSuccess}
                    total={data?.data?.total_pages}
                    isDeleteModalOpened={deleteModal}
                    isMultiDeleteModalOpened={multiDeleteModal}
                    isSingleDeleteMutationLoading={roleDeleteMutation.isLoading}
                    isMultiDeleteMutationLoading={roleMultiDeleteMutation.isLoading}
                    isAllCheckboxSelected={isAllCheckboxSelected}
                    isCheckboxSelect={isCheckboxSelect}
                    handleSelect={handleSelect}
                    onSelectAll={onSelectAll}
                    onSetPage={setPage}
                    onClickDeleteAll={() => setMultiDeleteModal(true)}
                    onConfirmSingleDelete={() => roleDeleteMutation.mutate(Number(rowId))}
                    onConfirmMultiDelete={() => roleMultiDeleteMutation.mutate(checked)}
                    handleSingleDeleteCloseModal={handleCloseModal}
                    handleMultiDeleteCloseModal={handleMultiDeleteCloseModal}
                    onHandleSearch={onHandleSearch}
                /> */}
        </PaperBox>
    );
};

export default ResourceList;
