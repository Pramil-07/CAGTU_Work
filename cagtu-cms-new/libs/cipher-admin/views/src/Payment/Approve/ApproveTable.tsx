// import { Badge, DataTable, NoDataMessage, SkeletonTableList, TableTopBar } from '@cagtu-cms/ui-shared';
// import { CipherUserContext, DataTableProps, ProductsResults, TableColumnsProps } from '@cagtu-cms/util-formatter';
// import {
//     ActionIcon,
//     Group,
//     Tooltip,
//     UnstyledButton,
//     Text,
//     Button,
//   } from '@mantine/core';
// import {IconAdjustmentsHorizontal, IconEdit, IconTrash } from '@tabler/icons';
// import { useContext } from 'react';

// interface City  {
//     id: string;
//     name:string;
// }
// interface Country  {
//     id: string;
//     name:string;
// }
// interface User  {
//     id: string;
//     username:string;
// }

// interface ProductTableProps extends DataTableProps {
//     handleSingleDelete: (id: string) => void;
//     onHandleSearch: (query: string) => void;
//     checked: string[];
//     isFetching?: boolean;
//     query: string;
//     users?:User[];
//     countryName?:string;
//     premium?: string;
//     setPremium: (premium: string) => void;
//     active?: string;
//     setActive: (active: string) => void;
//     user: string;
//     setUser : (user : string) => void;
//     city:string
//     setCity: (city: string) => void;
//     cities?: City[]
//     countries?: Country[];
//     country:string;
//     setCountry: (country: string) => void;
//     handleFormModalEdit: (object: ProductsResults) => void;
//     handleFormModal: () => void;
//     onShowFilterForm : () => void;
//   }

// const ApproveTable = ({
//     data,
//     page,
//     checked,
//     isLoading,
//     isSuccess,
//     total,
//     onConfirmSingleDelete,
//     onHandleSearch,
//     isCheckboxSelect,
//     handleSingleDelete,
//     handleSingleDeleteCloseModal,
//     handleSelect,
//     onSelectAll,
//     onSetPage,
//     limitChange,
//     handleLimitChange,
//     isFetching,handleFormModalEdit,
//     query,
//     handleFormModal, onShowFilterForm
// }: ProductTableProps) => {
    
//     const { user_permissions, is_superuser } = useContext(CipherUserContext);
//       const columns: TableColumnsProps[] = [
     
//         {
//             path: 'name',
//             label: 'Name',
//             style: {
//               width: 100,
//           },
//         },

//         {
//           path: 'product_status',
//           label: 'Product Status',
//           content: (object: any) => (
//             <Badge name={object?.product_status  ? object?.product_status : 'No Discount'} color={object?.product_status == "Hot Deals" || object?.product_status== "Sale" ? 'orange' : 'gray'} />
//         ),
//           style: {
//               width: 100,
//           },
//         },
       
//         {
//           path: 'stock_quantity',
//           label: 'Stock Quantity',
//           style: {
//             width: 100,
//         },
//         },
//         {
//           path: 'cost_price',
//           label: 'Cost Price',
//           style: {
//               width: 100,
//           },
//         }, 
//         {
//           path: 'selling_price',
//           label: 'Selling Price',
//           style: {
//               width: 100,
//           },
//         }, 
//         {
//           path: 'discount_per',
//           label: 'Discount %',
//           content: (object: any) => (
//             <Badge name={object?.discount_per ? object?.discount_per : 'No Discount'} color={object?.discount_per ? 'green' : 'red'} />
//         ),
//           style: {
//               width: 100,
//           },
//         },
//         {
//           path: 'user',
//           label: 'Discount %',
//           content: (object: any) => (
//             <Badge name={object?.discount_per ? object?.discount_per : 'No Discount'} color={object?.discount_per ? 'green' : 'red'} />
//         ),
//           style: {
//               width: 100,
//           },
//         },
//         {
//             path: 'category_details',
//             label: 'Category',
//             content: (object: any) => (
//               <Badge name={object?.category_details ? object?.category_details?.name : null}/>
//           ),
//             style: {
//                 width: 100,
//             },
//           },
        
