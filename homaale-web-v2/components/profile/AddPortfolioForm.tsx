import { Button, Group, LoadingOverlay, Modal } from "@mantine/core";
import { MIME_TYPES } from "@mantine/dropzone";
import { IconCalendarEvent } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Form, Formik } from "formik";
import _ from "lodash";
import type { Dispatch, SetStateAction } from "react";
import React from "react";

import urls from "@/constants/urls";
import { useFileStore } from "@/hooks/useFileStore";
import { useProfile } from "@/hooks/useProfile";
import type { PortfolioValueProps } from "@/types/profile/AddPortfolioProps";
import type { ProfileResponseProps } from "@/types/ProfileResponseProps";
import { axiosClient } from "@/utils/axiosClient";
import { AddPortfolioFormData } from "@/utils/formData/PortfolioFormData";
import { portfolioFormSchema } from "@/utils/validation/profile/PortfolioFormValidation";

import DateField from "../common/form/DateField";
import DescriptionField from "../common/form/DescriptionField";
import InputField from "../common/form/InputField";
import MultiFileDropzone from "../common/form/MultiFileDropzone";
import HomaaleLoader from "../common/HomaaleLoader";
import { toast } from "../common/Toast";

interface PortfolioProps {
    opened: boolean;
    handleClose: () => void;
    setShowPortfolioForm: Dispatch<SetStateAction<boolean>>;
    id?: number;
    isEditPortfolio?: boolean;
}

