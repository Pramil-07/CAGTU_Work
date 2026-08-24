import { createStyles } from "@mantine/core";

export const useHeaderStyles = createStyles((theme) => ({
    linkWrapper: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        padding: 0,
        [theme.fn.smallerThan("sm")]: {
            paddingLeft: 10,
            flexDirection: "column",
        },
        "& li": {
            display: "flex",
            alignItems: "center",
            height: "100%",
            whiteSpace: "nowrap",
            paddingLeft: theme.spacing.md,
            paddingRight: theme.spacing.md,
            textDecoration: "none",
            fontWeight: 500,
            fontSize: theme.fontSizes.sm,

            "& a": {
                display: "flex",
                alignItems: "center",
                gap: 10,

                "& svg": {
                    width: 22,
                    height: 22,
                },
                color:
                    theme.colorScheme === "light"
                        ? theme.colors.homaaleSlate[8]
                        : theme.colors.homaaleSlate[0],
                ...theme.fn.hover({
                    color: theme.colors.brand[3],
                }),
            },

            [theme.fn.smallerThan("sm")]: {
                height: 42,
                display: "flex",
                alignItems: "center",
                width: "100%",
            },
        },
    },

    subLink: {
        width: "100%",
        padding: `${theme.spacing.xs}px ${theme.spacing.md}px`,
        borderRadius: theme.radius.md,

        ...theme.fn.hover({
            color: theme.colors.brand[4],
        }),

        "&:active": theme.activeStyles,
    },

    dropdownFooter: {
        backgroundColor:
            theme.colorScheme === "dark"
                ? theme.colors.dark[7]
                : theme.colors.gray[0],
        margin: -theme.spacing.md,
        marginTop: theme.spacing.sm,
        padding: `${theme.spacing.md}px ${
            (theme.spacing.md as unknown as number) * 2
        }px`,
        paddingBottom: theme.spacing.xl,
        borderTop: `1px solid ${
            theme.colorScheme === "dark"
                ? theme.colors.dark[5]
                : theme.colors.gray[1]
        }`,
    },

    hiddenMobile: {
        "& a": {
            fontWeight: 500,
            color: theme.colors.homaaleSlate[8],
        },
        [theme.fn.smallerThan("md")]: {
            display: "none",
        },
        "& button": {
            "&:not([data-disabled]):hover": {
                background: `${theme.colors.brand[2]}`,
                transition: "0.35s all ease",
            },
        },
        "& svg": {
            margin: "0 !important",
        },
    },

    hiddenDesktop: {
        [theme.fn.largerThan("md")]: {
            display: "none",
        },
    },
}));
