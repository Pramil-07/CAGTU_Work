import { useContext, useState } from 'react';
import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { ErrorAlert, PaperBox, Badge as MantineBadge, SkeletonUserAnalytics, BarChart, PieChart, PageHeader } from '@cagtu-cms/ui-shared';
import { CipherUserContext, abbreviateNumber, useDark } from '@cagtu-cms/util-formatter';
import { Avatar, Box, Grid, Group, Table, Text, ThemeIcon, Title, useMantineTheme } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import * as _ from 'lodash';
import { IconUserCheck, IconUserCircle, IconUserOff, IconUserPlus, IconUsers, IconUserX } from '@tabler/icons';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';

interface UserByGenderResult {
    gender: string;
    count: number;
}
interface UserRolesResult {
    name: string;
    count: number;
}
interface PieChartResult {
    id: string;
    label: string;
    value: number;
}
interface AgeRangeResult {
    [key: string]: string | number;
    count: number;
}
interface UserResult {
    user_id: string;
    username: string;
    profile_image: string;
    followers_count: number;
}

const urlsPath = urls?.cipher?.analytics;

const UserAnalytics = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const [dark] = useDark();
    const theme = useMantineTheme();
    const userAnalyticsAPI = new CipherAPI(urlsPath?.user);
    const [userByGender, setUserByGender] = useState([]);
    const [kycStaus, setKYCStatus] = useState<PieChartResult[]>([]);
    const [ageRangeData, setAgeRangeData] = useState<AgeRangeResult[]>([]);
    // const [userRolesData, setUserRolesData] = useState([]);
    const [userGroupData, setUserGroupData] = useState([]);

    const { isLoading, isError, isSuccess, data } = useQuery(['user-analytics'], () => userAnalyticsAPI.list(), {
        onSuccess: (data) => {
            const userByGenderData = data?.data?.user_by_gender.map((val: UserByGenderResult) => {
                return {
                    id: _.isNull(val?.gender) ? 'Other' : String(val?.gender),
                    label: _.isNull(val?.gender) ? 'Other' : String(val?.gender),
                    value: val?.count,
                };
            });
            // const userRolesData = data?.data?.roles.map((val: UserRolesResult) => {
            //     return {
            //         id: String(val?.name),
            //         label: String(val?.name),
            //         value: val?.count,
            //     };
            // });
            const userGroupData = data?.data?.groups.map((val: UserRolesResult) => {
                return {
                    id: String(val?.name),
                    label: String(val?.name),
                    value: val?.count,
                };
            });
            const kycStatusData: PieChartResult[] = [
                {
                    id: 'Accepted',
                    label: 'Accepted',
                    value: data?.data?.kyc_status?.kyc_accepted,
                },
                {
                    id: 'Rejected',
                    label: 'Rejected',
                    value: data?.data?.kyc_status?.kyc_rejected,
                },
                {
                    id: 'Pending',
                    label: 'Pending',
                    value: data?.data?.kyc_status?.kyc_pending,
                },
            ];
            const ageRangeData: AgeRangeResult[] = [
                {
                    id: '16-20',
                    count: data?.data?.age_range?.age_group_16_to_20,
                },
                {
                    id: '21-27',
                    count: data?.data?.age_range?.age_group_21_to_27,
                },
                {
                    id: '28-35',
                    count: data?.data?.age_range?.age_group_28_to_35,
                },
                {
                    id: '36-50',
                    count: data?.data?.age_range?.age_group_36_to_50,
                },
                {
                    id: 'Above 50',
                    count: data?.data?.age_range?.age_group_above_50,
                },
            ];
            setUserByGender(userByGenderData);
            setKYCStatus(kycStatusData);
            setAgeRangeData(ageRangeData);
            // setUserRolesData(userRolesData);
            setUserGroupData(userGroupData);
        },
    });

    const CenteredMetric = ({ centerX, centerY }: { centerX: number; centerY: number }) => {
        return (
            <text
                x={centerX}
                y={centerY}
                textAnchor="middle"
                dominantBaseline="central"
                style={{
                    fontSize: '56px',
                    fontWeight: 600,
                    fill: `${dark ? theme.colors.gray['0'] : theme.colors.dark['6']}`,
                }}>
                {data?.data?.kyc_status?.total}
            </text>
        );
    };

    if (isError) {
        return <ErrorAlert />;
    }

    if (!is_superuser && !user_permissions?.includes('view_user_analytics')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            {isLoading && <SkeletonUserAnalytics />}
            {isSuccess && (
                <>
                    <PageHeader pageTitle="User Analytics" />
                    <Grid gutter="md" mb="xs">
                        <Grid.Col xl={2} md={4}>
                            <PaperBox>
                                <Group position="apart" spacing={15}>
                                    <Box>
                                        <Title order={5} weight={500} color="dimmed" size={13} mb={5}>
                                            Total Users
                                        </Title>
                                        <Title weight={500}>{abbreviateNumber(data?.data?.user_count?.total_users)}</Title>
                                    </Box>
                                    <ThemeIcon variant="light" size={40} radius="xl" color="teal">
                                        <IconUsers size={24} stroke={1.75} />
                                    </ThemeIcon>
                                </Group>
                            </PaperBox>
                        </Grid.Col>
                        <Grid.Col xl={2} md={4}>
                            <PaperBox>
                                <Group position="apart" spacing={15}>
                                    <Box>
                                        <Title order={5} weight={500} color="dimmed" size={13} mb={5}>
                                            Total Profile
                                        </Title>
                                        <Title weight={500}>{abbreviateNumber(data?.data?.user_count?.total_profile)}</Title>
                                    </Box>
                                    <ThemeIcon variant="light" size={40} radius="xl" color="violet">
                                        <IconUserCircle size={24} stroke={1.75} />
                                    </ThemeIcon>
                                </Group>
                            </PaperBox>
                        </Grid.Col>
                        <Grid.Col xl={2} md={4}>
                            <PaperBox>
                                <Group position="apart" spacing={15}>
                                    <Box>
                                        <Title order={5} weight={500} color="dimmed" size={13} mb={5}>
                                            Total KYC
                                        </Title>
                                        <Title weight={500}>{abbreviateNumber(data?.data?.user_count?.total_kyc_verified)}</Title>
                                    </Box>
                                    <ThemeIcon variant="light" size={40} radius="xl" color="green">
                                        <IconUserCheck size={24} stroke={1.75} />
                                    </ThemeIcon>
                                </Group>
                            </PaperBox>
                        </Grid.Col>
                        <Grid.Col xl={2} md={4}>
                            <PaperBox>
                                <Group position="apart" spacing={15}>
                                    <Box>
                                        <Title order={5} weight={500} color="dimmed" size={13} mb={5}>
                                            New Users
                                        </Title>
                                        <Title weight={500}>{abbreviateNumber(data?.data?.user_count?.new_users)}</Title>
                                    </Box>
                                    <ThemeIcon variant="light" size={40} radius="xl">
                                        <IconUserPlus size={24} stroke={1.75} />
                                    </ThemeIcon>
                                </Group>
                            </PaperBox>
                        </Grid.Col>
                        <Grid.Col xl={2} md={4}>
                            <PaperBox>
                                <Group position="apart" spacing={15}>
                                    <Box>
                                        <Title order={5} weight={500} color="dimmed" size={13} mb={5}>
                                            Inactive Users
                                        </Title>
                                        <Title weight={500}>{abbreviateNumber(data?.data?.user_count?.inactive_users)}</Title>
                                    </Box>
                                    <ThemeIcon variant="light" size={40} radius="xl" color="yellow">
                                        <IconUserOff size={24} stroke={1.75} />
                                    </ThemeIcon>
                                </Group>
                            </PaperBox>
                        </Grid.Col>
                        <Grid.Col xl={2} md={4}>
                            <PaperBox>
                                <Group position="apart" spacing={15}>
                                    <Box>
                                        <Title order={5} weight={500} color="dimmed" size={13} mb={5}>
                                            Deactivated Account
                                        </Title>
                                        <Title weight={500}>{abbreviateNumber(data?.data?.deactivated_user_count)}</Title>
                                    </Box>
                                    <ThemeIcon variant="light" size={40} radius="xl" color="red">
                                        <IconUserX size={24} stroke={1.75} />
                                    </ThemeIcon>
                                </Group>
                            </PaperBox>
                        </Grid.Col>
                    </Grid>
                    <Grid gutter="lg">
                        <Grid.Col md={4}>
                            <PaperBox>
                                <Title order={5} weight={600} mb={15}>
                                    Age Range
                                </Title>
                                <Box sx={{ height: 300 }}>
                                    <BarChart
                                        data={ageRangeData}
                                        keys={['count']}
                                        indexBy="id"
                                        groupMode="grouped"
                                        axisBottomLegendName="Age Group"
                                    />
                                </Box>
                            </PaperBox>
                        </Grid.Col>
                        <Grid.Col md={4}>
                            <PaperBox>
                                <Title order={5} weight={600} mb={15}>
                                    User by Gender
                                </Title>
                                <Box sx={{ height: 300 }}>
                                    <PieChart data={userByGender} />
                                </Box>
                            </PaperBox>
                        </Grid.Col>
                        <Grid.Col md={4}>
                            <PaperBox>
                                <Title order={5} weight={600} mb={15}>
                                    KYC Status
                                </Title>
                                <Box sx={{ height: 300 }}>
                                    <PieChart data={kycStaus} layers={['arcs', 'arcLabels', 'arcLinkLabels', CenteredMetric]} />
                                </Box>
                            </PaperBox>
                        </Grid.Col>
                        {/* <Grid.Col md={4}>
                            <PaperBox>
                                <Title order={5} weight={600} mb={15}>
                                    User Roles
                                </Title>
                                <Box sx={{ height: 300 }}>
                                    <PieChart data={userRolesData} />
                                </Box>
                            </PaperBox>
                        </Grid.Col> */}
                        <Grid.Col md={4}>
                            <PaperBox>
                                <Title order={5} weight={600} mb={15}>
                                    User Roles
                                </Title>
                                <Box sx={{ height: 300 }}>
                                    <PieChart data={userGroupData} />
                                </Box>
                            </PaperBox>
                        </Grid.Col>
                        <Grid.Col md={4}>
                            <PaperBox sx={{ minHeight: 379 }}>
                                <Title order={5} weight={600} mb={15}>
                                    Most Followed Users
                                </Title>
                                <Table verticalSpacing={8} fontSize={13} horizontalSpacing={0}>
                                    <thead>
                                        <tr>
                                            <th style={{ fontWeight: 600 }}>Username</th>
                                            <th style={{ width: 70, fontWeight: 600 }}>Followers</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data?.data?.most_followed_users.map((user: UserResult, key: number) => (
                                            <tr key={key}>
                                                <td>
                                                    <Group position="left" spacing={10}>
                                                        <Avatar src={`${user?.profile_image ?? ''}`} alt="user-profile" size={30} radius={'xl'} />
                                                        <Text weight={500} component="span">
                                                            {user?.username}
                                                        </Text>
                                                    </Group>
                                                </td>
                                                <td>
                                                    <MantineBadge name={user?.followers_count} radius="xl" />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </PaperBox>
                        </Grid.Col>
                    </Grid>
                </>
            )}
        </>
    );
};

export default UserAnalytics;
