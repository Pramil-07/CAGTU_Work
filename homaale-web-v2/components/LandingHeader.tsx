import {
    ActionIcon,
    Box,
    Burger,
    Button,
    Center,
    Divider,
    Drawer,
    Flex,
    Group,
    Header,
    HoverCard,
    ScrollArea,
    Select,
    SimpleGrid,
    Text,
    UnstyledButton,
    useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
    IconCategory2,
    IconChevronDown,
    IconShieldLock,
    IconCoin,
    IconDiscountCheck,
    IconHandClick,
    IconListSearch,
    IconLock,
    IconReportSearch,
    IconUsers,
    IconUserSearch,
    IconMoon,
    IconSun,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

import { useAppSelector } from "@/hooks";
import { useGetCookieUser } from "@/hooks/useGetCookieUser";
import { useWeather } from "@/hooks/useWeather";
import { useHeaderStyles } from "@/styles/components/HeaderStyles";
import { getBrand, scrollToView, useDark } from "@/utils/helpers";

import ActionNavigation from "./common/ActionNavigation";
import CategoryDropdown from "./common/CategoryDropdown";
import { HoverTag } from "./common/HoverCard";
import { TopHeaderNotification } from "./TopHeaderNotification";
import {colors} from "@react-spring/shared";
import { useEffect, useState } from "react";
import { useBrand } from "@/hooks/useBrand";
import { useBrandData } from "@/brand/BrandContext";
import { useCurrencyOption } from "@/hooks/useCurrencyOptions";
import { useCurrency } from "@/currency/CurrencyContext";
import {toast} from "@/components/common/Toast";

const LandingHeader = () => {
    const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false)
    const [isSticky,setIsSticky]= useState(false)
    const { classes, theme } = useHeaderStyles();
    const router = useRouter();
    const { brandData } = useBrandData();
    // const [brand, setBrand] = useState<"homaale" | "cagtu">("homaale");

    // useEffect(() => {
    //   setBrand(getBrand());
    // }, []);


       const dark = useDark();

        const { toggleColorScheme } = useMantineColorScheme();

    const user_id = useGetCookieUser();

    const { data: location } = useAppSelector((state) => state.locationReducer);

    const { data: weather } = useWeather();
     const {data: currencyOption = []} = useCurrencyOption();
     const {globalCurrency,setGlobalCurrency}= useCurrency()


    useEffect(() => {
        const handleScroll = () => {
          const scrollY = window.scrollY;
          setIsSticky(scrollY > 80); // Adjust threshold as needed
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
      }, []);
    return (
        <Box>
           {isSticky?"": <TopHeaderNotification />}
            <Header

            height={"100%"} px="md" py={4} mb={{ base: 20, md: 0 }}>
                <Group
                   className={`  w-full h-14 transition-smooth duration-200 ${
                    isSticky ? `  px-4 fixed h-14 top-0 left-0 ${dark?"bg-black":"bg-white"} shadow-md z-50` : "relative"
                  }`}
                position="apart" sx={{ height: "100%" }}>
                    <Image
                        src={(
                            dark
                                ? brandData?.logoWhite
                                : brandData?.logoDark
                             )}
                        height={28}
                        width={117}
                        alt="logo"
                    />
                  {!isSticky&&

                    <Group
                        sx={{ height: "100%" }}
                        spacing={0}
                        className={classes.hiddenMobile}
                    >
                        <ul className={classes.linkWrapper}>
                            <li>
                                <Link href={"/explore/services"}>
                                    <IconListSearch /> Explore Services
                                </Link>
                            </li>
                            <li>
                                <Link href={"/explore/tasks"}>
                                    <IconReportSearch /> Find Works
                                </Link>
                            </li>
                            <li>
                                <Link href={"/explore/taskers"}>
                                    <IconUserSearch /> Find Providers
                                </Link>
                            </li>
                            <li>
                                <CategoryDropdown />
                            </li>
                            <li>
                                <HoverCard
                                    width={"50%"}
                                    position="bottom"
                                    radius="sm"
                                    shadow="md"
                                    offset={18}
                                    withinPortal
                                >
                                    <HoverCard.Target>
                                        <Center
                                            sx={{
                                                cursor: "pointer",
                                                "&:hover": {
                                                    color: theme.colors
                                                        .brand[3],
                                                    transition: "all 0.3s ease",
                                                },
                                            }}
                                            inline
                                        >
                                            <Box component="span" mr={5}>
                                                Features
                                            </Box>
                                            <IconChevronDown />
                                        </Center>
                                    </HoverCard.Target>

                                    <HoverCard.Dropdown
                                        p={24}
                                        sx={{ overflow: "hidden" }}
                                    >
                                        <SimpleGrid cols={3} spacing={16}>
                                            <UnstyledButton
                                                className={classes.subLink}
                                                mb={8}
                                                onClick={() =>
                                                    scrollToView(
                                                        "trust-section"
                                                    )
                                                }
                                            >
                                                <Group align="flex-start">
                                                    <IconLock size={24} />
                                                    <Text
                                                        size="sm"
                                                        weight={500}
                                                    >
                                                        Secure
                                                    </Text>
                                                    <Text
                                                        size={14}
                                                        color="dimmed"
                                                    >
                                                        Your Identity and
                                                        Details will be kept
                                                        secure at Homaale.
                                                    </Text>
                                                </Group>
                                            </UnstyledButton>

                                            <UnstyledButton
                                                className={classes.subLink}
                                                mb={8}
                                                onClick={() =>
                                                    router.push("/contact-us")
                                                }
                                            >
                                                <Group align="flex-start">
                                                    <IconShieldLock size={24}/>

                                                    <Text
                                                        size="sm"
                                                        weight={500}
                                                    >
                                                        Reliable
                                                    </Text>
                                                    <Text
                                                        size={14}
                                                        color="dimmed"
                                                    >
                                                        You can rely on us for
                                                        any issues that arise
                                                        from our Platform.
                                                    </Text>
                                                </Group>
                                            </UnstyledButton>

                                            <UnstyledButton
                                                className={classes.subLink}
                                                mb={8}
                                                onClick={() =>
                                                    router.push(
                                                        "/homaale-terms-conditions"
                                                    )
                                                }
                                            >
                                                <Group align="flex-start">
                                                    <IconCoin size={24}/>
                                                    <Text
                                                        size="sm"
                                                        weight={500}
                                                    >
                                                        Pricing
                                                    </Text>
                                                    <Text
                                                        size={14}
                                                        color="dimmed"
                                                    >
                                                        All charges are kept
                                                        transparent to you.
                                                    </Text>
                                                </Group>
                                            </UnstyledButton>

                                            <UnstyledButton
                                                className={classes.subLink}
                                                mb={8}
                                                onClick={() =>
                                                    router.push("/FAQs")
                                                }
                                            >
                                                <Group align="flex-start">
                                                    <IconDiscountCheck
                                                        size={24}
                                                    />
                                                    <Text
                                                        size="sm"
                                                        weight={500}
                                                    >
                                                        Verified User
                                                    </Text>
                                                    <Text
                                                        size={14}
                                                        color="dimmed"
                                                    >
                                                        Every user at Homaale,
                                                        who can apply or post
                                                        for tasks and services
                                                        are KYC verified.
                                                    </Text>
                                                </Group>
                                            </UnstyledButton>

                                            <UnstyledButton
                                                className={classes.subLink}
                                                mb={8}
                                                onClick={() => {
                                                    scrollToView(
                                                        "post-process-section"
                                                    );
                                                }}
                                            >
                                                <Group align="flex-start">
                                                    <IconHandClick size={24} />
                                                    <Text
                                                        size="sm"
                                                        weight={500}
                                                    >
                                                        Convenient
                                                    </Text>
                                                    <Text
                                                        size={14}
                                                        color="dimmed"
                                                    >
                                                        You can create an
                                                        account without any
                                                        charges, post tasks and
                                                        services as per your
                                                        requirement and
                                                        negotiate on it.
                                                    </Text>
                                                </Group>
                                            </UnstyledButton>

                                            <UnstyledButton
                                                className={classes.subLink}
                                                mb={8}
                                                onClick={() =>
                                                    router.push("/category")
                                                }
                                            >
                                                <Group align="flex-start">
                                                    <IconUsers size={24} />
                                                    <Text
                                                        size="sm"
                                                        weight={500}
                                                    >
                                                        Multitude of Services
                                                    </Text>
                                                    <Text
                                                        size={14}
                                                        color="dimmed"
                                                    >
                                                        You can find a multitude
                                                        of tasks and services on
                                                        the same platform.
                                                    </Text>
                                                </Group>
                                            </UnstyledButton>
                                        </SimpleGrid>
                                    </HoverCard.Dropdown>
                                </HoverCard>
                            </li>
                        </ul>
                    </Group>
                        }


                    {!user_id ? (
                        <Group className={classes.hiddenMobile}>
                            <Select

                                variant="filled"

                                size="sm"
                                title=" Currency"
                                placeholder="Select Currency"
                                name={"currency"}

                                data={currencyOption.map((item) => ({
                                    value: item.value,
                                    label: item.label,
                                }))}
                                value={globalCurrency}
                                // rightSection={null}

                                onChange={(value:string) => {
                                     setGlobalCurrency(value)


                                }}
                                styles={{

                                    input: {
                                        width: '155px',
                                        justifyItems: 'center',
                                        '::placeholder': {
                                            fontSize: '10px',
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

                            <div>


                            <ActionIcon
                                                        bg={dark ? "gray.0" : "dark"}
                                                        color={!dark ? "gray.0" : "dark.9"}
                                                        size={"lg"}
                                                        // pos={"fixed"}
                                                        // top={{ base: "84%", sm: "90%", lg: "93%" }}
                                                        // right={{ base: "89%", sm: "95%", lg: "97%" }}

                                                        onClick={() => toggleColorScheme()}
                                                        sx={{
                                                            zIndex: 1001,
                                                            "&:hover": {
                                                                color: dark ? "white" : "black",
                                                            },
                                                            "& svg": {
                                                                margin: "0 !important",
                                                            },
                                                        }}
                                                    >
                                                          {!dark ? <IconMoon size={20} /> : <IconSun size={20} />}
                                                    </ActionIcon>
                                </div>
                            <Link
                                href={"/auth/login"}
                                style={{
                                    color:
                                        theme.colorScheme === "dark"
                                            ? theme.colors.dark[0]
                                            : "",
                                }}
                            >
                                Log in
                            </Link>

                            <Button
                                size={"sm"}
                                color={"dark"}
                                onClick={() => router.push("/auth/signup")}
                            >
                                Sign up
                            </Button>
                        </Group>
                    ) : (
                        <Group className={classes.hiddenMobile}>
                            <ActionNavigation />
                        </Group>
                    )}

                    <Burger
                        opened={drawerOpened}
                        onClick={toggleDrawer}
                        className={classes.hiddenDesktop}
                    />
                </Group>
            </Header>

            <Drawer
                opened={drawerOpened}
                onClose={closeDrawer}
                size="100%"
                padding="md"
                title={
                    <Image
                        src={
                            dark
                                ? brandData.logoWhite
                                : brandData.logoDark
                        }
                        height={28}
                        width={117}
                        alt="logo"
                    />
                }
                className={classes.hiddenDesktop}
                zIndex={1000000}
            >
                <ScrollArea sx={{ height: "calc(100vh - 60px)" }} mx="-md">
                    <Divider
                        my="sm"
                        color={
                            theme.colorScheme === "dark" ? "dark.5" : "gray.1"
                        }
                    />
                    <ul className={classes.linkWrapper}>
                        <li>
                            <Link href={"/explore/services"}>
                                <IconListSearch /> Explore Services
                            </Link>
                        </li>
                        <li>
                            <Link href={"/explore/tasks"}>
                                <IconReportSearch /> Find Works
                            </Link>
                        </li>
                        <li>
                            <Link href={"/explore/taskers"}>
                                <IconUserSearch /> Find Providers
                            </Link>
                        </li>
                        <li>
                            <Link href={"/category"}>
                                <IconCategory2 /> Browse Categories
                            </Link>
                        </li>
                        <li>
                            <Flex gap={50}>
                                <Flex>
                                    <IconCoin/>
                                    <Text ml={8} size="md">
                                        Select Currency
                                    </Text>
                                </Flex>


                        <Select
                                                            variant="filled"

                                                            size="sm"
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
                                                                    width: '180px',
                                                                    alignSelf: 'center',
                                                                    '::placeholder': {
                                                                        fontSize: '12px',

                                                                    },

                                                                },

                                                                rightSection: {


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
                                                         </Flex>

                        </li>
                    </ul>
                    {/* <Collapse in={linksOpened}>{links}</Collapse> */}

                    <Divider
                        my="sm"
                        color={
                            theme.colorScheme === "dark" ? "dark.5" : "gray.1"
                        }
                    />
                    <Flex
                        justify={"flex-start"}
                        gap={20}
                        ml={20}
                        direction={{ base: "column", xs: "row" }}
                        align={{ base: "flex-start", xs: "center" }}
                    >
                        {weather && (
                            <HoverTag
                                header={weather?.main?.temp
                                    .toFixed(1)
                                    .toString()}
                                image={weather.weather[0].icon}
                                top={"15%"}
                                left={"2%"}
                                is_mobile
                            />
                        )}

                        {location && (
                            <HoverTag
                                header={location?.city ?? ""}
                                secondary={location?.country}
                                bottom={"15%"}
                                right={"2%"}
                                is_mobile
                            />
                        )}
                    </Flex>
                    {/* {!user_id ? (
                        <Group
                            position="center"
                            grow
                            pb="xl"
                            px="md"
                            pos={"relative"}
                            mt={20}
                        >
                            <Button
                                size={"sm"}
                                onClick={() => router.push("/auth/login")}
                            >
                                Log in
                            </Button>
                            <Button
                                size={"sm"}
                                color={"dark"}
                                onClick={() => router.push("/auth/signup")}
                            >
                                Sign up
                            </Button>
                        </Group>
                    ) : (
                        ""
                    )} */}
                </ScrollArea>
            </Drawer>
        </Box>
    );
};

export default LandingHeader;
