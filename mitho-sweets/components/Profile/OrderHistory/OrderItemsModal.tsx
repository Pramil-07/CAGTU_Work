import {useEffect, useRef, useState} from 'react';
import { Modal, Stack, Text, Divider, ScrollArea, Table, Image, Group, Button, Card, Grid, Pagination } from '@mantine/core';
import { IconPackage, IconTable, IconGridDots } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { formatNumberWithCondition } from '@/components/utils/CurrencyFormatter';
import {Tooltip} from "recharts";



export const OrderItemsModal = ({ opened, onClose, order }:{opened:boolean,onClose:()=>void,order:any}) => {
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
    const [currentPage, setCurrentPage] = useState(1);
    const [viewFull,setViewFull]=useState<string|null>(null)
    const itemsPerPage = 6; // Adjust based on desired items per page

    // Calculate paginated items
    const totalItems = order?.order_items.length || 0;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedItems = order?.order_items.slice(startIndex, startIndex + itemsPerPage);

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={
                <Text fw={700} size="xl" c="dark.8">
                    Order Items - #{order?.order_id}
                </Text>
            }
            size="xl"
            centered
            radius="lg"
            overlayProps={{ opacity: 0.6, blur: 4 }}
            styles={{
                content: {
                    background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e2e8f0',
                },
                header: {
                    padding: '24px',
                    borderBottom: '1px solid #e2e8f0',
                    background: '#f8fafc',
                },
                body: {
                    padding: '24px',
                },
            }}
            transitionProps={{
                transition: 'fade',
                duration: 300,
                timingFunction: 'ease-in-out',
            }}
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Stack gap="xl">
                    <Group justify="space-between">
                        <Text fw={600} size="md">
                            {viewMode==="table"?"Table":"Grid"} View
                        </Text>
                        <Group gap="xs">
                            <Button
                                variant={viewMode === 'table' ? 'filled' : 'light'}
                                color="violet"
                                size="xs"
                                leftSection={viewMode==="table"?<IconGridDots size={14} />:<IconTable size={14} />}
                                onClick={() => setViewMode(viewMode==="table"?'grid':"table")}
                                style={{ borderRadius: '8px' }}
                            >
                                {viewMode==="table"? "Grid":"Table"}
                            </Button>
                            {/*<Button*/}
                            {/*    variant={viewMode === 'grid' ? 'filled' : 'light'}*/}
                            {/*    color="violet"*/}
                            {/*    size="xs"*/}
                            {/*    leftSection={<IconGridDots size={14} />}*/}
                            {/*    onClick={() => setViewMode('grid')}*/}
                            {/*    style={{ borderRadius: '8px' }}*/}
                            {/*>*/}
                            {/*    Grid*/}
                            {/*</Button>*/}
                        </Group>
                    </Group>
                    <ScrollArea h="auto" scrollbarSize={6} type="auto">
                        {viewMode === 'table' ? (
                            <Table
                                verticalSpacing="lg"
                                horizontalSpacing="md"
                                highlightOnHover

                                withColumnBorders
                                style={{
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0',
                                    background: '#ffffff',
                                }}
                            >
                                <thead>
                                <tr>
                                    <th style={{ padding: '12px 16px', color: '#1e293b', fontWeight: 600, fontSize: '14px' }}>Image</th>
                                    <th style={{ padding: '12px 16px', color: '#1e293b', fontWeight: 600, fontSize: '14px' }}>Product</th>
                                    <th style={{ padding: '12px 16px', color: '#1e293b', fontWeight: 600, fontSize: '14px' }}>Store</th>
                                    <th style={{ padding: '12px 16px', color: '#1e293b', fontWeight: 600, fontSize: '14px' }}>Details</th>
                                    <th style={{ padding: '12px 16px', color: '#1e293b', fontWeight: 600, fontSize: '14px' }}>Qty</th>
                                    <th style={{ padding: '12px 16px', color: '#1e293b', fontWeight: 600, fontSize: '14px' }}>Price</th>
                                    <th style={{ padding: '12px 16px', color: '#1e293b', fontWeight: 600, fontSize: '14px' }}>Total</th>
                                </tr>
                                </thead>
                                <tbody>
                                {paginatedItems?.map((item:any, index:any) => (
                                    <tr key={index} style={{ transition: 'background-color 0.2s ease' }}>
                                        <td style={{ padding: '16px', width: '80px', textAlign: 'center' }}>
                                            {item.product_images ? (
                                                <Image
                                                    src={item?.product_images[1]}
                                                    alt={item.product_name}
                                                    width={100}
                                                    height={100}
                                                    radius="md"
                                                    style={{ border: '1px solid #e2e8f0', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <Image
                                                    src={"/assets/logo.png"}
                                                    alt={item.product_name}
                                                    width={100}
                                                    height={100}
                                                    radius="md"
                                                    style={{ border: '1px solid #e2e8f0', objectFit: 'cover' }}
                                                />
                                                // <IconPackage size={60} color="#64748b" />
                                            )}
                                        </td>
                                        <td style={{ padding: '16px', maxWidth: '200px' }}>
                                            <Text fw={500} size="sm" lineClamp={2}>
                                                {item?.product_name}
                                            </Text>
                                        </td>
                                        <td style={{ padding: '16px', width: '120px' }}>
                                            <Text size="sm" c="dimmed">
                                                {item?.store_name}
                                            </Text>
                                        </td>
                                        <td style={{ padding: '16px', maxWidth: '150px' }}>
                                            <Text size="sm" c="dimmed" lineClamp={2}>
                                                {item?.stock_details?.color && `Color: ${item.stock_details.color}`}
                                                {item?.stock_details?.size && `, Size: ${item.stock_details.size} ${item.stock_details.size_unit}`}
                                            </Text>
                                        </td>
                                        <td style={{ padding: '16px', width: '80px', textAlign: 'center' }}>
                                            <Text size="sm">{item.quantity}</Text>
                                        </td>
                                        <td style={{ padding: '16px', width: '100px', textAlign: 'right' }}>
                                            <Text size="sm">${formatNumberWithCondition(item.product_price)}</Text>
                                        </td>
                                        <td style={{ padding: '16px', width: '100px', textAlign: 'right' }}>
                                            <Text size="sm" fw={500}>
                                                ${formatNumberWithCondition(item.sub_total)}
                                            </Text>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </Table>
                        ) : (
                            <Grid gutter="md">
                                {paginatedItems?.map((item:any, index:any) => (
                                    <Grid.Col key={index} span={{ base: 12, sm: 6, md: 4 }}>
                                        <Card
                                            padding="md"
                                            radius="md"
                                            withBorder
                                            h={{md:"500px",sm:"auto"}}
                                            style={{



                                                borderColor: '#e2e8f0',
                                                background: '#ffffff',
                                                transition: 'all 0.2s ease',
                                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                                            }}
                                            className="hover:shadow-md hover:border-violet-200"
                                        >
                                            <Stack gap="sm">
                                                <Group mih={ { md:300 ,sm:100}}  >
                                                    {item?.product_images ? (
                                                        <Image
                                                            src={item?.product_images[1]}
                                                            alt={item?.product_name}
                                                            width={100}
                                                            height={100}
                                                            radius="md"
                                                            style={{ border: '1px solid #e2e8f0', objectFit: "cover" }}
                                                        />
                                                    ) : (
                                                        <Image
                                                            src={"/assets/logo.png"}
                                                            alt={item?.product_name}
                                                            width={100}
                                                            height={100}
                                                            radius="md"
                                                            style={{ border: '1px solid #e2e8f0', objectFit: "contain" }}
                                                        />
                                                        // <IconPackage size={100} color="#64748b" />
                                                    )}
                                                </Group>


                                                <Text title={item?.product_name} fw={600}  size="sm" lineClamp={  viewFull ===item.product_name?8:1} style={{ textAlign: "left" }}
                                                      onMouseEnter={()=>setViewFull(item.product_name)} onMouseLeave={()=>{setViewFull(null)}}>
                                                    {item?.product_name}
                                                </Text>

                                                <Text size="xs" c="black" style={{ textAlign: 'left' }}>
                                                    Store: {item?.store_name}
                                                </Text>
                                                <Group justify="space-between">

                                                <Text size="xs" c="dimmed" style={{ textAlign: 'left',gap:4 }}>
                                                    {item?.stock_details?.color && `Color: ${item?.stock_details?.color}`}
                                                    {/*{item.stock_details.size && `, Size: ${item.stock_details.size} ${item.stock_details.size_unit}`}*/}
                                                </Text>
                                                <Text size="xs" c="dimmed" style={{ textAlign: 'left',gap:4 }}>
                                                    {/*{item.stock_details.color && `Color: ${item.stock_details.color}`}*/}
                                                    {item.stock_details?.size && ` Size: ${item.stock_details?.size} ${item.stock_details?.size_unit}`}
                                                </Text>
                                                </Group>
                                                <Group justify="space-between">
                                                    <Text size="xs" c="dimmed">
                                                        Qty: {item?.quantity}
                                                    </Text>
                                                    <Text size="xs" c="dimmed">
                                                        Price: ${formatNumberWithCondition(item?.product_price)}
                                                    </Text>
                                                </Group>
                                                <Divider my="xs" style={{ borderColor: '#e2e8f0' }} />
                                                <Group justify="space-between">
                                                    <Text fw={600} size="sm">
                                                        Total
                                                    </Text>
                                                    <Text fw={600} size="sm" c="#10b981">
                                                        ${formatNumberWithCondition(item?.sub_total)}
                                                    </Text>
                                                </Group>
                                            </Stack>
                                        </Card>
                                    </Grid.Col>
                                ))}
                            </Grid>
                        )}
                    </ScrollArea>
                    {/*<Pagination*/}
                    {/*    total={totalPages}*/}
                    {/*    value={currentPage}*/}
                    {/*    onChange={setCurrentPage}*/}
                    {/*    size="sm"*/}
                    {/*    withEdges*/}
                    {/*    style={{ marginTop: '16px' }}*/}
                    {/*    styles={{*/}
                    {/*        control: {*/}
                    {/*            borderRadius: '8px',*/}
                    {/*            '&:hover': { backgroundColor: '#f1f5f9' },*/}
                    {/*        },*/}
                    {/*        // active: {*/}
                    {/*        //     backgroundColor: '#7c3aed',*/}
                    {/*        //     color: '#ffffff',*/}
                    {/*        // },*/}
                    {/*    }}*/}
                    {/*/>*/}
                    <Divider my="md" style={{ borderColor: '#e2e8f0' }} />
                    <Stack gap="md">
                        <Group justify="space-between">
                            <Text fw={600} size="md">
                                Subtotal
                            </Text>
                            <Text fw={600} size="md" c="#10b981">
                                ${formatNumberWithCondition(order?.sub_total)}
                            </Text>
                        </Group>
                        {order?.coupon_used && order?.discount && (
                            <Group justify="space-between">
                                <Text fw={600} size="md">
                                    Discount ({order?.coupon_name})
                                </Text>
                                <Text fw={600} size="md" c="red">
                                    -${formatNumberWithCondition(order?.discount)}
                                </Text>
                            </Group>
                        )}
                        <Group justify="space-between">
                            <Text fw={700} size="lg">
                                Total
                            </Text>
                            <Text fw={700} size="lg" c="#10b981">
                                ${formatNumberWithCondition(order?.total_price)}
                            </Text>
                        </Group>
                        <Divider my="md" style={{ borderColor: '#e2e8f0' }} />
                        <Stack gap="xs">
                            <Text fw={700} size="md">
                                Delivery Address
                            </Text>
                            <Text size="sm" c="dimmed">
                                {order?.delivery_address?.first_name} {order?.delivery_address?.last_name}
                            </Text>
                            <Text size="sm" c="dimmed">
                                {order?.delivery_address?.street_address}, {order?.delivery_address?.city},{' '}
                                {order?.delivery_address?.state}, {order?.delivery_address?.country}
                            </Text>
                            {order?.delivery_address?.contact_number && (
                                <Text size="sm" c="dimmed">
                                    Contact: {order?.delivery_address?.contact_number}
                                </Text>
                            )}
                        </Stack>
                    </Stack>
                </Stack>
            </motion.div>
        </Modal>
    );
};