const AddPortfolioForm = ({
    opened,
    handleClose,
    setShowPortfolioForm,
    id,
    isEditPortfolio,
}: PortfolioProps) => {
    const MaxImages = 4;
    const MaxFiles = 3;

    const { data: profile } = useProfile();

    const currentEditPortfolio: PortfolioValueProps = profile?.portfolio?.find(
        (item) => item.id === id
    ) as ProfileResponseProps["portfolio"][0];

    const getCurrentPortfolioImages =
        currentEditPortfolio?.images &&
        currentEditPortfolio?.images.map((val: any) => {
            const fileName = _.split(val?.name, "/");
            return {
                id: val?.id,
                src: val?.media,
                file: {
                    name: _.last(fileName),
                    size: val?.size,
                    type: val?.media_type,
                },
            };
        });
    const getCurrentPortfolioFiles =
        currentEditPortfolio?.files &&
        currentEditPortfolio?.files.map((val: any) => {
            const fileName = _.split(val?.name, "/");
            return {
                id: val?.id,
                src: val?.media,
                file: {
                    name: _.last(fileName),
                    size: val?.size,
                    type: val?.media_type,
                },
            };
        });

    const queryClient = useQueryClient();

    const { mutate: addPortfolioMutation, isLoading } = useMutation(
        (data: PortfolioValueProps) => {
            return axiosClient.post(urls.profile.portfolio, data);
        }
    );
    const { mutate: editPortfolioMutation } = useMutation(
        (data: PortfolioValueProps) => {
            return axiosClient.patch(`${urls.profile.portfolio}${id}/`, data);
        }
    );

    //For Filestore API
    const { mutateAsync: uploadFileMutation, isLoading: uploadFileLoading } =
        useFileStore();

    return (
        <>
            <LoadingOverlay
                loader={<HomaaleLoader />}
                visible={isLoading || uploadFileLoading}
                sx={{ position: "fixed", inset: 0 }}
            />
            <Modal.Root
                opened={opened}
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
                    <Modal.Header
                        sx={{
                            padding: "24px 32px",
                        }}
                    >
                        <Modal.Title>
                            <h4>Add Portfolio</h4>
                        </Modal.Title>
                        <Modal.CloseButton />
                    </Modal.Header>
                    <Modal.Body>
                        <Formik
                            initialValues={
                                currentEditPortfolio && isEditPortfolio === true
                                    ? {
                                          ...currentEditPortfolio,
                                          issued_date: parseISO(
                                              currentEditPortfolio.issued_date
                                          ),

                                          images: currentEditPortfolio?.images as File[],
                                          files: currentEditPortfolio?.files as File[],
                                          imagePreviewUrl:
                                              getCurrentPortfolioImages,
                                          pdfPreviewUrl:
                                              getCurrentPortfolioFiles,
                                      }
                                    : AddPortfolioFormData
                            }
                            validationSchema={portfolioFormSchema}
                            onSubmit={async (values) => {
                                let newUploadImageID: number[] = [];
                                if (
                                    values?.images.some((val: any) => val?.path)
                                ) {
                                    const uploadedImageIds =
                                        await uploadFileMutation({
                                            files: values?.images.filter(
                                                (val: any) => val?.path
                                            ) as unknown as string,
                                            media_type: "image",
                                        });
                                    newUploadImageID = uploadedImageIds;
                                }

                                let newUploadFileID: number[] = [];
                                if (
                                    values?.files.some((val: any) => val?.path)
                                ) {
                                    const uploadedFileIds =
                                        await uploadFileMutation({
                                            files: values?.files.filter(
                                                (val: any) => val?.path
                                            ) as unknown as string,
                                            media_type: "pdf",
                                        });
                                    newUploadFileID = uploadedFileIds;
                                }

                                const imageIds = values?.images
                                    .filter((val: any) => !val?.path)
                                    .map((val: any) => val.id);
                                const fileIds = values?.files
                                    .filter((val: any) => !val?.path)
                                    .map((val: any) => val.id);

                                const imagesIds = [
                                    ...imageIds,
                                    ...newUploadImageID,
                                ];
                                const filesIds = [
                                    ...fileIds,
                                    ...newUploadFileID,
                                ];
                                const issued_date = format(
                                    new Date(values.issued_date),
                                    "yyyy-MM-dd"
                                );
                                const addPortfolioPayload = {
                                    ...values,
                                    issued_date,
                                    images: imagesIds,
                                    files: filesIds,
                                };

                                delete addPortfolioPayload.imagePreviewUrl;
                                {
                                    !isEditPortfolio
                                        ? addPortfolioMutation(
                                              addPortfolioPayload,
                                              {
                                                  onSuccess: () => {
                                                      setShowPortfolioForm(
                                                          false
                                                      );
                                                      queryClient.invalidateQueries(
                                                          ["profile-data"]
                                                      );
                                                      queryClient.invalidateQueries(
                                                          ["tasker-portfolio"]
                                                      );
                                                      toast.success(
                                                          "Portfolio detail added successfully"
                                                      );
                                                  },
                                                  onError: async (
                                                      error: any
                                                  ) => {
                                                      toast.error(
                                                          error.message
                                                      );
                                                  },
                                              }
                                          )
                                        : editPortfolioMutation(
                                              addPortfolioPayload,
                                              {
                                                  onSuccess: () => {
                                                      setShowPortfolioForm(
                                                          false
                                                      );
                                                      queryClient.invalidateQueries(
                                                          ["profile-data"]
                                                      );
                                                      queryClient.invalidateQueries(
                                                          ["tasker-portfolio"]
                                                      );
                                                      toast.success(
                                                          "Portfolio detail added successfully"
                                                      );
                                                  },
                                                  onError: async (
                                                      error: any
                                                  ) => {
                                                      toast.error(
                                                          error.message
                                                      );
                                                  },
                                              }
                                          );
                                }
                            }}
                        >
                            {({ errors, touched, setFieldValue }) => (
                                <Form>
                                    <InputField
                                        id="title"
                                        name={"title"}
                                        label={"Title"}
                                        placeholder="Portfolio Title"
                                        touch={touched.title}
                                        error={errors.title}
                                        data-autofocus
                                        withAsterisk
                                    />

                                    <DescriptionField
                                        id="description"
                                        name={"description"}
                                        label={"Description"}
                                        placeholder={"Description"}
                                        touch={touched.description}
                                        error={errors.description}
                                        withAsterisk
                                    />
                                    <DateField
                                        id="issued_date"
                                        name="issued_date"
                                        label="Issued Date"
                                        placeholder="Issued Date"
                                        error={errors.issued_date as string}
                                        touch={touched.issued_date as boolean}
                                        icon={<IconCalendarEvent size={20} />}
                                        maxDate={new Date()}
                                        onChange={(value) => {
                                            setFieldValue("issued_date", value);
                                        }}
                                        withAsterisk
                                    />
                                    <InputField
                                        id="credential_url"
                                        name="credential_url"
                                        label="Certificate URL"
                                        placeholder="Link to the certification verification"
                                        error={errors.credential_url}
                                        touch={touched.credential_url}
                                        withAsterisk
                                    />
                                    <MultiFileDropzone
                                        name="images"
                                        labelName="Upload your images"
                                        textMuted={`More than ${MaxImages} images cannot be uploaded. File supported: jpeg, jpg & png. Maximum size 4MB.`}
                                        error={
                                            (errors.imagePreviewUrl as string) ||
                                            (errors.images as string)
                                        }
                                        touch={
                                            touched.images as unknown as boolean
                                        }
                                        imagePreview="imagePreviewUrl"
                                        maxFiles={MaxImages}
                                        maxSize={4}
                                        multiple
                                        showFileDetail
                                    />
                                    <MultiFileDropzone
                                        name="files"
                                        labelName="Upload your file"
                                        textMuted={`More than ${MaxFiles} files cannot be uploaded. File supported: pdf, doc & docx. Maximum size 4MB.`}
                                        error={
                                            (errors.pdfPreviewUrl as string) ||
                                            (errors.files as string)
                                        }
                                        touch={
                                            touched.files as unknown as boolean
                                        }
                                        imagePreview="pdfPreviewUrl"
                                        maxFiles={MaxFiles}
                                        maxSize={4}
                                        multiple
                                        showFileDetail
                                        accept={[
                                            MIME_TYPES.pdf,
                                            MIME_TYPES.doc,
                                            MIME_TYPES.docx,
                                        ]}
                                    />

                                    <Group grow>
                                        <Button
                                            variant={"outline"}
                                            onClick={handleClose}
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

export default AddPortfolioForm;
