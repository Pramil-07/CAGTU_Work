import { Button, Group, Modal } from "@mantine/core";
import { IconCalendarEvent } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Form, Formik } from "formik";
import type { Dispatch, SetStateAction } from "react";
import React from "react";

import urls from "@/constants/urls";
import { useProfile } from "@/hooks/useProfile";
import type { EducationValueProps } from "@/types/profile/AddEducationProps";
import type { ProfileResponseProps } from "@/types/ProfileResponseProps";
import { axiosClient } from "@/utils/axiosClient";
import { educationFormSchema } from "@/utils/validation/profile/EducationFormValidation";

import DateField from "../common/form/DateField";
import DescriptionField from "../common/form/DescriptionField";
import InputField from "../common/form/InputField";
import { toast } from "../common/Toast";

interface EducationProps {
    opened: boolean;
    handleClose: () => void;
    setShowEducationForm: Dispatch<SetStateAction<boolean>>;
    id?: number;
    isEditEducation?: boolean;
}
const AddEducationForm = ({
    opened,
    handleClose,
    setShowEducationForm,
    id,
    isEditEducation,
}: EducationProps) => {
    const queryClient = useQueryClient();

    const { data: profile } = useProfile();

    const currentEditEducation: EducationValueProps = profile?.education?.find(
        (item) => item.id === id
    ) as ProfileResponseProps["education"][0];

    const addEducationMutation = useMutation((data: EducationValueProps) => {
        return axiosClient.post(urls.profile.education, data);
    });
    const editEducationMutation = useMutation((data: EducationValueProps) => {
        return axiosClient.patch(`${urls.profile.education}${id}/`, data);
    });

    return (
        <>
            <Modal.Root
                opened={opened}
                onClose={handleClose}
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
                    <Modal.Header
                        sx={{
                            padding: "24px 32px",
                        }}
                    >
                        <Modal.Title>
                            <h4>Add Education</h4>
                        </Modal.Title>
                        <Modal.CloseButton />
                    </Modal.Header>
                    <Modal.Body>
                        <Formik
                            initialValues={
                                currentEditEducation && isEditEducation === true
                                    ? {
                                          ...currentEditEducation,
                                          start_date: parseISO(
                                              currentEditEducation.start_date
                                          ),
                                          end_date: parseISO(
                                              currentEditEducation.end_date
                                          ),
                                      }
                                    : {
                                          school: "",
                                          description: "",
                                          degree: "",
                                          field_of_study: "",
                                          location: "",
                                          start_date: "",
                                          end_date: "",
                                          id: 0,
                                      }
                            }
                            validationSchema={educationFormSchema}
                            onSubmit={async (values) => {
                                const newValidatedValue = {
                                    ...values,
                                    start_date: format(
                                        new Date(values.start_date),
                                        "yyyy-MM-dd"
                                    ),
                                    end_date: format(
                                        new Date(values.end_date),
                                        "yyyy-MM-dd"
                                    ),
                                };
                                {
                                    currentEditEducation &&
                                    isEditEducation === true
                                        ? editEducationMutation.mutate(
                                              newValidatedValue,
                                              {
                                                  onSuccess: async () => {
                                                      setShowEducationForm(
                                                          false
                                                      );
                                                      queryClient.invalidateQueries(
                                                          ["profile-data"]
                                                      );
                                                      toast.success(
                                                          "Education detail updated successfully"
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
                                        : addEducationMutation.mutate(
                                              newValidatedValue,
                                              {
                                                  onSuccess: async () => {
                                                      setShowEducationForm(
                                                          false
                                                      );
                                                      queryClient.invalidateQueries(
                                                          ["profile-data"]
                                                      );
                                                      toast.success(
                                                          "Education detail updated successfully"
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
                                        id="school"
                                        name={"school"}
                                        label={"School"}
                                        placeholder="Eg: Boston University"
                                        touch={touched.school}
                                        error={errors.school}
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
                                        id="degree"
                                        name={"degree"}
                                        label={"Degree"}
                                        placeholder="Eg: Bachelor's"
                                        touch={touched.degree}
                                        error={errors.degree}
                                        withAsterisk
                                    />
                                    <InputField
                                        id="field_of_study"
                                        name={"field_of_study"}
                                        label={"Field of study"}
                                        placeholder="Eg: Business"
                                        touch={touched.field_of_study}
                                        error={errors.field_of_study}
                                        withAsterisk
                                    />
                                    <InputField
                                        id="location"
                                        name="location"
                                        label="Location"
                                        placeholder="Location"
                                        error={errors.location}
                                        touch={touched.location}
                                        withAsterisk
                                    />
                                    <DateField
                                        id="start_date"
                                        name="start_date"
                                        label="Start Date"
                                        placeholder="Select Start Date"
                                        error={errors.start_date as string}
                                        touch={touched.start_date as boolean}
                                        icon={<IconCalendarEvent size={20} />}
                                        onChange={(value) => {
                                            setFieldValue("start_date", value);
                                        }}
                                        withAsterisk
                                    />
                                    <DateField
                                        id="end_date"
                                        name="end_date"
                                        label="End Date"
                                        placeholder="Select End Date (or expected)"
                                        error={errors.end_date as string}
                                        touch={touched.end_date as boolean}
                                        icon={<IconCalendarEvent size={20} />}
                                        onChange={(value) => {
                                            setFieldValue("end_date", value);
                                        }}
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

export default AddEducationForm;
