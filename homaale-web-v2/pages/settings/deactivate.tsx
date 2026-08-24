import { Box, Button, LoadingOverlay, useMantineTheme } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import React, { useState } from "react";

import DescriptionField from "@/components/common/form/DescriptionField";
import SelectField from "@/components/common/form/SelectField";
import HomaaleLoader from "@/components/common/HomaaleLoader";
import PopUp from "@/components/common/PopUp";
import { toast } from "@/components/common/Toast";
import Layout from "@/components/Layout/Layout";
import urls from "@/constants/urls";
import { logout } from "@/features/auth/authSlice";
import { cannot_deactivate } from "@/features/utils/modalSlice";
import { useAppDispatch } from "@/hooks";
import { store } from "@/store";
import { axiosClient } from "@/utils/axiosClient";
import { deactivateFormSchema } from "@/utils/validation/DeactivationValidation";

const DeactivationOptions = [
    {
        id: 1,
        label: "I am deactivating the account temporarily.",
        value: "I am deactivating the account temporarily.",
    },
    {
        id: 2,
        label: "I did not find Homaale helpful for me.",
        value: "I did not find Homeaale helpful for me.",
    },
    {
        id: 3,
        label: "I have another Homaale account.",
        value: "I have another Homaale account.",
    },
    {
        id: 4,
        label: "I am not satisfied with the services of Homaale.",
        value: "I am not satisfied with the services of Homaale.",
    },
    { id: 5, label: "Other", value: "Other" },
];

const Deactivate = () => {
    const dispatch = useAppDispatch();

    const { mutate, isLoading } = useMutation(
        (data: { reason: string; explanation: string }) => {
            return axiosClient.post(urls.deactivate, data);
        }
    );

    const theme = useMantineTheme();
    const router = useRouter();
    const [popUpOpened, setPopUpOpened] = useState(false);
    const [erroMsg, setErroMsg] = useState("");

    return (
        <>
            <LoadingOverlay
                loader={<HomaaleLoader />}
                visible={isLoading}
                sx={{ position: "fixed", inset: 0 }}
            />
            <Layout heading="Deactivate">
                <Box
                    sx={{
                        width: "100%",
                        [`@media (min-width: ${theme.breakpoints.sm}px)`]: {
                            width: "60%",
                        },
                    }}
                >
                    <Formik
                        initialValues={{ reason: "", explanation: "" }}
                        validationSchema={deactivateFormSchema}
                        onSubmit={async (values, action) => {
                            action.resetForm();

                            mutate(values, {
                                onSuccess: async () => {
                                    store.dispatch(logout());
                                    router.push("/auth/login");
                                    toast.success(
                                        "Account deativate successfully"
                                    );
                                },
                                onError: (error: any) => {
                                    const { booking, non_field_errors } =
                                        error.response.data;
                                    booking &&
                                        store.dispatch(cannot_deactivate());

                                    non_field_errors &&
                                        toast.error(non_field_errors[0]);
                                },
                            });
                        }}
                    >
                        {({ errors, touched }) => (
                            <Form>
                                <SelectField
                                    id="reason"
                                    name="reason"
                                    label="I am leaving because "
                                    placeholder="Choose Reason"
                                    data={DeactivationOptions}
                                    touch={touched.reason}
                                    error={errors.reason}
                                    withAsterisk
                                />
                                {/* <SelectInputField
                            name="duration"
                            labelName="How Long"
                            touch={touched.duration}
                            error={errors.duration}
                            fieldRequired
                            placeHolder="How Long"
                            options={DeactivationOptions}
                        /> */}
                                <DescriptionField
                                    id="explaination"
                                    name={"explanation"}
                                    label={"Description"}
                                    placeholder={"Please explain your reason."}
                                    touch={touched.explanation}
                                    error={errors.explanation}
                                    withAsterisk
                                />
                                <Button type="submit">Submit</Button>
                            </Form>
                        )}
                    </Formik>
                </Box>
                <PopUp
                    opened={popUpOpened}
                    setPopUpOpened={setPopUpOpened}
                    heading={"Account Deactivated Successfully"}
                    subHeading={erroMsg}
                />
            </Layout>
        </>
    );
};

export default Deactivate;
