import { createStyles } from "@mantine/core";

export const useExpandButtonStyles = createStyles((theme) => ({
    button: {
        background: "none",
        color: theme.colors.gray[6],
        borderRadius: "60px",
        height: "36px",
        display: "inline-flex",
        alignItems: "center",
        overflow: "hidden",
        width: "auto",
        maxWidth: "40px",
        transition: "all 0.3s ease-in-out",
        padding: 0,
        "&:not([data-disabled]):hover": {
            background: theme.colors.brand[2],
        },
    },
    icon: {
        marginRight: "4px",
        padding: "0px 7px",
        display: "flex",
        alignItems: "center",
    },
    text: {
        fontFamily: "Inter",
        fontWeight: 500,
        fontSize: 12,
        whiteSpace: "nowrap",
        paddingRight: "15px",
    },
}));
