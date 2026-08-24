import {
    ActionIcon,
    Avatar,
    Flex,
    Group,
    Menu,
    Switch,
    Text,
    useMantineTheme,
} from "@mantine/core";
import {
    IconChevronRight,
    IconLogout,
    IconMoon,
    IconSun,
} from "@tabler/icons-react";
import { useUser } from "@/hooks/useUser";
import { useMantineColorScheme } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import {TbLayoutDashboard, TbMenuOrder} from "react-icons/tb";

const UserMenu = () => {
    const { user, loading } = useUser();
    const router = useRouter();
    const { colorScheme, setColorScheme } = useMantineColorScheme();
    const theme = useMantineTheme();
    const { isLoggedIn, logout } = useAuth();

    return (
        <Group justify="flex-end">
            <Menu
                withArrow
                width={300}
                position="bottom-end"
                transitionProps={{ transition: "pop" }}
            >
                <Menu.Target>
                    <ActionIcon variant="transparent"  size="lg">
                        <Avatar className={"rounded-full"}
                            // radius="xl"
                            src={user?.profile_image || "/placeholder.svg"}
                            alt={`${user?.first_name} ${user?.last_name}`}
                            size="md" // Adjust size as needed (e.g., "md" = 36px)

                            color="blue"
                            style={{
                                cursor: "pointer",
                                 border: "2px solid black", // Adjusted border for better appearance
                                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)", // Softer shadow
                            }}
                        />
                    </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                    <Menu.Item
                        rightSection={<IconChevronRight size={18} stroke={1.5} />}
                        onClick={() =>
                            user?.is_profile_complete
                                ? router.push("/Profile")
                                : router.push("/Profile/form")
                        }
                    >
                        <Group>
                            <Avatar  src={user?.profile_image} />
                            <div>
                                <Text
                                    fw={500}
                                    c={colorScheme === "dark" ? "white" : "dark.8"}
                                    size="sm"
                                >
                                    {user?.is_profile_complete?`${user?.first_name} ${user?.last_name}`: "Create Profile"}
                                </Text>
                                {user && (
                                    <Text size="xs" c="dimmed" fw={400}>
                                        {user.email}
                                    </Text>
                                )}
                            </div>
                        </Group>
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item closeMenuOnClick={false}>
                        <Flex align="center" gap="sm">
                            <Text c={colorScheme === "dark" ? "white" : "gray.7"}>
                                Toggle Theme
                            </Text>
                            <Switch
                                checked={colorScheme === "dark"}
                                onChange={() =>
                                    setColorScheme(colorScheme === "dark" ? "light" : "dark")
                                }
                                size="sm"
                                onLabel={<IconSun size="1.25rem" stroke={1.5} color={theme.white} />}
                                offLabel={
                                    <IconMoon
                                        size="1.25rem"
                                        stroke={1.5}
                                        color={
                                            colorScheme === "dark" ? theme.colors.gray[0] : theme.colors.gray[6]
                                        }
                                    />
                                }
                            />
                        </Flex>
                    </Menu.Item>
                    {user?.role?.includes("Admin") && (
                        <>
                         <>
                            <Menu.Divider />
                            <Menu.Item
                                c={colorScheme === "dark" ? "white" : "gray.7"}
                                leftSection={
                                    <TbLayoutDashboard
                                        size={24}
                                        color={
                                            colorScheme === "dark"
                                                ? theme.colors.gray[0]
                                                : theme.colors.gray[6]
                                        }
                                    />
                                }
                                onClick={() => {
                                    router.push("/dashboard");
                                }}
                            >
                                Go to Dashboard
                            </Menu.Item>
                        </>
                         <>
                            <Menu.Divider />
                            <Menu.Item
                                c={colorScheme === "dark" ? "white" : "gray.7"}
                                leftSection={
                                    <TbMenuOrder
                                        size={24}
                                        color={
                                            colorScheme === "dark"
                                                ? theme.colors.gray[0]
                                                : theme.colors.gray[6]
                                        }
                                    />
                                }
                                onClick={() => {
                                    router.push("/bulk-order");
                                }}
                            >
                                Request Bulk Order
                            </Menu.Item>
                        </>
                        </>
                       
                    )}
                    <Menu.Divider />
                    <Menu.Item
                        c={colorScheme === "dark" ? "white" : "gray.7"}
                        leftSection={
                            <IconLogout
                                size={24}
                                stroke={1.5}
                                color={
                                    colorScheme === "dark" ? theme.colors.gray[0] : theme.colors.gray[6]
                                }
                            />
                        }
                        onClick={() => {
                            logout();
                            router.push("/login");
                        }}
                    >
                        Log Out
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>
        </Group>
    );
};

export default UserMenu;