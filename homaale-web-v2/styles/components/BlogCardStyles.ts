import { createStyles } from "@mantine/core";

export const useBlogCardStyles = createStyles((theme) => ({
    root: {
        cursor: "pointer",
        ".blog__image": {
            border: `1px solid ${
                theme.colorScheme === "dark"
                    ? theme.colors.gray[7]
                    : theme.colors.gray[2]
            }`,
            borderRadius: 4,
        },
        ".blog__content": {
            border: `1px solid rgba(0, 0, 0, 0.1)`,
            borderRadius: 4,
            padding: "13px 18px",
            margin: "0 13px",
            position: "relative",
            background:
                theme.colorScheme === "dark" ? theme.colors.gray[9] : "#ffff",
            bottom: 50,
            "& h3": {
                fontWeight: 500,
                fontSize: 14,
                marginBottom: 16,
            },
            "& p": {
                fontWeight: 400,
                fontSize: 12,
                color:
                    theme.colorScheme === "dark"
                        ? theme.colors.homaaleSlate[3]
                        : theme.colors.homaaleSlate[6],
                marginBottom: 16,
            },
            ".tags": {
                color: theme.colors.gray[5],
                fontSize: 10,
                fontWeight: 400,
                padding: "4px 8px",
                background: "#F3F4F6",
                borderRadius: 4,
            },
            ".tag_wrapper": {
                "& span": {
                    background:
                        theme.colorScheme === "dark"
                            ? theme.colors.dark[5]
                            : theme.colors.gray[0],
                },
                [theme.fn.smallerThan("lg")]: {
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: 10,
                },
            },
        },
    },
}));
