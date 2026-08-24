import {
    Button,
    Checkbox,
    Grid,
    Group,
    LoadingOverlay,
    Text,
    useMantineTheme,
} from "@mantine/core";
import { IconCalendarEvent } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Form, Formik } from "formik";
import type { Dispatch, SetStateAction } from "react";
import React from "react";

import { useKycDocumentOption } from "@/hooks/kyc/useKycDocumentOptions";
import { usePostKycDocument } from "@/hooks/kyc/usePostKycDocument";
import type { KYCResponse } from "@/types/kyc/KycResponse";
import { KYCDocumentSchema } from "@/utils/validation/KycDocumentValidation";

import Asterik from "../common/Asterik";
import DateField from "../common/form/DateField";
import InputField from "../common/form/InputField";
import MultiFileDropzone from "../common/form/MultiFileDropzone";
import SelectField from "../common/form/SelectField";
import HomaaleLoader from "../common/HomaaleLoader";
import { toast } from "../common/Toast";

const DocumentForm = ({
    KycData,
    isAddNew,
    setAddDocumentOpened,
}: {
    KycData: KYCResponse | undefined;
    isAddNew: boolean;
    setAddDocumentOpened: Dispatch<SetStateAction<boolean>>;
}) => {
    const theme = useMantineTheme();
    const { mutate, isLoading } = usePostKycDocument();
    const { data: kycDocumentOptions = [] } = useKycDocumentOption();
    const queryClient = useQueryClient();

    return (
        <>
            <LoadingOverlay
                loader={<HomaaleLoader />}
                visible={isLoading}
                sx={{ position: "fixed", inset: 0 }}
            />
            <Formik
                initialValues={{
                    document_type: "",
                    document_id: "",
                    imagePreviewUrl: [],
                    file: [],
                    issuer_organization: "",
                    issued_date: "",
                    valid_through: "",
                    kyc: KycData ? KycData?.id : "",
                    is_noExpiry_checked: false,
                }}
                validationSchema={KYCDocumentSchema}
                onSubmit={async (val, action) => {
                    const formData: FormData = new FormData();

                    const newValues: any = {
                        ...val,
                        issued_date: format(
                            new Date(val.issued_date),
                            "yyyy-MM-dd"
                        ),
                        valid_through: val.valid_through
                            ? format(new Date(val.valid_through), "yyyy-MM-dd")
                            : "",
                        kyc: KycData?.id,
                    };
                    delete newValues.imagePreviewUrl;
                    val.is_noExpiry_checked &&
                        delete newValues.is_noExpiry_checked &&
                        delete newValues.valid_through;

                    Object.entries(newValues).forEach((entry) => {
                        const [key, value] = entry;
                        if (value && key !== "file") {
                            formData.append(key, value.toString());
                        }
                    });
                    formData.append("file", val.file[0]);
                    mutate(formData, {
                        onSuccess: () => {
                            queryClient.invalidateQueries(["kyc-document"]);
                            toast.success("Your KYC is sent for verification.");
                            setAddDocumentOpened(false);
                        },
                        onError: (error: any) => {
                            const {
                                data: { file, issued_date, non_field_errors },
                            } = error.response;
                            action.setFieldError("file", file && file[0]);
                            action.setFieldError(
                                "issued_date",
                                issued_date && issued_date[0]
                            );
                            action.setFieldError(
                                "document_type",
                                non_field_errors && non_field_errors[0]
                            );
                        },
                    });
                }}
            >
                {({ errors, touched, setFieldValue, resetForm, values }) => (
                    <Form>
                        {!isAddNew && (
                            <h4
                                style={{
                                    borderBottom: "1px solid #00000008",
                                    paddingBottom: 12,
                                    marginBottom: 24,
                                    marginTop: 40,
                                }}
                            >
                                General Details
                            </h4>
                        )}
                        <Grid className="content-block">
                            <Grid.Col md={3}>
                                <Text component="p">
                                    Document Type
                                    <Asterik />
                                </Text>
                            </Grid.Col>
                            <Grid.Col md={8}>
                                <SelectField
                                    id="document_type"
                                    name={"document_type"}
                                    placeholder="Select Document type"
                                    data={kycDocumentOptions}
                                    touch={touched.document_type}
                                    error={errors.document_type}
                                    // disabled={isInputDisabled}
                                    marginIgnore
                                />
                            </Grid.Col>
                        </Grid>
                        <Grid className="content-block">
                            <Grid.Col md={3}>
                                <Text component="p">
                                    Document Number <Asterik />
                                </Text>
                            </Grid.Col>
                            <Grid.Col md={8}>
                                <InputField
                                    name="document_id"
                                    placeholder="Document Number"
                                    error={errors.document_id}
                                    touch={touched.document_id}
                                    // disabled={isInputDisabled}
                                    marginIgnore
                                />
                            </Grid.Col>
                        </Grid>
                        <Grid className="content-block">
                            <Grid.Col md={3}>
                                <Text component="p">
                                    Issued by <Asterik />
                                </Text>
                            </Grid.Col>
                            <Grid.Col md={8}>
                                <InputField
                                    name="issuer_organization"
                                    placeholder="Issuing Organization"
                                    error={errors.issuer_organization}
                                    touch={touched.issuer_organization}
                                    // disabled={isInputDisabled}
                                    marginIgnore
                                />
                            </Grid.Col>
                        </Grid>
                        <Grid className="content-block">
                            <Grid.Col md={3}>
                                <Text component="p">
                                    Issued on <Asterik />
                                </Text>
                            </Grid.Col>
                            <Grid.Col md={8}>
                                <DateField
                                    id="issued_date"
                                    name="issued_date"
                                    placeholder="MM/DD/YYYY"
                                    error={errors.issued_date}
                                    touch={touched.issued_date}
                                    icon={<IconCalendarEvent size={20} />}
                                    minDate={
                                        new Date(
                                            new Date().setFullYear(
                                                new Date().getFullYear() - 100
                                            )
                                        )
                                    }
                                    maxDate={new Date()}
                                    onChange={(value) => {
                                        setFieldValue("issued_date", value);
                                    }}
                                    marginIgnore
                                />
                            </Grid.Col>
                        </Grid>

                        <Grid className="content-block">
                            <Grid.Col md={3}>
                                <Text component="p">
                                    Valid Through <Asterik />
                                </Text>
                            </Grid.Col>
                            <Grid.Col md={8}>
                                <DateField
                                    id="valid_through"
                                    name="valid_through"
                                    placeholder="MM/DD/YYYY"
                                    error={errors.valid_through}
                                    touch={touched.valid_through}
                                    icon={<IconCalendarEvent size={20} />}
                                    minDate={new Date()}
                                    onChange={(value) => {
                                        setFieldValue("valid_through", value);
                                    }}
                                    disabled={values?.is_noExpiry_checked}
                                    marginIgnore
                                />
                                <Checkbox
                                    size="xs"
                                    sx={{
                                        marginTop: 8,
                                        ".mantine-Checkbox-label": {
                                            paddingLeft: 4,
                                            color: theme.colors.gray[6],
                                        },
                                    }}
                                    checked={values.is_noExpiry_checked}
                                    onChange={(event) =>
                                        setFieldValue(
                                            "is_noExpiry_checked",
                                            event.target.checked
                                        )
                                    }
                                    label="This document does not expire."
                                />
                            </Grid.Col>
                        </Grid>

                        <Grid className="content-block">
                            <Grid.Col md={3}>
                                <Text component="p">
                                    Verification Document <Asterik />
                                </Text>
                            </Grid.Col>
                            <Grid.Col md={8}>
                                <MultiFileDropzone
                                    name="file"
                                    labelName="Upload your images"
                                    textMuted={`More than 1 images cannot be uploaded. File supported: .jpeg, .jpg, .png. Maximum size 4MB.`}
                                    error={
                                        (errors.imagePreviewUrl as string) ||
                                        (errors.file as string)
                                    }
                                    touch={touched.file as unknown as boolean}
                                    imagePreview="imagePreviewUrl"
                                    maxFiles={1}
                                    maxSize={4}
                                    multiple
                                    showFileDetail
                                />
                            </Grid.Col>
                        </Grid>
                        <Group mt={8}>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    isAddNew
                                        ? setAddDocumentOpened(false)
                                        : resetForm();
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">Continue</Button>
                        </Group>
                    </Form>
                )}
            </Formik>
        </>
    );
};

export default DocumentForm;
