import {
    Box,
    Image,
    Text,
    ThemeIcon,
    Tooltip,
    useMantineTheme,
} from "@mantine/core";
import {
    IconFileSpreadsheet,
    IconFileText,
    IconFileTypography,
    IconFileX,
    IconMicrophone,
    IconMovie,
} from "@tabler/icons-react";

export interface FileTypeProps {
    type?: string;
    filePath?: string;
    showFileDetail?: boolean;
    fileSize?: string;
    fileName?: string;
}

export const FileTypeGrid = ({
    type,
    filePath,
    showFileDetail,
    fileSize,
    fileName,
}: FileTypeProps) => {
    const theme = useMantineTheme();

    switch (type) {
        case "mp4":
        case "ogg":
        case "webm":
        case "avi":
            return (
                <Box>
                    <Tooltip
                        withArrow
                        label={fileName}
                        position="bottom"
                        styles={{
                            tooltip: {
                                fontSize: 10,
                                padding: "2px 8px",
                                fontWeight: 500,
                            },
                        }}
                    >
                        <ThemeIcon
                            variant="light"
                            radius="md"
                            color="indigo"
                            size={60}
                        >
                            <IconMovie size={32} />
                        </ThemeIcon>
                    </Tooltip>
                    <Text
                        size={11}
                        weight={500}
                        color="dimmed"
                        mt={5}
                        align="center"
                    >
                        {fileSize}
                    </Text>
                </Box>
            );
        case "csv":
        case "pdf":
            return (
                <Box>
                    <Tooltip
                        withArrow
                        label={fileName}
                        position="bottom"
                        styles={{
                            tooltip: {
                                fontSize: 10,
                                padding: "2px 8px",
                                fontWeight: 500,
                            },
                        }}
                    >
                        <ThemeIcon
                            variant="light"
                            radius="md"
                            color="green"
                            size={60}
                        >
                            <IconFileText size={32} />
                        </ThemeIcon>
                    </Tooltip>
                    <Text
                        size={11}
                        weight={500}
                        color="dimmed"
                        mt={5}
                        align="center"
                    >
                        {fileSize}
                    </Text>
                </Box>
            );
        case "vnd.openxmlformats-officedocument.wordprocessingml.document":
        case "msword":
            return (
                <Box>
                    <Tooltip
                        withArrow
                        label={fileName}
                        position="bottom"
                        styles={{
                            tooltip: {
                                fontSize: 10,
                                padding: "2px 8px",
                                fontWeight: 500,
                            },
                        }}
                    >
                        <ThemeIcon
                            variant="light"
                            radius="md"
                            color="cyan"
                            size={60}
                        >
                            <IconFileTypography size={32} />
                        </ThemeIcon>
                    </Tooltip>
                    <Text
                        size={11}
                        weight={500}
                        color="dimmed"
                        mt={5}
                        align="center"
                    >
                        {fileSize}
                    </Text>
                </Box>
            );
        case "vnd.openxmlformats-officedocument.spreadsheetml.sheet":
            return (
                <Box>
                    <Tooltip
                        withArrow
                        label={fileName}
                        position="bottom"
                        styles={{
                            tooltip: {
                                fontSize: 10,
                                padding: "2px 8px",
                                fontWeight: 500,
                            },
                        }}
                    >
                        <ThemeIcon
                            variant="light"
                            radius="md"
                            color="green"
                            size={60}
                        >
                            <IconFileSpreadsheet size={32} />
                        </ThemeIcon>
                    </Tooltip>
                    <Text
                        size={11}
                        weight={500}
                        color="dimmed"
                        mt={5}
                        align="center"
                    >
                        {fileSize}
                    </Text>
                </Box>
            );
        case "vnd.ms-excel":
            return (
                <Box>
                    <Tooltip
                        withArrow
                        label={fileName}
                        position="bottom"
                        styles={{
                            tooltip: {
                                fontSize: 10,
                                padding: "2px 8px",
                                fontWeight: 500,
                            },
                        }}
                    >
                        <ThemeIcon
                            variant="light"
                            radius="md"
                            color="teal"
                            size={60}
                        >
                            <IconFileX size={32} />
                        </ThemeIcon>
                    </Tooltip>
                    <Text
                        size={11}
                        weight={500}
                        color="dimmed"
                        mt={5}
                        align="center"
                    >
                        {fileSize}
                    </Text>
                </Box>
            );
        case "mpeg":
            return (
                <Box>
                    <Tooltip
                        withArrow
                        label={fileName}
                        position="bottom"
                        styles={{
                            tooltip: {
                                fontSize: 10,
                                padding: "2px 8px",
                                fontWeight: 500,
                            },
                        }}
                    >
                        <ThemeIcon
                            variant="light"
                            radius="md"
                            color="orange"
                            size={60}
                        >
                            <IconMicrophone size={32} />
                        </ThemeIcon>
                    </Tooltip>
                    <Text
                        size={11}
                        weight={500}
                        color="dimmed"
                        mt={5}
                        align="center"
                    >
                        {fileSize}
                    </Text>
                </Box>
            );

        default:
            return (
                <Tooltip
                    label={fileName}
                    withArrow
                    position="bottom"
                    styles={{
                        tooltip: {
                            fontSize: 10,
                            padding: "2px 8px",
                            fontWeight: 500,
                        },
                    }}
                >
                    <Image
                        src={filePath}
                        width={60}
                        height={60}
                        radius="md"
                        alt="selected-img"
                        mb={
                            showFileDetail && fileSize !== "NaN undefined"
                                ? 20
                                : 0
                        }
                        caption={
                            showFileDetail &&
                            fileSize !== "NaN undefined" && (
                                <Text size={11} weight={500} color="dimmed">
                                    {fileSize}
                                </Text>
                            )
                        }
                        styles={{
                            imageWrapper: {
                                background: theme.colors["gray"][2],
                                borderRadius: theme.radius.md,
                            },
                            image: { padding: 0 },
                            caption: { marginTop: 5 },
                        }}
                    />
                </Tooltip>
            );
    }
};
