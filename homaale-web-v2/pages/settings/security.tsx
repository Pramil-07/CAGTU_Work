import { Accordion, Text } from "@mantine/core";
import Link from "next/link";

import Layout from "@/components/Layout/Layout";
import AddEmail from "@/components/securityPage/AddEmail";
import AddPhone from "@/components/securityPage/AddPhone";
import ChangePassword from "@/components/securityPage/ChangePassword";
import SecurityQuestions from "@/components/securityPage/SecurityQuestions";
import { useUser } from "@/hooks/useUser";
import { useSecuritySettingStyles } from "@/styles/pages/SecuritySettingStyles";
import { useBrandData } from "@/brand/BrandContext";

const Security = () => {
    const { classes } = useSecuritySettingStyles();
    const { data: userData } = useUser();
    const {brandData} = useBrandData();

    return (
        <Layout heading="Password & Security" currentTitle="Security & Settings" breadCrumbsItems={[{name:"Settings",href:""}]}>
            <Accordion
                defaultValue={"change-password"}
                className={classes.wrapper}
            >
                <Accordion.Item value="change-password">
                    <Accordion.Control>
                        <h4>Password</h4>
                        <p>
                            You will be asked to enter the password before
                            logging into {brandData.name}
                        </p>
                    </Accordion.Control>
                    <Accordion.Panel>
                        <ChangePassword />
                    </Accordion.Panel>
                </Accordion.Item>

                <Accordion.Item value="add-phone">
                    <Accordion.Control>
                        <h4>
                            {userData?.phone === null
                                ? "Add phone number"
                                : "Update phone number"}
                        </h4>
                        <p>
                            Keep your phone number updated for security reasons.
                        </p>
                    </Accordion.Control>
                    <Accordion.Panel>
                        <AddPhone />
                    </Accordion.Panel>
                </Accordion.Item>

                <Accordion.Item value="update-email">
                    <Accordion.Control>
                        <h4>
                            {userData?.email === ""
                                ? "Add email"
                                : "Update email"}
                        </h4>
                        <p>Keep your email updated for security reasons.</p>
                    </Accordion.Control>
                    <Accordion.Panel>
                        <AddEmail />
                    </Accordion.Panel>
                </Accordion.Item>

                <Accordion.Item value="sequrity-questions">
                    <Accordion.Control>
                        <h4>Security Questions</h4>
                        <p>Add security questions to keep your account safe</p>
                    </Accordion.Control>
                    <Accordion.Panel>
                        <SecurityQuestions />
                    </Accordion.Panel>
                </Accordion.Item>
            </Accordion>
            <Link href={"/settings/deactivate"}>
                <Text
                    sx={{
                        margin: "16px 0 16px 20px",
                        cursor: "pointer",
                    }}
                >
                    Deactivate Account?
                </Text>
            </Link>
        </Layout>
    );
};

export default Security;
