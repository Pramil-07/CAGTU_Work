import { createStyles } from "@mantine/core";

export const useActionIconStyles = createStyles((theme) => ({
    iconContainer: {
        display: "flex",
        alignItems: "center",
        border: "none",
        outline: "none",
        backgroundColor: "transparent",
        transition: "all 0.3s ease",

        "&:hover > svg": {
            transform: "scale(1.5)",
        },
        ".edit": {
            fontWeight: 400,
            fontSize: 12,
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.dark[0]
                    : theme.colors.homaaleSlate[8],
        },

    },
    saveIcon: {
        "& svg": {
            margin: "0 !important",
        },


    },
}));
