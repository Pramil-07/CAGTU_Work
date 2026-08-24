import { Badge, DataTable, NoDataMessage, SkeletonTableList, TableTopBar } from '@cagtu-cms/ui-shared';
import { CipherUserContext, DataTableProps, MerchantResult, TableColumnsProps } from '@cagtu-cms/util-formatter';
import { ActionIcon, Group, Tooltip, Select } from '@mantine/core';
import { IconEdit, IconTrash,IconSelector } from '@tabler/icons';
import { useContext } from 'react';
import MerchantMetaData from './MerchantMetaData';


interface City  {
    id: string;
    name:string;
}
interface Country  {
    id: string;
    name:string;
}
interface User  {
    id: string;
    username:string;
}

interface MerchantTableProps extends DataTableProps {
    // handleSingleDelete: (id: string) => void;
    onHandleSearch: (query: string) => void;
    checked: string[];
    isFetching?: boolean;
    query: string;
    users?:User[];
    countryName?:string;
    premium?: string;
    setPremium: (premium: string) => void;
    active?: string;
    setActive: (active: string) => void;
    user: string;
    setUser : (user : string) => void;
    city:string
    setCity: (city: string) => void;
    cities?: City[]
    countries?: Country[];
    country:string;
    setCountry: (country: string) => void;
    handleFormModalEdit: (object: MerchantResult) => void;
    

  }

const MerchantTable = ({
    data,
    page,
    checked,
    isLoading,
    isSuccess,
    total,
    onConfirmSingleDelete,
    onHandleSearch,
    isCheckboxSelect,
    // handleSingleDelete,
    handleSingleDeleteCloseModal,
    handleSelect,
    onSelectAll,
    onSetPage,
    limitChange,
    handleLimitChange,
    isFetching,handleFormModalEdit,
    query,
    premium, setPremium,active, setActive, city, setCity, country, setCountry,user, setUser
}: MerchantTableProps) => {
    
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
   
            
   
      const columns: TableColumnsProps[] = [
     
        {
            path: 'full_name',
            label: 'Name',
        },
        {
          path: 'category_name',
          label: 'Category',
          style: {
              width: 200,
          },
      },
        {
            path: 'address_line1',
            label: 'Address',
            content: (object: any) => <Badge name={object?.address_line1}/>,
            style: {
                width: 100,
            },
        },
        {
          path: 'city_name',
          label: 'City',
      },
        {
            path: 'country',
            label: 'Country',
          
            style: {
                width: 100,
            },
        },
        {
            path: 'active_hour_start',
            label: 'Active Hour Start',
            content: (object: any) => <Badge name={object?.active_hour_start} color='green' />,
            style: {
                width: 155,
            },
        },
        {
          path: 'active_hour_end',
          label: 'Active Hour End',
          content: (object: any) => <Badge name={object?.active_hour_end} color='red' />,
          style: {
              width: 150,
          },
      },
        {
            path: 'is_premium',
            label: 'Is Premium',
            content: (object: any) => (
                <Badge name={object?.is_premium ? 'Yes' : 'No'} color={object?.is_premium ? 'green' : 'red'} />
            ),
            style: {
                width: 100,
            },
        },
        {
            path: 'is_active',
            label: 'Is Active',
            content: (object: any) => (
                <Badge name={object?.is_active ? 'Yes' : 'No'} color={object?.is_active ? 'green' : 'red'} />
            ),
            style: {
                width: 100,
            },
        },
        {
            path: 'created_at',
            label: 'Created At',
            content: (object: any) => {
                const formattedDate = object?.created_at
                && new Date(object.created_at).toLocaleDateString('en-CA') 
                return (
                    <Badge name={formattedDate} color={'black'} />
                );
            },
            style: {
                width: 100,
            },
        },
        
        {
            path: 'actions',
            label: '',
            content: (object: MerchantResult) => (
                <Group position="right" spacing={5}>
                    {(is_superuser || user_permissions?.includes('change_merchant')) && (
                        <Tooltip label="Edit" position="bottom" styles={{ tooltip: { fontSize: 12, padding: '3px 8px', fontWeight: 500 } }}>
                            <ActionIcon
                                variant="light"
                                radius="xl"
                                size={30}
                                color="gray"
                                onClick={() => handleFormModalEdit(object)}

                                sx={{
                                    cursor: 'pointer',
                                }}>
                                <IconEdit size={18} stroke={1.75} />
                            </ActionIcon>
                        </Tooltip>
                    )}
                    {/* {(is_superuser || user_permissions?.includes('delete_merchant')) && (
                        <Tooltip label="Delete" position="bottom" styles={{ tooltip: { fontSize: 12, padding: '3px 8px', fontWeight: 500 } }}>
                            <ActionIcon
                                variant="light"
                                radius="xl"
                                size={30}
                                color="gray"
                                onClick={() => handleSingleDelete(object.id)}
                                sx={{
                                    cursor: 'pointer',
                                }}>
                                <IconTrash size={18} stroke={1.75} />
                            </ActionIcon>
                        </Tooltip>
                    )} */}
                </Group>
            ),
            style: {
                width: 90,
            },
        },
    ];
    return (
        <>
            {isLoading ? (
                <SkeletonTableList />
            ) : (
                <Group position={'apart'} spacing={10} align="normal">
                    {isSuccess && (
                        <Group position="left" spacing={10} align="normal" className='gap-3 flex'>
                            <TableTopBar
                                checked={checked}
                                onHandleSearch={onHandleSearch}
                                query={query}
                                loading={isFetching}
                            />            
                            {/* Filter for Premium or not */}
                              <Select
                                                                name="premium"
                                                                placeholder="Premium"
                                                                value={premium !== '' ? premium : null}
                                                                maw={180}
                                                                size="md"
                                                                data={[
                                                                    { value: 'true', label: 'Premium' },
                                                                  
                                                                  
                                                                    { value: 'false', label: 'Standard' },
                                                                ]}
                                                                onChange={(value) => {
                                                                    setPremium(value as string);
                                                                }}
                                                                icon={<IconSelector size={18} stroke={1.75} />}
                                                                clearable
                                                                style={{ marginBottom: 0 }}
                                                            />
                                                            
                                                            {/* Filter for active or not  */}
                                                             <Select
                                                                name="active"
                                                                placeholder="Active"
                                                                value={active !== '' ? active : null}
                                                                maw={180}
                                                                size="md"
                                                                data={[
                                                                    { value: 'true', label: 'Active' },
                                                                  
                                                                  
                                                                    { value: 'false', label: 'Not Active' },
                                                                ]}
                                                                onChange={(value) => {
                                                                    setActive(value as string);
                                                                }}
                                                                icon={<IconSelector size={18} stroke={1.75} />}
                                                                clearable
                                                                style={{ marginBottom: 0 }}
                                                            />      

                                                            <MerchantMetaData city={city} setCity={setCity}  country={country}  setCountry={setCountry} user={user} setUser={setUser} />    
                                                               
                                                           
                 </Group>
                    )}
                </Group>
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
                    isCheckbox={is_superuser || user_permissions?.includes('delete_merchant')}
                />
            )}
            {data && data.length < 1 && <NoDataMessage />}
        </>
    );
};

export default MerchantTable;
