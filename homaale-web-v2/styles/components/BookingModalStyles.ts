import { createStyles } from "@mantine/core";

export const useBookingModalStyles = createStyles((theme) => ({
    root: {
       alignItems:"self-end",
        listStyleType: "none",
        padding: 0,
        borderBottom: `1px solid ${theme.colors.gray[2]}`,
        marginBottom: 24,

        "& li": {
            paddingBottom: 16,
            fontSize: 14,
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.dark[0]
                    : theme.colors.homaaleSlate[8],
            "& span": {
                paddingRight: 24,
                fontWeight: 500,
            },
        },
    },
}));
