import { createStyles } from "@mantine/core";

export const usefaqQuestionStyles = createStyles((theme) => ({
    root: {
        ".icon_wrapper": {
            border: "0.5px solid #D1D5DB",
            borderRadius: 4,
            padding: 4,
        },
        ".content_wrapper": {
            "& h4": {
                color:
                    theme.colorScheme === "dark"
                        ? theme.colors.gray[5]
                        : theme.colors.gray[8],
            },
            "& p": {
                fontSize: 12,
                lineHeight: "30px",
                fontWeight: 400,
                color:
                    theme.colorScheme === "dark"
                        ? theme.colors.gray[5]
                        : theme.colors.gray[8],
            },
        },
    },
}));
