import { Badge } from '@mantine/core';

// Define the possible status values
type OrderStatus = 'ordered' | 'delivered' | 'processing' | 'shipped' | 'cancelled';

interface StatusBadgeProps {
    status: OrderStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
    const statusColors: Record<OrderStatus, string> = {
        ordered: 'blue',
        delivered: 'teal',
        processing: 'cyan',
        shipped: 'green',
        cancelled: 'red',
    };

    return (
        <Badge
            color={statusColors[status] || 'gray'}
            variant="light"
            radius="sm"
            style={{ textTransform: 'capitalize' }}
        >
            {status}
        </Badge>
    );
};