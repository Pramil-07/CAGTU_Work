import { ActionIcon, Box, Burger, Button, Flex, Group, MediaQuery, Navbar, ScrollArea, useMantineTheme } from "@mantine/core";
import { IconLayoutSidebarLeftCollapse, IconLayoutSidebarLeftCollapseFilled, IconMenu2, IconSettings, IconSmartHome, IconUser } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";

import {
    HELP_SIDE_NAV_DATA, MERCHANT_SIDE_NAV_DATA,
    PAYMENT_SIDE_NAV_DATA,
    SETTINGS_SIDE_NAV_DATA,
    TASK_SIDE_NAV_DATA,
} from "@/constants/SideBarData";
import { useSideNavbarStyles } from "@/styles/SideNavbarStyles";
import { isLoggedIn, scrollToElement, useDark } from "@/utils/helpers";

import { NavContainer } from "./NavContainer";
import { NavLink } from "./NavLink";
import CategorySidebar from "@/components/CategorySidebar/CategorySidebar";
import {useProfile} from "@/hooks/useProfile";
import { IoHomeOutline } from "react-icons/io5";
import { useBrand } from "@/hooks/useBrand";
import { useBrandData } from "@/brand/BrandContext";
// import { isFixed } from "@mantine/hooks/lib/use-headroom/use-headroom";
export const SideNavbar = ({ opened ,style,navbarCollapsed,setNavbarCollapsed,setOpened}: { opened: boolean,  navbarCollapsed: string|null ,style:React.CSSProperties, setNavbarCollapsed: Dispatch<SetStateAction<string | null>>;setOpened: (value: boolean | ((prev: boolean) => boolean)) => void; }) => {
    const dark = useDark();
    const {classes} = useSideNavbarStyles();
    const router = useRouter();
     const brand = useBrand()
     const {brandData}=useBrandData()
    const {data: profileData} = useProfile();
    // console.log("profiledata ",profileData);
    const merchantId = profileData?.user?.id;
    const isPremium = profileData?.merchant_data?.[0]?.is_premium;
    const helpSidebarPages = ["FAQs", "feedback", "contact-us", "support"];
    const taskBookings =[ "merchants","explore","myList","tasker","category","bookings","products","shops"]
    const isActive = taskBookings.some((item) =>
        router.pathname.includes(item)
    );
    const isActive1 = router.pathname.includes("payment")
    const isActive2 = router.pathname.includes("settings")
    const helpSupport = ["FAQs","feedback","contact","report"]
    const isActive4= helpSupport.some((item)=>
    router.pathname.includes(item)
    )

      useEffect(() => {
        scrollToElement(router.pathname, "auto");
      }, [router.pathname]);

       const theme = useMantineTheme();
      const iconColorMode = dark
      ? theme.colors.yellow[6]
      : theme.colors.homaaleSlate[5];

       const [rotateChevron, setRotateChevron] = useState(
              typeof window != "undefined"
                  ? localStorage.getItem("isNavbarCollapsed")
                  : "false"
          );
          const rotate = rotateChevron === "true" ? "rotate(180deg)" : "rotate(0)";

          const handleBurgerToggle = () => {
            // console.log("Burger clicked, current opened state:", opened);
            setOpened((prev) => {
              // console.log("New opened state:", !prev);
              return !prev;
            });
          };

          const handleCollapseToggle = () => {
            // console.log("Collapse icon clicked, current navbarCollapsed:", navbarCollapsed);
            const newCollapsed = navbarCollapsed === "true" ? "false" : "true";
            setNavbarCollapsed(newCollapsed);
            setRotateChevron(newCollapsed);
            if (typeof window !== "undefined") {
              localStorage.setItem("isNavbarCollapsed", newCollapsed);
            }
            // console.log("New navbarCollapsed state:", newCollapsed);
          };

    return (
        <Navbar
            style={style}


            pt={14}
            hiddenBreakpoint="sm"
            hidden={!opened}
            className={classes.root}
            width={{sm: 200, md: 220, lg: 250, xl: 280}}
            mt={{base: 0, lg: 0, md: 0}}

        >
           <Flex>



            <Box id={"home-logo"} className={classes.figure}>
                <Link href={"/"}>
                    <Image
                        src={(

                            dark
                            ? brandData.logoWhite
                            : brandData.logoDark
                        )
                        }
                        alt={"homaale-logo"}
                        width={117}
                        priority
                        height={32}
                    />
                </Link>
                </Box>
                <Group >

                        {/* <Burger
                            opened={opened}
                            onClick={handleBurgerToggle}
                            size="sm"
                            color={theme.colors.gray[6]}
                            mr="xl"
                            sx={{
                                display: "block",
                                [`@media (min-width: ${theme.breakpoints.sm}px)`]:
                                    {
                                        display: "none",
                                    },
                            }}
                        /> */}


                    </Group>
                    <MediaQuery
                            smallerThan={"sm"}
                            styles={{display: "none"}}
                        >
                         
                        <svg onClick={handleCollapseToggle} cursor={"pointer"}  width="36" height="30" transform="translate(4,0)" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 2C0 0.895431 0.895431 0 2 0H36V36H2C0.895431 36 0 35.1046 0 34V2Z" fill={theme.colors.brand[4]}/>
                        <path d="M26.1302 23.2604C26.6106 23.2604 27 23.6499 27 24.1302C27 24.6106 26.6106 25 26.1302 25H10.8172C10.3368 25 9.94737 24.6106 9.94737 24.1302C9.94737 23.6499 10.3368 23.2604 10.8171 23.2604H26.1302ZM12.7414 11.5625C13.0879 11.2444 13.6203 11.2444 13.9668 11.5625C14.3578 11.9215 14.3578 12.5382 13.9668 12.8972L12.4815 14.2609C12.0499 14.6571 12.0499 15.3379 12.4815 15.7341L13.9668 17.0978C14.3578 17.4568 14.3578 18.0735 13.9668 18.4325C13.6203 18.7506 13.0879 18.7506 12.7414 18.4325L9.80234 15.7341C9.37073 15.3379 9.37074 14.6571 9.80234 14.2609L12.7414 11.5625ZM26.1302 17.172C26.6106 17.172 27 17.5614 27 18.0417C27 18.5221 26.6106 18.9115 26.1302 18.9115H19.3435C18.8631 18.9115 18.4737 18.5221 18.4737 18.0417C18.4737 17.5614 18.8631 17.172 19.3435 17.172H26.1302ZM26.1302 11.0835C26.6106 11.0835 27 11.4729 27 11.9533C27 12.4336 26.6106 12.8231 26.1302 12.8231H19.3435C18.8631 12.8231 18.4737 12.4336 18.4737 11.9533C18.4737 11.4729 18.8631 11.0835 19.3435 11.0835H26.1302Z" fill="white"/>
                        </svg>
       

                        </MediaQuery>

                    </Flex>
            <Navbar.Section

                id={"main-navigation"}
                grow
                component={ScrollArea}
                className={classes.main}
                scrollbarSize={6}
            >
                {/* <Box mb={12} >


                <NavContainer   icon={<IoHomeOutline color="grey"/>} title="HOME" isDefault >
                    <NavLink

                        title={"Home"}
                        icon={<IconSmartHome size={20}/>}
                        link={"/#"}
                        id="/"
                    />

                    </NavContainer>

                </Box> */}
                <NavContainer
                routes={taskBookings}
                title="TASK & BOOKINGS"

                isDefault



                icon={<svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <mask id="mask0_2864_75301"  maskUnits="userSpaceOnUse" x="0" y="0" width="16" height="16">
                    <rect width="16" height="16" fill="#D9D9D9"/>
                    </mask>
                    <g mask="url(#mask0_2864_75301)">
                    <path d="M2.66634 14C2.29967 14 1.9859 13.8696 1.72501 13.6087C1.46367 13.3473 1.33301 13.0333 1.33301 12.6667V3.33333C1.33301 2.96667 1.46367 2.65267 1.72501 2.39133C1.9859 2.13044 2.29967 2 2.66634 2H13.333C13.6997 2 14.0137 2.13044 14.275 2.39133C14.5359 2.65267 14.6663 2.96667 14.6663 3.33333V12.6667C14.6663 13.0333 14.5359 13.3473 14.275 13.6087C14.0137 13.8696 13.6997 14 13.333 14H2.66634ZM2.66634 12.6667H13.333V3.33333H2.66634V12.6667ZM3.33301 11.3333H6.66634V10H3.33301V11.3333ZM9.69967 10L12.9997 6.7L12.0497 5.75L9.69967 8.11667L8.74967 7.16667L7.81634 8.11667L9.69967 10ZM3.33301 8.66667H6.66634V7.33333H3.33301V8.66667ZM3.33301 6H6.66634V4.66667H3.33301V6Z" fill="currentColor"/>
                    </g>
                    </svg>

                } >
                    {TASK_SIDE_NAV_DATA().map((item, index) => (
                        <NavLink
                            key={index}
                            title={item.title}
                            icon={item.icon}
                            link={item.link}
                            id={item.id}
                        />
                    ))}
                </NavContainer>

                {isLoggedIn() && isPremium &&(
                    <NavContainer title="MERCHANT DASHBOARD" isDefault icon={<IconUser />} routes={["/merchant/sales","/merchant/profile"]}>
                        {MERCHANT_SIDE_NAV_DATA().map((item, index) => (
                            <NavLink
                                key={index}
                                title={item.title}
                                icon={item.icon}
                                link={item.link}
                                id={item.id}
                            />
                        ))}
                    </NavContainer>
                )}

                {isLoggedIn() && (
                    <NavContainer title="PAYMENT" isDefault icon={<svg width="20" height="20" viewBox="0 0 14 12" fill="lightgrey" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6.33301 9.33268H7.66634V8.66602H8.33301C8.5219 8.66602 8.68034 8.60202 8.80834 8.47402C8.9359 8.34646 8.99967 8.18824 8.99967 7.99935V5.99935C8.99967 5.81046 8.9359 5.65202 8.80834 5.52401C8.68034 5.39646 8.5219 5.33268 8.33301 5.33268H6.33301V4.66602H8.99967V3.33268H7.66634V2.66602H6.33301V3.33268H5.66634C5.47745 3.33268 5.31923 3.39646 5.19167 3.52402C5.06367 3.65202 4.99967 3.81046 4.99967 3.99935V5.99935C4.99967 6.18824 5.06367 6.34646 5.19167 6.47402C5.31923 6.60202 5.47745 6.66602 5.66634 6.66602H7.66634V7.33268H4.99967V8.66602H6.33301V9.33268ZM1.66634 11.3327C1.29967 11.3327 0.985897 11.2022 0.725008 10.9413C0.463675 10.68 0.333008 10.366 0.333008 9.99935V1.99935C0.333008 1.63268 0.463675 1.3189 0.725008 1.05802C0.985897 0.796682 1.29967 0.666016 1.66634 0.666016H12.333C12.6997 0.666016 13.0137 0.796682 13.275 1.05802C13.5359 1.3189 13.6663 1.63268 13.6663 1.99935V9.99935C13.6663 10.366 13.5359 10.68 13.275 10.9413C13.0137 11.2022 12.6997 11.3327 12.333 11.3327H1.66634ZM1.66634 9.99935H12.333V1.99935H1.66634V9.99935Z" fill="currentColor"/>
                        </svg>

                        }
                       routes={["payment"]}

                        >
                        {PAYMENT_SIDE_NAV_DATA().map((item, index) => (
                            <NavLink
                                key={index}
                                title={item.title}
                                icon={item.icon}
                                link={item.link}
                                id={item.id}
                            />
                        ))}
                    </NavContainer>
                )}

                {isLoggedIn() && (
                    <NavContainer
                    isActive={isActive2}
                    icon={<IconSettings color="grey" size={20}/>}
                        title="SETTINGS"
                        isDefault={router.pathname.includes("/settings/")}
                        routes={["settings"]}
                    >
                        {SETTINGS_SIDE_NAV_DATA().map((item, index) => (
                            <NavLink
                                key={index}
                                title={item.title}
                                icon={item.icon}
                                link={item.link}
                                id={item.id}
                            />
                        ))}
                    </NavContainer>
                )}

                <NavContainer
                isActive={isActive4}
                icon={<svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <mask id="mask0_2864_75335"  maskUnits="userSpaceOnUse" x="0" y="0" width="16" height="16">
                    <rect width="16" height="16" fill="#D9D9D9"/>
                    </mask>
                    <g mask="url(#mask0_2864_75335)">
                    <path d="M8.00016 14.6673C7.07794 14.6673 6.21127 14.4922 5.40016 14.142C4.58905 13.7922 3.8835 13.3173 3.2835 12.7173C2.6835 12.1173 2.20861 11.4118 1.85883 10.6007C1.50861 9.78954 1.3335 8.92287 1.3335 8.00065C1.3335 7.07843 1.50861 6.21176 1.85883 5.40065C2.20861 4.58954 2.6835 3.88398 3.2835 3.28398C3.8835 2.68398 4.58905 2.20887 5.40016 1.85865C6.21127 1.50887 7.07794 1.33398 8.00016 1.33398C8.92239 1.33398 9.78905 1.50887 10.6002 1.85865C11.4113 2.20887 12.1168 2.68398 12.7168 3.28398C13.3168 3.88398 13.7917 4.58954 14.1415 5.40065C14.4917 6.21176 14.6668 7.07843 14.6668 8.00065C14.6668 8.92287 14.4917 9.78954 14.1415 10.6007C13.7917 11.4118 13.3168 12.1173 12.7168 12.7173C12.1168 13.3173 11.4113 13.7922 10.6002 14.142C9.78905 14.4922 8.92239 14.6673 8.00016 14.6673ZM6.06683 12.9673L6.86683 11.134C6.40016 10.9673 5.9975 10.7089 5.65883 10.3587C5.31972 10.0089 5.05572 9.60065 4.86683 9.13398L3.0335 9.90065C3.28905 10.6118 3.6835 11.234 4.21683 11.7673C4.75016 12.3007 5.36683 12.7007 6.06683 12.9673ZM4.86683 6.86732C5.05572 6.40065 5.31972 5.99243 5.65883 5.64265C5.9975 5.29243 6.40016 5.03398 6.86683 4.86732L6.10016 3.03398C5.38905 3.30065 4.76683 3.70065 4.2335 4.23398C3.70016 4.76732 3.30016 5.38954 3.0335 6.10065L4.86683 6.86732ZM8.00016 10.0007C8.55572 10.0007 9.02794 9.80621 9.41683 9.41732C9.80572 9.02843 10.0002 8.55621 10.0002 8.00065C10.0002 7.4451 9.80572 6.97287 9.41683 6.58398C9.02794 6.1951 8.55572 6.00065 8.00016 6.00065C7.44461 6.00065 6.97238 6.1951 6.5835 6.58398C6.19461 6.97287 6.00016 7.4451 6.00016 8.00065C6.00016 8.55621 6.19461 9.02843 6.5835 9.41732C6.97238 9.80621 7.44461 10.0007 8.00016 10.0007ZM9.9335 12.9673C10.6335 12.7007 11.2475 12.3035 11.7755 11.776C12.3031 11.248 12.7002 10.634 12.9668 9.93398L11.1335 9.13398C10.9668 9.60065 10.7113 10.0033 10.3668 10.342C10.0224 10.6811 9.62239 10.9451 9.16683 11.134L9.9335 12.9673ZM11.1335 6.83398L12.9668 6.06732C12.7002 5.36732 12.3031 4.75332 11.7755 4.22532C11.2475 3.69776 10.6335 3.30065 9.9335 3.03398L9.16683 4.90065C9.62239 5.06732 10.0168 5.31998 10.3502 5.65865C10.6835 5.99776 10.9446 6.38954 11.1335 6.83398Z" fill="currentColor"/>
                    </g>
                    </svg>
                    }
                    title="HELP & SUPPORT"
                    isDefault={helpSidebarPages.some((val) =>
                        router.pathname.includes(val)

                    )}
                    routes={helpSidebarPages}
                >
                    {HELP_SIDE_NAV_DATA().map((item, index) => (
                        <NavLink
                            key={index}
                            title={item.title}
                            icon={item.icon}
                            link={item.link}
                            id={item.id}
                        />
                    ))}
                </NavContainer>
            </Navbar.Section>
        </Navbar>
    );
};












