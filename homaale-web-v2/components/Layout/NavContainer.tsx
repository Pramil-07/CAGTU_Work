import { Collapse, Flex, Text, useMantineTheme } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import type { ReactNode } from "react";
import React, { useState } from "react";

import { useSideNavbarStyles } from "@/styles/SideNavbarStyles";
import { useRouter } from "next/router";

export const NavContainer = ({
    children,
    title,
    isDefault,
    icon,
    isActive:propIsActive,
    routes
}: {
    children: ReactNode;
    title: string;
    isDefault?: boolean;
    icon:ReactNode
    isActive?:any;
    routes?:string[]
}) => {
    const { classes, cx } = useSideNavbarStyles();
    const router = useRouter()
    const computedIsActive = routes
        ? routes.some((item) => router.pathname.includes(item))
        : false;
    const isActive = propIsActive !== undefined ? propIsActive : computedIsActive;

    const [navListOpen, setNavListOpen] = useState(isDefault ? true : false);
    // const isActive = navListOpen
    const theme = useMantineTheme()

    return (
        <div className={classes.navWrapper} style={ {color: isActive
            ? theme.colors[theme.primaryColor][4] // Active color from original
    
            : theme.colors.homaaleSlate?.[5] ?? theme.colors.gray[7]}}
        >
            <div
                className={classes.navHeader}
              
                onClick={() => setNavListOpen((o) => !o)}
                style={ { 
                    borderTopLeftRadius: isActive ? "50px" : "0",
                    borderBottomLeftRadius: isActive ? "50px" : "",
                    paddingLeft:  isActive?"10px":"10px" ,
                    paddingTop: isActive?"10px":"" ,
                    paddingBottom:isActive?"10px":"",
                    marginLeft:"20px",
                    backgroundColor: isActive
                        ? theme.colors[theme.primaryColor][1]
                        : "transparent" ,
                }}
                
            > 
            <Flex gap={8} color={isActive
                        ? theme.colors[theme.primaryColor][4] // Active color from original
                
                        : theme.colors.homaaleSlate?.[5] ?? theme.colors.gray[7]} >
             {React.cloneElement(icon as React.ReactElement, { size: 20, color:isActive?theme.colors[theme.primaryColor][4]:theme.colors.homaaleSlate?.[5] ?? theme.colors.gray[7]})}
                <Text
                    sx={(theme) => ({
                        fontWeight: 600,
                        textTransform: "capitalize",
                        fontSize: "12px",
                        color: isActive
                        ? theme.colors[theme.primaryColor][4] // Active color from original
                
                        : theme.colors.homaaleSlate?.[5] ?? theme.colors.gray[7],
                    })}
                >
                  {title}
                </Text>
                </Flex>
                <span
                    className={cx(classes.navChevron, {
                        [classes.active]: navListOpen,
                    })}
                    
               
                >
                 

                    <IconChevronRight size={16} color={isActive
                        ? theme.colors[theme.primaryColor][4] // Active color from original
                        
                        : theme.colors.homaaleSlate?.[5] ?? theme.colors.gray[7]} />
                        
                </span>
            </div>
            <Collapse
                in={navListOpen}
                className={classes.navCollapse}
                transitionDuration={300}
                transitionTimingFunction="linear"
            >
                {children}
            </Collapse>
        </div>
    );
};
