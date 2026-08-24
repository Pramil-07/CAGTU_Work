import { createStyles } from "@mantine/core";

export const useAccountSettingStyles = createStyles((theme) => ({
    wrapper: {
        ".topContainer": {
            marginBottom: 36,
            "& h2": {
                marginBottom: 8,
            },
        },
        ".info-container": {
            marginBottom: 32,
            ".flex-wrapper": {
                "& h4": {
                    fontSize: 20,
                    marginBottom: 24,
                },
                "& p": {
                    cursor: "pointer",
                    color: theme.colors.secondary[4],
                    "&:hover": {
                        color: theme.colors.brand[4],
                    },
                },
            },
            ".content-block": {
                alignItems: "flex-start",
                marginBottom: 24,
                [`@media (max-width: ${theme.breakpoints.sm}px)`]: {
                    marginBottom: 8,
                },
                "& p": {
                    fontSize: 13,
                    fontWeight: 500,
                    color:
                        theme.colorScheme === "dark"
                            ? theme.colors.dark[0]
                            : theme.colors.gray[8],
                    textTransform: "capitalize",
                    // width: 230,
                },
                ".profile-img": {
                    position: "relative",
                    margin: 0,
                    ".camera-icon": {
                        position: "absolute",
                        background: theme.colors.gray[8],
                        opacity: "70%",
                        padding: 6,
                        height: 30,
                        width: 30,
                        zIndex: 1,
                        borderRadius: "50%",
                        cursor: "pointer",
                        bottom: 5,
                        right: 10,
                    },
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
