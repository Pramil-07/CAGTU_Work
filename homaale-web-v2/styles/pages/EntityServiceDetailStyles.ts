import { createStyles } from "@mantine/core";

export const useEntityServiceDetailStyles = createStyles((theme) => ({
    wrapper: {
        scrollBehavior: "smooth",
    },
    topActionArea: {
        display: "flex",
        gap: 5,
        marginTop: 3,
        alignItems: "center",
    },
    slider: {
        borderRadius: 4,
        textAlign: "center",
        marginBottom: 20,
        ".slick-dots": {
            position: "absolute",
            height: 0,
            bottom: 40,
            "li.slick-active button:before": {
                fontSize: 10,
                color: theme.colors[theme.primaryColor][4],
                borderRadius: 12,
            },
            "li button:before": {
                fontSize: 9,
                color: "#fff",
                opacity: 0.9,
                borderRadius: 12,
            },
        },
    },
    stats: {
        display: "flex",
        textAlign: "center",
        "& svg": {
            stroke:
                theme.colorScheme === "dark"
                    ? theme.colors.dark[0]
                    : theme.colors.homaaleSlate[5],
        },
        "& span": {
            fontFamily: "Inter",
            fontSize: "10px",
            textTransform: "capitalize",
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.dark[0]
                    : theme.colors.homaaleSlate[5],
        },
    },
    dateTime: {
        "& p": {
            fontFamily: "Inter",
            fontSize: 14,
            fontWeight: 400,
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.dark[0]
                    : theme.colors.homaaleSlate[5],
            marginBottom: 8,
            "& span": {
                marginLeft: 8,
            },
        },
    },
    description: {
        '& p': {
            color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.homaaleSlate[5],
            lineHeight: '22px',
        },

        '& ul': {
            listStyleType: 'disc !important',
            // paddingLeft: '1.5rem !important',
            margin: '1em 0 !important',
        },
        '& ol': {
            listStyleType: 'decimal !important',
            paddingLeft: '1.5rem !important',
            margin: '1em 0 !important',
        },

        "li[data-list='bullet']": {
            display: 'list-item',
            listStyleType: 'disc',
            margin: '0.5em 0',
            color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.homaaleSlate[5],
        },

        "li[data-list='ordered']": {
            display: 'list-item',
            listStyleType: 'decimal',
            // paddingLeft: '1.5rem',
            margin: '0.5em 0',
            color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.homaaleSlate[5],
        },

        '& li': {
            marginBottom: '0.5em',
            lineHeight: '16px',
            fontSize : '14px'
        },
    },


    requirements: {
        ".requirement-list": {
            marginBottom: 8,
            "& p": {
                color:
                    theme.colorScheme === "dark"
                        ? theme.colors.dark[0]
                        : theme.colors.homaaleSlate[5],
            },
        },
    },
    pressable: {
        color: theme.colors.status[0],
        fontWeight: 600,
        cursor: "pointer",
        ":hover": {
            color: theme.colors[theme.primaryColor][4],
            transition: "0.2s ease",
        },
    },
    event: {
        borderBottom: `1px solid ${theme.colors.gray[4]}`,
        marginBottom: 8,
        "& p": {
            fontWeight: 400,
            fontSize: 12,
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.homaaleSlate[3]
                    : theme.colors.homaaleSlate[6],
        },
    },
    schedule: {
        border: `1px dashed #D8D8D8`,
        padding: "20px 24px",
        borderRadius: 10,
        "& p": {
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.homaaleSlate[4]
                    : theme.colors.homaaleSlate[6],
        },
    },
    scheduleCard: {
        border: `1px solid #CED4DA;`,
        padding: "20px 24px",
        borderRadius: 10,
        marginBottom: 16,
        "& p": {
            fontWeight: 500,
            fontSize: 12,
            "& span": {
                color: theme.colors.gray[6],
            },
        },
        ".start": {
            color: "#1EB2A6",
        },
        ".end": {
            color: "#FE5050",
        },
    },

    rating: {
        borderBottom: `1px solid #CED4DA`,
        marginBottom: 17,
        "& p": {
            fontWeight: 500,
            fontSize: 48,
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.gray[4]
                    : theme.colors.gray[7],
            "& span": {
                opacity: "50%",
                fontSize: 24,
            },
        },
        "& ul": {
            padding: 0,
            listStyleType: "none",
            "& li": {
                display: "flex",
                alignItems: "center",
                gap: 24,
                margin: 4,
                ".mantine-Progress-root": {
                    width: 200,
                    ".mantine-Progress-bar": {
                        background: theme.colors.brand[2],
                    },
                },
                "& span": {
                    color: theme.colors.gray[7],
                    fontSize: 12,
                },
            },
        },
    },
    review: {
        marginTop: 20,
        ".review__header": {
            borderBottom: `1px solid #CED4DA`,
            paddingBottom: 16,
            "& h4": {
                marginBottom: 0,
            },
        },
    },

    cancel: {
        background: "#FFEDED",
        border: `1px solid ${theme.colors.status[1]}`,
        borderRadius: 6,
        padding: 24,
        marginTop: 24,
        "& h4, span": {
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.homaaleSlate[6]
                    : theme.colors.homaaleSlate[8],
        },
    },
    progress: {
        padding: 16,
        border: `1px solid ${
            theme.colorScheme === "dark"
                ? theme.colors.homaaleSlate[6]
                : "rgba(0, 0, 0, 0.08)"
        }`,
        borderRadius: 6,
    },
    share: {
        padding: 8,
        margin: 0,
    },
}));
