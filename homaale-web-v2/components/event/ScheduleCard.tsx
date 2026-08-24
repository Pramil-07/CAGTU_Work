import { Box, Flex, Loader, Switch, useMantineTheme } from "@mantine/core";
import { IconCalendarEvent } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { format } from "date-fns";
import React, { useState } from "react";

import urls from "@/constants/urls";
import { useEntityServiceDetailStyles } from "@/styles/pages/EntityServiceDetailStyles";
import type { EntityServiceDetailProps } from "@/types/EntityServiceDetailProps";
import type { EventGetProps } from "@/types/event/EventGetProps";
import { axiosClient } from "@/utils/axiosClient";

import Ellipsis from "../common/Ellipsis";

export const ScheduleCard = ({
    schedules,
}: {
    schedules: EntityServiceDetailProps["event"]["schedules"][0];
}) => {
    const theme = useMantineTheme();
    const { classes } = useEntityServiceDetailStyles();

    const { end_date, start_date, title, id, is_active } = schedules ?? {};

    const [checked, setChecked] = useState(is_active);

    const { mutate, isLoading } = useMutation<
        EventGetProps["schedules"][0],
        AxiosError,
        { is_active: boolean }
    >(async (payload) => {
        const { data } = await axiosClient.patch<EventGetProps["schedules"][0]>(
            `${urls.event.schedule}${id}/`,
            payload
        );
        return data;
    });

    return (
        <Box className={classes.scheduleCard}>
            <Flex>
                <Flex justify={"flex-start"} gap={24}>
                    <IconCalendarEvent size={32} color={theme.colors.gray[6]} />
                    <Box>
                        <h4>{title}</h4>
                        <Flex gap={10}>
                            {start_date && (
                                <p className="start">
                                    Start:{" "}
                                    <span>
                                        {format(new Date(start_date), "PP")}
                                    </span>{" "}
                                </p>
                            )}
                            {end_date && (
                                <p className="end">
                                    End:{" "}
                                    <span>
                                        {format(new Date(end_date), "PP")}
                                    </span>
                                </p>
                            )}
                        </Flex>
                    </Box>
                </Flex>
                <Flex direction={"column"} align={"flex-end"} gap={14}>
                    <Ellipsis type="schedule" size={20} id={id} />
                    {!isLoading ? (
                        <Switch
                            checked={checked}
                            onChange={() =>
                                mutate(
                                    { is_active: !checked },
                                    {
                                        onSuccess: (e) => {
                                            if (e.is_active) {
                                                setChecked(true);
                                            } else setChecked(false);
                                        },
                                    }
                                )
                            }
                        />
                    ) : (
                        <Loader size={"sm"} />
                    )}
                </Flex>
            </Flex>
        </Box>
    );
};
