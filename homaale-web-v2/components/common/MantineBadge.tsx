import { Badge as MantineBadge, BadgeProps, MantineNumberSize, MantineSize } from '@mantine/core';
import { ReactNode } from 'react';

export interface MantineBadgeProps {
    name: ReactNode;
    radius?: MantineNumberSize | undefined;
    size?: MantineSize | undefined;
}

const Badge = ({ name, radius = 'xs', size = 'lg', ...props }: MantineBadgeProps & BadgeProps) => {
    return (
        <MantineBadge {...props} size={size} radius={radius} sx={{ fontWeight: 600, textTransform: 'capitalize', fontSize: 12 }}>
            {name}
        </MantineBadge>
    );
};

export default Badge;
