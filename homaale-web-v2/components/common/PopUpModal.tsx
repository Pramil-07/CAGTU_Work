import type { MantineNumberSize } from "@mantine/core";
import { Title } from "@mantine/core";
import { Box, Button, Flex, Modal, Text, useMantineTheme } from "@mantine/core";
import { useRouter } from "next/router";
import React from "react";

import { close } from "@/features/utils/modalSlice";
import { useAppDispatch, useAppSelector } from "@/hooks";

export const PopUpModal = () => {
    const {
        opened,
        color,
        desc,
        icon: Icon,
        link,
        title,
        buttonTitle,
    } = useAppSelector((state) => state.modalReducer);

    const dispatch = useAppDispatch();

    const theme = useMantineTheme();

    const router = useRouter();
    return (
        <Modal.Root
            opened={opened}
            onClose={() => dispatch(close())}
            centered
            size={"md"}
            scrollAreaComponent={Modal.NativeScrollArea}
        >
            <Modal.Overlay
                sx={{
                    opacity: 0.55,
                    blur: 3,
                    color:
                        theme.colorScheme === "dark"
                            ? theme.colors.dark[9]
                            : theme.colors.gray[4],
                }}
            />
            <Modal.Content
                p={
                    {
                        base: "5px",
                        sm: "10px ",
                        lg: "20px",
                    } as unknown as MantineNumberSize
                }
                sx={{
                    "& h3": {
                        marginBottom: 0,
                    },
                    overflow: "visible",
                }}
            >
                <Modal.Header
                    sx={{
                        flexDirection: "column",
                        justifyContent: "center",
                        background: "transparent",
                        top: -30,
                    }}
                >
                    <Box
                        w={80}
                        h={80}
                        pos="absolute"
                        sx={{
                            display: "flex",
                            justifyContent: "center", // Center horizontally
                            alignItems: "center", // Center vertically
                            background: color,
                            borderRadius: "50%",
                            // marginTop:"20px",
                            marginBottom:"20px"
                        }}
                    >
                        <Icon
                            size={40}
                            stroke={2}
                            style={{
                                color: "white",
                            }}
                        />
                    </Box>

                </Modal.Header>
                <Modal.Body
                    sx={{
                        "& p": {
                            color:
                                theme.colorScheme === "dark"
                                    ? theme.colors.dark[0]
                                    : theme.colors.gray[7],
                            fontWeight: 400,
                            marginBottom: 16,
                            "& span": { color: theme.colors.gray[8] },
                        },
                    }}
                >
                    <Box sx={{ textAlign: "center" }}>
                        <Flex justify={"center"} direction={"column"} gap={12}>
                            <Title
                                order={2}
                                fw={600}
                                mt={20}
                                mb={10}
                                sx={{ color: color }}
                            >
                                {title}
                            </Title>
                            <Text component="p" size={16} fw={500}>
                                {desc}
                            </Text>

                            {buttonTitle && link && (
                                <Button
                                    color={"gray.8"}
                                    fullWidth
                                    onClick={() => {
                                        dispatch(close());
                                        router.push(link);
                                    }}
                                    sx={{
                                        transition: "all 0.25s ease-in-out",
                                    }}
                                >
                                    {buttonTitle}
                                </Button>
                            )}
                            <Button
                                color={"gray.8"}
                                variant={buttonTitle ? "outline" : "filled"}
                                fullWidth
                                onClick={() => dispatch(close())}
                                sx={{
                                    transition: "all 0.25s ease-in-out",
                                }}
                            >
                                Close
                            </Button>
                        </Flex>
                    </Box>
                </Modal.Body>
            </Modal.Content>
        </Modal.Root>
    );
};