//         {
//         path: 'shop',
//         label: 'Shop Name',
//         content: (object: any) => (
//           <Badge name={object?.shop ? object?.shop?.name : 'null'} color={object?.shop?.name ? 'blue' : 'gray'} />
//         ),
//         style: {
//             width: 100,
//         },
//         },

//         {
//             path: 'is_active',
//             label: 'Is Active',
//             content: (object: any) => (
//                 <Badge name={object?.is_active ? 'Yes' : 'No'} color={object?.is_active ? 'green' : 'red'} />
//             ),
//             style: {
//                 width: 100,
//             },
//         },  
     
//         {
//             path: 'actions',
//             label: '',
//             content: (object: ProductsResults) => (
//                 <Group position="right" spacing={5}>
                    
//                     {(is_superuser || user_permissions?.includes('change_product')) && (
//                         <Tooltip label="Edit" position="bottom" styles={{ tooltip: { fontSize: 12, padding: '3px 8px', fontWeight: 500 } }}>
//                             <ActionIcon
//                                 variant="light"
//                                 radius="xl"
//                                 size={30}
//                                 color="gray"
//                                 onClick={() => handleFormModalEdit(object)}
//                                 sx={{
//                                     cursor: 'pointer',
//                                 }}>
//                                 <IconEdit size={18} stroke={1.75} />
//                             </ActionIcon>
//                         </Tooltip>
//                     )}
//                     {(is_superuser || user_permissions?.includes('delete_product')) && (
//                         <Tooltip label="Delete" position="bottom" styles={{ tooltip: { fontSize: 12, padding: '3px 8px', fontWeight: 500 } }}>
//                             <ActionIcon
//                                 variant="light"
//                                 radius="xl"
//                                 size={30}
//                                 color="gray"
//                                 onClick={() => handleSingleDelete(object.id)}
//                                 sx={{
//                                     cursor: 'pointer',
//                                 }}>
//                                 <IconTrash size={18} stroke={1.75} />
//                             </ActionIcon>
//                         </Tooltip>
//                     )}
                  
//                 </Group>
//             ),
//             style: {
//                 width: 90,
//             },
//         },
//     ];
//     return (
//         <>
//           {isLoading ? (
//             <SkeletonTableList />
//           ) : (
//             <Group position="apart" spacing={10} align="normal">
//               {isSuccess && (
//                 <>
//                   <Group position="left" spacing={10} align="normal" className="gap-3 flex">
//                     <TableTopBar
//                       checked={checked}
//                       onHandleSearch={onHandleSearch}
//                       query={query}
//                       loading={isFetching}
//                     />
//                   </Group>
      
//                   <Group position="right" spacing={12}>
//                     <UnstyledButton component="div" onClick={onShowFilterForm}>
//                       <Group spacing={8}>
//                         <Text weight={500}>Filter</Text>
//                         <ActionIcon
//                           variant="light"
//                           radius="xl"
//                           size={40}
//                           color="blue"
//                         >
//                           <IconAdjustmentsHorizontal size={24} stroke={1.75} />
//                         </ActionIcon>
//                       </Group>
//                     </UnstyledButton>
      
//                     {(is_superuser || user_permissions?.includes('add_user')) && (
//                       <Button onClick={handleFormModal}>Create</Button>
//                     )}
//                   </Group>
//                 </>
//               )}
//             </Group>
//           )}
      
//           {isSuccess && data.length >= 1 && (
//             <DataTable
//               data={data}
//               columns={columns}
//               page={page}
//               total={total}
//               isCheckboxSelect={isCheckboxSelect}
//               onSetPage={onSetPage}
//               handleSelect={handleSelect}
//               onConfirmSingleDelete={onConfirmSingleDelete}
//               handleSingleDeleteCloseModal={handleSingleDeleteCloseModal}
//               onSelectAll={onSelectAll}
//               limitChange={limitChange}
//               handleLimitChange={handleLimitChange}
//               isCheckbox={is_superuser || user_permissions?.includes('delete_product')}
//             />
//           )}
      
//           {data && data.length < 1 && <NoDataMessage />}
//         </>
//       );
      
// };

// export default ApproveTable;
