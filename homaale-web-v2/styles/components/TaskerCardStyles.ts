import { createStyles } from "@mantine/core";

export const useTaskerCardStyles = createStyles((theme) => ({
    mainBox: {
        border:
            theme.colorScheme === "dark"
                ? `1px solid ${theme.colors.gray[7]}`
                : `1px solid rgba(0, 0, 0, 0.08)`,
        padding: 0,
        cursor: "pointer",
        margin: 0,
        borderRadius: 4,
        background:
            theme.colorScheme === "dark" ? theme.colors.dark[6] : "inherit",
        "&:hover": {
            border: `1px solid ${theme.colors[theme.primaryColor][4]}`,
            transition: "0.50s ease",
        },
    },
    UpperBox: {
        borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
    },
    headerwrapper: {
        display: "flex",
        flexDirection: "column",
    },
    upperBox: {
        display: "flex",
        marginBottom: 16,
        [theme.fn.smallerThan("25em")]: {
            flexDirection: "column",
            alignItems: "flex-start",
        },
    },
    taskername: {
        fontWeight: 500,
        fontSize: 18,
    },
    starwrapper: {
        display: "flex",
        alignItems: "center",
        "& h4": {
            margin: 0,
            fontWeight: 400,
        },
        gap: 6,
    },
    followButton: {
        padding: "4px 18px",
        borderRadius: 4,
        background:
            theme.colorScheme === "dark"
                ? theme.colors.homaaleSlate[7]
                : theme.colors.homaaleSlate[8],
        ":active": {
            backgroundColor: "none",
        },
    },
    unfollowButton: {
        fontWeight: 500,
        fontSize: 12,
        padding: "4px 16px",
        background: theme.colorScheme === "dark" ? "none" : "none",
        color: theme.colorScheme === "dark" ? theme.colors.gray[0] : "inherit",
        border:
            theme.colorScheme === "dark"
                ? `1px solid ${theme.colors.gray[6]}`
                : `1px solid ${theme.colors.homaaleSlate[7]}`,
        "&:not([data-disabled]):hover": {
            backgroundColor:
                theme.colorScheme === "dark"
                    ? theme.colors.homaaleSlate[7]
                    : "inherit",
        },
    },
    wrapper1: {
        padding: "16px 16px 12px",
    },
    lowerwrapper: {
        padding: "8px 12px 8px",
        display: "flex",
        justifyContent: "space-between",
        [theme.fn.smallerThan("22em")]: {
            flexDirection: "column",
        },
    },
    flexlowerleft: {
        display: "flex",
        gap: 8,
    },
    flexlowerbox: {
        display: "flex",
        gap: 4,
        "& p": {
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.dark[0]
                    : theme.colors.homaaleSlate[5],
        },
    },

    description: {
        display: "flex",
        alignItems: "center",
        width: 250,
        gap: 6,
        marginBottom: 6,
    },
    description1: {
        padding: "6px 0px 6px 0px",
        "&_h4": {
            fontWeight: 500,
            fontSize: 10,
        },
    },
    header4: {
        margin: 0,
        fontWeight: 500,
        fontSize: 12,
        fontStyle: "normal",
        textTransform: "capitalize",
        color:
            theme.colorScheme === "dark"
                ? theme.colors.dark[0]
                : theme.colors.homaaleSlate[5],
    },
    share: {

        padding: 8,
        margin: 0,
    },
}));
