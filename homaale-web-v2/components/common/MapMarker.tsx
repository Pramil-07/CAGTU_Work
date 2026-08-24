import {
    ActionIcon,
    Avatar,
    Button,
    Flex,
    Group,
    Menu,
    Text,
    Title,
    useMantineTheme,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconStar } from "@tabler/icons-react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import type { EntityServiceLisitngProps } from "@/types/EntityServiceLisitngProps";
import {useBrandData} from "@/brand/BrandContext";

export const MapMarker = ({
    data,
    selectedId,
    icons
}: {
    data: EntityServiceLisitngProps["result"][0];
    selectedId?: string;
    icons?: any;
}) => {
    const theme = useMantineTheme();
    const smallScreen = useMediaQuery("(max-width: 991px)");
    const {brandData} = useBrandData();
    const {
        title,
        id,
        created_by,
        rating,
        budget_from,
        budget_to,
        currency,
        budget_type,
        is_requested,
    } = data ?? ({} as EntityServiceLisitngProps["result"][0]);

    const router = useRouter();

    const toDataURL = (svgString: string) => {
        // Remove the surrounding <div> if present
        const svgContent = svgString.replace(/<div[^>]*>([\s\S]*?)<\/div>/i, "$1").trim();
        // Encode the SVG string to handle special characters
        const encodedSvg = encodeURIComponent(svgContent)
            .replace(/'/g, "%27")
            .replace(/"/g, "%22");
        return `data:image/svg+xml,${encodedSvg}`;
    };

    // Use the cleaned SVG or fallback to default image
    const iconSrc = icons ? toDataURL(icons) : brandData.favicon;
    const [opened, setOpened] = useState(false);

    useEffect(() => {
        if (selectedId === id) {
            setOpened(true);
        }
    }, [id, selectedId]);

    return (
        <Group position="center">
            <Menu
                withArrow
                width={300}
                position={smallScreen ? "top" : "right-end"}
                transitionProps={{ transition: "pop" }}
                id="profile-menu"
                opened={opened}
                onChange={setOpened}
            >
                <Menu.Target>
                    <ActionIcon>
                        <Avatar
                            src={iconSrc}
                            radius="xl"
                            size={45}
                            p={10}
                            sx={{ cursor: "pointer", background: theme.colors.brand[4] }}
                        />
                    </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown
                    sx={{
                        ".mantine-Menu-item": {
                            "&:not([data-disabled]):hover": {
                                background:
                                    theme.colorScheme === "dark"
                                        ? theme.colors.gray[8]
                                        : theme.colors.gray[1],
                            },
                        },
                        boxShadow: `0px 4px 14px rgba(33, 29, 79, 0.1)`,
                    }}
                    py={16}
                    px={24}
                >
                    <Title
                        order={3}
                        size={20}
                        fw={500}
                        mb={5}
                        color={
                            theme.colorScheme === "dark"
                                ? theme.colors.homaaleSlate[2]
                                : theme.colors.homaaleSlate[8]
                        }
                    >
                        {title}
                    </Title>
                    <Flex justify={"flex-start"} gap={6} mb={9}>
                        <Image
                            src={
                                created_by?.profile_image
                                    ? created_by?.profile_image
                                    : "/images/placeholder/profilePlaceholder.png"
                            }
                            style={{
                                borderRadius: "50%",
                                objectFit: "contain",
                            }}
                            alt={created_by?.full_name + "profile"}
                            height={24}
                            width={24}
                        />
                        <Title
                            order={4}
                            size={12}
                            fw={500}
                            maw={170}
                            sx={{
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                            color={
                                theme.colorScheme === "dark"
                                    ? theme.colors.homaaleSlate[4]
                                    : theme.colors.homaaleSlate[5]
                            }
                        >
                            {created_by?.full_name}
                        </Title>

                        <IconStar
                            fill={theme?.colors.brand[3]}
                            color={theme?.colors.brand[3]}
                            size={16}
                        />
                        {rating && (
                            <Text
                                component="span"
                                size={10}
                                fw={500}
                                color={theme.colors.homaaleSlate[8]}
                            >
                                {rating}
                            </Text>
                        )}
                    </Flex>
                    <Text
                        component="p"
                        size={16}
                        fw={500}
                        color={
                            theme.colorScheme === "dark"
                                ? theme.colors.homaaleSlate[2]
                                : theme.colors.homaaleSlate[8]
                        }
                        mb={16}
                    >
                        {budget_from
                            ? `${currency?.symbol} ${+parseFloat(
                                  budget_from
                              ).toFixed(2)} -`
                            : ""}{" "}
                        {budget_to
                            ? `${currency?.symbol} ${+parseFloat(
                                  budget_to
                              ).toFixed(2)}`
                            : ""}{" "}
                        <Text
                            component="span"
                            size={10}
                            fw={500}
                            color={theme.colors.homaaleSlate[5]}
                        >
                            /{budget_type}
                        </Text>
                    </Text>
                    <Button
                        fullWidth
                        onClick={() =>
                            router.push(
                                `/${is_requested ? "tasks" : "services"}/${id}`
                            )
                        }
                    >
                        View {is_requested ? "Task" : "Service"}
                    </Button>
                </Menu.Dropdown>
            </Menu>
        </Group>
    );
};
