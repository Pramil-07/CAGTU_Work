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
import { toast } from "@/components/common/Toast";
import Layout from "@/components/Layout/Layout";
import { useContact } from "@/hooks/contactus";
import { useContactUsStyles } from "@/styles/pages/ContactUsStyles";
import { isSubmittingClass } from "@/utils/helpers";
import { ContactFormData } from "@/utils/PostTask/ContactFormData";
import contactFormSchema from "@/utils/validation/ContactFormValidation";

const ContactUs: NextPage = () => {
    const theme = useMantineTheme();
    const { classes } = useContactUsStyles();
    const { mutate } = useContact();
    return (
        <Layout heading="Contact Us" currentTitle={"Contact-us"} breadCrumbsItems={[{name:"Help & Support",href:""}]}>
            <Grid className={classes.contactwrapper}>
                <Grid.Col md={6}>
                    <Formik
                        initialValues={ContactFormData}
                        validationSchema={contactFormSchema}
                        onSubmit={async (values, action) => {
                            mutate(values, {
                                onSuccess: async (data) => {
                                    toast.success(data.message);
                                    action.resetForm();
                                },
                                onError: (error: any) => {
                                    const { full_name, email, message } =
                                        error.response.data;
                                    action.setFieldError(
                                        "full_name",
                                        full_name && full_name[0]
                                    );
                                    action.setFieldError(
                                        "email",
                                        email && email[0]
                                    );
                                    action.setFieldError(
                                        "message",
                                        message && message[0]
                                    );
                                },
                            });
                        }}
                    >
                        {({ isSubmitting, errors, touched }) => (
                            <Form className={classes.form}>
                                <h4>Leave us a message</h4>
                                <h5>
                                    Full Name
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
                                <h5>
                                    Email
                                    <Asterik />
                                </h5>
                                <InputField
                                    name="email"
                                    placeholder="email address"
                                    error={errors.email}
                                    touch={touched.email}
                                />
                                <h5>
                                    Message
                                    <Asterik />
                                </h5>
                                <DescriptionField
                                    name={"message"}
                                    id="message"
                                    minRows={10}
                                    placeholder="Message here"
                                    error={errors.message}
                                    touch={touched.message}
                                />
                                <FormButton
                                    className={classes.formbutton}
                                    fullWidth
                                    size="md"
                                    name={"Send"}
                                    type={"submit"}
                                    id={"contact-us-save-form"}
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
                    <Box className={classes.leftbox}>
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
                            {/* <Link href="mailto:info@cagtu.com">
                                <Image
                                    alt="image-google-logo"
                                    src="/images/google-logo.png"
                                    height={20}
                                    width={20}
                                    style={{ marginTop: -9 }}
                                />
                            </Link> */}
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

export default ContactUs;
