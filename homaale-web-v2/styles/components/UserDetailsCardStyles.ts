import { createStyles } from "@mantine/core";

export const useUserDetailsCardStyles = createStyles((theme) => ({
    wrapper: {
        position: "sticky",
        top: 70,
        background:
            theme.colorScheme === "dark"
                ? theme.colors.darkBackground[0]
                : "inherit",
        border:
            theme.colorScheme === "dark"
                ? "none"
                : `1px solid rgba(0, 0, 0, 0.08)`,
        padding: 24,
        borderRadius: 4,
        ".user-img": {
            height: 134,
            width: 134,
            position: "relative",
            img: {
                borderRadius: "50%",
            },
            ".user-badge": {
                position: "absolute",
                left: 0,
                right: 0,
                // top: 0,
                bottom: -16,
                margin: "0px auto",
            },
        },
        ".basic-info": {
            marginBottom: 4,
        },

        ".review-count": {
            fontFamily: "Inter",
            fontSize: 14,
            color: theme.colors.gray[6],
        },
        h1: {
            fontSize: 20,
            fontWeight: 500,
        },
        p: {
            fontSize: 14,
            color: theme.colors.homaaleSlate[9],
            fontWeight: 400,
        },
        ".contact-block": {
            ".contact-info": {
                display: "flex",
                marginBottom: 12,
                alignItems: "center",
                color: theme.colors.gray[6],
                ".svg-icon": {
                    marginRight: 8,
                },
                "&:last-child": {
                    marginTop: 16,
                },
            },
        },
        ".stat-block": {
            textAlign: "center",
            ".stat-content": {
                h1: {
                    fontSize: 20,
                    fontWeight: 500,
                },
                ".success-rate": {
                    color: "#38C675",
                },
                ".happy-clients": {
                    color: "#B187F2",
                },
                ".task-completed": {
                    color: "#FF9700",
                },
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
            lineHeight: '22px',
        },
    },
}));
