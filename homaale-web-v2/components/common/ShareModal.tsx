import {
    ActionIcon,
    Box,
    CopyButton,
    Flex,
    Modal,
    Text,
    Tooltip,
} from "@mantine/core";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import Image from "next/image";
import {
    FacebookMessengerShareButton,
    FacebookShareButton,
    LinkedinShareButton,
    TwitterShareButton,
    ViberShareButton,
    WhatsappShareButton,
} from "next-share";
import React from "react";

import type { ShareButtonProps } from "@/types/ShareButtonProps";
import { useDark } from "@/utils/helpers";

const ShareModal = ({ opened, handleClose, url }: ShareButtonProps) => {
    const dark = useDark();
    return (
        <>
            <Modal.Root
                opened={opened}
                onClose={handleClose}
                centered
                closeOnClickOutside={false}
                closeOnEscape={false}
                size={"lg"}
                onClick={(e) => e.stopPropagation()}
                padding={32}
            >
                <Modal.Overlay
                    sx={{
                        opacity: 0.55,
                        blur: 3,
                    }}
                />
                <Modal.Content>
                    <Modal.Header
                        sx={{
                            padding: "24px 32px",
                        }}
                    >
                        <Modal.Title>
                            <h4>Share on:</h4>
                        </Modal.Title>
                        <Modal.CloseButton />
                    </Modal.Header>
                    <Modal.Body>
                        <Flex
                            sx={{
                                flexWrap: "wrap",
                            }}
                        >
                            <Box sx={{ textAlign: "center" }}>
                                <WhatsappShareButton url={url}>
                                    <Image
                                        src="/svgs/whatsapp-logo.svg"
                                        height={40}
                                        width={40}
                                        alt="img"
                                    />
                                </WhatsappShareButton>
                                <Text
                                    size={12}
                                    mt={12}
                                    color={dark ? "dark.0" : "gray.7"}
                                >
                                    Whatsapp
                                </Text>
                            </Box>

                            <Box sx={{ textAlign: "center" }}>
                                <ViberShareButton url={url}>
                                    <Image
                                        src="/svgs/viber-logo.svg"
                                        height={40}
                                        width={40}
                                        alt="img"
                                    />
                                </ViberShareButton>
                                <Text
                                    size={12}
                                    mt={12}
                                    color={dark ? "dark.0" : "gray.7"}
                                >
                                    Viber
                                </Text>
                            </Box>

                            <Box sx={{ textAlign: "center" }}>
                                <FacebookMessengerShareButton
                                    appId=""
                                    url={url}
                                >
                                    <Image
                                        src="/svgs/messenger-logo.svg"
                                        height={40}
                                        width={40}
                                        alt="img"
                                    />
                                </FacebookMessengerShareButton>
                                <Text
                                    size={12}
                                    mt={12}
                                    color={dark ? "dark.0" : "gray.7"}
                                >
                                    Messenger
                                </Text>
                            </Box>

                            <Box sx={{ textAlign: "center" }}>
                                <FacebookShareButton url={url}>
                                    <Image
                                        src="/svgs/facebook-logo.svg"
                                        height={48}
                                        width={48}
                                        alt="img"
                                    />
                                </FacebookShareButton>
                                <Text
                                    size={12}
                                    mt={6}
                                    color={dark ? "dark.0" : "gray.7"}
                                >
                                    Facebook
                                </Text>
                            </Box>

                            <Box sx={{ textAlign: "center" }}>
                                <TwitterShareButton url={url}>
                                    <Image
                                        src="/svgs/twitter-logo.svg"
                                        height={48}
                                        width={48}
                                        alt="img"
                                    />
                                </TwitterShareButton>
                                <Text
                                    size={12}
                                    mt={6}
                                    color={dark ? "dark.0" : "gray.7"}
                                >
                                    X
                                </Text>
                            </Box>

                            <Box sx={{ textAlign: "center" }}>
                                <LinkedinShareButton url={url}>
                                    <Image
                                        src="/svgs/linkedin-logo.svg"
                                        height={48}
                                        width={48}
                                        alt="img"
                                    />
                                </LinkedinShareButton>
                                <Text
                                    size={12}
                                    mt={6}
                                    color={dark ? "dark.0" : "gray.7"}
                                >
                                    LinkedIn
                                </Text>
                            </Box>
                            <Box sx={{ textAlign: "center" }}>
                                <Box
                                    sx={{
                                        borderRadius: "50%",
                                        padding: 10,
                                    }}
                                >
                                    <CopyButton value={url} timeout={2000}>
                                        {({ copied, copy }) => (
                                            <Tooltip
                                                label={
                                                    copied ? "Copied" : "Copy"
                                                }
                                                withArrow
                                                position="right"
                                            >
                                                <ActionIcon
                                                    color={
                                                        copied ? "teal" : "gray"
                                                    }
                                                    onClick={copy}
                                                    className="svg-icon copy-icon"
                                                >
                                                    {copied ? (
                                                        <IconCheck size={30} />
                                                    ) : (
                                                        <IconCopy size={30} />
                                                    )}
                                                </ActionIcon>
                                            </Tooltip>
                                        )}
                                    </CopyButton>
                                </Box>
                                <Text
                                    size={12}
                                    mt={6}
                                    color={dark ? "dark.0" : "gray.7"}
                                >
                                    Copy
                                </Text>
                            </Box>
                        </Flex>
                    </Modal.Body>
                </Modal.Content>
            </Modal.Root>
        </>
    );
};

export default ShareModal;
