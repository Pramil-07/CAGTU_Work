import {
    Alert,
    Box,
    Button,
    Flex,
    Modal,
    PinInput,
    Text,
    useMantineTheme,
} from "@mantine/core";
import {
    IconAlertOctagon,
    IconCircleCheck,
    IconClockHour4,
} from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

import urls from "@/constants/urls";
import { useOtpModalStyles } from "@/styles/components/OtpModalStyles";
import type {
    AuthProps,
    OtpModalpProps,
    ResendOtpPayload,
} from "@/types/OtpProps";
import { axiosClient } from "@/utils/axiosClient";

import { toast } from "./common/Toast";

const OtpModal = ({
    onClose,
    opened,
    phone,
    scope,
    setShowForm,
}: OtpModalpProps & AuthProps) => {
    const router = useRouter();

    const { classes } = useOtpModalStyles();
    const theme = useMantineTheme();

    const [otpNum, setOTPNum] = useState<string>("");

    const [errorAlertMsg, setErrorAlertMsg] = useState<string>("");
    const [successAlertMsg, setSuccessAlertMsg] = useState<string>("");

    const handleChange = (otpNum: string) => {
        setOTPNum(otpNum);
        setErrorAlertMsg("");
    };

    const { mutate: resendOtpMutation, isLoading: isResendLoading } =
        useMutation((data: ResendOtpPayload) => {
            return axiosClient.post(urls.otp.resend, data);
        });

    const { mutate: sendOtpMutation, isLoading } = useMutation(
        (data: AuthProps) => {
            return axiosClient.post(urls.otp.verify, data);
        }
    );

    const handleSubmit = () => {
        const dataToSend = {
            otp: otpNum,
            scope: scope,
            phone: phone,
        };

        sendOtpMutation(dataToSend, {
            onSuccess: async () => {
                toast.success("OTP Verified");
                setShowForm(false);
                scope !== "change number" && router.push("/auth/login");
                // router.push("/profile");
            },
            onError: async (error: any) => {
                const { otp, phone, non_field_errors } = error.response.data;
                otp && setErrorAlertMsg(otp[0]);
                phone && setErrorAlertMsg(phone[0]);
                non_field_errors && setErrorAlertMsg(non_field_errors[0]);
                setSuccessAlertMsg("");
            },
        });
    };

    const [startTime, setStartTime] = useState<number | null>(null);
    const [now, setNow] = useState<number | null>(null);
    const intervalRef = useRef<any>(null);

    useEffect(() => {
        handleStart();
    }, [opened]);

    const handleStart = () => {
        setStartTime(Date.now());
        setNow(Date.now());

        clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            setNow(Date.now());
        }, 10);
    };

    const handleStop = () => {
        clearInterval(intervalRef.current);
    };

    let secondsPassed = 0;
    if (startTime != null && now != null) {
        secondsPassed = 60 - (now - startTime) / 1000;
        if (secondsPassed < 0) {
            handleStop();
            setStartTime(null);
            setNow(null);
        }
    }
    return (
        <Modal.Root
            opened={opened}
            onClose={() => {
                handleStop();
                onClose();
            }}
            centered
            closeOnClickOutside={false}
            closeOnEscape={false}
            size={"lg"}
            padding={32}
        >
            <Modal.Overlay
                sx={{
                    opacity: 0.55,
                    blur: 3,
                }}
            />
            <Modal.Content>
                <Modal.Body>
                    <div className={classes.wrapper}>
                        <Image
                            src={"/svgs/otp.svg"}
                            alt="otp-img"
                            height={144}
                            width={231}
                        />
                        <Flex
                            justify={"center"}
                            direction="column"
                            className="text-container"
                        >
                            <h2>Verify your Phone Number</h2>
                            <p>
                                A text with One Time Password has been sent to{" "}
                                {phone.substring(0, 8)}******
                            </p>
                        </Flex>
                        <div className="otp-wrapper">
                            <PinInput
                                length={6}
                                type="number"
                                autoFocus
                                onChange={handleChange}
                                error={errorAlertMsg ? true : false}
                            />
                            <Flex mt={16}>
                                {secondsPassed > 0 ? (
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                        }}
                                    >
                                        <IconClockHour4 size={18} />

                                        <Text ml={4}>
                                            Resend OTP in:{" "}
                                            {secondsPassed.toFixed(0)} seconds
                                        </Text>
                                    </Box>
                                ) : (
                                    <span></span>
                                )}

                                <Button
                                    color={"blue"}
                                    size={"xs"}
                                    disabled={secondsPassed > 0}
                                    variant="subtle"
                                    loading={isResendLoading}
                                    onClick={() => {
                                        if (phone) {
                                            resendOtpMutation(
                                                {
                                                    phone: phone,
                                                    method: "SMS",
                                                },
                                                {
                                                    onSuccess: () => {
                                                        setOTPNum("");
                                                        setSuccessAlertMsg(
                                                            `OTP sent to the desired phone number.`
                                                        );
                                                        setErrorAlertMsg("");
                                                        handleStart();
                                                    },
                                                    onError: (err: any) => {
                                                        toast.error(
                                                            err.message
                                                        );
                                                    },
                                                }
                                            );
                                        }
                                    }}
                                >
                                    Resend OTP
                                </Button>
                            </Flex>
                        </div>

                        {errorAlertMsg !== "" && (
                            <Alert
                                icon={<IconAlertOctagon />}
                                title="Failed"
                                color="red"
                                withCloseButton={true}
                                onClose={() => setErrorAlertMsg("")}
                                sx={{
                                    width: "70%",
                                    marginTop: 16,
                                }}
                            >
                                {errorAlertMsg ?? "Something went wrong"}
                            </Alert>
                        )}
                        {successAlertMsg !== "" && (
                            <Alert
                                icon={<IconCircleCheck />}
                                title="Success"
                                color="teal"
                                sx={{
                                    width: "70%",
                                    marginTop: 16,
                                }}
                                withCloseButton={true}
                                onClose={() => setSuccessAlertMsg("")}
                            >
                                {successAlertMsg}
                            </Alert>
                        )}
                        <Button
                            onClick={handleSubmit}
                            sx={{
                                background: theme.colors.homaaleSlate[8],
                                width: 394,
                                marginTop: 32,
                            }}
                            loading={isLoading}
                        >
                            Submit
                        </Button>
                    </div>
                </Modal.Body>
            </Modal.Content>
        </Modal.Root>
    );
};

export default OtpModal;
