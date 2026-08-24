import {
    Badge,
    DataTable,
    NoDataMessage,
    SkeletonTableList,
    TableTopBar,
  } from '@cagtu-cms/ui-shared';
  import {
    CipherUserContext,
    DataTableProps,
    ShopResult,
    TableColumnsProps,
  } from '@cagtu-cms/util-formatter';
  import {
    ActionIcon,
    Group,
    Tooltip,
    UnstyledButton,
    Text,
    Button,
  } from '@mantine/core';
  import {
    IconEdit,
    IconTrash,
    IconAdjustmentsHorizontal,
  } from '@tabler/icons';
  import { useContext } from 'react';
  
  interface ShopTableProps extends DataTableProps {
    handleSingleDelete: (id: string) => void;
    onShowFilterForm: () => void;
    onHandleSearch: (query: string) => void;
    checked: string[];
    isFetching?: boolean;
    query: string;
    handleFormModalEdit: (object: ShopResult) => void;
    handleFormModal: () => void;
  }
  
  const Shoptable = ({
    data,
    page,
    checked,
    isLoading,
    isSuccess,
    total,
    onConfirmSingleDelete,
    onHandleSearch,
    isCheckboxSelect,
    handleSingleDelete,
    handleSingleDeleteCloseModal,
    handleSelect,
    onSelectAll,
    onSetPage,
    limitChange,
    handleLimitChange,
    isFetching,
    handleFormModalEdit,
    handleFormModal,
    query,
    onShowFilterForm,
  }: ShopTableProps) => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
  
    const columns: TableColumnsProps[] = [
      {
        path: 'name',
        label: 'Name',
        style: { width: 200 },
      },
      {
        path: 'category_name',
        label: 'Category',
        style: { width: 200 },
      },
      {
        path: 'location',
        label: 'Address',
        style: { width: 300 },
      },
      {
        path: 'owner_name',
        label: 'Shop Owner',
        style: { width: 300 },
      },
      {
        path: 'is_active',
        label: 'Is Active',
        content: (object: any) => (
          <Badge
            name={object?.is_active ? 'Yes' : 'No'}
            color={object?.is_active ? 'green' : 'red'}
          />
        ),
        style: { width: 100 },
      },
      {
        path: 'status',
        label: 'Status',
        content: (object: any) => {
          let statusLabel = 'Pending';
          if (object?.status === 'verified') statusLabel = 'Verified';
          else if (object?.status === 'rejected') statusLabel = 'Rejected';
          else if (object?.status === 'under_review') statusLabel = 'Under Review';
  
          return (
            <Badge
              name={statusLabel}
              color={
                object?.status === 'verified'
                  ? 'green'
                  : object?.status === 'under_review'
                  ? 'orange'
                  : 'red'
              }
            />
          );
        },
        style: { width: 100 },
      },
      {
        path: 'products',
        label: 'Products',
        content: (object: any) => {
          const products = object?.products || [];
          return (
            <Badge
              name={`${products.length} item${products.length !== 1 ? 's' : ''}`}
            />
          );
        },
        style: { width: 100 },
      },
      {
        path: 'created_at',
        label: 'Joined Date',
        content: (object: any) => {
          const formattedDate =
            object?.created_at &&
            new Date(object.created_at).toLocaleDateString('en-CA');
          return <Badge name={formattedDate} color={'black'} />;
        },
        style: { width: 100 },
      },
      {
        path: 'actions',
        label: '',
        content: (object: any) => (
          <Group position="right" spacing={0}>
            {(is_superuser || user_permissions?.includes('change_shop')) && (
              <Tooltip
                label="Edit"
                position="bottom"
                styles={{
                  tooltip: {
                    fontSize: 12,
                    padding: '3px 8px',
                    fontWeight: 500,
                  },
                }}
              >
                <ActionIcon
                  variant="light"
                  radius="xl"
                  size={30}
                  color="gray"
                  onClick={() => handleFormModalEdit(object)}
                >
                  <IconEdit size={18} stroke={1.75} />
                </ActionIcon>
              </Tooltip>
            )}
{/*   
            {(is_superuser || user_permissions?.includes('delete_shop')) && (
              <Tooltip
                label="Delete"
                position="bottom"
                styles={{
                  tooltip: {
                    fontSize: 12,
                    padding: '3px 8px',
                    fontWeight: 500,
                  },
                }}
              >
                <ActionIcon
                  variant="light"
                  radius="xl"
                  size={30}
                  color="gray"
                  onClick={() => handleSingleDelete(object.id)}
                >
                  <IconTrash size={18} stroke={1.75} />
                </ActionIcon>
              </Tooltip>
            )} */}
          </Group>
        ),
        style: { width: 100 },
      },
    ];
  
    return (
      <>
        {isLoading ? (
          <SkeletonTableList />
        ) : (
          <>
            {isSuccess && (
              <Group position="apart" className="mb-4">
                <Group position="left" spacing={10} className="gap-3 flex">
                  <TableTopBar
                    checked={checked}
                    onHandleSearch={onHandleSearch}
                    query={query}
                    loading={isFetching}
                  />
                </Group>
  
                <Group position="right" spacing={12}>
                  <UnstyledButton component="div" onClick={onShowFilterForm}>
                    <Group spacing={8}>
                      <Text weight={500}>Filter</Text>
                      <ActionIcon
                        variant="light"
                        radius="xl"
                        size={40}
                        color="blue"
                      >
                        <IconAdjustmentsHorizontal size={24} stroke={1.75} />
                      </ActionIcon>
                    </Group>
                  </UnstyledButton>
                  {(is_superuser || user_permissions?.includes('add_user')) && (
                    <Button onClick={handleFormModal}>Create</Button>
                  )}
                </Group>
              </Group>
            )}
          </>
        )}
  
        {isSuccess && data.length >= 1 && (
          <DataTable
            data={data}
            columns={columns}
            page={page}
            total={total}
            isCheckboxSelect={isCheckboxSelect}
            onSetPage={onSetPage}
            handleSelect={handleSelect}
            onConfirmSingleDelete={onConfirmSingleDelete}
            handleSingleDeleteCloseModal={handleSingleDeleteCloseModal}
            onSelectAll={onSelectAll}
            limitChange={limitChange}
            handleLimitChange={handleLimitChange}
            isCheckbox={is_superuser || user_permissions?.includes('delete_shop')}
          />
        )}
  
        {data && data.length < 1 && <NoDataMessage />}
      </>
    );
  };
  
  export default Shoptable;
  