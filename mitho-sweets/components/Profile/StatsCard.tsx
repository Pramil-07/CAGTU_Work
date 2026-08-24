import {Badge, Card, Group, NumberFormatter, Stack, Text, ThemeIcon} from "@mantine/core";

function StatsCard({
                       icon: Icon,
                       label,
                       value,
                       color,
                       subtitle,
                       trend,
                   }: {
    icon: any
    label: string
    value: string | number
    color: string
    subtitle?: string
    trend?: number
}) {
    return (
        <Card
            padding="xl"
            radius="xl"
            style={{
                background: `linear-gradient(135deg, ${color}08 0%, ${color}03 100%)`,
                border: `1px solid ${color}20`,
                transition: "all 0.3s ease",
            }}
            className="hover:shadow-lg hover:scale-105"
        >
            <Group justify="space-between" mb="lg">
                <ThemeIcon size="xl" radius="xl" variant="light" color={color.replace("#", "")}>
                    <Icon size={28} />
                </ThemeIcon>
                {trend && (
                    <Badge color={trend > 0 ? "teal" : "red"} variant="light" size="sm" radius="md">
                        {trend > 0 ? "+" : ""}
                        {trend}%
                    </Badge>
                )}
            </Group>
            <Stack gap="xs">
                <Text size="2xl" fw={700} c={color}>
                    {typeof value === "number" && value > 1000 ? <NumberFormatter value={value} thousandSeparator /> : value}
                </Text>
                <Text size="sm" fw={600} c="dark.6">
                    {label}
                </Text>
                {subtitle && (
                    <Text size="xs" c="dimmed">
                        {subtitle}
                    </Text>
                )}
            </Stack>
        </Card>
    )
}
export  default StatsCard;