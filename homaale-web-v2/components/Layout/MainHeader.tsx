import {
    ActionIcon,
    Box,
    Burger,
    Button, Flex,
    Group,
    Header,
    MediaQuery,
    Select,
    useMantineColorScheme,
    useMantineTheme,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {IconLayoutSidebarLeftCollapse, IconMoon, IconSearch, IconSun} from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/router";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import React from "react";

import { useMainHeaderStyles } from "@/styles/MainHeaderStyles";
import type { BreadcrumbItems } from "@/types/BreadCrumbProps";
import { isLoggedIn, useDark } from "@/utils/helpers";

import ActionNavigation from "../common/ActionNavigation";
import Breadcrumb from "../common/BreadCrumb";
// import { NotificationDropProps } from "../notifications/NotificationDrop";
import { SearchBar } from "../common/SearchBar";
import {useBrandData} from "@/brand/BrandContext";
import Image from "next/image";
import { useCurrencyOption } from "@/hooks/useCurrencyOptions";
import SelectField from "../common/form/SelectField";
import { fontSize } from "@mui/system";
import { useCurrency } from "@/currency/CurrencyContext";
import {toast} from "@/components/common/Toast";
export const MainHeader = ({
    opened,
    setOpened,
    navbarCollapsed,
    setNavbarCollapsed,
    currentTitle,
    breadCrumbsItems,
    category,
    onCurrencyChange

}: {
    style:React.CSSProperties;
    opened: boolean;
    navbarCollapsed: string;
    setOpened: Dispatch<SetStateAction<boolean>>;
    setNavbarCollapsed: Dispatch<SetStateAction<string | null>>;
    currentTitle?: string;
    breadCrumbsItems?: BreadcrumbItems[];
    category: boolean;
    onCurrencyChange: (currency: string | null) => void;


}) => {
    const { classes } = useMainHeaderStyles();
    const theme = useMantineTheme();
    const {brandData } =useBrandData()
    const dark = useDark();
    const { globalCurrency, setGlobalCurrency } = useCurrency();
    const[showSearchBar,setShowSearchBar]= useState(false)

    const iconColorMode = dark
        ? theme.colors.yellow[6]
        : theme.colors.homaaleSlate[5];

    const router = useRouter();
     const {data: currencyOption = []} = useCurrencyOption();

    const [rotateChevron, setRotateChevron] = useState(
        typeof window != "undefined"
            ? localStorage.getItem("isNavbarCollapsed")
            : "false"
    );

    const rotate = rotateChevron === "true" ? "rotate(180deg)" : "rotate(0)";

    const smallScreen = useMediaQuery("(max-width: 36em)");
    const mobileview = useMediaQuery("(max-width: 768px)")
    const isMid = useMediaQuery('(max-width: 1200px)');
    console.log("currency",globalCurrency)


        //   const dark = useDark();

           const { toggleColorScheme } = useMantineColorScheme();
    const handelId = () => {
        router.push(`/#`)
    };
    return (
        <>
            <Header
                height={65}
                ml={0}
                mr={0}
                p="12px 30px 12px 34px"
                style={{

                    // border:"1px solid #ddd",
                     borderRadius:"5px",
                    boxShadow:"0 2px 4px rgba(0,0,0,0.1)",
                    padding:"20px 20px",





                }}

            >
                <div className={classes.headerWrapper}>
                    <Group>

                         <Burger
                            opened={opened}
                            onClick={() => setOpened((o) => !o)}
                            size="sm"

                            color={theme.colors.gray[6]}
                            // mr="xl"
                            sx={{

                                display: "block",
                                [`@media (min-width: ${theme.breakpoints.sm}px)`]:
                                    {
                                        display: "none",
                                    },
                            }}
                        />

                        {/* <MediaQuery
                            smallerThan={"sm"}
                            styles={{display: "none"}}
                        >
                            <IconLayoutSidebarLeftCollapse
                                size={20}
                                color={iconColorMode}
                                style={{
                                    transform: rotate,
                                    transition: "all 0.2s linear",
                                    cursor: "pointer",
                                }}
                                onClick={() => {
                                    setNavbarCollapsed(
                                        navbarCollapsed === "true"
                                            ? "false"
                                            : "true"
                                    );
                                    setRotateChevron(
                                        rotateChevron === "true"
                                            ? "false"
                                            : "true"
                                    );
                                }}
                            />
                        </MediaQuery> */}
                        {/* {!smallScreen && currentTitle && (
                            <Breadcrumb
                                currentTitle={currentTitle}
                                items={breadCrumbsItems}
                            />
                        )} */}
                        {!mobileview && category && !isMid && (
                            <Image
                                className="cursor-pointer"
                                src={
                                    dark
                                        ? brandData.logoWhite
                                        : brandData.logoDark
                                }
                                height={28}
                                width={117}
                                onClick={handelId}
                                alt="logo"
                            />
                        )}

                        <Box w={mobileview?115:350} display={"flex"} style={{gap:"5px"}}>
                            { mobileview && showSearchBar?
                                <Flex>
                                <SearchBar inLayout={true}/>
                                    <Button variant={"outline"} style={{
                                        border:"none",
                                        padding:"2px",
                                        // width:"10px"
                                    }} size={"sm"} onClick={()=>showSearchBar?setShowSearchBar(false):setShowSearchBar(true)}>
                                          X
                                    </Button>
                                </Flex>

                                :!mobileview&&
                                <SearchBar inLayout={true}/>

                            }
                            {!showSearchBar&&mobileview&&
                              <Button radius={"md"}  variant={"gradient"} onClick={()=>showSearchBar?setShowSearchBar(false):setShowSearchBar(true)}>
                                <IconSearch/>

                              </Button>

                            }
                            {!isLoggedIn() && !showSearchBar && mobileview&&(
                                <Select


                                variant="filled"
                                radius={"sm"}

                                size="sm"
                                title=" Currency"
                                placeholder="Select Currency"
                                name={"currency"}

                                data={currencyOption.map((item) => ({
                                    value: item.value,
                                    label: item.symbol,
                                }))}
                                value={globalCurrency}
                                rightSection={null}
                                // onClick={()=>is_checkout &&  toast.error("Cannot change currency during checkout")}
                                // disabled={is_checkout}
                                onChange={(value) => {
                                    value && setGlobalCurrency(value)


                                }}
                                styles={{
                                    root: {
                                        width: "80px",
                                        // padding:"10px"
                                    },


                                    input: {
                                        width: '65px',
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
                            />)}

                        </Box>
                    </Group>
                    {!isLoggedIn() ? (
                        <Group
                            sx={{
                                "& a": {
                                    color: theme.colors.homaaleSlate[8],
                                },
                                "@media (max-width: 36em)": {
                                    gap: 8,
                                    flexDirection: "row",
                                },
                            }}
                        >  {!mobileview&&(
                            <Select


                                variant="filled"
                                radius={"sm"}

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
                                // onClick={()=>is_checkout &&  toast.error("Cannot change currency during checkout")}
                                // disabled={is_checkout}
                                onChange={(value) => {
                                    value && setGlobalCurrency(value)


                                }}
                                styles={{
                                    root: {
                                        width: "150px",
                                        // padding:"10px"
                                    },


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
                            />)}

                              <ActionIcon
                                    bg={dark ? "gray.0" : "dark"}
                                    color={!dark ? "gray.0" : "dark.9"}
                                    size={"md"}
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
                                size={"xs"}
                                color={"dark"}
                                onClick={() => router.push("/auth/signup")}
                            >
                                Sign up
                            </Button>
                        </Group>
                    ) : (
                        <Group>
                          {/* <Select
        variant="filled"

        size="sm"
        title=" Currency"
        placeholder="Select Currency"
        name={"currency"}

        data={currencyOption.map((item) => ({
            value: item.value,
            label: item.symbol,
        }))}
        value={globalCurrency}
        rightSection={null}
        rightSectionWidth={0}
        onChange={(value) => {
            value && setGlobalCurrency(value)


        }}
        styles={{

            input: {
                width: '80px',
                alignSelf: 'center',
                '::placeholder': {
                    fontSize: '12px',

                },

            },

            rightSection: {
              opacity:"0"

            },

        }}
        // onDoubleClick={() => {
        //     const currentIndex = currencyOption.findIndex(
        //         (item) => item.value === currency
        //     );
        //     const nextIndex = (currentIndex + 1) % currencyOption.length;
        //     setCurrency(currencyOption[nextIndex].value); // Update the currency state
        // }}
    /> */}
                            <ActionNavigation />
                        </Group>
                    )}
                </div>
            </Header>
        </>
    );
};
