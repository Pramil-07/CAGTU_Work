import { Button, Checkbox, Group, Modal, useMantineTheme } from "@mantine/core";
import { IconCalendarEvent } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Form, Formik } from "formik";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import React from "react";

import urls from "@/constants/urls";
import { useProfile } from "@/hooks/useProfile";
import type { CertificationValueProps } from "@/types/profile/AddCertificationsProps";
import type { ProfileResponseProps } from "@/types/ProfileResponseProps";
import { axiosClient } from "@/utils/axiosClient";
import { certificateFormSchema } from "@/utils/validation/profile/CertificationFormValidation";

import DateField from "../common/form/DateField";
import DescriptionField from "../common/form/DescriptionField";
import InputField from "../common/form/InputField";
import { toast } from "../common/Toast";

interface ExperienceProps {
    opened: boolean;
    handleClose: () => void;
    setShowCertificationForm: Dispatch<SetStateAction<boolean>>;
    id?: number;
    isEditCertification?: boolean;
}

const AddCertificationForm = ({
    opened,
    handleClose,
    setShowCertificationForm,
    id,
    isEditCertification,
}: ExperienceProps) => {
    const [toggle, setToggled] = useState(false);
    const theme = useMantineTheme();

    const { data: profile } = useProfile();
    const currentEditCertification: CertificationValueProps =
        profile?.certificates?.find(
            (item: any) => item.id === id
        ) as ProfileResponseProps["certificates"][0];

    const queryClient = useQueryClient();

    const addCertificationMutation = useMutation(
        (data: CertificationValueProps) => {
            return axiosClient.post(urls.profile.certifications, data);
        }
    );
    const editCertificationMutation = useMutation(
        (data: CertificationValueProps) => {
            return axiosClient.patch(
                `${urls.profile.certifications}${id}/`,
                data
            );
        }
    );

    return (
        <>
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
                            <h4>Add Certifications</h4>
                        </Modal.Title>
                        <Modal.CloseButton />
                    </Modal.Header>
                    <Modal.Body>
                        <Formik
                            initialValues={
                                currentEditCertification &&
                                isEditCertification === true
                                    ? {
                                          ...currentEditCertification,
                                          issued_date: parseISO(
                                              currentEditCertification.issued_date
                                          ),

                                          expire_date:
                                              currentEditCertification.expire_date
                                                  ? parseISO(
                                                        currentEditCertification.expire_date
                                                    )
                                                  : "",
                                      }
                                    : {
                                          name: "",
                                          issuing_organization: "",
                                          description: "",
                                          does_expire: false,
                                          credential_id: "",
                                          certificate_url: "",
                                          issued_date: "",
                                          expire_date: "",
                                          id: 0,
                                      }
                            }
                            validationSchema={certificateFormSchema}
                            onSubmit={async (values) => {
                                let newValue;
                                if (!values.expire_date) {
                                    const withoutEndDate = {
                                        ...values,
                                        issued_date: format(
                                            new Date(values.issued_date),
                                            "yyy-MM-dd"
                                        ),
                                        expire_date: null,
                                    };
                                    newValue = withoutEndDate;
                                } else {
                                    const newvalidatedValue = {
                                        ...values,
                                        issued_date: format(
                                            new Date(values.issued_date),
                                            "yyyy-MM-dd"
                                        ),
                                        expire_date: format(
                                            new Date(values.expire_date),
                                            "yyyy-MM-dd"
                                        ),
                                    };
                                    newValue = newvalidatedValue;
                                }

                                {
                                    currentEditCertification &&
                                    isEditCertification
                                        ? editCertificationMutation.mutate(
                                              newValue,
                                              {
                                                  onSuccess: async () => {
                                                      setShowCertificationForm(
                                                          false
                                                      );
                                                      queryClient.invalidateQueries(
                                                          ["profile-data"]
                                                      );
                                                      toast.success(
                                                          "Certification detail updated successfully"
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
                                        : addCertificationMutation.mutate(
                                              newValue,
                                              {
                                                  onSuccess: async () => {
                                                      setShowCertificationForm(
                                                          false
                                                      );
                                                      queryClient.invalidateQueries(
                                                          ["profile-data"]
                                                      );
                                                      toast.success(
                                                          "Experience detail added successfully"
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
                            {({
                                errors,
                                touched,
                                setFieldValue,
                                getFieldProps,
                            }) => (
                                <Form>
                                    <InputField
                                        id="name"
                                        name={"name"}
                                        label={"Name"}
                                        placeholder="Eg: Cetified Gardener"
                                        touch={touched.name}
                                        error={errors.name}
                                        data-autofocus
                                        withAsterisk
                                    />
                                    <InputField
                                        id="issuing_organization"
                                        name={"issuing_organization"}
                                        label={"Issuing Organization"}
                                        placeholder="Eg: Cagtu Nepal"
                                        touch={touched.issuing_organization}
                                        error={errors.issuing_organization}
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
                                    <InputField
                                        id="credential_id"
                                        name={"credential_id"}
                                        label={"Credential ID"}
                                        placeholder="Certification credential"
                                        touch={touched.credential_id}
                                        error={errors.credential_id}
                                        withAsterisk
                                    />
                                    <InputField
                                        id="certificate_url"
                                        name="certificate_url"
                                        label="Certificate URL"
                                        placeholder="Link to the certification verification"
                                        error={errors.certificate_url}
                                        touch={touched.certificate_url}
                                        withAsterisk
                                    />
                                    <Checkbox
                                        mt={-12}
                                        mb={24}
                                        size={"xs"}
                                        defaultChecked={toggle}
                                        label="This certification does not expire"
                                        {...getFieldProps("does_expire")}
                                        onChange={(event) => {
                                            setToggled(!toggle);

                                            setFieldValue(
                                                "does_expire",
                                                event.target.checked
                                            );
                                        }}
                                        sx={{
                                            ".mantine-Checkbox-label": {
                                                color: theme.colors.gray[6],
                                            },
                                        }}
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
                                    <DateField
                                        id="expire_date"
                                        name="expire_date"
                                        label="End Date"
                                        placeholder="Expiry Date"
                                        error={errors.expire_date as string}
                                        touch={touched.expire_date  as boolean}
                                        icon={<IconCalendarEvent size={20} />}
                                        maxDate={new Date()}
                                        onChange={(value) => {
                                            setFieldValue("expire_date", value);
                                        }}
                                        disabled={toggle ? true : false}
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

export default AddCertificationForm;
