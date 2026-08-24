import { Table, Group, Text, Badge, ThemeIcon } from '@mantine/core';
import { IconCalendar, IconCreditCard, IconGift, IconCircleCheck } from '@tabler/icons-react';
import { Transaction } from '@/DataTypes/TransactionProps';
import StatusBadge from "@/components/Profile/StatusBadge";

interface TransactionTableRowProps {
    transaction: Transaction;
}

export const TransactionTableRow = ({ transaction }: TransactionTableRowProps) => {
    return (
        <Table.Tr
            style={{
                transition: 'all 0.3s ease',
                background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
            }}
            className="hover:bg-violet-50"
        >
            <Table.Td>
                <Group gap="lg">
                    <ThemeIcon
                        size="sm"
                        radius="md"
                        variant="light"
                        color={
                            transaction.transaction_type === 'purchase'
                                ? 'red'
                                : transaction.transaction_type === 'reward'
                                    ? 'yellow'
                                    : 'teal'
                        }
                    >
                        {transaction.transaction_type === 'purchase' ? (
                            <IconCreditCard size={16} />
                        ) : transaction.transaction_type === 'reward' ? (
                            <IconGift size={16} />
                        ) : (
                            <IconCircleCheck size={16} />
                        )}
                    </ThemeIcon>
                    <Text fw={600} size="sm" c="dark.8">
                        {transaction?.intent_id}
                    </Text>
                </Group>
            </Table.Td>
            <Table.Td>
                <Text size="sm" c="dimmed">
                    {transaction?.description || 'No description'}
                </Text>
            </Table.Td>
            <Table.Td>
                <Text size="sm" c="dimmed">
                    {transaction.provider}
                </Text>
            </Table.Td>
            <Table.Td>
                <Group gap="xs">
                    <IconCalendar size={14} color="#64748b" />
                    <Text size="sm" c="dimmed">
                        {new Date(transaction?.created_at).toLocaleDateString()}
                    </Text>
                </Group>
            </Table.Td>
            <Table.Td>
                <StatusBadge status={transaction?.payment_status} />
            </Table.Td>
            <Table.Td>
                <Text
                    size="sm"
                    fw={700}
                    c={transaction?.amount > 0 ? '#10b981' : '#ef4444'}
                >
                    {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction?.amount)}
                </Text>
            </Table.Td>
            <Table.Td>
                <Text size="sm" c="dimmed" tt="capitalize" fw={500}>
                    {transaction.transaction_type}
                </Text>
            </Table.Td>
        </Table.Tr>
    );
};