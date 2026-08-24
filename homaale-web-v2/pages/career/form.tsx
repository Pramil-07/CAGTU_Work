import { Flex } from "@mantine/core";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";

import DescriptionField from "@/components/common/form/DescriptionField";
import FileInputField from "@/components/common/form/FileInputField";
import FormButton from "@/components/common/form/FormButton";
import InputField from "@/components/common/form/InputField";
import PhoneNumberField from "@/components/common/form/PhoneNumberField";
import { toast } from "@/components/common/Toast";
import Layout from "@/components/Layout/Layout";
import { useForm } from "@/hooks/useform";
import { useCareerFormStyles } from "@/styles/components/CareerFormStyles";
import { CarrerFormData } from "@/utils/career/careerinitialdata";
import { isSubmittingClass } from "@/utils/helpers";
import { carrerApplyFormValidation } from "@/utils/validation/CarrerApplyFormValidation";

const Apply = () => {
    const router = useRouter();
    const { id, name } = router.query;
    const { mutate } = useForm(`/career/candidate/apply/${id}/`);
    const { classes } = useCareerFormStyles();
    return (
        <Layout
            title="Apply Application"
            breadCrumbsItems={[
                { name: "career", href: "/career" },
                { name: name as string, href: `/career/${id}` },
            ]}
            currentTitle={"form"}
        >
            <h4
                style={{
                    borderBottom: "1px solid lightgray",
                    paddingBottom: 16,
                }}
            >
                Apply Application
            </h4>
            <Formik
                initialValues={CarrerFormData}
                validationSchema={carrerApplyFormValidation}
                onSubmit={async (values, action) => {
                    const formData = new FormData();
                    Object.entries(values).forEach((entry) => {
                        const [key, value] = entry;
                        formData.append(key, value);
                    });
                    values.cv.forEach((file) => formData.append("cv", file));

                    delete values.imagePreviewUrl;

                    mutate(formData, {
                        onSuccess: async () => {
                            toast.success("Applied Successfully!");
                            await router.push("/career");
                        },
                        onError: (error: any) => {
                            toast.error(error.message);
                        },
                    });
                    action.resetForm();
                }}
            >
                {({
                    errors,
                    touched,
                    isSubmitting,
                    setFieldValue,
                    values,
                    setFieldTouched,
                }) => (
                    <Flex>
                        <Form className={classes.root}>
                            <InputField
                                name="full_name"
                                type={"text"}
                                placeholder="Enter your full name here"
                                label="Full Name"
                                withAsterisk
                                error={errors.full_name}
                                touch={touched.full_name}
                            />
                            <InputField
                                name="email"
                                type="email"
                                placeholder="Enter your email address here"
                                label="Email"
                                withAsterisk
                                error={errors.email}
                                touch={touched.email}
                            />
                            <PhoneNumberField
                                labelName="Phone Number"
                                name={"phone"}
                                placeholder="Enter your number here"
                                onChange={(value) =>
                                    setFieldValue("phone", value)
                                }
                                touch={touched.phone}
                                error={errors.phone}
                                min={10}
                                fieldRequired
                            />

                            <InputField
                                name="current_company"
                                type="text"
                                placeHolder="Enter your current/previous company name"
                                label="Current Company"
                                error={errors.current_company}
                                touch={touched.current_company}
                            />
                            <InputField
                                type="text"
                                label="Work Experience"
                                name="experience"
                                labelName="Work Experience"
                                error={errors.experience}
                                touch={touched.experience}
                                placeHolder="Enter you work experience in years"
                                withAsterisk
                            />
                            <InputField
                                name="portfolio_link"
                                placeholder="Enter you portfolio or website link here"
                                label="Portfolio Link"
                                withAsterisk
                                error={errors.portfolio_link}
                                touch={touched.portfolio_link}
                            />
                            <FileInputField
                                fieldRequired
                                name="cv"
                                error={errors.cv as string}
                                touch={touched.cv as boolean}
                                placeHolder="Attach Resume/CV"
                                labelName="Resume/CV"
                                handleChange={(e) => {
                                    setFieldValue(
                                        "cv",
                                        Array.from(e.target.files)
                                    );

                                    const arrFiles = Array.from(e.target.files);
                                    const multipleFiles = arrFiles.map(
                                        (file: any, index: number) => {
                                            const src =
                                                window.URL.createObjectURL(
                                                    file
                                                );
                                            return {
                                                file,
                                                id: index,
                                                src,
                                            };
                                        }
                                    );

                                    setFieldValue(
                                        "imagePreviewUrl",
                                        multipleFiles
                                    );
                                }}
                                fileName={
                                    values.imagePreviewUrl &&
                                    values.imagePreviewUrl.map(
                                        (value: any) => value?.file?.name
                                    )
                                }
                                onBlur={() => {
                                    setFieldTouched("cv", true);
                                }}
                            />
                            <DescriptionField
                                name="cover_letter"
                                placeHolder="Add a cover letter or anything you want to share here."
                                label="Additional Information"
                                touch={touched.cover_letter}
                                error={errors.cover_letter}
                            />
                            <Flex>
                                <FormButton
                                    name={"Apply Now"}
                                    id={"apply_form_Btn"}
                                    type="submit"
                                    className="formBtn"
                                    isSubmitting={isSubmitting}
                                    isSubmittingClass={isSubmittingClass(
                                        isSubmitting
                                    )}
                                >
                                    Apply Now
                                </FormButton>
                            </Flex>
                        </Form>
                    </Flex>
                )}
            </Formik>
        </Layout>
    );
};
export default Apply;
