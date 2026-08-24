import { useState } from 'react';
import { Table, Group, Text, Button, Badge } from '@mantine/core';
import { IconCalendar, IconTruck, IconPackage } from '@tabler/icons-react';
import { OrderItemsModal } from './OrderItemsModal';
import { calculateEstimatedDeliveryDate, formatNumberWithCondition } from '@/components/utils/CurrencyFormatter';
import { Order } from '@/DataTypes/OrderHistoryProps';

interface OrderTableRowProps {
    order: Order;
}

export const OrderTableRow = ({ order }: OrderTableRowProps) => {
    const [modalOpened, setModalOpened] = useState(false);

    return (
        <>
            <Table.Tr
                style={{
                    transition: 'all 0.3s ease',
                    background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
                }}
                className="hover:bg-violet-50"
            >
                <Table.Td>
                    <Text fw={700} size="sm" c="dark.8">
                        #{order.order_id}
                    </Text>
                </Table.Td>
                <Table.Td>
                    <Group gap="xs">
                        <IconCalendar size={14} color="#64748b" />
                        <Text size="sm" c="dimmed">
                            {calculateEstimatedDeliveryDate(order?.created_at, 0)}
                        </Text>
                    </Group>
                </Table.Td>
                <Table.Td>
                    <Group gap="xs">
                        <IconTruck size={14} color="#64748b" />
                        <Text size="sm" c="dimmed">
                            {calculateEstimatedDeliveryDate(order?.created_at)}
                        </Text>
                    </Group>
                </Table.Td>
                <Table.Td>
                    <Badge
                        color={
                            order?.order_status === 'delivered' ? 'teal' :
                                order?.order_status === 'processing' ? 'blue' :
                                    order?.order_status === 'shipped' ? 'yellow' : 'gray'
                        }
                        variant="light"
                        radius="sm"
                    >
                        {order?.order_status}
                    </Badge>
                </Table.Td>
                <Table.Td>
                    <Text size="sm" fw={700} c="#10b981">
                        ${formatNumberWithCondition(order?.total_price)}
                    </Text>
                </Table.Td>
                <Table.Td>
                    <Text size="sm" c="dimmed" fw={500}>
                        {order.order_items?.length} {order.order_items.length === 1 ? 'item' : 'items'}
                    </Text>
                </Table.Td>
                <Table.Td>
                    <Group gap="sm">
                        <Button
                            variant="light"
                            color="violet"
                            size="xs"
                            leftSection={<IconPackage size={14} />}
                            onClick={() => setModalOpened(true)}
                            style={{ borderRadius: '8px' }}
                        >
                            View Items
                        </Button>
                    </Group>
                </Table.Td>
            </Table.Tr>
            <OrderItemsModal
                opened={modalOpened}
                onClose={() => setModalOpened(false)}
                order={order}
            />
        </>
    );
};