import {
    ActionIcon,
    Box,
    Button,
    Flex,
    FocusTrap,
    Grid,
    LoadingOverlay,
    Text,
    Title,
    useMantineTheme,
} from "@mantine/core";
import {
    IconCalendarEvent,
    IconCircleX,
    IconClock,
    IconPlus,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { format } from "date-fns";
import { FieldArray, Form, Formik, getIn } from "formik";
import { useRouter } from "next/router";
import type { Dispatch, SetStateAction } from "react";
import React from "react";

import { TIME_INTERVAL } from "@/constants/minutesData";
import { REPEAT_CHOICES } from "@/constants/RepeatChoices";
import urls from "@/constants/urls";
import type { EventGetProps } from "@/types/event/EventGetProps";
import type { SchedulePostPayload } from "@/types/SchedulePostPayload";
import { axiosClient } from "@/utils/axiosClient";
import { scheduleFromSchema } from "@/utils/validation/ScheduleFormValidation";

import DateField from "../common/form/DateField";
import FormButton from "../common/form/FormButton";
import SelectField from "../common/form/SelectField";
import HomaaleLoader from "../common/HomaaleLoader";
import { toast } from "../common/Toast";

export const ScheduleForm = ({
    schedule_id,
    event_id,
    setOpened,
}: {
    schedule_id?: string;
    event_id: string;
    setOpened: Dispatch<SetStateAction<boolean>>;
}) => {
    const theme = useMantineTheme();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { mutate, isLoading: scheduleLoading } = useMutation<
        any,
        AxiosError,
        SchedulePostPayload
    >(async (data) => {
        if (schedule_id) {
            await axiosClient
                .patch(`${urls.event.schedule}${schedule_id}/`, data)
                .then((response) => response.data);
        } else
            await axiosClient
                .post(`${urls.event.schedule}`, data)
                .then((response) => response.data);
    });

    const { data, isLoading: eventLoading } = useQuery<
        any,
        Error,
        EventGetProps
    >(
        ["event-detail", event_id],
        async () => {
            try {
                const { data } = await axiosClient.get<EventGetProps>(
                    `${urls.event.initial}${event_id}/`
                );
                return data;
            } catch (error) {
                console.log(
                    "🚀 ~ file: ScheduleForm.tsx:43 ~ const{data,isLoading}=useQuery<SchedulePostPayload> ~ error",
                    error
                );
            }
        },
        { enabled: !!event_id }
    );

    const { data: scheduleData } = useQuery<
        any,
        Error,
        EventGetProps["schedules"][0]
    >(
        ["schedule-detail", schedule_id],
        async () => {
            try {
                const { data } = await axiosClient.get<
                    EventGetProps["schedules"][0]
                >(`${urls.event.schedule}${schedule_id}/`);
                return data;
            } catch (error) {
                console.log(
                    "🚀 ~ file: ScheduleForm.tsx:43 ~ const{data,isLoading}=useQuery<SchedulePostPayload> ~ error",
                    error
                );
            }
        },
        { enabled: !!schedule_id }
    );

    const { end, start } = data ?? ({} as EventGetProps);

    const { start_date, end_date, repeat_type, slots } =
        scheduleData ?? ({} as EventGetProps["schedules"][0]);

    return (
        <div>
            <Title order={5} weight={500} mb={16}>
                {"New Schedule"}
            </Title>
            <LoadingOverlay
                loader={<HomaaleLoader />}
                visible={scheduleLoading || eventLoading}
                sx={{ position: "fixed", inset: 0 }}
            />
            <Formik
                initialValues={{
                    event: "",
                    repeat_type: repeat_type ? repeat_type.toString() : "1",
                    start_date: start_date ? new Date(start_date) : "",
                    end_date: start_date ? new Date(end_date) : "",
                    is_active: true,
                    slots: slots ? slots : [{ start: "", end: "" }],
                }}
                enableReinitialize
                validationSchema={scheduleFromSchema}
                onSubmit={async (values: SchedulePostPayload, actions) => {
                    const updatedPayload = {
                        ...values,
                        event: event_id,
                        start_date: values.start_date
                            ? format(
                                  new Date(String(values.start_date)),
                                  "yyyy-MM-dd"
                              )
                            : null,
                        end_date: values.end_date
                            ? format(
                                  new Date(String(values.end_date)),
                                  "yyyy-MM-dd"
                              )
                            : null,
                    };

                    mutate(updatedPayload, {
                        onSuccess: () => {
                            toast.success("Event Created successfully");
                            queryClient.invalidateQueries([
                                "service-detail",
                                router.query.id,
                            ]);
                            queryClient.invalidateQueries([
                                "event-schedule-listing",
                                event_id,
                            ]);
                            setOpened(false);
                        },
                        onError: (e: any) => {
                            toast.error("Schedule creation Failed");
                            const {
                                event,
                                repeat_type,
                                end_date,
                                is_active,
                                slots,
                                start_date,
                            } = e.response.data;
                            actions.setFieldError(
                                "repeat_type",
                                repeat_type && repeat_type[0]
                            );
                            actions.setFieldError(
                                "is_active",
                                is_active && is_active[0]
                            );
                            actions.setFieldError("title", slots && slots[0]);
                            actions.setFieldError(
                                "end_date",
                                end_date && end_date[0]
                            );
                            actions.setFieldError(
                                "start_date",
                                start_date && start_date[0]
                            );
                            actions.setFieldError("event", event && event[0]);
                            event && toast.error(event[0]);
                        },
                    });
                }}
            >
                {({ errors, touched, setFieldValue, values }) => (
                    <FocusTrap active={true}>
                        <Form>
                            <Grid>
                                <Grid.Col md={6}>
                                    <DateField
                                        id="start_date"
                                        name="start_date"
                                        label="Start Date"
                                        placeholder="MM/DD/YYYY"
                                        error={errors.start_date}
                                        touch={touched.start_date}
                                        icon={<IconCalendarEvent size={20} />}
                                        minDate={new Date(start)}
                                        maxDate={new Date(end)}
                                        onChange={(value) => {
                                            setFieldValue("start_date", value);
                                        }}
                                    />
                                </Grid.Col>
                                <Grid.Col md={6}>
                                    <DateField
                                        id="end_date"
                                        name="end_date"
                                        label="End Date"
                                        placeholder="MM/DD/YYYY"
                                        error={errors.end_date}
                                        touch={touched.end_date}
                                        icon={<IconCalendarEvent size={20} />}
                                        minDate={new Date(start)}
                                        maxDate={new Date(end)}
                                        onChange={(value) => {
                                            setFieldValue("end_date", value);
                                        }}
                                    />
                                </Grid.Col>
                            </Grid>
                            <Text
                                component="p"
                                color={
                                    theme.colorScheme === "dark"
                                        ? theme.colors.homaaleSlate[4]
                                        : theme.colors.homaaleSlate[6]
                                }
                            >
                                The schedule must be within{" "}
                                {start && format(new Date(start), "PP")} -
                                {end && format(new Date(end), "PP")}
                            </Text>
                            <Text
                                component="p"
                                mt={24}
                                sx={{
                                    color:
                                        theme.colorScheme === "dark"
                                            ? theme.colors.homaaleSlate[3]
                                            : theme.colors.gray[8],
                                    fontWeight: 400,
                                    marginBottom: 6,
                                }}
                            >
                                Shifts
                            </Text>
                            <FieldArray name="slots">
                                {({ remove, push }) => (
                                    <Box>
                                        {values?.slots &&
                                            values?.slots.map((_, idx) => (
                                                <Flex
                                                    key={idx}
                                                    wrap={"nowrap"}
                                                    gap={15}
                                                    align={"center"}
                                                >
                                                    <SelectField
                                                        name={`slots[${idx}].start`}
                                                        id={`slots[${idx}].start`}
                                                        label="Start Time"
                                                        w={"100%"}
                                                        placeholder="select time"
                                                        icon={
                                                            <IconClock
                                                                size={15}
                                                            />
                                                        }
                                                        radius={"md"}
                                                        size={"md"}
                                                        error={getIn(
                                                            errors,
                                                            `slots[${idx}].start`
                                                        )}
                                                        touch={getIn(
                                                            touched,
                                                            `slots[${idx}].start`
                                                        )}
                                                        searchable
                                                        handleChange={(value) =>
                                                            setFieldValue(
                                                                `slots[${idx}].start`,
                                                                value
                                                            )
                                                        }
                                                        data={TIME_INTERVAL}
                                                    />
                                                    <SelectField
                                                        name={`slots[${idx}].end`}
                                                        id={`slots[${idx}].end`}
                                                        label="End Time"
                                                        w={"100%"}
                                                        placeholder="select time"
                                                        icon={
                                                            <IconClock
                                                                size={15}
                                                            />
                                                        }
                                                        radius={"md"}
                                                        size={"md"}
                                                        error={getIn(
                                                            errors,
                                                            `slots[${idx}].end`
                                                        )}
                                                        touch={getIn(
                                                            touched,
                                                            `slots[${idx}].end`
                                                        )}
                                                        searchable
                                                        handleChange={(value) =>
                                                            setFieldValue(
                                                                `slots[${idx}].end`,
                                                                value
                                                            )
                                                        }
                                                        data={TIME_INTERVAL}
                                                    />
                                                    {values?.slots?.length >
                                                        1 && (
                                                        <ActionIcon
                                                            variant="light"
                                                            radius="xl"
                                                            size="sm"
                                                            color="gray"
                                                            onClick={() =>
                                                                remove(idx)
                                                            }
                                                            sx={{
                                                                cursor: "pointer",
                                                            }}
                                                        >
                                                            <IconCircleX
                                                                size={18}
                                                                stroke={1.75}
                                                            />
                                                        </ActionIcon>
                                                    )}
                                                </Flex>
                                            ))}
                                        <Button
                                            name="Add"
                                            variant="outline"
                                            leftIcon={
                                                <IconPlus
                                                    size={18}
                                                    stroke={1.75}
                                                />
                                            }
                                            onClick={() =>
                                                push({
                                                    start: "",
                                                    end: "",
                                                })
                                            }
                                            mt={5}
                                            mb={20}
                                        >
                                            Add New Shift
                                        </Button>
                                    </Box>
                                )}
                            </FieldArray>
                            <SelectField
                                id="repeat_type"
                                name={"repeat_type"}
                                label={"Repeat"}
                                placeholder="Select a repeat type"
                                data={REPEAT_CHOICES}
                                touch={touched.repeat_type}
                                error={errors.repeat_type}
                                withAsterisk
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
        </div>
    );
};
