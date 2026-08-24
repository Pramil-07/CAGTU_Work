import { Box, Button, Flex, Grid, useMantineTheme } from "@mantine/core";
import { Text } from "@mantine/core";
import {
    IconCalendar,
    IconCalendarPlus,
    IconClock,
    IconUsers,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useRouter } from "next/router";
import React, { useState } from "react";

import { CalenderInteractive } from "@/components/common/CalenderInteractive";
import { EventAddModal } from "@/components/event/EventAddModal";
import { ScheduleCard } from "@/components/event/ScheduleCard";
import { ScheduleModal } from "@/components/event/ScheduleModel";
import Layout from "@/components/Layout/Layout";
import urls from "@/constants/urls";
import { useEntityServiceDetailStyles } from "@/styles/pages/EntityServiceDetailStyles";
import type { EventGetProps } from "@/types/event/EventGetProps";
import { axiosClient } from "@/utils/axiosClient";

const Events = () => {
    const { classes } = useEntityServiceDetailStyles();
    const theme = useMantineTheme();
    const [eventModel, setEventModel] = useState(false);
    const [scheduleModel, setScheduleModel] = useState(false);

    const router = useRouter();
    const { data } = useQuery(
        ["event-schedule-listing", router?.query?.event_id],
        async () => {
            try {
                const { data } = await axiosClient.get<EventGetProps>(
                    `${urls.event.initial}${router?.query?.event_id}/`
                );
                return data;
            } catch (error) {
                console.log(
                    "🚀 ~ file: [id].tsx:20 ~ const{data}=useQuery ~ error",
                    error
                );
            }
        },
        { enabled: !!router?.query?.event_id }
    );
    const { start, end, guest_limit, is_flexible, schedules, title } =
        data ?? {};
    return (
        <Layout
            breadCrumbsItems={[{name:"Task & Bookings",href:""},
                { name: "service", href: "/services" },
                {
                    name: "detail",
                    href: `/services/${router?.query?.id}`,
                },
            ]}
            currentTitle={title ?? ""}
        > 
            <Grid gutter={30}>
                <Grid.Col md={5}>
                    <Flex>
                        <h4>Event</h4>
                        <p
                            className={classes.pressable}
                            onClick={() => setEventModel(true)}
                        >
                            {" "}
                            Edit
                        </p>
                    </Flex>

                    <Box className={classes.event}>
                        <Text component="p" mb={10}>
                            <Text component="span" fw={500} size={14}>
                                Title :
                            </Text>{" "}
                            {title}
                        </Text>
                        <Flex justify={"flex-start"} gap={8} pb={14}>
                            <IconCalendar
                                size={18}
                                color={theme.colors.gray[6]}
                            />{" "}
                            <p>
                                {start && format(new Date(start), "PP")} -{" "}
                                {end && format(new Date(end), "PP")}
                            </p>
                        </Flex>
                        <Flex justify={"flex-start"} gap={8} pb={14}>
                            <IconUsers size={18} color={theme.colors.gray[6]} />{" "}
                            <p>{guest_limit} guests</p>
                        </Flex>
                        {is_flexible && (
                            <Flex justify={"flex-start"} gap={8} pb={14}>
                                <IconClock
                                    size={18}
                                    color={theme.colors.gray[6]}
                                />{" "}
                                <p>Is Flexible</p>
                            </Flex>
                        )}
                    </Box>
                    <Flex>
                        <h4>Schedule</h4>
                        {schedules?.length ? (
                            <p
                                className={classes.pressable}
                                onClick={() => setScheduleModel(true)}
                            >
                                {" "}
                                New
                            </p>
                        ) : (
                            ""
                        )}
                    </Flex>
                    {schedules?.length ? (
                        schedules?.map((item, index) => (
                            <ScheduleCard schedules={item} key={index} />
                        ))
                    ) : (
                        <Box className={classes.schedule}>
                            <Flex justify={"flex-start"} gap={24}>
                                <IconCalendarPlus
                                    size={32}
                                    color={theme.colors.gray[6]}
                                />
                                <Box>
                                    <h4>No Schedule Found</h4>
                                    <p>Add New Schedule</p>
                                </Box>
                            </Flex>
                            <Flex justify={"flex-end"} mt={8}>
                                <Button onClick={() => setScheduleModel(true)}>
                                    {" "}
                                    + Create New
                                </Button>
                            </Flex>
                        </Box>
                    )}
                </Grid.Col>
                <Grid.Col md={7}>
                    {data && <CalenderInteractive events={data} />}
                </Grid.Col>
            </Grid>
            <EventAddModal
                event_id={router?.query?.event_id as string}
                opened={eventModel}
                setOpened={setEventModel}
                service_id={router?.query?.id as string}
            />
            <ScheduleModal
                event_id={router?.query?.event_id as string}
                opened={scheduleModel}
                setOpened={setScheduleModel}
            />
        </Layout>
    );
};
export default Events;
