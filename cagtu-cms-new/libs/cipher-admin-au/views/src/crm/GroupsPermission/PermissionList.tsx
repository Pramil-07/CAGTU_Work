import { API, urls } from '@cagtu-cms/data-access';
import { PaperBox } from '@cagtu-cms/ui-shared';
import { Title } from '@mantine/core';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import PermissionListTable from './PermissionListTable';

const urlsPath = urls?.cipher?.user?.permission;

const PermissionList = () => {
    const [checked, setChecked] = useState<string[]>([]);
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);

    const permissionAPI = new API(urlsPath?.path);

    // const { isLoading, isError, isSuccess, data } = useQuery(['resources', page], () => permissionAPI.list({ page }));

    const onHandleSearch = (query: string) => {
        queryClient.prefetchQuery(['permissions', page], () => permissionAPI.list({ search: query }));
    };

    // if (isError) {
    //     return <ErrorAlert />;
    // }

    return (
        <PaperBox>
            <Title order={4}>Permission List</Title>
            {/* <PermissionListTable
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

export default PermissionList;
