import type { SelectItem } from "@mantine/core";
import { format } from "date-fns";

export const minutesType = [
    {
        id: 1,
        value: "00",
        label: "0 Minute",
    },
    {
        id: 2,
        value: "15",
        label: "15 Minutes",
    },
    {
        id: 3,
        value: "30",
        label: "30 Minutes",
    },
    {
        id: 4,
        value: "45",
        label: "45 Minutes",
    },
];

function createTimeArray() {
    const formattedTime = [];
    const unformattedTime = [];

    const startTime = new Date();
    startTime.setHours(0, 0, 0, 0); // Set start time to 12:00 AM

    const endTime = new Date();
    endTime.setHours(23, 45, 0, 0); // Set end time to 11:45 PM

    const interval = 15; // Interval in minutes

    const currentTime = new Date(startTime);

    while (currentTime <= endTime) {
        const formatTheTime = formatTime(currentTime);
        formattedTime.push(formatTheTime);
        unformattedTime.push(new Date(currentTime));
        currentTime.setMinutes(currentTime.getMinutes() + interval);
    }

    return { formattedTime, unformattedTime };
}

function formatTime(date: Date) {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    let meridiem = "AM";

    if (hours >= 12) {
        meridiem = "PM";
        if (hours > 12) {
            hours -= 12;
        }
    }

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0"
    )} ${meridiem}`;
}

export const TIME_INTERVAL: SelectItem[] = createTimeArray().formattedTime.map(
    (label, index) => {
        return {
            id: index + 1,
            label,
            value: format(
                createTimeArray().unformattedTime[index],
                "HH:mm:ss"
            ).toString(),
        };
    }
);
