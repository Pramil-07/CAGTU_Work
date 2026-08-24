import type { TextInputProps } from "@mantine/core";
import { useMantineTheme } from "@mantine/core";
import { Text } from "@mantine/core";
import { Anchor, Group } from "@mantine/core";
import { PasswordInput } from "@mantine/core";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import type { FieldProps } from "formik";
import { Field } from "formik";
import Link from "next/link";

import type { InputFieldProps } from "@/types/InputFieldProps";

const PasswordField = ({
    name,
    error,
    touch,
    hasForgot,
    ...rest
}: InputFieldProps &
    TextInputProps &
    React.RefAttributes<HTMLInputElement>) => {
    const errTouch = error && touch ? error : null;
    const theme = useMantineTheme();

    return (
        <Field name={name}>
            {({ field }: FieldProps) => {
                return (
                    <>
                        {hasForgot && (
                            <Group position="apart" mb={5}>
                                <Text
                                    component="label"
                                    htmlFor="your-password"
                                    size="sm"
                                    weight={400}
                                >
                                    Password
                                    {
                                        <span
                                            className="asterisk"
                                            style={{
                                                color: "#ff8787",
                                            }}
                                        >
                                            {" "}
                                            *
                                        </span>
                                    }
                                </Text>

                                <Link href="/auth/forgot-password">
                                    <Anchor
                                        sx={(theme) => ({
                                            paddingTop: 2,
                                            color: theme.colors[
                                                theme.primaryColor
                                            ][4],
                                            fontWeight: 500,
                                            fontSize: theme.fontSizes.xs,
                                        })}
                                    >
                                        Forgot your password?
                                    </Anchor>
                                </Link>
                            </Group>
                        )}
                        <PasswordInput
                            {...field}
                            {...rest}
                            error={errTouch}
                            autoComplete="off"
                            radius="md"
                            size="md"
                            mb={24}
                            sx={{
                                ["& .mantine-PasswordInput-label"]: {
                                    color:
                                        theme.colorScheme === "dark"
                                            ? theme.colors.dark[0]
                                            : theme.colors.gray[8],
                                    fontWeight: 400,
                                    marginBottom: 6,
                                },
                            }}
                            visibilityToggleIcon={({ reveal, size }) =>
                                reveal ? (
                                    <IconEye size={size} />
                                ) : (
                                    <IconEyeOff size={size} />
                                )
                            }
                        />
                    </>
                );
            }}
        </Field>
    );
};

export default PasswordField;
