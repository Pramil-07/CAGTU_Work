import { createStyles } from "@mantine/core";

export const useAppliedModalStyles = createStyles((theme) => ({
    root: {
        "& p": {
            // display: "flex",
            // alignItems: "center",
        },
        ".tasker": {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: `1px solid rgba(0, 0, 0, 0.08)`,
            paddingBottom: 24,
            marginBottom: 24,

            "& h3": {
                fontWeight: 500,
                fontSize: 18,
                marginBottom: 4,
            },
            "& p": {
                fontWeight: 400,
                fontSize: 12,
            },
            "&__status": {
                "& p": {
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontWeight: 400,
                    fontSize: 14,
                    marginRight: 16,
                    marginTop: 7,
                    color:
                        theme.colorScheme === "dark"
                            ? theme.colors.homaaleSlate[3]
                            : theme.colors.gray[8],
                },
            },
            "&__info": {
                "& p": {
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontWeight: 400,
                    fontSize: 12,
                    marginRight: 16,
                    marginTop: 7,
                    color:
                        theme.colorScheme === "dark"
                            ? theme.colors.homaaleSlate[3]
                            : theme.colors.homaaleSlate[5],
                },
            },
        },
        ".content": {
            "& ul": {
                listStyleType: "none",
                fontSize: 14,
                padding: 0,
                "& li": {
                    fontWeight: 500,
                    color:
                        theme.colorScheme === "dark"
                            ? theme.colors.homaaleSlate[4]
                            : theme.colors.gray[8],
                    marginBottom: 12,
                    "& span": {
                        fontWeight: 400,
                        paddingLeft: 8,
                        color:
                            theme.colorScheme === "dark"
                                ? theme.colors.homaaleSlate[2]
                                : theme.colors.gray[8],
                    },
                },
            },
            "&__desc": {
                fontWeight: 500,
                color:
                    theme.colorScheme === "dark"
                        ? theme.colors.homaaleSlate[4]
                        : theme.colors.gray[8],
                marginBottom: 12,
                "& p": {
                    fontWeight: 400,
                    fontSize: 14,
                    color:
                        theme.colorScheme === "dark"
                            ? theme.colors.homaaleSlate[2]
                            : theme.colors.gray[8],
                },
            },
            "&__requirement": {
                "& li": {
                    listStyleType: "none",
                    marginTop: 14,

                    "& span": {
                        marginLeft: 16,
                    },
                },
            },
        },
    },
    description: {
        display: "flex",
        flexDirection: 'column' ,
        '& p': {
            color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.homaaleSlate[5],
            lineHeight: '',
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
