import { Box, Grid } from "@mantine/core";
import React, { useState } from "react";

import Layout from "@/components/Layout/Layout";
import { AddPayAccount } from "@/components/payment/AddPayAccount";
import { PayTransferForm } from "@/components/payment/PayTransferForm";
import { useBankWallet } from "@/hooks/useBankWallet";
import { useWithdrawStyles } from "@/styles/pages/WithdrawStyles";

const Withdraw = () => {
    const { classes } = useWithdrawStyles();

    const { data } = useBankWallet();

    const [bankId, setbankId] = useState<number | null>(null);

    const selectedBank = data?.result?.find((item) => item.id === bankId);
    // if (!data) return <div>Loading bank data...</div>;

    return (
        <Layout heading="Withdraw Fund" currentTitle="withdraw" breadCrumbsItems={[{name:"Payment",href:""}]}>
            <Box
                component="section"
                id="withdraw-section"
                className={classes.root}
            >
                <Grid>
                    {data&& (
                        <Grid.Col lg={6}>
                            <AddPayAccount
                                bankId={bankId}
                                setbankId={setbankId}
                                data={data}
                            />
                        </Grid.Col>
                    )}

                    <Grid.Col lg={6}>
                        <PayTransferForm
                            bankId={bankId||0}
                             selectedBank={selectedBank||undefined}
                        />
                    </Grid.Col>
                </Grid>
            </Box>
        </Layout>
    );
};

export default Withdraw;
