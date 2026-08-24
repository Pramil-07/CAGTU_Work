import { createStyles } from "@mantine/core";

export const useOfferStyles = createStyles((theme) => ({
    offer: {
        h2: {
            fontWeight: 500,
            marginBottom: 24,
        },
        ".slick-slider": {
            "& svg": {
                background: "#FFFFFF",
                border: `1px solid rgba(0, 0, 0, 0.08)`,
                boxShadow: `0px 4px 14px rgba(33, 29, 79, 0.1)`,
                borderRadius: 100,
                width: 35,
                height: 35,
                padding: 6,
                color: "black",
                zIndex: 1,

                "&:hover": {
                    transition: "0.35s all ease",
                    background: theme.colors.brand[3],
                    color: "#ffff",
                },
            },

            ".slick-prev": {
                left: -6,
            },
            ".slick-next": {
                right: -6,
            },
        },
    },
}));
