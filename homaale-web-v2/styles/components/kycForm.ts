import { createStyles } from "@mantine/core";

export const useKycFormStyles = createStyles((theme) => ({
    wrapper: {
        marginBottom: 32,
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
}));
