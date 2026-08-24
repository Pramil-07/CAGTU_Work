import { Box, Button, Flex, Modal, Text, useMantineTheme } from "@mantine/core";
import { IconCircleCheck, IconX } from "@tabler/icons-react";
import type { Dispatch, SetStateAction } from "react";

interface Props {
    opened: boolean;
    heading: string;
    subHeading: string;
    failure?: boolean;
    setPopUpOpened: Dispatch<SetStateAction<boolean>>;
}
const PopUp = ({
    setPopUpOpened,
    opened,
    heading,
    subHeading,
    failure,
}: Props) => {
    const theme = useMantineTheme();
    return (
        <Modal
            opened={opened}
            onClose={() => setPopUpOpened(false)}
            centered
            withCloseButton={false}
            closeOnClickOutside={false}
            overlayProps={{
                opacity: 0.55,
                blur: 3,
            }}
            size="md"
            padding={0}
            radius={8}
        >
            <Box
                component="div"
                bg={!failure ? "#38C675" : "#FE5050"}
                p="20px 0"
                sx={{
                    zIndex: -1,
                    borderRadius: "8px 8px 0 0",
                }}
            >
                <Flex justify={"center"} align={"center"} direction="column">
                    {!failure ? (
                        <IconCircleCheck color="white" size={48} />
                    ) : (
                        <IconX color="white" size={48} />
                    )}
                    <Text component="p" size={24} color="white">
                        {!failure ? "Success" : "Failure"}
                    </Text>
                </Flex>
            </Box>
            <Box p="32px 0">
                <Flex justify={"center"} align={"center"} direction="column">
                    <Text
                        component="p"
                        sx={{
                            fontSize: 14,
                            color: theme.colors.homaaleSlate[8],
                            fontWeight: 500,
                            marginBottom: 4,
                        }}
                    >
                        {heading}
                    </Text>
                    <Text
                        component="p"
                        sx={{
                            fontSize: 12,
                            color: theme.colors.homaaleSlate[6],
                            textAlign: "center",
                        }}
                    >
                        {subHeading}
                    </Text>
                    <Button
                        mt={32}
                        sx={{
                            width: 130,
                            background: theme.colors.homaaleSlate[8],
                        }}
                        onClick={() => setPopUpOpened(false)}
                    >
                        Okay
                    </Button>
                </Flex>
            </Box>
        </Modal>
    );
};
export default PopUp;
