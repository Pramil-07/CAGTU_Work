import type { DateSelectArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import { Box, Flex, Text, Title, useMantineTheme } from "@mantine/core";
import { IconPoint } from "@tabler/icons-react";
import { format, parse } from "date-fns";
import type { Dispatch, SetStateAction } from "react";
import React from "react";

import { useEventListing } from "@/hooks/useEventListing";
import { useCalendarInteractiveStyles } from "@/styles/components/CalendarInteractiveStyles";
import type { BookingDataProps } from "@/types/booking/BookingDataProps";
import type { EventGetProps } from "@/types/event/EventGetProps";

import { SlotButton } from "./SlotButton";

export const CalenderInteractive = ({
    events,
    selectedDateTime,
    setSelectedDateTime,
}: {
    events: BookingDataProps["event"] & EventGetProps;
    selectedDateTime?: { date: string; start: string; end: string };
    setSelectedDateTime?: Dispatch<
        SetStateAction<{ date: string; start: string; end: string }>
    >;
}) => {
    const { classes: CalendarStyles } = useCalendarInteractiveStyles();
    const theme = useMantineTheme();

    const { id } = events ?? {};
    const { data } = useEventListing(id);

    const active_dates =
        events?.active_dates ?? data?.all_shifts.map((item) => item.date);

    const eventAvailable = active_dates?.map((item) => ({ date: item }));

    const handleDateSelect = (e: DateSelectArg) => {
        const formatedDate = format(new Date(e?.start), "yyyy-MM-dd");
        const today = new Date();

        if (setSelectedDateTime)
            if (data?.active_dates) {
                active_dates?.forEach((item) => {
                    if (item.includes(formatedDate)) {
                        setSelectedDateTime({
                            date: formatedDate,
                            start: "",
                            end: "",
                        });
                    }
                });
            } else {
                if (
                    new Date(formatedDate) >=
                    new Date(new Date(today).setDate(today.getDate() - 1))
                )
                    setSelectedDateTime({
                        date: formatedDate,
                        start: "",
                        end: "",
                    });
            }
    };

    return (
        <Box className={CalendarStyles.main}>
            <Title order={4} weight={500} mb={24}>
                Select Date
            </Title>
            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
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
                selectable={true}
                select={(e) => handleDateSelect(e)}
                unselectAuto={false}
                longPressDelay={1}
                eventClassNames={CalendarStyles.event}
                dayCellClassNames={CalendarStyles.day}
                events={eventAvailable}
            />
            <Flex mt={24} justify={"flex-start"} gap={8} wrap={"wrap"}>
                {data &&
                    data?.all_shifts[0]?.slots?.length > 0 &&
                    selectedDateTime?.date &&
                    "Select Shift:"}
                {data &&
                    selectedDateTime?.date &&
                    setSelectedDateTime &&
                    data?.all_shifts?.map(
                        (item) =>
                            item.date.includes(selectedDateTime.date) &&
                            item?.slots?.map((item, index) => (
                                <SlotButton
                                    key={index}
                                    sx={{
                                        background:
                                            selectedDateTime.start ===
                                                item?.start &&
                                            selectedDateTime.end === item?.end
                                                ? theme.colors.brand[1]
                                                : "#f1f1f1",
                                        color:
                                            selectedDateTime.start ===
                                                item?.start &&
                                            selectedDateTime.end === item?.end
                                                ? theme.colors.brand[4]
                                                : theme.colors.gray[8],
                                        "&:hover": {
                                            transition: "0.5s",
                                            color: "white",
                                            background: theme.colors.brand[1],
                                        },
                                    }}
                                    onClick={() => {
                                        setSelectedDateTime((state) => ({
                                            date: state.date,
                                            start: item?.start,
                                            end: item?.end,
                                        }));
                                    }}
                                >
                                    {format(
                                        parse(
                                            item?.start.split(":", 2).join(":"),
                                            "HH:mm",
                                            new Date()
                                        ),
                                        "hh:mm a"
                                    )}{" "}
                                    -{" "}
                                    {format(
                                        parse(
                                            item?.end.split(":", 2).join(":"),
                                            "HH:mm",
                                            new Date()
                                        ),
                                        "hh:mm a"
                                    )}
                                </SlotButton>
                            ))
                    )}
            </Flex>
            <Flex justify={"flex-end"} align={"flex-right"} gap={16}>
                <Flex>
                    <IconPoint
                        style={{
                            fill: theme.colors[theme.primaryColor][4],
                        }}
                        color={theme.colors[theme.primaryColor][4]}
                    />
                    <Text>Available</Text>
                </Flex>
                <Flex>
                    <IconPoint
                        style={{
                            fill: theme.colors.gray[8],
                        }}
                        color={theme.colors.gray[8]}
                    />
                    <Text>Inactive</Text>
                </Flex>
                <Flex>
                    <IconPoint
                        style={{
                            fill: theme.colors.gray[4],
                        }}
                        color={theme.colors.gray[4]}
                    />
                    <Text>Unavailable</Text>
                </Flex>
            </Flex>
        </Box>
    );
};
