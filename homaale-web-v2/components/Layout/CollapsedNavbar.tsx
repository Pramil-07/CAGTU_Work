import { ActionIcon, Box, Center, Navbar } from "@mantine/core";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

import {
    HOME_SIDE_NAV_DATA,
    PAYMENT_SIDE_NAV_DATA,
    SETTINGS_SIDE_NAV_DATA,
    TASK_SIDE_NAV_DATA,
    MERCHANT_SIDE_NAV_DATA
} from "@/constants/CollapsedSideBarData ";
import { useSideNavbarStyles } from "@/styles/SideNavbarStyles";
import { isLoggedIn, scrollToElement } from "@/utils/helpers";

import { CollapsedNavLink } from "./CollapsedNavLink";
import { useMediaQuery } from "@mantine/hooks";
import { IconLayoutSidebarLeftCollapse, IconLayoutSidebarLeftCollapseFilled, IconLayoutSidebarRightCollapse } from "@tabler/icons-react";
import { useBrand } from "@/hooks/useBrand";
import { useBrandData } from "@/brand/BrandContext";

export const CollapsedNavbar = ({
    setNavbarCollapsed,
  }: {
    setNavbarCollapsed: Dispatch<SetStateAction<string|null>>;
  }) => {
    const [active, setActive] = useState(2);
    const { classes, theme } = useSideNavbarStyles();
    const router = useRouter();
    const isSmallScreen = useMediaQuery("(max-width: 768px)");
    const brand = useBrand()
    const {brandData}=useBrandData()

    useEffect(() => {
        scrollToElement(router.pathname, "auto");
    }, [router.pathname]);

    const handleToggle = () => {
        if (setNavbarCollapsed) {
          console.log("CollapsedNavbar - Attempting to switch to SideNavbar");
          setNavbarCollapsed("false");
          console.log("CollapsedNavbar - Switching to SideNavbar");
        } else {
          console.warn("CollapsedNavbar - setNavbarCollapsed is undefined");
        }
      };

    return (
        <Navbar width={{ base: 80 }} p={0} className={classes.root}  sx={{
            position: isSmallScreen ? "relative" : "fixed",
           
            
        }} 
        

        >
            <Center pt={14} ml={5} pb={32} style={{justifyContent:"space-between"}}>
                <Link href={"/"}>
                 {
                    <Image
                    src={brandData.WhiteIcon}
                    alt={"homaale-logo"}
                    width={32}
                    priority
                    height={32}
                />
                 
                 
                }
                </Link>
                <ActionIcon
          onClick={handleToggle}
          variant="transparent"
          color={theme.colorScheme === "dark" ? "yellow.6" : "homaaleSlate.5"}
        ><div>
      

<svg onClick={handleToggle} transform="scale(-1,1) translate(0,0)"  width="36" height="30" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0 2C0 0.895431 0.895431 0 2 0H36V36H2C0.895431 36 0 35.1046 0 34V2Z" fill={theme.colors.brand[4]}/>
<path d="M26.1302 23.2604C26.6106 23.2604 27 23.6499 27 24.1302C27 24.6106 26.6106 25 26.1302 25H10.8172C10.3368 25 9.94737 24.6106 9.94737 24.1302C9.94737 23.6499 10.3368 23.2604 10.8171 23.2604H26.1302ZM12.7414 11.5625C13.0879 11.2444 13.6203 11.2444 13.9668 11.5625C14.3578 11.9215 14.3578 12.5382 13.9668 12.8972L12.4815 14.2609C12.0499 14.6571 12.0499 15.3379 12.4815 15.7341L13.9668 17.0978C14.3578 17.4568 14.3578 18.0735 13.9668 18.4325C13.6203 18.7506 13.0879 18.7506 12.7414 18.4325L9.80234 15.7341C9.37073 15.3379 9.37074 14.6571 9.80234 14.2609L12.7414 11.5625ZM26.1302 17.172C26.6106 17.172 27 17.5614 27 18.0417C27 18.5221 26.6106 18.9115 26.1302 18.9115H19.3435C18.8631 18.9115 18.4737 18.5221 18.4737 18.0417C18.4737 17.5614 18.8631 17.172 19.3435 17.172H26.1302ZM26.1302 11.0835C26.6106 11.0835 27 11.4729 27 11.9533C27 12.4336 26.6106 12.8231 26.1302 12.8231H19.3435C18.8631 12.8231 18.4737 12.4336 18.4737 11.9533C18.4737 11.4729 18.8631 11.0835 19.3435 11.0835H26.1302Z" fill="white"/>
</svg>

        </div>
        </ActionIcon>
            </Center>
            <Navbar.Section grow
            
            sx={{
                height: "100%",
                overflow: "hidden",
                '&:hover': {
                  overflow: 'auto',
                },
                // Hide scrollbars by default (for WebKit)
                '&::-webkit-scrollbar': {
                  width: 0,
                  height: 0,
                },
                '&:hover::-webkit-scrollbar': {
                  width: 6,
                  height: 6,
                },
                '&:hover::-webkit-scrollbar-thumb': {
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '8px',
                },
                scrollbarWidth: 'none', // Firefox
              }}
            
            >
                {/* <Box pb={24}>
                    {HOME_SIDE_NAV_DATA().map((item, index) => (
                        <CollapsedNavLink
                            {...item}
                            key={item.label}
                            active={index === active}
                            onClick={() => setActive(index)}
                            link={item.link}
                            id={item.id}
                        />
                    ))}
                </Box> */}
                <Box
                    pb={24}
                    pt={24}
                    sx={{
                        borderTop:
                            theme.colorScheme === "dark"
                                ? `1px solid ${theme.colors.gray[7]}`
                                : "1px solid rgba(0, 0, 0, 0.08)",
                    }}
                >
                    {TASK_SIDE_NAV_DATA().map((item, index) => (
                        <CollapsedNavLink
                            {...item}
                            key={item.label}
                            active={index === active}
                            onClick={() => setActive(index)}
                            link={item.link}
                            id={item.id}
                        />
                    ))}
                </Box>
                {isLoggedIn() && (
                    <Box
                        pb={24}
                        pt={24}
                        sx={{
                            borderTop:
                                theme.colorScheme === "dark"
                                    ? `1px solid ${theme.colors.gray[7]}`
                                    : "1px solid rgba(0, 0, 0, 0.08)",
                        }}
                    >
                        {MERCHANT_SIDE_NAV_DATA().map((item) => (
                            <CollapsedNavLink
                                {...item}
                                key={item.id}
                                active={router.pathname === item.link}
                            />
                        ))}
                    </Box>
                )}
                {isLoggedIn() && (
                    <Box
                        pb={24}
                        pt={24}
                        sx={{
                            borderTop:
                                theme.colorScheme === "dark"
                                    ? `1px solid ${theme.colors.gray[7]}`
                                    : "1px solid rgba(0, 0, 0, 0.08)",
                        }}
                    >
                        {PAYMENT_SIDE_NAV_DATA().map((item, index) => (
                            <CollapsedNavLink
                                {...item}
                                key={item.label}
                                active={index === active}
                                onClick={() => setActive(index)}
                                link={item.link}
                                id={item.id}
                            />
                        ))}
                    </Box>
                )}

                {isLoggedIn() && (
                    <Box
                        pb={24}
                        pt={24}
                        sx={{
                            borderTop:
                                theme.colorScheme === "dark"
                                    ? `1px solid ${theme.colors.gray[7]}`
                                    : "1px solid rgba(0, 0, 0, 0.08)",
                        }}
                    >
                        {SETTINGS_SIDE_NAV_DATA().map((item, index) => (
                            <CollapsedNavLink
                                {...item}
                                key={item.label}
                                active={index === active}
                                onClick={() => setActive(index)}
                                link={item.link}
                                id={item.id}
                            />
                        ))}
                    </Box>
                )}
            </Navbar.Section>
        </Navbar>
    );
};
