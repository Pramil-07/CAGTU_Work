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
import type { ExperienceValueProps } from "@/types/profile/AddExpProps";
import type { ProfileResponseProps } from "@/types/ProfileResponseProps";
import { axiosClient } from "@/utils/axiosClient";
import { experienceFormSchema } from "@/utils/validation/profile/ExperienceFormValidation";

import DateField from "../common/form/DateField";
import DescriptionField from "../common/form/DescriptionField";
import InputField from "../common/form/InputField";
import SelectField from "../common/form/SelectField";
import { toast } from "../common/Toast";

interface ExperienceProps {
    opened: boolean;
    handleClose: () => void;
    setShowExpForm: Dispatch<SetStateAction<boolean>>;
    id?: number;
    isEditExp?: boolean;
}

const employmentTypeOptions = [
    { id: 1, label: "Part Time", value: "Part Time" },
    { id: 2, label: "Full Time", value: "Full Time" },
];

const AddExperienceForm = ({
    opened,
    handleClose,
    setShowExpForm,
    id,
    isEditExp,
}: ExperienceProps) => {
    const [toggle, setToggled] = useState(false);
    const theme = useMantineTheme();

    const { data: profile } = useProfile();

    const currentEditExp: ExperienceValueProps = profile?.experience?.find(
        (item) => item.id === id
    ) as ProfileResponseProps["experience"][0];

    const queryClient = useQueryClient();

    const addExpMutation = useMutation((data: ExperienceValueProps) => {
        return axiosClient.post(urls.profile.experience, data);
    });
    const editExpMutation = useMutation((data: ExperienceValueProps) => {
        return axiosClient.patch(`${urls.profile.experience}${id}/`, data);
    });

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
                            <h4>Add Experience</h4>
                        </Modal.Title>
                        <Modal.CloseButton />
                    </Modal.Header>
                    <Modal.Body>
                        <Formik
                            initialValues={
                                currentEditExp && isEditExp === true
                                    ? {
                                          ...currentEditExp,
                                          start_date: parseISO(
                                              currentEditExp.start_date
                                          ),

                                          end_date: currentEditExp.end_date
                                              ? parseISO(
                                                    currentEditExp.end_date
                                                )
                                              : "",
                                      }
                                    : {
                                          title: "",
                                          description: "",
                                          employment_type: "Full Time",
                                          company_name: "",
                                          location: "",
                                          start_date: "",
                                          end_date: "",
                                          currently_working: false,
                                          id: 0,
                                      }
                            }
                            validationSchema={experienceFormSchema}
                            onSubmit={async (values) => {
                                let newValue;
                                if (!values.end_date) {
                                    const withoutEndDate = {
                                        ...values,
                                        start_date: format(
                                            new Date(values.start_date),
                                            "yyyy-MM-dd"
                                        ),
                                        end_date: null,
                                    };
                                    newValue = withoutEndDate;
                                } else {
                                    const newvalidatedValue = {
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
                                    newValue = newvalidatedValue;
                                }

                                {
                                    currentEditExp && isEditExp
                                        ? editExpMutation.mutate(newValue, {
                                              onSuccess: async () => {
                                                  setShowExpForm(false);
                                                  queryClient.invalidateQueries(
                                                      ["profile-data"]
                                                  );
                                                  toast.success(
                                                      "Experience detail updated successfully"
                                                  );
                                              },
                                              onError: async (error: any) => {
                                                  toast.error(error.message);
                                              },
                                          })
                                        : addExpMutation.mutate(newValue, {
                                              onSuccess: async () => {
                                                  setShowExpForm(false);
                                                  queryClient.invalidateQueries(
                                                      ["profile-data"]
                                                  );
                                                  toast.success(
                                                      "Experience detail added successfully"
                                                  );
                                              },
                                              onError: async (error: any) => {
                                                  toast.error(error.message);
                                              },
                                          });
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
                                        id="title"
                                        name={"title"}
                                        label={"Title"}
                                        placeholder="Experience title"
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
                                    <SelectField
                                        id="employment_type"
                                        name={"employment_type"}
                                        label={"Category"}
                                        placeholder="Select a category"
                                        data={employmentTypeOptions}
                                        touch={touched.employment_type}
                                        error={errors.employment_type}
                                        withAsterisk
                                    />
                                    <InputField
                                        id="company"
                                        name={"company_name"}
                                        label={"Company"}
                                        placeholder="Company Name"
                                        touch={touched.company_name}
                                        error={errors.company_name}
                                        withAsterisk
                                    />
                                    <InputField
                                        id="location"
                                        name="location"
                                        label="Location"
                                        placeholder="Company Location"
                                        error={errors.location}
                                        touch={touched.location}
                                        withAsterisk
                                    />
                                    <Checkbox
                                        mt={-12}
                                        mb={24}
                                        size={"xs"}
                                        defaultChecked={toggle}
                                        label="I am currently working here"
                                        {...getFieldProps("currently_working")}
                                        onChange={(event) => {
                                            setToggled(!toggle);

                                            setFieldValue(
                                                "currently_working",
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
                                        id="start_date"
                                        name="start_date"
                                        label="Start Date"
                                        placeholder="Select Start Date"
                                        error={errors.start_date as string}
                                        touch={touched.start_date as boolean}
                                        icon={<IconCalendarEvent size={20} />}
                                        maxDate={new Date()}
                                        onChange={(value) => {
                                            setFieldValue("start_date", value);
                                        }}
                                        withAsterisk
                                    />
                                    <DateField
                                        id="end_date"
                                        name="end_date"
                                        label="End Date"
                                        placeholder="Select End Date"
                                        error={errors.end_date as string}
                                        touch={touched.end_date as boolean}
                                        icon={<IconCalendarEvent size={20} />}
                                        maxDate={new Date()}
                                        onChange={(value) => {
                                            setFieldValue("end_date", value);
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

export default AddExperienceForm;
