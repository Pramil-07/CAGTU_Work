import { BadgeProps, Group, Text } from '@mantine/core';
import { IconChevronDown, IconChevronUp, IconEqual } from '@tabler/icons';
import Badge from '../badge/Badge';

interface PriorityBadgeProps {
    name: string;
}

export const PriorityBadge = ({ name, ...props }: PriorityBadgeProps & Partial<BadgeProps>) => {
    switch (name) {
        case 'High':
            return (
                <Badge
                    {...props}
                    color="red"
                    name={
                        <Group spacing={5}>
                            <IconChevronUp size={16} stroke={1.75} />
                            <Text component="span">{name}</Text>
                        </Group>
                    }
                />
            );

        case 'Medium':
            return (
                <Badge
                    {...props}
                    color="orange"
                    name={
                        <Group spacing={5}>
                            <IconEqual size={16} stroke={1.75} />
                            <Text component="span">{name}</Text>
                        </Group>
                    }
                />
            );

        default:
            return (
                <Badge
                    {...props}
                    color="blue"
                    name={
                        <Group spacing={5}>
                            <IconChevronDown size={16} stroke={1.75} />
                            <Text component="span">{name}</Text>
                        </Group>
                    }
                />
            );
    }
};
