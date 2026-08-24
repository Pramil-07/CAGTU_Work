import { Button, Group, Modal, MultiSelect } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Form, Formik } from "formik";
import type { Dispatch, SetStateAction } from "react";
import { useEffect, useRef, useState } from "react";
import React from "react";

import urls from "@/constants/urls";
import { useProfile } from "@/hooks/useProfile";
import { useSkillsOptions } from "@/hooks/useSkillsOptions";
import { axiosClient } from "@/utils/axiosClient";

import { toast } from "../common/Toast";

interface SkillsProps {
    opened: boolean;
    handleClose: () => void;
    setShowSkillsForm: Dispatch<SetStateAction<boolean>>;
}

const AddSkillsForm = ({
    opened,
    handleClose,
    setShowSkillsForm,
}: SkillsProps) => {
    const { data: skillsOptions = [] } = useSkillsOptions();

    const queryClient = useQueryClient();

    const { data: profile } = useProfile();

    const { mutate: addSkillsMutation, isLoading } = useMutation(
        (data: any) => {
            return axiosClient.patch(urls.tasker.profile, data);
        }
    );
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const modalContentRef = useRef<HTMLDivElement>(null);

    const updateModalHeight = () => {
        if (modalContentRef.current && isDropdownOpen) {
            modalContentRef.current.style.height = "500px";
        } else if (modalContentRef.current) {
            modalContentRef.current.style.height = "300px";
        }
    };

    useEffect(() => {
        updateModalHeight();
    }, [isDropdownOpen]);

    const handleDropdownOpen = () => {
        setIsDropdownOpen(true);
    };

    const handleDropdownClose = () => {
        setIsDropdownOpen(false);
    };

    return (
        <>
            <Modal.Root
                opened={opened}
                onClose={handleClose}
                centered
                closeOnClickOutside={false}
                closeOnEscape={false}
                size={"lg"}
                padding={48}
                scrollAreaComponent={Modal.NativeScrollArea}
            >
                <Modal.Overlay
                    sx={(theme) => ({
                        opacity: 0.55,
                        blur: 3,
                        color:
                            theme.colorScheme === "dark"
                                ? theme.colors.dark[9]
                                : theme.colors.gray[4],
                    })}
                />
                <Modal.Content
                    ref={modalContentRef}
                    style={{
                        transition: "height 0.3s ease",
                        height: isDropdownOpen ? "500px" : "300px",
                    }}
                >
                    <Modal.Header>
                        <Modal.Title>Add Skills</Modal.Title>
                        <Modal.CloseButton />
                    </Modal.Header>
                    <Modal.Body>
                        <Formik
                            initialValues={{
                                skills: profile
                                    ? profile?.skills?.map((item) =>
                                          item.id.toString()
                                      )
                                    : [],
                            }}
                            onSubmit={async (values) => {
                                const skills = values.skills;
                                const stringifiedSkills =
                                    JSON.stringify(skills);
                                const dataToSend = {
                                    ...values,
                                    skill: stringifiedSkills,
                                };

                                addSkillsMutation(dataToSend, {
                                    onSuccess: async () => {
                                        setShowSkillsForm(false);
                                        queryClient.invalidateQueries([
                                            "profile-data",
                                        ]);
                                        toast.success(
                                            "Skills detail updated successfully"
                                        );
                                    },
                                    onError: async (error: any) => {
                                        toast.error(error.message);
                                    },
                                });
                            }}
                        >
                            {({
                                values,
                                touched,
                                errors,
                                setFieldValue,
                                setFieldTouched,
                            }) => (
                                <Form>
                                    <MultiSelect
                                        id="skills"
                                        data={skillsOptions}
                                        onDropdownOpen={handleDropdownOpen}
                                        onDropdownClose={handleDropdownClose}
                                        placeholder="Choose your skills"
                                        searchable
                                        name="skills"
                                        error={
                                            touched.skills && errors.skills
                                                ? (errors.skills as string)
                                                : null
                                        }
                                        onChange={(value) => {
                                            setFieldValue("skills", value);
                                        }}
                                        size="sm"
                                        value={values?.skills}
                                        onBlur={() => setFieldTouched("skills")}
                                        radius={8}
                                        dropdownPosition="bottom"
                                        mb={24}
                                    />

                                    <Group grow>
                                        <Button
                                            variant={"outline"}
                                            onClick={handleClose}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            loading={isLoading}
                                        >
                                            Submit
                                        </Button>
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

export default AddSkillsForm;
