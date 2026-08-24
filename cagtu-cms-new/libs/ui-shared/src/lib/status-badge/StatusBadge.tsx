import { BadgeProps } from '@mantine/core';
import Badge from '../badge/Badge';

interface StatusBadgeProps {
    name: string;
}

export const StatusBadge = ({ name, ...props }: StatusBadgeProps & Partial<BadgeProps>) => {
    switch (name) {
        case 'open':
        case 'monthly':
            return <Badge {...props} name={name} color="lime" />;

        case 'pending':
        case 'project':
            return <Badge {...props} name={name} color="yellow" />;

        case 'on_progress':
            return <Badge {...props} name={name?.replace('_', ' ')} color="yellow" />;

        case 'cancelled':
        case 'rejected':
        case 'hourly':
            return <Badge {...props} name={name} color="red" />;

        case 'approved':
        case 'fixed':
        case 'resolved':
        case 'completed':
            return <Badge {...props} name={name} color="green" />;

        case 'assigned':
        case 'initiated':
        case 'daily':
            return <Badge {...props} name={name} color="orange" />;

        case 'closed':
            return <Badge {...props} name={name} color="dark" />;

        default:
            return <Badge {...props} name="New" />;
    }
};