// import { Box, Navbar, ScrollArea } from "@mantine/core";
// import { IconSmartHome } from "@tabler/icons-react";
// import Image from "next/image";
// import Link from "next/link";
// import { useRouter } from "next/router";
// import React, { useEffect } from "react";
//
// import {
//     HELP_SIDE_NAV_DATA,
//     PAYMENT_SIDE_NAV_DATA,
//     SETTINGS_SIDE_NAV_DATA,
//     TASK_SIDE_NAV_DATA,
// } from "@/constants/SideBarData";
// import { useSideNavbarStyles } from "@/styles/SideNavbarStyles";
// import { isLoggedIn, scrollToElement, useDark } from "@/utils/helpers";
//
// import { NavContainer } from "./NavContainer";
// import { NavLink } from "./NavLink";
// import CategorySidebar from "@/components/CategorySidebar/CategorySidebar";
// // import { isFixed } from "@mantine/hooks/lib/use-headroom/use-headroom";
// export const SideNavbar = ({ opened ,style}: { opened: boolean ,style:React.CSSProperties }) => {
//     const dark = useDark();
//     const {classes} = useSideNavbarStyles();
//     const router = useRouter();
//     const helpSidebarPages = ["FAQs", "feedback", "contact-us", "support"];
//     useEffect(() => {
//         scrollToElement(router.pathname, "auto");
//     }, [router.pathname]);
//
//     return (
//         <Navbar
//             style={style}
//
//
//             pt={14}
//             hiddenBreakpoint="sm"
//             hidden={!opened}
//             className={classes.root}
//             width={{sm: 200, md: 220, lg: 250, xl: 280}}
//             mt={{base: 50, lg: 0, md: 0}}
//
//         >
//
//             <Box id={"home-logo"} className={classes.figure}>
//                 <Link href={"/"}>
//                     <Image
//                         src={
//                             dark
//                                 ? "/images/logo/homaale-logo-white_svg.svg"
//                                 : "/images/logo/homaale-logo-dark_svg.svg"
//                         }
//                         alt={"homaale-logo"}
//                         width={117}
//                         priority
//                         height={32}
//                     />
//                 </Link>
//             </Box>
//             <Navbar.Section
//
//                 id={"main-navigation"}
//                 grow
//                 component={ScrollArea}
//                 className={classes.main}
//                 scrollbarSize={6}
//             >
//                 <Box mb={12}>
//                     <NavLink
//                         title={"Home"}
//                         icon={<IconSmartHome size={20}/>}
//                         link={"/#"}
//                         id="/"
//                     />
//                 </Box>
//                 <NavContainer title="CATEGORIES" isDefault>
//                     {/*{TASK_SIDE_NAV_DATA().map((item, index) => (*/}
//                     {/*    <NavLink*/}
//                     {/*        key={index}*/}
//                     {/*        title={item.title}*/}
//                     {/*        icon={item.icon}*/}
//                     {/*        link={item.link}*/}
//                     {/*        id={item.id}*/}
//                     {/*    />*/}
//                     {/*))}*/}
//                     <CategorySidebar/>
//                 </NavContainer>
//
//                 {isLoggedIn() && (
//                     <NavContainer title="PAYMENT" isDefault>
//                         {PAYMENT_SIDE_NAV_DATA().map((item, index) => (
//                             <NavLink
//                                 key={index}
//                                 title={item.title}
//                                 icon={item.icon}
//                                 link={item.link}
//                                 id={item.id}
//                             />
//                         ))}
//                     </NavContainer>
//                 )}
//
//                 {isLoggedIn() && (
//                     <NavContainer
//                         title="SETTINGS"
//                         isDefault={router.pathname.includes("/settings/")}
//                     >
//                         {SETTINGS_SIDE_NAV_DATA().map((item, index) => (
//                             <NavLink
//                                 key={index}
//                                 title={item.title}
//                                 icon={item.icon}
//                                 link={item.link}
//                                 id={item.id}
//                             />
//                         ))}
//                     </NavContainer>
//                 )}
//
//                 <NavContainer
//                     title="HELP & SUPPORT"
//                     isDefault={helpSidebarPages.some((val) =>
//                         router.pathname.includes(val)
//                     )}
//                 >
//                     {HELP_SIDE_NAV_DATA().map((item, index) => (
//                         <NavLink
//                             key={index}
//                             title={item.title}
//                             icon={item.icon}
//                             link={item.link}
//                             id={item.id}
//                         />
//                     ))}
//                 </NavContainer>
//             </Navbar.Section>
//         </Navbar>
//     );
// };
