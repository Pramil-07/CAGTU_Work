import type { ButtonProps } from "@mantine/core";
import { Tooltip, useMantineTheme } from "@mantine/core";
import { Button } from "@mantine/core";
import { useRouter } from "next/router";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import React, { useState } from "react";


import { useExpandButtonStyles } from "@/styles/components/ExpandButtonStyles";

export const ExpandButton = ({
    icon,
    title,
    id,
    activeId,
    setActiveId,
    is_expandable = false,
    isMobile = false,
    explore = false,
    ...rest
}: {
    icon: ReactNode;
    title: string|any;
    setActiveId: Dispatch<SetStateAction<number|any>>;
    activeId: number| string|null;
    is_expandable?: boolean;
    id: number;
    isMobile?: boolean;
    explore?: boolean;
} & ButtonProps) => {
    const [isClicked, setIsClicked] = useState(false);
    const theme = useMantineTheme();

    //TO set active ID on next routes
    const router = useRouter();


    const { classes } = useExpandButtonStyles();
    return (
        <Tooltip withArrow label={title} position="bottom">
            <Button

                {...rest}
                className={
                    activeId === id
                        ? `${classes.button} btn-active`
                        : classes.button
                }
                sx={{
                    position:"relative",
                    left:"",
                    backgroundColor:
                        activeId === id
                            ? theme.colors[theme.primaryColor][2]
                            : "",
                    color: activeId === id ? theme.colors.secondary[4] : "",
                    maxWidth:
                        activeId === id
                            ? "300px"
                            : is_expandable
                            ? "36px"
                            : "300px",
                    border:
                        activeId === id
                            ? "none"
                            : `1px solid ${theme.colors.gray[4]}`,
                    fontWeight: 100,
                }}
                onClick={() => {
                    // setIsClicked((prevState) => !prevState);
                    if(explore) {
                        if (activeId === id) {
                            setActiveId(0);

                            // if (router.pathname === "/explore") {
                            //     window.location.reload(); // full reload
                            // } else {
                                router.replace("/explore");
                            // }
                        } else {
                            setActiveId(id);
                            router.push(`${router.pathname}?active_tab=${id}`);
                        }} else {
                            setActiveId((prevId: any) => (prevId === id ? null : id))
                            router.push(`${router.pathname}?active_tab=${id}`);
                        }
                    }
                }
            >
                <span className={classes.icon}>{icon}</span>
                {!isMobile && (
                <span className={classes.text}>{title}</span>
                )}
                </Button>
        </Tooltip>
    );
};
