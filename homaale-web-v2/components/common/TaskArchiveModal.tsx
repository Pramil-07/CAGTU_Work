import {
    Box,
    Button,
    Flex,
    Group,
    Modal,
    Text,
    useMantineTheme,
} from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import type { Dispatch, SetStateAction } from "react";
import React from "react";

import urls from "@/constants/urls";
import { axiosClient } from "@/utils/axiosClient";

import { toast } from "./Toast";

export type TaskArchivePayload = {
    is_active: boolean;
    id: string;
};

const TaskArchiveModal = ({
    opened,
    setOpened,
    serviceId,
}: {
    opened: boolean;
    setOpened: Dispatch<SetStateAction<boolean>>;
    serviceId: string;
}) => {
    const theme = useMantineTheme();

    const { mutate, isLoading } = useMutation<any, Error, TaskArchivePayload>(
        async (payload) => {
            const { data } = await axiosClient.post<TaskArchivePayload>(
                urls.entityServiceArchive,
                payload
            );
            return data;
        }
    );
    return (
        <Modal.Root
            opened={opened}
            onClose={() => setOpened(false)}
            centered
            closeOnClickOutside={false}
            closeOnEscape={false}
            size={"md"}
            padding={24}
        >
            <Modal.Overlay
                sx={{
                    opacity: 0.55,
                    blur: 3,
                }}
            />
            <Modal.Content>
                <Modal.Body>
                    <Box
                        component="div"
                        sx={{
                            zIndex: -1,
                            borderRadius: "8px 8px 0 0",
                        }}
                    >
                        <Flex
                            justify={"center"}
                            align={"center"}
                            direction="column"
                        >
                            {/* <IconHelp size={48} color={theme.colors.blue[7]} /> */}

                            <Text
                                component="p"
                                size={24}
                                color={
                                    theme.colorScheme === "dark"
                                        ? theme.colors.dark[0]
                                        : theme.colors.homaaleSlate[8]
                                }
                                mt={12}
                                weight={500}
                            >
                                Archive this Task?
                            </Text>
                        </Flex>
                    </Box>
                    <Box p="16px 0">
                        <Flex
                            justify={"center"}
                            align={"center"}
                            direction="column"
                        >
                            <Text
                                component="p"
                                sx={{
                                    fontSize: 14,
                                    color:
                                        theme.colorScheme === "dark"
                                            ? theme.colors.dark[1]
                                            : theme.colors.gray[8],
                                    fontWeight: 400,
                                    marginBottom: 4,
                                    textAlign: "center",
                                }}
                            >
                                Archive task if you do not need this task to be
                                done again.
                            </Text>

                            <Group grow>
                                <Button
                                    mt={32}
                                    variant="outline"
                                    onClick={() => setOpened(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    mt={32}
                                    sx={{
                                        width: 130,
                                        background:
                                            theme.colors.homaaleSlate[8],
                                    }}
                                    type="submit"
                                    disabled={isLoading}
                                    loading={isLoading}
                                    onClick={() => {
                                        mutate(
                                            {
                                                is_active: false,
                                                id: serviceId,
                                            },
                                            {
                                                onSuccess: (data) => {
                                                    console.log(
                                                        "success: ",
                                                        data
                                                    );
                                                    toast.success("success");
                                                    setOpened(false);
                                                },
                                                onError: (e: any) => {
                                                    console.log("error: ", e);
                                                },
                                            }
                                        );
                                    }}
                                >
                                    Archive
                                </Button>
                            </Group>
                        </Flex>
                    </Box>
                </Modal.Body>
            </Modal.Content>
        </Modal.Root>
    );
};

export default TaskArchiveModal;
