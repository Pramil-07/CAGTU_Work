import { createStyles, rem, Tooltip, UnstyledButton } from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

import type { CollapsedNavLinkProps } from "@/types/CollapsedNavLinkProps";

export const CollapsedNavLink = ({
    icon: Icon,
    label,
    active,
    onClick,
    link,
    id,
}: CollapsedNavLinkProps) => {
    const { classes, cx, theme } = useStyles();
    const router = useRouter();
    const isActive =router.pathname.includes(link)
    return (
        <Link href={link} id={id}>
            <Tooltip
                label={label}
                position="right"
                transitionProps={{ duration: 0 }}
            >
                <UnstyledButton
                    onClick={onClick}
                    className={cx(classes.link)}
                    w={"87%"}
                    h={40}
                    sx={{
                        margin: 0,
                        color: router.pathname.includes(link)
                            ? theme.colors.brand[4]
                            : theme.colorScheme === "dark"
                            ? theme.colors.dark[0]
                            : theme.colors.homaaleSlate[5],
                        backgroundColor: isActive
                        ? theme.colors.brand[1]
                        : theme.colorScheme === "dark"
                        ? "transparent"
                        : theme.colors.homaaleSlate[0],
                        borderTopLeftRadius: isActive ? "30px" : "0",
                        borderBottomLeftRadius: isActive ? "30px" : "",
                        paddingLeft:  isActive?"px":"px" ,
                        paddingTop: isActive?"10px":"" ,
                        paddingBottom:isActive?"10px":"",

                        marginLeft:"10px",

                    }}
                >
                    <Icon size={22} stroke={1.7} />
                </UnstyledButton>
            </Tooltip>
        </Link>
    );
};

const useStyles = createStyles((theme) => ({
    link: {
        width: rem(50),
        height: rem(50),
        borderRadius: theme.radius.md,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        "&:hover": {
            color: theme.colors.brand[4],
        },
    },
}));
