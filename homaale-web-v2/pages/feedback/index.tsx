import { Box, Grid, Group, useMantineTheme } from "@mantine/core";
import {
    IconBrandFacebook,
    IconBrandInstagram,
    IconBrandTwitter,
    IconDeviceMobile,
    IconMapPin,
} from "@tabler/icons-react";
import { Form, Formik } from "formik";
import type { NextPage } from "next";
import Link from "next/link";

import Asterik from "@/components/common/Asterik";
import DescriptionField from "@/components/common/form/DescriptionField";
import FormButton from "@/components/common/form/FormButton";
import InputField from "@/components/common/form/InputField";
import PhoneNumberField from "@/components/common/form/PhoneNumberField";
import SelectField from "@/components/common/form/SelectField";
import { toast } from "@/components/common/Toast";
import Layout from "@/components/Layout/Layout";
import { useFeedback } from "@/hooks/feedback";
import { useFeedbackCategoryOption } from "@/hooks/useFeedbackCategoryOptions";
import { useFeedbackStyles } from "@/styles/pages/FeedbackStyles";
import { FeedbackFormData } from "@/utils/Feedback/FeedbackFormData";
import { isLoggedIn, isSubmittingClass } from "@/utils/helpers";
import feedbackFormSchema, {
    feedbackFormIsloggedInSchema,
} from "@/utils/validation/feedbackformvalidation";
import { useBrandData } from "@/brand/BrandContext";

const FeedbackPage: NextPage = () => {
    const theme = useMantineTheme();
    const { classes } = useFeedbackStyles();
    const { data: categoryItems = [] } = useFeedbackCategoryOption();
    const { mutate } = useFeedback();
    const{brandData}= useBrandData()
    return (
        <Layout heading="Feedback" currentTitle={"feedback"} breadCrumbsItems={[{name:"Help & Support",href:""}]}>
            <h4
                style={{
                    fontSize: "14px",
                    marginBottom: 15,
                    color:
                        theme.colorScheme === "dark"
                            ? theme.colors.homaaleSlate[4]
                            : theme.colors.gray[8],
                }}
            >
                Are you enjoying {brandData.name} ? Send us your Feedbacks
            </h4>

            <Grid>
                <Grid.Col md={6}>
                    <Formik
                        initialValues={FeedbackFormData}
                        validationSchema={
                            isLoggedIn()
                                ? feedbackFormIsloggedInSchema
                                : feedbackFormSchema
                        }
                        onSubmit={async (values, action) => {
                            mutate(values, {
                                onSuccess: async (data) => {
                                    toast.success(data?.message);
                                    action.resetForm();
                                },
                                onError: (error) => {
                                    toast.error(error?.message);
                                },
                            });
                        }}
                    >
                        {({ isSubmitting, errors, touched, setFieldValue }) => (
                            <Form className={classes.form}>
                                {!isLoggedIn() && (
                                    <>
                                        <h5>
                                            Full name
                                            <Asterik />
                                        </h5>
                                        <InputField
                                            type="text"
                                            style={{ marginBottom: "30px" }}
                                            name="full_name"
                                            placeholder="Full Name"
                                            error={errors.full_name}
                                            touch={touched.full_name}
                                        />
                                    </>
                                )}

                                <h5>
                                    Subject
                                    <Asterik />
                                </h5>
                                <SelectField
                                    id="subject"
                                    name={"subject"}
                                    placeholder="Select a subject_category"
                                    data={categoryItems}
                                    error={errors.subject}
                                    touch={touched.subject}
                                />
                                {!isLoggedIn() && (
                                    <>
                                        <h5>Email</h5>
                                        <InputField
                                            name="email"
                                            placeholder="email address"
                                            error={errors.email}
                                            touch={touched.email}
                                        />
                                    </>
                                )}
                                {!isLoggedIn() && (
                                    <>
                                        <h5>
                                            Contact number
                                            <Asterik />
                                        </h5>
                                        <PhoneNumberField
                                            name="phone"
                                            id="phone"
                                            placeHolder="Contact Number"
                                            error={errors.phone}
                                            touch={touched.phone}
                                            onChange={(value) =>
                                                setFieldValue("phone", value)
                                            }
                                        />
                                    </>
                                )}

                                <h5>
                                    Feedback
                                    <Asterik />
                                </h5>
                                <DescriptionField
                                    name={"description"}
                                    id="description"
                                    minRows={10}
                                    placeholder="If you have any additional feedback, please type it in here..."
                                    error={errors.description}
                                    touch={touched.description}
                                />
                                <FormButton
                                    className={classes.formbutton}
                                    fullWidth
                                    size="md"
                                    name={"Submit Feedback"}
                                    type={"submit"}
                                    id={"submit"}
                                    isSubmitting={isSubmitting}
                                    isSubmittingClass={isSubmittingClass(
                                        isSubmitting
                                    )}
                                />
                            </Form>
                        )}
                    </Formik>
                </Grid.Col>
                <Grid.Col md={5}>
                    <Box className={classes.address}>
                        <Group>
                            <IconMapPin
                                size={24}
                                color={theme.colors.socialicons[0]}
                            />
                            <h5>Dhobi Khola, Buddhanagar, Kathmandu, Nepal</h5>
                        </Group>
                        <Group>
                            <IconDeviceMobile
                                size={24}
                                color={theme.colors.socialicons[1]}
                            />
                            <h5>+977 9805674418</h5>
                        </Group>
                        <Group>
                            <Link
                                href="https://www.facebook.com/people/homaale/100086263383456/?mibextid=ZbWKwL"
                                target="_blank"
                            >
                                <IconBrandFacebook
                                    size={24}
                                    color={theme.colors.socialicons[2]}
                                />
                            </Link>
                            <Link
                                href="https://instagram.com/homaaleservices"
                                target="_blank"
                            >
                                <IconBrandInstagram
                                    size={24}
                                    color={theme.colors.socialicons[3]}
                                />
                            </Link>
                            <Link
                                href="https://twitter.com/homaaleservices"
                                target="_blank"
                            >
                                <IconBrandTwitter
                                    size={24}
                                    color={theme.colors.socialicons[4]}
                                />
                            </Link>
                            {/* <a
                                href="mailto:info@cagtu.com"
                                // target="_blank"
                                // rel="noreferrer"
                            >
                                <IconBrandGoogle
                                    size={18}
                                    color={theme.colors.socialicons[5]}
                                />
                            </a> */}
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.963097077884!2d85.32534497621334!3d27.68753542636364!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb1941e59e3d2f%3A0x9e7314875986661e!2sCagtu%20Nepal!5e0!3m2!1sen!2snp!4v1682828489095!5m2!1sen!2snp"
                                width={609}
                                height={387}
                                loading="lazy"
                                style={{ border: 0 }}
                            ></iframe>
                        </Group>
                    </Box>
                </Grid.Col>
            </Grid>
        </Layout>
    );
};

export default FeedbackPage;
