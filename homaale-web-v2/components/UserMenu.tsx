import {
    ActionIcon,
    Avatar,
    Flex,
    Group,
    Menu,
    Select,
    Switch,
    Text,
    useMantineColorScheme,
    useMantineTheme,
} from "@mantine/core";
import {
    IconChevronRight,
    IconCoin,
    IconGift,
    IconLogout,
    IconMoon,
    IconMoonStars,
    IconSettings,
    IconSun,
    IconTicket,
} from "@tabler/icons-react";
import { useRouter } from "next/router";

import { logout } from "@/features/auth/authSlice";
import { useAppDispatch } from "@/hooks";
import { useUser } from "@/hooks/useUser";
import { useCurrencyOption } from "@/hooks/useCurrencyOptions";
import { useCurrency } from "@/currency/CurrencyContext";
import {LuCalculator} from "react-icons/lu";

const UserMenu = () => {
    const { data: userData } = useUser();

    const { full_name, profile_image, email } = userData ?? {};
      const {data: currencyOption = []} = useCurrencyOption();
      const{ globalCurrency, setGlobalCurrency } = useCurrency();

    const dispatch = useAppDispatch();
    const router = useRouter();

    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    const theme = useMantineTheme();

    return (
        <Group position="center">
            <Menu
                withArrow
                width={300}
                position="bottom"
                transitionProps={{ transition: "pop" }}
                id="profile-menu"
            >
                <Menu.Target>
                    <ActionIcon>
                        <Avatar
                            src={profile_image}
                            radius="xl"
                            size={30}
                            color="blue"
                            sx={{ cursor: "pointer" }}
                        ></Avatar>
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
                    }}
                >
                    <Menu.Item
                        rightSection={
                            <IconChevronRight size={18} stroke={1.5} />
                        }
                        onClick={() =>
                            userData?.has_profile
                                ? router.push("/profile")
                                : router.push("/settings/account")
                        }
                    >
                        <Group>
                            <Avatar radius="xl" src={profile_image} />

                            <div>
                                <Text
                                    sx={{
                                        fontWeight: 500,
                                        color:
                                            theme.colorScheme === "dark"
                                                ? theme.colors.gray[0]
                                                : theme.colors.homaaleSlate[8],
                                        fontSize: 14,
                                    }}
                                >
                                    {full_name ? full_name : "Create Profile"}
                                </Text>
                                {userData && (
                                    <Text size="xs" color="dimmed" weight={400}>
                                        {email}
                                    </Text>
                                )}
                            </div>
                        </Group>
                    </Menu.Item>

                    <Menu.Divider />

                    <Menu.Item
                        component="p"
                        onClick={() => router.push("/offer")}
                        icon={
                            <IconGift
                                size={24}
                                stroke={1.5}
                                color={
                                    theme.colorScheme === "dark"
                                        ? theme.colors.gray[0]
                                        : theme.colors.gray[6]
                                }
                            />
                        }
                        color={
                            theme.colorScheme === "dark"
                                ? theme.colors.gray[0]
                                : theme.colors.gray[7]
                        }
                    >
                        Offers
                    </Menu.Item>
                    <Menu.Item
                        component="p"
                        icon={
                            <IconTicket
                                size={24}
                                stroke={1.5}
                                color={
                                    theme.colorScheme === "dark"
                                        ? theme.colors.gray[0]
                                        : theme.colors.gray[6]
                                }
                            />
                        }
                        color={
                            theme.colorScheme === "dark"
                                ? theme.colors.gray[0]
                                : theme.colors.gray[7]
                        }
                        onClick={() => router.push("/my-tickets")}
                    >
                        Support Ticket
                    </Menu.Item>
                    <Menu.Item
                        component="p"
                        icon={
                            <IconCoin
                                size={24}
                                stroke={1.5}
                                color={
                                    theme.colorScheme === "dark"
                                        ? theme.colors.gray[0]
                                        : theme.colors.gray[6]
                                }
                            />
                        }
                        color={
                            theme.colorScheme === "dark"
                                ? theme.colors.gray[0]
                                : theme.colors.gray[7]
                        }
                        onClick={() => router.push("/refer")}
                    >
                        Refer & Earn
                    </Menu.Item>

                    <Menu.Item
                        component="p"
                        icon={
                            <IconSettings
                                size={24}
                                stroke={1.5}
                                color={
                                    theme.colorScheme === "dark"
                                        ? theme.colors.gray[0]
                                        : theme.colors.gray[6]
                                }
                            />
                        }
                        color={
                            theme.colorScheme === "dark"
                                ? theme.colors.gray[0]
                                : theme.colors.gray[7]
                        }
                        onClick={() => router.push("/settings/account")}
                    >
                        Account settings
                    </Menu.Item>
                    <Menu.Item
                        component="p"
                        icon={
                            <LuCalculator
                                size={24}
                                color={
                                    theme.colorScheme === "dark"
                                        ? theme.colors.gray[0]
                                        : theme.colors.gray[6]
                                }
                            />
                        }
                        color={
                            theme.colorScheme === "dark"
                                ? theme.colors.gray[0]
                                : theme.colors.gray[7]
                        }
                        onClick={() => router.push("/calculator")}
                    >
                        Calculator
                    </Menu.Item>
                    <Menu.Item
                    component="p"
                        icon={
                            <IconCoin
                                size={24}
                                stroke={1.5}
                                color={
                                    theme.colorScheme === "dark"
                                        ? theme.colors.gray[0]
                                        : theme.colors.gray[6]
                                }
                            />
                        }
                        closeMenuOnClick={false}>
                        <Flex>
                            <Text
                                color={
                                    theme.colorScheme === "dark"
                                        ? theme.colors.gray[0]
                                        : theme.colors.gray[7]
                                }
                            >
                               Currency
                            </Text>
                            <Group position="center">

                                  <Select
                                                                        variant="filled"

                                                                        size="xs"
                                                                        title=" Currency"
                                                                        placeholder="Select Currency"
                                                                        name={"currency"}

                                                                        data={currencyOption.map((item) => ({
                                                                            value: item.value,
                                                                            label: item.label,
                                                                        }))}
                                                                        value={globalCurrency}
                                                                        rightSection={null}
                                                                        rightSectionWidth={0}
                                                                        onChange={(value) => {
                                                                            value && setGlobalCurrency(value)


                                                                        }}
                                                                        styles={{

                                                                            input: {
                                                                                width: '139px',
                                                                                alignSelf: 'center',
                                                                                '::placeholder': {
                                                                                    fontSize: '12px',

                                                                                },

                                                                            },


                                                                        }}
                                                                        // onDoubleClick={() => {
                                                                        //     const currentIndex = currencyOption.findIndex(
                                                                        //         (item) => item.value === currency
                                                                        //     );
                                                                        //     const nextIndex = (currentIndex + 1) % currencyOption.length;
                                                                        //     setCurrency(currencyOption[nextIndex].value); // Update the currency state
                                                                        // }}
                                                                    />


                            </Group>
                                </Flex>


                    </Menu.Item>


                    <Menu.Divider />

                    {/* <Menu.Label>Danger zone</Menu.Label> */}
                    <Menu.Item
                        component="p"
                        icon={
                            <IconMoon
                                size={24}
                                stroke={1.5}
                                color={
                                    theme.colorScheme === "dark"
                                        ? theme.colors.gray[0]
                                        : theme.colors.gray[6]
                                }
                            />
                        }
                        closeMenuOnClick={false}
                    >
                        <Flex>
                            <Text
                                color={
                                    theme.colorScheme === "dark"
                                        ? theme.colors.gray[0]
                                        : theme.colors.gray[7]
                                }
                            >
                                Toggle Theme
                            </Text>
                            <Group position="center">
                                <Switch
                                    checked={colorScheme === "dark"}
                                    onChange={() => toggleColorScheme()}
                                    size="sm"
                                    onLabel={
                                        <IconSun
                                            color={theme.white}
                                            size="1.25rem"
                                            stroke={1.5}
                                        />
                                    }
                                    offLabel={
                                        <IconMoonStars
                                            color={
                                                theme.colorScheme === "dark"
                                                    ? theme.colors.gray[0]
                                                    : theme.colors.gray[6]
                                            }
                                            size="1.25rem"
                                            stroke={1.5}
                                        />
                                    }
                                />
                            </Group>
                        </Flex>
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item
                        component="p"
                        color={
                            theme.colorScheme === "dark"
                                ? theme.colors.gray[0]
                                : theme.colors.gray[7]
                        }
                        icon={
                            <IconLogout
                                size={24}
                                stroke={1.5}
                                color={
                                    theme.colorScheme === "dark"
                                        ? theme.colors.gray[0]
                                        : theme.colors.gray[6]
                                }
                            />
                        }
                        onClick={() => {
                            dispatch(logout());
                            router.push("/auth/login");
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
