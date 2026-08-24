import { createStyles } from "@mantine/core";

export const useBlogDescriptionStyles = createStyles((theme) => ({
    root: {
        ".advertisement_image": {
            maxWidth: "100%",
            height: "auto",
        },
        ".blog_image": {
            borderRadius: 4,
        },
        ".date": {
            marginTop: 24,
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 28,
            [theme.fn.smallerThan("400")]: {
                flexDirection: "column",
                alignItems: "flex-start",
            },
        },
        ".parsecontent": {
            "& img": {
                maxWidth: "100%",
                maxHeight: 800,
                borderRadius: 4,
            },
            "& p": {
                color:
                    theme.colorScheme === "dark"
                        ? theme.colors.dark[2]
                        : theme.colors.gray[7],
                textAlign: "justify",
            },
        },
        "& h1": {
            fontWeight: 600,
            fontSize: 40,
            marginBottom: 24,
            [theme.fn.smallerThan("xs")]: {
                fontWeight: 400,
                fontSize: 25,
            },
        },
        "& h4": {
            margin: 0,
            fontSize: 16,
            fontWeight: 600,
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.dark[2]
                    : theme.colors.gray[8],
        },
        "& p": {
            fontWeight: 400,
            color: theme.colors.gray[6],
        },
        ".sharing": {
            marginTop: 24,
            padding: "24px 0px",
            borderStyle: "solid",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            borderWidth: "1px 0px",
            borderColor: "rgba(0, 0, 0, 0.08)",
            gap: 30,
            "& p": {
                margin: 0,
                color:
                    theme.colorScheme === "dark"
                        ? theme.colors.dark[2]
                        : theme.colors.secondaryColor[0],
            },
            marginBottom: 24,
        },
        "& h3": {
            marginBottom: 12,
            fontSize: 18,
            fontWeight: 500,
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.dark[2]
                    : theme.colors.gray[8],
        },
        ".articles": {
            cursor: "pointer",
            marginTop: 24,
            display: "flex",
            flexDirection: "column",
            gap: 24,
            marginBottom: 42,
            ".related_article_wrapper": {
                "& p": {
                    fontWeight: 500,
                    fontSize: 16,
                    color:
                        theme.colorScheme === "dark"
                            ? theme.colors.dark[2]
                            : theme.colors.gray[7],
                },
            },
        },
    },
    icon: {
        background: theme.colors.homaaleSlate[8],
        borderRadius: 50,
        color: theme.colors.white[0],
        cursor: "pointer",
    },
}));
