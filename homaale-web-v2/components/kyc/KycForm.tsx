import {Avatar, Button, Flex, Grid, Group, LoadingOverlay, Text} from "@mantine/core";
import { IconCamera } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { Form, Formik } from "formik";
import Image from "next/image";
import React, { useRef, useState } from "react";

import { usePostKYC } from "@/hooks/kyc/usePostKYC";
import { useCountryOptions } from "@/hooks/useCountryOptions";
import { useKycFormStyles } from "@/styles/components/kycForm";
import type { KYCResponse } from "@/types/kyc/KycResponse";
import type { PostKycPayloadProps } from "@/types/kyc/PostKycPayloadProps";
import { KYCFormSchema } from "@/utils/validation/KycDocumentValidation";

import Asterik from "../common/Asterik";
import InputField from "../common/form/InputField";
import SelectField from "../common/form/SelectField";
import HomaaleLoader from "../common/HomaaleLoader";
import { toast } from "../common/Toast";
import DocumentForm from "./DocumentForm";
import ImageUploadModal from "./ImageUploadModal";
import {useRouter} from "next/router";

const KycForm = ({ KycData }: { KycData: KYCResponse | undefined }) => {
    const [opened, setOpened] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | undefined>("/images/placeholder/personPlaceholder.jpg");
    const [showLogoError, setShowLogoError] = useState(false);
    const router = useRouter()

    const inputRef = useRef<HTMLInputElement>(null);

    const onButtonClick = () => {
        inputRef?.current?.click();
        setOpened(true);
    };
    const onContinueClick=()=>{
        router.reload()
    }

    const { classes } = useKycFormStyles();

    const { mutate, isLoading: IsKYCSubmitting,error } = usePostKYC();
    console.log("error from kyc ",error)

    const handleCountryChanged = (
        code: string | null,
        setFieldValue: (field: string, value: any) => void
    ) => {
        if (code) setFieldValue("country", code);
    };
    const { data: countryOptions = [] } = useCountryOptions("");
    const [isKycEdit, setIsKycEdit] = useState<boolean>(false);
    const isInputDisabled = !isKycEdit && KycData ? true : false;
    const imageSrc = KycData?.logo || previewImage || "/images/placeholder/personPlaceholder.jpg";
    const queryClient = useQueryClient();

    return (
        <>
            <LoadingOverlay
                loader={<HomaaleLoader />}
                visible={IsKYCSubmitting}
                sx={{ position: "fixed", inset: 0 }}
            />
            <div className={classes.wrapper}>
                <Formik
                    enableReinitialize={Boolean(KycData)}
                    initialValues={{
                        logo: KycData?.logo ?? "",
                        full_name: KycData ? KycData?.full_name : "",
                        address: KycData ? KycData?.address : "",
                        country: KycData ? KycData?.country?.code : "",
                        is_company: false,
                        organization_name: KycData
                            ? KycData?.organization_name
                            : "",
                        user_type: "individual",
                    }}
                    validationSchema={KYCFormSchema}
                    onSubmit={(values: PostKycPayloadProps) => {
                        setShowLogoError(false);
                        const formData = new FormData();

                        const kycPayload: PostKycPayloadProps = {
                            ...values,
                            is_company:
                                values.user_type === "organization"
                                    ? true
                                    : false,
                        };
                        delete kycPayload.user_type;
                        values.user_type === "individual" &&
                            delete kycPayload.organization_name;

                        Object.entries(kycPayload).forEach((entry) => {
                            const [key, value] = entry;
                            formData.append(key, value);
                        });
                        mutate(formData, {
                            onSuccess: (res: any) => {
                                console.log("Success Response:", res);
                                queryClient.invalidateQueries(["get-kyc"]);
                                setIsKycEdit(false);
                                toast.success(res.message);
                            },
                            onError: (error: any) => {
                                console.error("KYC Submission Error:", {
                                    message: error.message,
                                    status: error.response?.status,
                                    data: error.response?.data,
                                });
                                const { logo } = error.response?.data || {};
                                logo && setShowLogoError(true);
                            },
                        });
                    }}
                >
                    {({
                        errors,
                        touched,
                        values,
                        resetForm,
                        setFieldValue,
                        setFieldTouched,
                    }) => (
                        <Form>
                            <Flex
                                sx={{
                                    borderBottom: "1px solid #00000008",
                                    paddingBottom: 12,
                                    marginBottom: 24,
                                    marginTop: 40,
                                }}
                            >
                                <h4>General Details</h4>
                            </Flex>

                            <Grid className="content-block" mb={24}>
                                <Grid.Col md={3}>
                                    <Text component="p">
                                        Passport Size Photo
                                        <Asterik />
                                    </Text>
                                </Grid.Col>
                                <Grid.Col md={8}>
                                    <Flex mb={8}>
                                        <figure className="profile-img">
                                            <>
                                                {!isInputDisabled && (
                                                    <IconCamera
                                                        className="camera-icon"
                                                        color="#fff"
                                                        onClick={onButtonClick}
                                                    />
                                                )}
                                                <ImageUploadModal
                                                    opened={opened}
                                                    setOpened={setOpened}
                                                    setFieldValue={
                                                        setFieldValue
                                                    }
                                                    setPreviewImage={
                                                        setPreviewImage
                                                    }
                                                />
                                            </>

                                            <Avatar
                                                src={imageSrc}
                                                alt="kyc-image"
                                                placeholder="blur"
                                                size={148}
                                                radius={148}
                                                style={{
                                                    borderRadius: "50%",
                                                    objectFit: "cover",
                                                }}
                                            />
                                        </figure>
                                    </Flex>
                                    {showLogoError && (
                                        <Text component="span" color="red">
                                            Required Field
                                            
                                        </Text>
                                    )}
                                </Grid.Col>
                            </Grid>

                            <Grid className="content-block">
                                <Grid.Col md={3}>
                                    <Text component="p">
                                        User Type
                                        <Asterik />
                                    </Text>
                                </Grid.Col>
                                <Grid.Col md={8}>
                                    <SelectField
                                        id="user_type"
                                        name={"user_type"}
                                        placeholder="Select your user type"
                                        data={[
                                            {
                                                value: "individual",
                                                label: "Individual",
                                            },
                                            {
                                                value: "organization",
                                                label: "Organization",
                                            },
                                        ]}
                                        disabled={isInputDisabled}
                                        marginIgnore
                                    />
                                </Grid.Col>
                            </Grid>

                            <Grid className="content-block">
                                <Grid.Col md={3}>
                                    <Text component="p">
                                        {values.user_type === "individual"
                                            ? "Full name"
                                            : "Representative Name"}
                                        <Asterik />
                                    </Text>
                                </Grid.Col>
                                <Grid.Col md={8}>
                                    <InputField
                                        name="full_name"
                                        placeholder="Full Name"
                                        error={errors.full_name}
                                        touch={touched.full_name}
                                        disabled={isInputDisabled}
                                        marginIgnore
                                    />
                                </Grid.Col>
                            </Grid>
                            {values.user_type === "organization" && (
                                <Grid className="content-block">
                                    <Grid.Col md={3}>
                                        <Text component="p">
                                            Organization Name
                                            <Asterik />
                                        </Text>
                                    </Grid.Col>
                                    <Grid.Col md={8}>
                                        <InputField
                                            name="organization_name"
                                            placeholder="Organization Name"
                                            error={errors.organization_name}
                                            touch={touched.organization_name}
                                            autoFocus
                                            disabled={isInputDisabled}
                                            marginIgnore
                                        />
                                    </Grid.Col>
                                </Grid>
                            )}

                            <Grid className="content-block">
                                <Grid.Col md={3}>
                                    <Text component="p">
                                        Address
                                        <Asterik />
                                    </Text>
                                </Grid.Col>
                                <Grid.Col md={8}>
                                    <InputField
                                        name="address"
                                        placeholder="Address"
                                        error={errors.address}
                                        touch={touched.address}
                                        disabled={isInputDisabled}
                                        marginIgnore
                                    />
                                </Grid.Col>
                            </Grid>

                            <Grid className="content-block" mb={"0 !important"}>
                                <Grid.Col md={3}>
                                    <Text component="p">
                                        Country
                                        <Asterik />
                                    </Text>
                                </Grid.Col>
                                <Grid.Col md={8}>
                                    <SelectField
                                        id="country"
                                        name={"country"}
                                        placeholder="Select your country"
                                        data={countryOptions ?? []}
                                        value={values.country}
                                        onChange={(value) => {
                                            handleCountryChanged(
                                                value,
                                                setFieldValue
                                            );
                                        }}
                                        onBlur={() =>
                                            setFieldTouched("country")
                                        }
                                        touch={touched.country}
                                        error={errors.country}
                                        disabled={isInputDisabled}
                                        marginIgnore
                                    />
                                </Grid.Col>
                            </Grid>
                            {!isInputDisabled && (
                                <Group mt={8}>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            resetForm();
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit"   >Continue</Button>
                                </Group>
                            )}
                        </Form>
                    )}
                </Formik>

                {KycData && (
                    <DocumentForm
                        KycData={KycData}
                        isAddNew={false}
                        setAddDocumentOpened={setOpened}
                    />
                )}
            </div>
        </>
    );
};

export default KycForm;
