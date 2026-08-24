import {
    Box,
    Button,
    Flex,
    Group,
    LoadingOverlay,
    Modal,
    Text,
} from "@mantine/core";
import { IconCircleX, IconTrash } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Form, Formik } from "formik";
import { useState } from "react";

import urls from "@/constants/urls";
import { useSecurityAnswers } from "@/hooks/useSecurityAnswers";
import { useSecurityQuestion } from "@/hooks/useSecurityQuestions";
import { axiosClient } from "@/utils/axiosClient";
import { securityQuestionSchema } from "@/utils/validation/SecurityQuestionsValidation";

import FormButton from "../common/form/FormButton";
import InputField from "../common/form/InputField";
import SelectField from "../common/form/SelectField";
import HomaaleLoader from "../common/HomaaleLoader";
import { toast } from "../common/Toast";

export interface answerPayload {
    answer: string;
    question: string;
}

const SecurityQuestions = () => {
    const [opened, setOpened] = useState(false);
    const [deleteId, setDeleteId] = useState<number>();
    const [questionHovered, setQuestionHovered] = useState<null | number>();

    const queryClient = useQueryClient();

    const { data: securityQuestions = [] } = useSecurityQuestion();

    const { mutate: submitSecurityAnswer, isLoading: isSubmitting } =
        useMutation((data: answerPayload) => {
            return axiosClient.post(urls.tasker.securityAnswer, data);
        });

    const { data: securityAnswers } = useSecurityAnswers();

    const { mutate: deleteMutation, isLoading } = useMutation(
        (id: number | undefined) => {
            return axiosClient.delete(`${urls.auth.securityAnswer}${id}`);
        }
    );

    return (
        <>
            <LoadingOverlay
                loader={<HomaaleLoader />}
                visible={isLoading || isSubmitting}
                sx={{ position: "fixed", inset: 0 }}
            />
            <Formik
                initialValues={{
                    question: "",
                    answer: "",
                }}
                validationSchema={securityQuestionSchema}
                onSubmit={async (values, actions) => {
                    submitSecurityAnswer(values, {
                        onSuccess: () => {
                            toast.success("Security questions Answered");
                            queryClient.invalidateQueries(["security-answers"]);
                            actions.resetForm();
                        },
                        onError: (error: any) => {
                            const { non_field_errors } = error.response.data;
                            actions.setFieldError(
                                "question",
                                non_field_errors && non_field_errors[0]
                            );
                        },
                    });
                }}
            >
                {({ isSubmitting, resetForm, touched, errors }) => (
                    <Form autoComplete="off">
                        <Box sx={{ maxWidth: 600 }}>
                            <SelectField
                                id="question"
                                name={"question"}
                                label={"Category"}
                                placeholder="Select a category"
                                data={securityQuestions}
                                touch={touched.question}
                                error={errors.question}
                                withAsterisk
                            />
                            <InputField
                                id="answer"
                                name={"answer"}
                                label={"Answer"}
                                placeholder="Answer"
                                touch={touched.answer}
                                error={errors.answer}
                                data-autofocus
                                withAsterisk
                            />

                            <Group>
                                <Button
                                    id="cancel-security-question"
                                    variant="outline"
                                    onClick={() => resetForm}
                                >
                                    Cancel
                                </Button>
                                <FormButton
                                    id="submit-answer"
                                    type="submit"
                                    name="Answer"
                                    className="submit-btn"
                                    isSubmitting={isSubmitting}
                                />
                            </Group>
                        </Box>
                    </Form>
                )}
            </Formik>
            {securityAnswers && securityAnswers.length > 0 && (
                <Box mt={16}>
                    <h4>Questions you have answered:</h4>
                    {securityAnswers?.map((item, index) => {
                        return (
                            <>
                                <Flex
                                    onMouseEnter={() =>
                                        setQuestionHovered(item?.question?.id)
                                    }
                                    onMouseLeave={() =>
                                        setQuestionHovered(null)
                                    }
                                    justify={"start"}
                                    align={"flex-start"}
                                    w={"100%"}
                                >
                                    <Text
                                        component="p"
                                        key={index}
                                        mb={8}
                                        mr={8}
                                        color={"gray.7"}
                                        sx={{
                                            cursor: "default",
                                        }}
                                    >
                                        {`${index + 1}. ${" "}`}
                                        {item?.question?.question}
                                    </Text>

                                    {questionHovered === item?.question?.id && (
                                        <IconTrash
                                            size={18}
                                            color="red"
                                            style={{
                                                cursor: "pointer",
                                            }}
                                            onClick={() => {
                                                setOpened(true);
                                                setDeleteId(item?.question?.id);
                                            }}
                                        />
                                    )}
                                </Flex>
                            </>
                        );
                    })}
                </Box>
            )}

            <Modal
                opened={opened}
                onClose={() => setOpened(false)}
                centered
                withCloseButton={false}
                closeOnClickOutside={false}
                overlayProps={{
                    opacity: 0.55,
                    blur: 3,
                }}
                size="md"
                className="delete-modal"
                padding={24}
            >
                <Flex align={"center"} justify={"center"} direction={"column"}>
                    <div className="icon-block">
                        <IconCircleX size={48} color="red" />
                    </div>
                    <Text
                        sx={{
                            fontSize: 24,
                            fontWeight: 400,
                            marginBottom: 16,
                        }}
                    >
                        Are you sure?
                    </Text>
                    <Text
                        component="p"
                        sx={{
                            textAlign: "center",
                            color: "gray",
                        }}
                        mb={36}
                    >
                        Do you really want to delete this record? This process
                        cannot be undone.
                    </Text>
                    <Group>
                        <Button
                            color={"gray.5"}
                            onClick={() => setOpened(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            color={"red.6"}
                            onClick={() => {
                                deleteMutation(deleteId, {
                                    onSuccess: () => {
                                        toast.success(
                                            "Security question deleted successfully."
                                        );
                                        queryClient.invalidateQueries([
                                            "security-answers",
                                        ]);
                                        setOpened(false);
                                    },
                                    onError: (error: any) => {
                                        toast.error(error?.response?.message);
                                    },
                                });
                            }}
                        >
                            Delete
                        </Button>
                    </Group>
                </Flex>
            </Modal>
        </>
    );
};

export default SecurityQuestions;
