import { createStyles } from "@mantine/core";

export const useCareerListingStyles = createStyles((theme) => ({
    listingwrapper: {
        "& ul": {
            [theme.fn.smallerThan("xs")]: {
                padding: 0,
            },
            "& p": {
                fontWeight: 400,
                color: `${theme.colors.gray[6]}`,
            },
            "& li": {
                listStyle: "none",
                display: "flex",
                gap: 12,
                marginTop: 16,
            },
        },
    },
    body: {
        background: "rgba(252, 165, 0, 0.16)",
        width: 30,
        height: 30,
        borderRadius: 8,
        backgroundColor:theme.colors.brand[1],
    },
}));
