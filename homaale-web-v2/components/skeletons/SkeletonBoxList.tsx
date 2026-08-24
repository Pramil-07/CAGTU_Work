import { Table, Skeleton } from "@mantine/core";
import { useBoxStyles } from "@/styles/pages/BoxStyles";

const SkeletonBoxList = () => {
    const { classes } = useBoxStyles();
    return (
        <Table withBorder withColumnBorders>
            <tbody>
            {Array.from({ length: 2 }).map((_, key) => (
                <tr key={key}>
                    <td><Skeleton height={20} width={20} /></td>
                    <td><Skeleton height={20} width="80%" /></td>
                    <td><Skeleton height={20} width="60%" /></td>
                    <td><Skeleton height={20} width="60%" /></td>
                    <td><Skeleton height={20} width="60%" /></td>
                    <td><Skeleton height={20} width="40%" /></td>
                    <td><Skeleton height={20} width="40%" /></td>
                </tr>
            ))}
            </tbody>
        </Table>
    );
};

export default SkeletonBoxList;
