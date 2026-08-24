import { createStyles } from "@mantine/core";

export const useFilterStyles = createStyles((theme) => ({
    root: {
        color: theme.colors.gray[6],
        "& span": {
            fontFamily: "Inter",
            fontWeight: 500,
            fontSize: 12,
        },
    },
    input: {
        "& input": {
            "&::placeholder": {
                fontFamily: "Inter",
                fontWeight: 500,
                fontSize: 12,
                color: theme.colors.gray[6],
            },
        },
    },
    active: {
        "& input": {
            backgroundColor: theme.colors[theme.primaryColor][3],
            color: "#fff",
            "&::placeholder": {
                fontFamily: "Inter",
                fontWeight: 500,
                fontSize: 12,
            },
        },
        "& button": {
            color: "#fff",
        },
    },
    activeSort: {
        background: theme.colors[theme.primaryColor][3],
        width: 130,
        "&:hover": {
            background: theme.colors[theme.primaryColor][3],
        },
        "& span": {
            color: "#fff",
            paddingRight: 10,
        },
    },
    crossBtn: {
        position: "absolute",
        right: "2%",
        top: "22%",
        color: "#fff",
    },
}));
