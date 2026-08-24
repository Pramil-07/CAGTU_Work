import { createStyles } from "@mantine/core";

export const useHiringComponentStyles = createStyles((theme) => ({
    root: {
        "& h4": {
            marginBottom: 24,
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.homaaleSlate[5]
                    : theme.colors.gray[8],
        },
        "& p": {
            fontWeight: 400,
            textAlign: "justify",
            color: theme.colors.gray[6],
        },
        ".arrow_image": {
            [theme.fn.smallerThan("xl")]: {
                display: "none",
            },
        },
    },
    icon_wrapper: {
        background:
            theme.colorScheme === "dark"
                ? theme.colors.gray[8]
                : theme.colors.brand[0],
        padding: 16,
        borderRadius: 8,
        lineHeight: "0px",
    },
}));
