import {
    Button,
    Flex,
    Grid,
    Group,
    LoadingOverlay,
    Modal,
    Text,
} from "@mantine/core";
import { IconCamera } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Form, Formik } from "formik";
import Image from "next/image";
import type { Dispatch, SetStateAction } from "react";
import { useMemo } from "react";
import { useRef } from "react";
import { useState } from "react";

import urls from "@/constants/urls";
import { useCountryOptions } from "@/hooks/useCountryOptions";
import { useKycFormStyles } from "@/styles/components/kycForm";
import type { KYCResponse } from "@/types/kyc/KycResponse";
import type { PostKycPayloadProps } from "@/types/kyc/PostKycPayloadProps";
import { axiosClient } from "@/utils/axiosClient";
import { KYCFormSchema } from "@/utils/validation/KycDocumentValidation";

import Asterik from "../common/Asterik";
import InputField from "../common/form/InputField";
import SelectField from "../common/form/SelectField";
import HomaaleLoader from "../common/HomaaleLoader";
import { toast } from "../common/Toast";

interface Props {
    opened: boolean;
    setEditKycOpened: Dispatch<SetStateAction<boolean>>;
    KycData: KYCResponse | undefined;
}

const EditKycForm = ({ opened, setEditKycOpened, KycData }: Props) => {
    const { classes, theme } = useKycFormStyles();

    const inputRef = useRef<HTMLInputElement>(null);
    const onButtonClick = () => {
        inputRef?.current?.click();
    };

    const { data: countryOptions = [] } = useCountryOptions("");
    const handleCountryChanged = (
        code: string | null,
        setFieldValue: (field: string, value: any) => void
    ) => {
        if (code) setFieldValue("country", code);
    };

    const [uploadedFile, setUploadedFile] = useState<File | null>(null);

    let previewImage: any;

    const uploadPreview = useMemo(() => {
        uploadedFile ? (previewImage = URL.createObjectURL(uploadedFile)) : "";
        return previewImage;
    }, [uploadedFile]);

    const { mutate: editKycMutation, isLoading } = useMutation(
        (data: FormData) => {
            return axiosClient.patch(urls.kyc.patchKyc, data);
        }
    );

    const queryClient = useQueryClient();

    return (
        <>
            <LoadingOverlay
                loader={<HomaaleLoader />}
                visible={isLoading}
                sx={{ position: "fixed", inset: 0 }}
            />

            <Modal
                opened={opened}
                onClose={() => setEditKycOpened(false)}
                centered
                title="Edit KYC Details"
                withCloseButton
                closeOnClickOutside={false}
                overlayProps={{
                    opacity: 0.55,
                    blur: 3,
                }}
                size="lg"
                padding={32}
                radius={8}
            >
                <div className={classes.wrapper}>
                    <Formik
                        enableReinitialize={Boolean(KycData)}
                        validationSchema={KYCFormSchema}
                        initialValues={{
                            logo: KycData?.logo ?? "",
                            full_name: KycData ? KycData?.full_name : "",
                            address: KycData ? KycData?.address : "",
                            country: KycData ? KycData?.country?.code : "",
                            is_company: KycData?.is_company,
                            organization_name: KycData
                                ? KycData?.organization_name
                                : "",
                            user_type: KycData?.is_company
                                ? "organization"
                                : "individual",
                        }}
                        onSubmit={(values, actions) => {
                            const formData = new FormData();
                            const EditkycPayload: PostKycPayloadProps = {
                                ...values,
                                is_company:
                                    values.user_type === "organization"
                                        ? true
                                        : false,
                            };
                            delete EditkycPayload.user_type;
                            values.user_type === "individual" &&
                                delete EditkycPayload.organization_name;
                            KycData?.is_address_verified &&
                                delete EditkycPayload.address;
                            KycData?.is_address_verified &&
                                delete EditkycPayload.country;
                            !uploadedFile && delete EditkycPayload.logo;

                            Object.entries(EditkycPayload).forEach((entry) => {
                                const [key, value] = entry;
                                formData.append(key, value);
                            });

                            editKycMutation(formData, {
                                onSuccess: (res: any) => {
                                    queryClient.invalidateQueries(["get-kyc"]);
                                    setEditKycOpened(false);
                                    actions.resetForm();
                                    setUploadedFile(null);
                                    toast.success(res.message);
                                },
                                onError: (error: any) => {
                                    toast.error(error.message);
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
                                <Grid className="content-block" mb={24}>
                                    <Grid.Col md={3}>
                                        <Text component="p">
                                            Passport Size Photo
                                        </Text>
                                    </Grid.Col>
                                    <Grid.Col md={8}>
                                        <Flex>
                                            <figure className="profile-img">
                                                <>
                                                    <IconCamera
                                                        color="#fff"
                                                        onClick={onButtonClick}
                                                        style={{
                                                            position:
                                                                "absolute",
                                                            bottom: 5,
                                                            left: 105,
                                                            background:
                                                                theme.colors
                                                                    .gray[8],
                                                            opacity: "80%",
                                                            padding: 6,
                                                            height: 30,
                                                            width: 30,
                                                            zIndex: 1,
                                                            borderRadius: "50%",
                                                            cursor: "pointer",
                                                        }}
                                                    />
                                                    <input
                                                        ref={inputRef}
                                                        accept="image/png, image/jpeg"
                                                        type="file"
                                                        style={{
                                                            visibility:
                                                                "hidden",
                                                        }}
                                                        onChange={(e) => {
                                                            const files =
                                                                e.target.files;
                                                            setUploadedFile(
                                                                files &&
                                                                    files[0]
                                                            );
                                                            setFieldValue(
                                                                "logo",
                                                                files &&
                                                                    files[0]
                                                            );
                                                        }}
                                                        // className={classes.input}
                                                    />
                                                </>

                                                <Image
                                                    src={
                                                        uploadedFile
                                                            ? uploadPreview
                                                            : KycData?.logo ??
                                                              "/images/placeholder/personPlaceholder.jpg"
                                                    }
                                                    height={148}
                                                    width={148}
                                                    alt="serviceprovider-image"
                                                    placeholder="blur"
                                                    blurDataURL="/images/placeholder/loadingLightPlaceHolder.jpg"
                                                    style={{
                                                        borderRadius: "50%",
                                                        objectFit: "cover",
                                                    }}
                                                />
                                            </figure>
                                        </Flex>
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
                                            // disabled={isInputDisabled}
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
                                                touch={
                                                    touched.organization_name
                                                }
                                                autoFocus
                                                // disabled={isInputDisabled}
                                                marginIgnore
                                            />
                                        </Grid.Col>
                                    </Grid>
                                )}

                                {!KycData?.is_address_verified && (
                                    <>
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
                                                    // disabled={isInputDisabled}
                                                    marginIgnore
                                                />
                                            </Grid.Col>
                                        </Grid>

                                        <Grid
                                            className="content-block"
                                            mb={"0 !important"}
                                        >
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
                                                        setFieldTouched(
                                                            "country"
                                                        )
                                                    }
                                                    touch={touched.country}
                                                    error={errors.country}
                                                    // disabled={isInputDisabled}
                                                    marginIgnore
                                                />
                                            </Grid.Col>
                                        </Grid>
                                    </>
                                )}

                                <Group mt={8}>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setEditKycOpened(false);
                                            resetForm();
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit">Continue</Button>
                                </Group>
                            </Form>
                        )}
                    </Formik>
                </div>
            </Modal>
        </>
    );
};
export default EditKycForm;
