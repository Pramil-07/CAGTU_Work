import {
    Button,
    Checkbox,
    Flex,
    FocusTrap,
    Grid,
    LoadingOverlay,
    Text,
    Title,
    useMantineTheme,
} from "@mantine/core";
import { IconCalendarEvent } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import type { Dispatch, SetStateAction } from "react";
import React from "react";

import { minutesType } from "@/constants/minutesData";
import urls from "@/constants/urls";
import type { EventGetProps } from "@/types/event/EventGetProps";
import type {
    EventPostPayload,
    ExtendedEventPostPayload,
} from "@/types/event/EventPostPayload";
import { axiosClient } from "@/utils/axiosClient";
import { eventCreateSchema } from "@/utils/validation/EventCreateValidation";

import DateField from "../common/form/DateField";
import FormButton from "../common/form/FormButton";
import InputField from "../common/form/InputField";
import NumberField from "../common/form/NumberField";
import SelectField from "../common/form/SelectField";
import HomaaleLoader from "../common/HomaaleLoader";
import { toast } from "../common/Toast";

export const EventCreateForm = ({
    event_id,
    service_id,
    setOpened,
}: {
    event_id?: string;
    service_id: string;
    setOpened: Dispatch<SetStateAction<boolean>>;
}) => {
    const theme = useMantineTheme();
    const router = useRouter();

    const { mutate, isLoading } = useMutation<
        any,
        AxiosError,
        EventPostPayload
    >(async (data) => {
        if (event_id) {
            await axiosClient
                .patch(`${urls.event.initial}${event_id}/`, data)
                .then((response) => response.data);
        } else
            await axiosClient
                .post(`${urls.event.initial}`, data)
                .then((response) => response.data);
    });

    const queryClient = useQueryClient();

    const { data } = useQuery(
        ["event-schedule-listing", event_id],
        async () => {
            try {
                const { data } = await axiosClient.get<EventGetProps>(
                    `${urls.event.initial}${event_id}/`
                );
                return data;
            } catch (error) {
                console.log(
                    "🚀 ~ file: [id].tsx:20 ~ const{data}=useQuery ~ error",
                    error
                );
            }
        },
        { enabled: !!event_id }
    );

    const { title, start, end, guest_limit, duration, is_flexible } =
        data ?? {};

    const disectDuration = duration?.split(":");

    return (
        <>
            <Title order={5} weight={500} mb={16}>
                {event_id ? "Edit event" : "Create an Event"}
            </Title>
            <LoadingOverlay
                loader={<HomaaleLoader />}
                visible={isLoading}
                sx={{ position: "fixed", inset: 0 }}
            />
            <Formik
                initialValues={{
                    duration: "",
                    entity_service: (router.query.id as string) ?? "",
                    title: title ?? "",
                    description: "",
                    is_flexible: is_flexible ?? false,
                    start: start
                        ? (new Date(start as string) as unknown as string)
                        : "",
                    end: end
                        ? (new Date(end as string) as unknown as string)
                        : "",
                    guest_limit: guest_limit ?? null,
                    is_active: true,
                    is_unlimited_guest: false,
                    hours: disectDuration ? parseInt(disectDuration[0]) : null,
                    minutes: disectDuration ? disectDuration[1] : "00",
                }}
                validationSchema={eventCreateSchema}
                onSubmit={async (values: ExtendedEventPostPayload, actions) => {
                    const updatedPayload = {
                        ...values,
                        duration: `${values.hours}:${values.minutes}:00`,
                    };

                    //To remove unneccessary fields
                    delete updatedPayload.hours;
                    delete updatedPayload.minutes;
                    delete updatedPayload.is_unlimited_guest;

                    mutate(updatedPayload, {
                        onSuccess: () => {
                            if (event_id) {
                                toast.success("Event Updated successfully");
                                queryClient.invalidateQueries([
                                    "service-detail",
                                    service_id,
                                ]);
                                queryClient.invalidateQueries([
                                    "event-schedule-listing",
                                    event_id,
                                ]);
                            } else {
                                toast.success("Event Created successfully");
                                queryClient.invalidateQueries([
                                    "service-detail",
                                    service_id,
                                ]);
                            }
                            setOpened(false);
                        },
                        onError: (e: any) => {
                            toast.error("Event Post Failed");
                            const { title, start, end, guest_limit, duration } =
                                e.response.data;
                            actions.setFieldError("title", title && title[0]);
                            actions.setFieldError("start", start && start[0]);
                            actions.setFieldError("end", end && end[0]);
                            actions.setFieldError(
                                "guest_limit",
                                guest_limit && guest_limit[0]
                            );
                            actions.setFieldError(
                                "end",
                                duration && duration[0]
                            );
                        },
                    });
                }}
            >
                {({ errors, touched, setFieldValue, values }) => (
                    <FocusTrap active={true}>
                        <Form>
                            <InputField
                                id="title"
                                name={"title"}
                                label={"Title"}
                                placeholder="Name"
                                touch={touched.title}
                                error={errors.title}
                                data-autofocus
                            />
                            <DateField
                                id="start"
                                name="start"
                                label="Start Date"
                                placeholder="MM/DD/YYYY"
                                error={errors.start}
                                touch={touched.start}
                                icon={<IconCalendarEvent size={20} />}
                                minDate={new Date()}
                                onChange={(value) => {
                                    setFieldValue("start", value);
                                }}
                            />
                            <DateField
                                id="end"
                                name="end"
                                label="End end"
                                placeholder="MM/DD/YYYY"
                                error={errors.end}
                                touch={touched.end}
                                icon={<IconCalendarEvent size={20} />}
                                minDate={new Date()}
                                onChange={(value) => {
                                    setFieldValue("end", value);
                                }}
                            />
                            <NumberField
                                id="guest_limit"
                                name={"guest_limit"}
                                label="Max No. of Guest"
                                placeholder="No. of Guest"
                                touch={touched.guest_limit}
                                error={errors.guest_limit}
                                minimum={1}
                                disabled={values.is_unlimited_guest}
                            />
                            <Checkbox
                                checked={values.is_unlimited_guest}
                                onChange={(event) => {
                                    setFieldValue(
                                        "is_unlimited_guest",
                                        event.currentTarget.checked
                                    );
                                    setFieldValue("guest_limit", 0);
                                }}
                                mb={24}
                                label={"No. of guest are unlimited"}
                            />
                            <Text component="p" mb={8}>
                                Duration of the event
                            </Text>
                            <Grid>
                                <Grid.Col md={6}>
                                    <Flex justify={"flex-start"} gap={10}>
                                        <NumberField
                                            id="hours"
                                            name={"hours"}
                                            placeholder="hours"
                                            maximum={24}
                                            w={"100%"}
                                            touch={touched.hours}
                                            error={
                                                errors.hours || errors.duration
                                            }
                                            rightSection={<p>Hours</p>}
                                            rightSectionWidth={55}
                                            minimum={0}
                                        />
                                    </Flex>
                                </Grid.Col>
                                <Grid.Col md={6}>
                                    <SelectField
                                        id="minutes"
                                        name={"minutes"}
                                        placeholder="minutes"
                                        data={minutesType}
                                        touch={touched.minutes}
                                        error={errors.minutes}
                                    />
                                </Grid.Col>
                            </Grid>
                            <Checkbox
                                checked={values.is_flexible}
                                onChange={(event) =>
                                    setFieldValue(
                                        "is_flexible",
                                        event.currentTarget.checked
                                    )
                                }
                                label={"This event is flexible."}
                            />
                            <Flex justify={"center"} gap={30} mt={80}>
                                <Button
                                    variant="outline"
                                    sx={{
                                        color: theme.colors.secondary[2],
                                        border: `1px solid ${theme.colors.secondary[2]}`,
                                    }}
                                    onClick={() => setOpened(false)}
                                >
                                    Cancel
                                </Button>
                                <FormButton
                                    name={"Save"}
                                    id={"Save-event-btn"}
                                    type="submit"
                                />
                            </Flex>
                        </Form>
                    </FocusTrap>
                )}
            </Formik>
        </>
    );
};
