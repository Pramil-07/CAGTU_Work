import type {MantineNumberSize} from "@mantine/core";
import {Box, Grid} from "@mantine/core";
import {Title} from "@mantine/core";
import {Modal} from "@mantine/core";
import type {Dispatch, SetStateAction} from "react";
import React from "react";

import {Calendar} from "../common/Calendar";
import {EventCreateForm} from "./EventCreateForm";

export const EventAddModal = ({
                                  event_id,
                                  service_id,
                                  opened,
                                  setOpened,
                              }: {
    event_id?: string;
    service_id: string;
    opened: boolean;
    setOpened: Dispatch<SetStateAction<boolean>>;
}) => {
    // console.log("event_id", event_id);
    // console.log("service_id", service_id);
    // console.log("opened", opened);
    return (
        <Modal.Root
            opened={opened}
            onClose={() => setOpened(false)}
            fullScreen
            scrollAreaComponent={Modal.NativeScrollArea}
        >
            <Modal.Content
                p={
                    {
                        base: "5px 20px",
                        sm: "10px 50px",
                        md: "20px 100px",
                        lg: "40px 200px",
                    } as unknown as MantineNumberSize
                }
                h={"100%"}
            >
                <Modal.Header sx={{position: "relative"}}>
                    <Modal.Title>
                        <Title order={3} size={20} weight={600}>
                            <Title order={3} size={20} weight={600}>
                                {event_id ? "Event Edit" : "Attach an event"}
                            </Title>
                        </Title>
                    </Modal.Title>
                    <Modal.CloseButton/>
                </Modal.Header>
                <Modal.Body>
                    <Grid gutter={20}>
                        <Grid.Col md={5}>
                            <Box
                                sx={{
                                    border: `1px solid rgba(0, 0, 0, 0.08)`,
                                    borderRadius: 10,
                                }}
                                p={40}
                            >
                                <EventCreateForm
                                    event_id={event_id}
                                    service_id={service_id}
                                    setOpened={setOpened}
                                />
                            </Box>
                        </Grid.Col>
                        <Grid.Col md={7}>
                            <Calendar eventAvailable={[]}/>
                        </Grid.Col>
                    </Grid>
                </Modal.Body>
            </Modal.Content>
        </Modal.Root>
    );
};
