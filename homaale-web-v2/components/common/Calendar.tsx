import dayGridPlugin from "@fullcalendar/daygrid";
import FullCalendar from "@fullcalendar/react";
import { Box, Flex, Title, useMantineTheme } from "@mantine/core";
import { IconPoint } from "@tabler/icons-react";
import React from "react";

import { useCalendarStyles } from "@/styles/components/CalendarStyles";

export const Calendar = ({
    eventAvailable,
}: {
    eventAvailable: { date: string }[];
}) => {
    const { classes: CalendarStyles } = useCalendarStyles();
    const theme = useMantineTheme();
    return (
        <div>
            <Box className={CalendarStyles.main}>
                <FullCalendar
                    plugins={[dayGridPlugin]}
                    contentHeight={"auto"}
                    initialView="dayGridMonth"
                    eventDisplay="background"
                    eventContent={
                        <Title
                            order={1}
                            color={theme.colors[theme.primaryColor][4]}
                            mt={10}
                        >
                            .
                        </Title>
                    }
                    eventClassNames={CalendarStyles.event}
                    dayCellClassNames={CalendarStyles.day}
                    events={eventAvailable}
                />
            </Box>
            <Flex justify={"flex-end"} align={"flex-right"} gap={24}>
                <Flex>
                    <IconPoint
                        style={{
                            fill: theme.colors[theme.primaryColor][4],
                        }}
                        color={theme.colors[theme.primaryColor][4]}
                    />
                    <p>Available</p>
                </Flex>
                <Flex>
                    <IconPoint
                        style={{
                            fill: theme.colors.gray[8],
                        }}
                        color={theme.colors.gray[8]}
                    />
                    <p>Inactive</p>
                </Flex>
                <Flex>
                    <IconPoint
                        style={{
                            fill: theme.colors.gray[4],
                        }}
                        color={theme.colors.gray[4]}
                    />
                    <p>Unavailable</p>
                </Flex>
            </Flex>
        </div>
    );
};
