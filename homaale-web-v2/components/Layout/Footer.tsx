import { Box, Container, Grid } from "@mantine/core";
import {
    IconBrandFacebook,
    IconBrandInstagram,
    IconBrandTiktok,
    IconBrandTwitter,
    IconBrandYoutube,
} from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { Form, Formik } from "formik";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import * as Yup from "yup";

import { useFooterStyles } from "@/styles/components/FooterStyles";
import { axiosClient } from "@/utils/axiosClient";
import { getCurrentYear } from "@/utils/helpers";
import { emailValidationSchema } from "@/utils/validation/GlobalValidations";

import FormButton from "../common/form/FormButton";
import InputField from "../common/form/InputField";
import { toast } from "../common/Toast";
import {useProfile} from "@/hooks/useProfile";
import { BsTwitterX } from "react-icons/bs";
import { useBrand } from "@/hooks/useBrand";
import { useBrandData } from "@/brand/BrandContext";
import { useUserStatus } from "@/hooks/useUserStatus";
import router from "next/router";

export const Footer = () => {


    const {checkStatus} = useUserStatus();
    const { classes } = useFooterStyles();
    const emailSubscription = useMutation((data) =>
        axiosClient.post("/support/newsletter/subscribe/", data)
    );

    const onSubscribeEmail = (data: any, actions: any) => {
        emailSubscription.mutate(data, {
            onSuccess: (data) => {
                if (data?.data?.status === "failure") {
                    toast.error(data?.data?.message);
                } else {
                    toast.success(data?.data?.message);
                    actions.resetForm();
                }
            },
            onError: (error: any) => {
                toast.error(error?.response?.data?.email[0]);
                actions.resetForm();
            },
        });
    };

    const merchantRoute = () => {
        if (!checkStatus("profile")) {
            return;
        }
        router.push(`/merchant/profile`);
    };

    const brand = useBrand()
    const { brandData } = useBrandData();

    return (
        <footer id="site-footer" className={classes.footer}>
            <Container size={"xl"}>
                {/* Cipher Footer navigation start */}
                <div className="footer__main">
                    <Grid gutter={30}>
                        <Grid.Col md={6}>
                            <div className="footer__main--block">
                            {

                            <Image
                                src={brandData.assets.footerLogo}

                                alt={"homaale-logo"}
                                width={117}
                                priority
                                height={28}
                            />
                            }

                                <p>
                                    {brandData.name} is a platform designed to provide
                                    service booking solutions to the service
                                    seekers and business opportunities to
                                    various service providing companies by
                                    bridging a gap between them. It covers a
                                    wide range of services from various
                                    industries like Accounting, Gardening,
                                    Health, Beauty, and many more.
                                </p>
                            </div>
                        </Grid.Col>
                        <Grid.Col md={2}>
                            <ul>
                                <h4>Company</h4>
                                <li>
                                    <Link href="/about-us">About Us</Link>
                                </li>
                                <li>
                                    <Link href="/career">Career</Link>
                                </li>
                                <li>
                                    <Link href="/contact-us">Contact Us</Link>
                                </li>
                                <li>
                                    <Link href="/feedback">Feedback</Link>
                                </li>
                            </ul>
                        </Grid.Col>
                        <Grid.Col md={2}>
                            <ul>
                                <h4>Resources</h4>
                                <li>
                                    <Link href="/clients">For Client</Link>
                                </li>
                                <li>
                                    <text className={`text-white ${brand === "cagtu" ? "hover:text-blue-300" : "hover:text-orange-300"} cursor-pointer`}  onClick={merchantRoute}>


                                        For Merchant

                                    </text >
                                </li>
                                <li>
                                    <Link href="/FAQs">FAQs</Link>
                                </li>
                                <li>
                                    <Link href="/blogs">Blogs</Link>
                                </li>
                            </ul>
                        </Grid.Col>
                        <Grid.Col md={2}>
                            <ul>
                                <h4>Legals</h4>
                                <li>
                                    <Link href="/homaale-terms-conditions">
                                        Terms and Conditions
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/homaale-privacy-policy">
                                        Privacy Policy
                                    </Link>
                                </li>
                                {/* <li>
                                    <Link href="/help">Help Center</Link>
                                </li> */}
                                {/* <li>
                                    <Link href="/support">Support</Link>
                                </li> */}
                                <li>
                                    <Link href="/data-deletion-policy">
                                        Data Deletion Policy
                                    </Link>
                                </li>
                            </ul>
                        </Grid.Col>
                    </Grid>
                </div>
                {/* Cipher Footer navigation end */}

                {/* Cipher footer newsletter section start */}
                <div className="footer__newletter">
                    <Grid align={"center"}>
                        <Grid.Col md={6}>
                            <h2>Sign up to our newsletter</h2>
                            <Formik
                                initialValues={{ email: "" }}
                                validationSchema={Yup.object().shape({
                                    email: emailValidationSchema,
                                })}
                                onSubmit={async (values, actions) => {
                                    onSubscribeEmail(values, actions);
                                }}
                            >
                                {({ isSubmitting, errors, touched }) => (
                                    <Form>
                                        <InputField
                                            type="email"
                                            name="email"
                                            error={errors.email}
                                            touch={touched.email}
                                            placeholder="Your email address"
                                        />
                                        <FormButton
                                            type="submit"
                                            size={"md"}
                                            disabled={isSubmitting}
                                            name={"Subscribe"}
                                            id={"newsletter-btn"}
                                            style={{
                                                background: "white",
                                                color: "#0F172A",
                                            }}
                                        />
                                    </Form>
                                )}
                            </Formik>
                        </Grid.Col>
                        <Grid.Col md={6}>
                            <Box className="footer__end--mobile">
                                <Image
                                    src={"/svgs/app_store.svg"}
                                    alt={"app_store-logo"}
                                    width={196}
                                    height={60}
                                />

                                <Image
                                    src={"/svgs/google_play.svg"}
                                    alt={"google_play-logo"}
                                    width={196}
                                    height={60}
                                />
                            </Box>
                        </Grid.Col>
                    </Grid>
                </div>

                {/* Cipher footer newsletter section end */}

                {/* Cipher footer end section start */}
                <div className="footer__end">
                    <Grid>
                        <Grid.Col md={6}>
                            <p className="footer__end--copyright">
                                © {getCurrentYear()} {brandData.name}®. All Rights
                                Reserved
                            </p>
                        </Grid.Col>
                        <Grid.Col md={6}>
                            <Box className="footer__end--social">
                                <Link
                                    href="https://twitter.com/homaaleservices"
                                    target={"_blank"}
                                >
                                   <p className="text-white mt-1"> <BsTwitterX size={20} /> </p>
                                </Link>
                                <Link
                                    href="https://www.tiktok.com/@homaaleservices"
                                    target={"_blank"}
                                >
                                    <IconBrandTiktok />
                                </Link>
                                <Link
                                    href="https://www.youtube.com/@Homaale"
                                    target={"_blank"}
                                >
                                    <IconBrandYoutube />
                                </Link>
                                <Link
                                    href="https://www.instagram.com/homaaleservices/"
                                    target={"_blank"}
                                >
                                    <IconBrandInstagram />
                                </Link>
                                <Link
                                    href="https://www.facebook.com/profile.php?id=100086263383456"
                                    target={"_blank"}
                                >
                                    <IconBrandFacebook />
                                </Link>
                            </Box>
                        </Grid.Col>
                    </Grid>
                </div>
                {/* Cipher footer social links section end */}
            </Container>
        </footer>
    );
};
