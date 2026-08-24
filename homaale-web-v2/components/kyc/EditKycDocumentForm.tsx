import {
    Box,
    Button,
    Checkbox,
    Grid,
    Group,
    LoadingOverlay,
    Modal,
    Text,
} from "@mantine/core";
import { IconCalendarEvent } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { format } from "date-fns";
import { Form, Formik } from "formik";
import _ from "lodash";
import Image from "next/image";
import type { Dispatch, SetStateAction } from "react";
import { useMemo } from "react";
import { useState } from "react";

import urls from "@/constants/urls";
import { useKycDocumentOption } from "@/hooks/kyc/useKycDocumentOptions";
import { useKycFormStyles } from "@/styles/components/kycForm";
import type { KYCDocumentDetailsProps } from "@/types/kyc/KycDocumentDetailsProps";
import { axiosClient } from "@/utils/axiosClient";

import Asterik from "../common/Asterik";
import DateField from "../common/form/DateField";
import InputField from "../common/form/InputField";
import SelectField from "../common/form/SelectField";
import HomaaleLoader from "../common/HomaaleLoader";
import { toast } from "../common/Toast";

interface Props {
    opened: boolean;
    setEditKycDocumentOpened: Dispatch<SetStateAction<boolean>>;
    id: number | undefined;
}

export type PostKycDocumentPayloadProps = {
    kyc?: number | undefined;
    document_type: number | undefined;
    document_id: string;
    file: string | File | undefined;
    issuer_organization: string;
    issued_date: string;
    valid_through?: string;
    is_company?: boolean;
    is_noExpiry_checked?: boolean;
};

