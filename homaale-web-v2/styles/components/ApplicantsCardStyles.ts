import { createStyles } from "@mantine/core";

export const useApplicantsCardStyles = createStyles((theme) => ({
    root: {
        border: `1px solid rgba(0, 0, 0, 0.08)`,
        background:
            theme.colorScheme === "dark" ? theme.colors.dark[6] : "inherit",
        padding: "19px 16px",
        borderRadius: 4,
        position: "relative",
        overflow: "hidden",
        maxHeight: 320,
        minHeight: 320,
        ".status_icon": {
            position: "absolute",
            right: -20,
            transform: "rotate(315deg)",
            height: 55,
            width: 40,
            top: -23,
            "& svg": {
                width: 18,
                height: 18,
                color: theme.colors.gray[0],
                transform: "rotate(45deg)",
                marginTop: 15,
            },
        },
        cursor: "pointer",
    },
    accept: {
        border: `1px solid ${theme.colors.brand[3]}`,
        ".status_icon": {
            background: theme.colors.brand[3],
            "& svg": {
                width: 18,
                height: 18,
            },
        },
    },
    reject: {
        border: `1px solid ${theme.colors.status[1]}`,
        ".status_icon": {
            background: theme.colors.status[1],
            "& svg": {
                width: 16,
                height: 16,
                marginLeft: 2,
            },
        },
    },
    body: {
        borderBottom: `1px solid ${theme.colors.gray[2]}`,
        paddingBottom: 19,
        marginBottom: 16,
        "& p": {
            display: "flex",
            gap: 5,
            alignItems: "center",
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.homaaleSlate[4]
                    : theme.colors.gray[8],
            "& svg": {
                width: 16,
                height: 16,
                color: theme.colors.gray[6],
            },
        },
        "& span": {
            fontWeight: 400,
            fontSize: 11,
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.homaaleSlate[3]
                    : theme.colors.homaaleSlate[6],
        },
    },
    content: {
        textAlign: "center",
        marginBottom: 20,
        "& p": {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
        },
        "& h3": {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            fontWeight: 500,
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.homaaleSlate[3]
                    : theme.colors.gray[8],

            "& svg": {
                fill: theme.colors.blue[4],
                stroke: "#fff",
            },
        },
    },
    footer: {
        display: "flex",
        justifyContent: "center",
        "& p": {
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.homaaleSlate[3]
                    : theme.colors.homaaleSlate[7],
            fontSize: 20,
            "& span": {
                color:
                    theme.colorScheme === "dark"
                        ? theme.colors.homaaleSlate[5]
                        : theme.colors.homaaleSlate[6],
            },
        },
        "& span": { fontWeight: 400, fontSize: 14 },
    },
}));
