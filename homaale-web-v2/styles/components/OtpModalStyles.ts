import { createStyles } from "@mantine/core";

export const useOtpModalStyles = createStyles((theme) => ({
    wrapper: {
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        ".text-container": {
            h2: {
                fontSize: 24,
                fontWeight: 600,
                color:
                    theme.colorScheme === "dark"
                        ? theme.colors.dark[0]
                        : theme.colors.homaaleSlate[8],
                marginTop: 40,
                marginBottom: 16,
            },
            p: {
                fontSize: 14,
                fontFamily: "Inter",
                fontWeight: 500,
                color: theme.colors.homaaleSlate[5],
                marginBottom: 40,
            },
        },
        ".otp-wrapper": {
            width: "70%",
            margin: "0 auto",
        },
        ".otp-wrapper > div": {
            display: "flex",
            justifyContent: "space-between",
            ".otp-box": {
                height: 42,
                width: 42,
                [`@media (min-width: ${theme.breakpoints.sm}px)`]: {
                    height: 50,
                    width: 50,
                },
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                border: `1px solid ${theme.colors.homaaleSlate[3]}`,
                background: theme.colors.homaaleSlate[0],
                borderRadius: 4,
                fontSize: 18,
                color: theme.colors.homaaleSlate[8],
                outline: "none",
                fontWeight: 500,
                "& input": {
                    border: "none",
                    background: theme.colors.homaaleSlate[0],
                    "&:focus-visible": {
                        outline: "none",
                    },
                },
            },
            ".mantine-PinInput-input": {
                height: 48,
                width: 48,
            },
        },
    },
}));