const EditKycDocumentForm = ({
    opened,
    setEditKycDocumentOpened,
    id,
}: Props) => {
    // Get document details to edit
    const { data: documentDetails } = useQuery<KYCDocumentDetailsProps>(
        ["kyc-document-details", id],
        async () => {
            try {
                const { data } = await axiosClient.get<KYCDocumentDetailsProps>(
                    `${urls.kyc.kycDocument}${id}/`
                );
                return data;
            } catch (error) {
                if (error instanceof AxiosError) {
                    const errors = Object.values(error.response?.data).join(
                        "\n"
                    );
                    throw new Error(errors);
                }
                throw new Error("Something went wrong");
            }
        },
        {
            enabled: !!id,
        }
    );

    const { data: kycDocumentOptions = [] } = useKycDocumentOption();

    const { classes, theme } = useKycFormStyles();

    const [uploadedFile, setUploadedFile] = useState<File | null>(null);

    let previewImage: any;

    const { mutate: editKycDocumentMutation, isLoading } = useMutation(
        (data: FormData) => {
            return axiosClient.patch(`${urls.kyc.kycDocument}${id}/`, data);
        }
    );

    const queryClient = useQueryClient();

    const uploadPreview = useMemo(() => {
        uploadedFile ? (previewImage = URL.createObjectURL(uploadedFile)) : "";
        return previewImage;
    }, [uploadedFile]);

    return (
        <>
            <LoadingOverlay
                loader={<HomaaleLoader />}
                visible={isLoading}
                sx={{ position: "fixed", inset: 0 }}
            />
            <Modal
                opened={opened}
                onClose={() => setEditKycDocumentOpened(false)}
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
                        enableReinitialize={Boolean(documentDetails)}
                        initialValues={{
                            file: documentDetails?.file,
                            document_type:
                                documentDetails?.document_type?.id.toString(),
                            document_id: documentDetails?.document_id,
                            issuer_organization:
                                documentDetails?.issuer_organization,
                            issued_date:
                                documentDetails?.issued_date &&
                                new Date(documentDetails?.issued_date),
                            valid_through:
                                documentDetails?.valid_through &&
                                new Date(documentDetails?.valid_through),

                            kyc: documentDetails?.kyc,
                            is_noExpiry_checked: documentDetails?.valid_through
                                ? false
                                : true,
                        }}
                        // validationSchema={KYCDocumentSchema}
                        onSubmit={async (values, action) => {
                            const formData: FormData = new FormData();
                            const EditDocumentPayload = {
                                ...values,
                                issued_date: format(
                                    new Date(String(values.issued_date)),
                                    "yyyy-MM-dd"
                                ),
                                valid_through:
                                    values?.valid_through &&
                                    format(
                                        new Date(String(values.valid_through)),
                                        "yyyy-MM-dd"
                                    ),
                            };

                            !uploadedFile && delete EditDocumentPayload.file;
                            Object.entries(EditDocumentPayload).forEach(
                                (entry) => {
                                    const [key, value] = entry;
                                    formData.append(key, value as string);
                                }
                            );

                            values?.is_noExpiry_checked &&
                                formData.append("valid_through", "");
                            formData.delete("is_noExpiry_checked");

                            // formData.append("file", values.file[0]);
                            editKycDocumentMutation(formData, {
                                onSuccess: () => {
                                    queryClient.invalidateQueries([
                                        "kyc-document",
                                    ]);
                                    queryClient.invalidateQueries([
                                        "kyc-document-details",
                                    ]);
                                    toast.success(
                                        "Your KYC is sent for verification."
                                    );
                                    setEditKycDocumentOpened(false);
                                    action.resetForm();
                                    setUploadedFile(null);
                                },
                                onError: (error: any) => {
                                    const {
                                        data: { file, issued_date },
                                    } = error.response;
                                    action.setFieldError(
                                        "file",
                                        file && file[0]
                                    );
                                    action.setFieldError(
                                        "issued_date",
                                        issued_date && issued_date[0]
                                    );
                                    toast.error(error.message);
                                },
                            });
                        }}
                    >
                        {({
                            errors,
                            touched,
                            setFieldValue,
                            resetForm,
                            values,
                        }) => (
                            <Form>
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
                                            value={values.document_type?.toString()}
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
                                            icon={
                                                <IconCalendarEvent size={20} />
                                            }
                                            minDate={
                                                new Date(
                                                    new Date().setFullYear(
                                                        new Date().getFullYear() -
                                                            100
                                                    )
                                                )
                                            }
                                            maxDate={new Date()}
                                            onChange={(value) => {
                                                setFieldValue(
                                                    "issued_date",
                                                    value
                                                );
                                            }}
                                        />
                                    </Grid.Col>
                                </Grid>

                                <Grid className="content-block">
                                    <Grid.Col md={3}>
                                        <Text component="p">Valid Through</Text>
                                    </Grid.Col>
                                    <Grid.Col md={8}>
                                        <DateField
                                            id="valid_through"
                                            name="valid_through"
                                            placeholder="MM/DD/YYYY"
                                            error={errors.valid_through}
                                            touch={touched.valid_through}
                                            icon={
                                                <IconCalendarEvent size={20} />
                                            }
                                            minDate={new Date()}
                                            disabled={
                                                values.is_noExpiry_checked
                                            }
                                            onChange={(value) => {
                                                setFieldValue(
                                                    "valid_through",
                                                    value
                                                );
                                            }}
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
                                            checked={
                                                values?.is_noExpiry_checked
                                            }
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
                                        <Box
                                            sx={{
                                                "& input[type=file]": {
                                                    marginTop: 8,
                                                    "&::file-selector-button": {
                                                        cursor: "pointer",
                                                        background:
                                                            theme.colors
                                                                .brand[3],
                                                        border: "none",
                                                        borderRadius: 4,
                                                        color: "#fff",
                                                        padding: "6px 12px",
                                                        fontWeight: 600,
                                                    },
                                                },
                                            }}
                                        >
                                            <Image
                                                src={
                                                    uploadedFile
                                                        ? uploadPreview
                                                        : documentDetails?.file
                                                }
                                                height={148}
                                                width={256}
                                                alt="serviceprovider-image"
                                                placeholder="blur"
                                                blurDataURL="/images/placeholder/loadingLightPlaceHolder.jpg"
                                                style={{
                                                    borderRadius: 8,
                                                    objectFit: "contain",
                                                }}
                                            />
                                            <input
                                                type="file"
                                                accept="image/png, image/jpeg"
                                                onChange={(e) => {
                                                    const files =
                                                        e.target.files;
                                                    setUploadedFile(
                                                        files && files[0]
                                                    );
                                                    setFieldValue(
                                                        "file",
                                                        files && files[0]
                                                    );
                                                }}
                                            />
                                        </Box>
                                    </Grid.Col>
                                </Grid>
                                <Group mt={8}>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setEditKycDocumentOpened(false);
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
export default EditKycDocumentForm;
