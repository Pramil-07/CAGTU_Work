// components/booking/BookingModal.tsx
import { Alert, Modal, Stepper, Grid, Box, Button, Flex, Text, Title, useMantineTheme, Group } from "@mantine/core";
import { IconAlertCircle, IconCalendar, IconCalendarPlus, IconClock } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { Form, Formik } from "formik";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

import { TIME_INTERVAL } from "@/constants/minutesData";
import urls from "@/constants/urls";
import type { BookingDataProps } from "@/types/booking/BookingDataProps";
import { axiosClient } from "@/utils/axiosClient";
import { addTimeFromSchema } from "@/utils/validation/AddTimeFormValidation";
import SelectField from "../common/form/SelectField";

export const BookingModal = ({
  opened,
  setOpened,
  bookingData,
  FirstModal,
  is_editing = false,
}: {
  is_editing?: boolean;
  opened: boolean;
  setOpened: (value: boolean) => void;
  bookingData: BookingDataProps;
  FirstModal?: { end_time: string; start_time: string; end_date: string | null };
}) => {
  const theme = useMantineTheme();
  const router = useRouter();

  const [selectedDateTime, setSelectedDateTime] = useState({
    date: FirstModal?.end_date ?? "",
    start: FirstModal?.start_time ?? "",
    end: FirstModal?.end_time ?? "",
  });
  const [emptyError, setEmptyError] = useState(false);
  const [apiError, setApiError] = useState("");
  const [formikError, setFormikError] = useState("");
  const bookingId= bookingData.entity_service
  console.log("from the booking modal",bookingId)
  useEffect(() => {
    setSelectedDateTime({
      date: FirstModal?.end_date ?? "",
      start: FirstModal?.start_time ?? "",
      end: FirstModal?.end_time ?? "",
    });
  }, [FirstModal]);

  const { mutate } = useMutation<
    any,
    Error,
    { date: string; start: string; end: string }
  >(async (payload) => {
    await axiosClient.post(`${urls.event.initial}${bookingData?.event?.id}/availability/`, payload);
  });

 const nextStep = () => {
  if (formikError) return;
  if (selectedDateTime?.start && selectedDateTime?.end && selectedDateTime?.date) {
    console.log("Booking Data:", bookingData); // Log full object
    console.log("Booking Data ID:", bookingData.title); // Log ID specifically
    console.log("Query:", selectedDateTime);

    // Fallback if id is missing
    const bookingId =  bookingData.entity_service|| "Booking";
    const pathname = `/bookingform/${bookingId}/details`;
    console.log("Navigating to:", pathname);
    

    router.push({
      pathname,
      query: {
        date: selectedDateTime.date,
        start: selectedDateTime.start,
        end: selectedDateTime.end,
        bookingData: JSON.stringify(bookingData), // Pass as string
      },
    });
    setOpened(false); // Close modal
  } else {
    setEmptyError(true);
  }
};

  const renderMessage = () => {
    if (!selectedDateTime.date && !selectedDateTime.start && !selectedDateTime.end) {
      return "Please Select a date and Time";
    } else if (selectedDateTime.date && !selectedDateTime.start && !selectedDateTime.end) {
      return "Please Select a Time";
    } else {
      setEmptyError(false);
      return null;
    }
  };

  return (
    <Modal.Root
      opened={opened}
      onClose={() => setOpened(false)}
      scrollAreaComponent={Modal.NativeScrollArea}
      size={"sm"}
    >
      <Modal.Overlay
        sx={{
          opacity: 0.55,
          blur: 3,
          color: theme.colorScheme === "dark" ? theme.colors.dark[9] : theme.colors.gray[4],
        }}
      />
      <Modal.Content
        sx={{
          "& h3": { marginBottom: 0 },
        }}
      >
        <Modal.Header sx={{ position: "relative" }}>
          <Modal.Title>
            <Title order={3} size={20} weight={600}>
              {"Book a Service"}
            </Title>
          </Modal.Title>
          <Modal.CloseButton />
        </Modal.Header>
        <Modal.Body
          sx={{
            "& p": {
              color: theme.colors.gray[7],
              fontWeight: 400,
              marginBottom: 16,
              "& span": { color: theme.colors.gray[8] },
            },
          }}
        >
          <Stepper active={0} breakpoint="sm" w={"100%"} mx={"xs"} mb={12}>
            <Stepper.Step label="Schedule"></Stepper.Step>
            {/* //<Stepper.Step label="Details" disabled></Stepper.Step> */}
          </Stepper>
          <Formik
            initialValues={{
              start: selectedDateTime?.start || "",
              end: selectedDateTime?.end || "",
            }}
            enableReinitialize
            onSubmit={() => console.log("first")}
            validationSchema={addTimeFromSchema}
          >
            {({ errors, touched, setFieldValue }) => {
              setFormikError((errors.end || errors.start) ?? "");
              return (
                <Form>
                  <Grid gutter={10}>
                    <Grid.Col md={10}>
                      {/* Uncomment if you want to keep CalenderInteractive */}
                      {/* <CalenderInteractive
                        events={bookingData?.event}
                        selectedDateTime={selectedDateTime}
                        setSelectedDateTime={setSelectedDateTime}
                      /> */}
                    </Grid.Col>
                    <Grid.Col md={5}>
                      <Box
                        sx={{
                          borderRadius: 10,
                          background: theme.colorScheme === "dark" ? theme.colors.dark[6] : "inherit",
                          boxShadow: theme.colorScheme === "dark" ? "none" : `6px 0px 18px rgba(163, 171, 185, 0.2)`,
                        }}
                        p={10}
                        style={{ width: "50vh" }}
                      >
                        <Title order={4} weight={500} mb={4}>
                          When do you need this done?
                        </Title>
                        {selectedDateTime.date ? (
                          <Box>
                            <Flex justify={"flex-start"} align={"center"} gap={8} mb={10}>
                              <IconCalendar size={20} color={theme.colors.gray[6]} />
                              <Text
                                component="span"
                                color={theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.colors.gray[8]}
                              >
                                {format(new Date(selectedDateTime.date), "PP")}
                              </Text>
                            </Flex>
                            {selectedDateTime?.end && selectedDateTime.start ? (
                              <Flex justify={"flex-start"} gap={8} mb={10}>
                                <IconClock size={20} color={theme.colors.gray[6]} />
                                <Text
                                  component="span"
                                  color={theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.colors.gray[8]}
                                >
                                  {selectedDateTime.start} - {selectedDateTime?.end}
                                </Text>
                              </Flex>
                            ) : (
                              <Title order={4} weight={200} mb={24}>
                                Please Select a time
                              </Title>
                            )}
                            <Grid>
                              <Grid.Col md={10}>
                                <SelectField
                                  icon={<IconClock size={15} />}
                                  radius={"md"}
                                  size={"md"}
                                  error={errors.start}
                                  touch={touched.start}
                                  placeholder="Select start time"
                                  searchable
                                  handleChange={(value) => {
                                    setSelectedDateTime((state) => ({
                                      date: state.date,
                                      start: value,
                                      end: state.end,
                                    }));
                                    setFieldValue("start", value);
                                  }}
                                  label={"Start Time"}
                                  name={"start"}
                                  data={TIME_INTERVAL}
                                />
                              </Grid.Col>
                              <Grid.Col md={10}>
                                <SelectField
                                  icon={<IconClock size={15} />}
                                  name={"end"}
                                  radius={"md"}
                                  size={"md"}
                                  error={errors.end}
                                  touch={touched.end}
                                  placeholder="Select end time"
                                  handleChange={(value) => {
                                    setSelectedDateTime((state) => ({
                                      date: state.date,
                                      start: state.start,
                                      end: value,
                                    }));
                                    setFieldValue("end", value);
                                  }}
                                  label={"End Time"}
                                  data={TIME_INTERVAL}
                                />
                              </Grid.Col>
                            </Grid>
                          </Box>
                        ) : (
                          <Box
                            px={21}
                            py={16}
                            bg={theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.colors.homaaleSlate[0]}
                            sx={{ borderRadius: 4 }}
                          >
                            <Flex justify={"flex-start"} gap={24}>
                              <IconCalendarPlus size={32} color={theme.colors.gray[6]} />
                              <Box>
                                <Text component="h4">No Date Selected</Text>
                                <Text>Select task date to complete booking</Text>
                              </Box>
                            </Flex>
                          </Box>
                        )}
                      </Box>
                      {emptyError && (
                        <Alert
                          icon={<IconAlertCircle size={16} />}
                          title="Bummer!"
                          mt={20}
                          color="orange"
                          onClose={() => {
                            setEmptyError(false);
                            setApiError("");
                          }}
                          withCloseButton
                          closeButtonLabel="Close alert"
                        >
                          {renderMessage()}
                        </Alert>
                      )}
                      {apiError && (
                        <Alert
                          icon={<IconAlertCircle size={16} />}
                          title="Bummer!"
                          mt={20}
                          color="red"
                          onClose={() => setEmptyError(false)}
                          withCloseButton
                          closeButtonLabel="Close alert"
                        >
                          {apiError}
                        </Alert>
                      )}
                    </Grid.Col>
                  </Grid>
                  <Group position="center" mt="xl">
                    <Button type={"submit"} onClick={nextStep}>
                      Next Step
                    </Button>
                  </Group>
                </Form>
              );
            }}
          </Formik>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
};