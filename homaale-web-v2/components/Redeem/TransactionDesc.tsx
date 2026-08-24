import { Box } from "@mantine/core";
import { IconAward } from "@tabler/icons-react";

import { useTransactionDescStyles } from "@/styles/components/TranssactionDescStyles";
export interface TransactionProps {
    desc: string;
    color: string;
    reward_points: number | null | undefined;
}
const TransactionDesc = ({ desc, color, reward_points }: TransactionProps) => {
    const { classes } = useTransactionDescStyles();
    return (
        <Box className={classes.root}>
            <IconAward size={32} color={color} />
            <div className="desc_wrapper">
                <h2 style={{ color: color }}>{reward_points}.00</h2>
                <h4>{desc}</h4>
            </div>
        </Box>
    );
};
export default TransactionDesc;
