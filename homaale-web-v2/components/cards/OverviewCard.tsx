import { Box, Card, Flex, Group } from "@mantine/core";
import {
  IconArrowNarrowDown,
  IconArrowNarrowUp,
  IconCircuitSwitchClosed,
  IconLoader,
  IconPlus,
} from "@tabler/icons-react";

import { useOverviewCardStyles } from "@/styles/components/OverviewCardStyles";

export const OverviewCard = () => {
  const { classes } = useOverviewCardStyles();
  return (
    <Card className={classes.card}>
      <Box className={classes.box}>
        <Group position="apart" className={classes.group}>
          <Box className={classes.firstbox}>
            <p className={classes.firsttext}>$10.00 USD</p>
            <p className={classes.secondtext}>Current Balance</p>
          </Box>
          <Box className={classes.secondbox}>
            <Flex gap={16}>
              <p>0.52 USD</p>
              <IconArrowNarrowUp size={24} color={"#40bf46"} />
            </Flex>
            <Flex mt="16px" gap={16}>
              <p>0.52 USD</p>
              <IconArrowNarrowDown size={24} color={"#bf4040"} />
            </Flex>
          </Box>
        </Group>
        <Flex className={classes.lowerflex} gap={106} >
          <Flex gap={8}>
            {" "}
            <IconPlus size={18} color={"#0693E3"} />
            <p>Load a Balance</p>
          </Flex>
          <Flex gap={8}>
            {" "}
            <IconCircuitSwitchClosed size={18} color={"#0693E3"} />
            <p>Withdraw Fund</p>
          </Flex>
          <Flex gap={8}>
            {" "}
            <IconLoader size={18} color={"#0693E3"} />
            <p>Make Payment</p>
          </Flex>
        </Flex>
      </Box>
    </Card>
  );
};
