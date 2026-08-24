import { Button, Group, LoadingOverlay, Modal, Text } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Form, Formik } from "formik";
import type { Dispatch, SetStateAction } from "react";
import React from "react";

import urls from "@/constants/urls";
import { axiosClient } from "@/utils/axiosClient";
import { stringUnReq } from "@/utils/validation/GlobalValidations";

import PasswordField from "../common/form/PasswordField";
import HomaaleLoader from "../common/HomaaleLoader";
import { toast } from "../common/Toast";

interface PasswordModalCardProps {
    show: boolean;
    handleClose: () => void;
    setShowForm: Dispatch<SetStateAction<boolean>>;
}
interface AuthProps {
    id?: number;
}

const UnlinkConfirmPasswordModal = ({
    show,
    handleClose,
    setShowForm,
    id,
}: PasswordModalCardProps & AuthProps) => {
    const { mutate, isLoading } = useMutation((data: { password: string }) => {
        return axiosClient.post(`${urls.unlinkAccount}${id}/`, data);
    });

    const queryClient = useQueryClient();

    return (
        <>
            <LoadingOverlay
                loader={<HomaaleLoader />}
                visible={isLoading}
                sx={{ position: "fixed", inset: 0 }}
            />
            <Modal.Root
                opened={show}
                onClose={handleClose}
                centered
                closeOnEscape={false}
                closeOnClickOutside={false}
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
                    <Modal.Header>
                        <Modal.Title>
                            <Text>Enter your your password</Text>
                        </Modal.Title>
                        <Modal.CloseButton />
                    </Modal.Header>
                    <Modal.Body>
                        <Formik
                            initialValues={{ password: "" }}
                            validationSchema={stringUnReq}
                            onSubmit={async (values, actions) => {
                                mutate(values, {
                                    onSuccess: async (data: any) => {
                                        toast.success(data.message);
                                        queryClient.invalidateQueries([
                                            "connected-accounts",
                                        ]);
                                        setShowForm(false);
                                    },
                                    onError: (error: any) => {
                                        const { password } =
                                            error.response.data;
                                        actions.setFieldError(
                                            "password",
                                            password && password[0]
                                        );
                                    },
                                });
                            }}
                        >
                            {({ errors, touched }) => (
                                <Form>
                                    <PasswordField
                                        name={"password"}
                                        placeholder={"Enter your password"}
                                        label="Password"
                                        error={errors.password}
                                        touch={touched.password}
                                        withAsterisk
                                    />
                                    <Group grow>
                                        <Button
                                            className="btn close-btn"
                                            onClick={handleClose}
                                            variant="outline"
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit">Submit</Button>
                                    </Group>
                                </Form>
                            )}
                        </Formik>
                    </Modal.Body>
                </Modal.Content>
            </Modal.Root>
        </>
    );
};

export default UnlinkConfirmPasswordModal;
