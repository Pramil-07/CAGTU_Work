import {IconCircleCheck, IconCircleX, IconClock, IconTruck} from "@tabler/icons-react";
import {Badge} from "@mantine/core";

function StatusBadge({ status }: { status: string }) {
    const getStatusConfig = () => {
        switch (status) {
            case "delivered":
            case "completed":
                return { color: "teal", icon: IconCircleCheck }
            case "shipped":
                return { color: "blue", icon: IconTruck }
            case "processing":
                return { color: "orange", icon: IconClock }
            case "pending":
                return { color: "yellow", icon: IconClock }
            case "cancelled":
            case "failed":
                return { color: "red", icon: IconCircleX }
            default:
                return { color: "gray", icon: IconClock }
        }
    }

    const { color, icon: Icon } = getStatusConfig()

    return (
        <Badge
            color={color}
            variant="light"
            leftSection={<Icon size={12} />}
            size="sm"
            radius="md"
            style={{ fontWeight: 500 }}
        >
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
    )
}
export default  StatusBadge;