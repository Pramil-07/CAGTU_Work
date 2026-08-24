import { Skeleton, Table } from "@mantine/core";

export const SkeletonTableList = () => {
    return (
        <Table verticalSpacing={12}>
            <thead>
                <tr>
                    {Array.from({ length: 7 }).map((_, index) => (
                        <th key={index}>
                            <Skeleton height={8} radius={4} />
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {Array.from({ length: 10 }).map((_, index) => (
                    <tr key={index}>
                        <td>
                            <Skeleton height={8} radius={4} />
                        </td>
                        <td>
                            <Skeleton height={8} radius={4} />
                        </td>
                        <td>
                            <Skeleton height={8} radius={4} />
                        </td>
                        <td>
                            <Skeleton height={8} radius={4} />
                        </td>
                        <td>
                            <Skeleton height={8} radius={4} />
                        </td>
                        <td>
                            <Skeleton height={8} radius={4} />
                        </td>
                        <td>
                            <Skeleton height={8} radius={4} />
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
};
