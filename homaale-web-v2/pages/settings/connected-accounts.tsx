import { createStyles, Flex } from "@mantine/core";
import React from "react";

import Layout from "@/components/Layout/Layout";
import ConnectAccount from "@/components/settings/ConnectAccount";
import urls from "@/constants/urls";
import { useData } from "@/hooks/useData";
import type { LinkedAccountProps } from "@/types/ConnectedAccpuntsProps";

const ConnectedAccounts = () => {
    const { classes } = useStyles();

    const { data: connectedAccounts } = useData<LinkedAccountProps>(
        ["connected-accounts"],
        urls.connectedAccounts
    );

    return (
        <Layout heading="Connected Accounts" currentTitle="Connected-accounts" breadCrumbsItems={[{name:"Settings",href:""}]}>
            <Flex justify={"start"} gap={30} className={classes.wrapper}>
                {connectedAccounts && connectedAccounts?.data.length > 1 ? (
                    connectedAccounts?.data.map((values) => (
                        <ConnectAccount
                            connected={true}
                            name={values?.provider.substring(
                                values?.provider.indexOf("-"),
                                0
                            )}
                            uid={values?.uid}
                            id={values?.id}
                            key={values?.id}
                            facebookName={values?.extra_data?.name}
                        />
                    ))
                ) : connectedAccounts?.data.length === 1 ? (
                    connectedAccounts?.data.map((values) =>
                        values.provider !== "google-oauth2" ? (
                            <>
                                <ConnectAccount
                                    connected={true}
                                    name={values?.provider.substring(
                                        values?.provider.indexOf("-"),
                                        0
                                    )}
                                    uid={values?.uid}
                                    id={values?.id}
                                    key={values?.id}
                                    facebookName={values?.extra_data?.name}
                                />
                                <ConnectAccount
                                    connected={false}
                                    name={"google"}
                                />
                            </>
                        ) : (
                            <>
                                <ConnectAccount
                                    connected={true}
                                    name={values?.provider.substring(
                                        values?.provider.indexOf("-"),
                                        0
                                    )}
                                    uid={values.uid}
                                    id={values.id}
                                    key={values.id}
                                    facebookName={values.extra_data.name}
                                />
                                <ConnectAccount
                                    connected={false}
                                    name={"Facebook"}
                                />
                            </>
                        )
                    )
                ) : (
                    <>
                        <ConnectAccount connected={false} name="google" />
                        <ConnectAccount connected={false} name="Facebook" />
                    </>
                )}
            </Flex>
        </Layout>
    );
};

export default ConnectedAccounts;

const useStyles = createStyles(() => ({
    wrapper: {
        flexWrap: "wrap",
    },
}));
