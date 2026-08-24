import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { BackButton, ErrorAlert, PageHeader, PaperBox, SkeletonLgalVersionHistory, SuccessModal } from '@cagtu-cms/ui-shared';
import {
    BreadcrumbItems,
    CipherUserContext,
    converDateFromIsonString,
    getFormatedTime,
    LegalResult,
    LegalUpdatesResult,
    useDark,
    UserProfile,
} from '@cagtu-cms/util-formatter';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import * as _ from 'lodash';
import { Grid, Group, Text, ThemeIcon, Timeline, Title, useMantineTheme, Avatar, Tooltip, Box, ScrollArea, Button, ActionIcon } from '@mantine/core';
import { IconCalendar, IconCheck, IconChevronDown, IconChevronRight, IconClock, IconHistory, IconPoint, IconSend, IconX } from '@tabler/icons';
import { useContext, useState } from 'react';
import { showNotification } from '@mantine/notifications';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';

const urlsPath = urls?.cipher?.legal;

const LegalHistory = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const { slug } = useParams();
    const queryClient = useQueryClient();
    const [showUpdate, setShowUpdate] = useState<number[]>([]);
    const [showContent, setShowContent] = useState<number | null>();
    const [successModal, setSuccessModal] = useState<boolean>(false);
    const [latestDraftId, setLatestDraftId] = useState<number | null>();

    const [dark] = useDark();
    const theme = useMantineTheme();

    const legalHistoryAPI = new CipherAPI(urlsPath?.history);
    const legalAPI = new CipherAPI(urlsPath?.path);

    const { isLoading, isError, isSuccess, data } = useQuery(['legal-history', slug], () => legalHistoryAPI.get(String(slug)), {
        onSuccess: (data) => {
            setShowContent(data?.data[0].id);
        },
    });

    const legalMutation = useMutation<any, void, { is_current: boolean; id: number }>(({ is_current, id }) => legalAPI.save({ is_current }, id), {
        onSuccess: (data) => {
            setSuccessModal(false);
            showNotification({
                title: 'Congrats! Latest draft published',
                message: data.data.message,
                color: 'green',
                icon: <IconCheck size={18} />,
            });
            queryClient.invalidateQueries(['legal-history', slug]);
        },
        onError: (error: any) => {
            const {
                data: { message },
            } = error.response;
            showNotification({
                title: 'Uh oh! something went wrong',
                message: message ?? 'Sorry! There was a problem with your request.',
                color: 'red',
                icon: <IconX size={18} />,
            });
        },
    });

    const handleShowUpdate = (id: number) => {
        setShowUpdate((prevState: number[]) => {
            if (prevState.includes(id)) {
                return prevState.filter((val: number) => val !== id);
            } else {
                return [...prevState, id];
            }
        });
    };

    const handleShowContent = (id: number) => {
        setShowContent(id);
    };

    const breadCrumbItems: BreadcrumbItems[] = [{ name: 'Legal', href: '/cms/legal' }];

    if (isError) {
        return <ErrorAlert />;
    }

    if (!is_superuser && !user_permissions?.includes('view_content')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            <PageHeader pageTitle={_.startCase(slug)} currentBreadcrumbName="History" breadCrumbItems={breadCrumbItems}>
                <BackButton navigateTo="/cms/legal" />
            </PageHeader>
            <PaperBox>
                {isLoading && <SkeletonLgalVersionHistory />}
                {isSuccess && (
                    <Grid gutter="lg">
                        <Grid.Col md={9}>
                            <Box
                                px="sm"
                                dangerouslySetInnerHTML={{
                                    __html: String(data?.data.find((content: LegalResult) => content?.id === showContent)?.content),
                                }}></Box>
                        </Grid.Col>
                        <Grid.Col md={3}>
                            <Box sx={{ position: 'sticky', top: 80 }}>
                                <Group spacing="xs" mb="lg">
                                    <ThemeIcon variant="light" radius="xl" size="lg">
                                        <IconHistory size={18} stroke={1.75} />
                                    </ThemeIcon>
                                    <Title order={5} weight={600}>
                                        Version History
                                    </Title>
                                </Group>
                                <ScrollArea sx={{ height: 'calc(100vh - 1rem - 80px - 80px)' }} scrollbarSize={6}>
                                    <Timeline lineWidth={2} bulletSize={24} styles={{ itemTitle: { fontSize: 13 } }} ml={5}>
                                        {data?.data.map((val: LegalResult, key: number) => {
                                            const selectedContent = val?.id === showContent;

                                            return (
                                                <Timeline.Item
                                                    key={key}
                                                    bullet={
                                                        <IconCalendar
                                                            size={18}
                                                            stroke={2}
                                                            style={{ cursor: 'pointer', padding: `${1}px ${2}px` }}
                                                            onClick={() => handleShowContent(val?.id)}
                                                        />
                                                    }
                                                    active={selectedContent}
                                                    lineActive={selectedContent}
                                                    title={
                                                        <Group>
                                                            <span
                                                                onClick={() => handleShowContent(val?.id)}
                                                                style={{
                                                                    cursor: 'pointer',
                                                                    color: selectedContent
                                                                        ? theme.colors.blue['6']
                                                                        : dark
                                                                        ? theme.colors.gray['0']
                                                                        : theme.colors.dark['7'],
                                                                }}>
                                                                {converDateFromIsonString(val?.created_at)} - {getFormatedTime(val?.created_at)}
                                                            </span>
                                                            {val?.is_latest_draft && (
                                                                <Button
                                                                    compact
                                                                    size="xs"
                                                                    leftIcon={<IconSend size={14} />}
                                                                    sx={{ fontWeight: 500 }}
                                                                    styles={{ leftIcon: { marginRight: 5 } }}
                                                                    onClick={() => {
                                                                        setLatestDraftId(val?.id);
                                                                        setSuccessModal(true);
                                                                    }}>
                                                                    Publish
                                                                </Button>
                                                            )}
                                                        </Group>
                                                    }>
                                                    <Group spacing={4} mb={4}>
                                                        <Text color="dimmed" size="xs" weight={500}>
                                                            Created By:
                                                        </Text>
                                                        <Tooltip
                                                            withArrow
                                                            label={
                                                                val?.created_by?.username !== 'admin'
                                                                    ? `${val?.created_by?.first_name ?? ''} ${val?.created_by?.middle_name ?? ''} ${
                                                                          val?.created_by?.last_name ?? ''
                                                                      }`
                                                                    : _.upperFirst(val?.created_by?.username)
                                                            }
                                                            position="bottom"
                                                            styles={{ tooltip: { fontSize: 10, padding: '2px 8px', fontWeight: 500 } }}>
                                                            <Avatar
                                                                src={`${val?.created_by?.profile_image ?? ''}`}
                                                                alt="user-profile"
                                                                size={20}
                                                                radius={'xl'}
                                                            />
                                                        </Tooltip>
                                                    </Group>
                                                    {val?.is_latest_draft && (
                                                        <Group spacing={4} mb={2}>
                                                            <IconPoint size={8} stroke={8} color={theme.colors.yellow['6']} />
                                                            <Text color="yellow" size="xs" weight={500}>
                                                                Latest Draft
                                                            </Text>
                                                        </Group>
                                                    )}
                                                    {val?.is_current && (
                                                        <Group spacing={4} mb={2}>
                                                            <IconPoint size={8} stroke={8} color={theme.colors.teal['6']} />
                                                            <Text color="teal" size="xs" weight={500}>
                                                                Current Version
                                                            </Text>
                                                        </Group>
                                                    )}
                                                    {val?.updates.length >= 1 && (
                                                        <Group spacing={2} mb={showUpdate.includes(val?.id) ? 5 : 0}>
                                                            <ActionIcon size="xs" radius="lg" onClick={() => handleShowUpdate(val.id)}>
                                                                {showUpdate.includes(val?.id) ? (
                                                                    <IconChevronDown size={15} stroke={2} />
                                                                ) : (
                                                                    <IconChevronRight size={15} stroke={2} />
                                                                )}
                                                            </ActionIcon>
                                                            <Text color="dimmed" size="xs" weight={500} sx={{ userSelect: 'none' }}>
                                                                Updated By:
                                                            </Text>
                                                            <Avatar.Group spacing="xs" ml={2}>
                                                                {val?.updated_by.map((user: UserProfile, key: number) => (
                                                                    <Tooltip
                                                                        key={key}
                                                                        withArrow
                                                                        label={
                                                                            !_.isNull(user?.first_name)
                                                                                ? `${user?.first_name ?? ''} ${user?.middle_name ?? ''} ${
                                                                                      user?.last_name ?? ''
                                                                                  }`
                                                                                : user?.username
                                                                        }
                                                                        position="bottom"
                                                                        styles={{ tooltip: { fontSize: 10, padding: '2px 8px', fontWeight: 500 } }}>
                                                                        <Avatar
                                                                            src={`${user?.profile_image ?? ''}`}
                                                                            alt="user-profile"
                                                                            size={24}
                                                                            radius={'xl'}
                                                                            color="blue"
                                                                        />
                                                                    </Tooltip>
                                                                ))}
                                                            </Avatar.Group>
                                                        </Group>
                                                    )}
                                                    {showUpdate.includes(val?.id) && (
                                                        <Box
                                                            mt={5}
                                                            mr="xs"
                                                            px="xl"
                                                            py="sm"
                                                            sx={{
                                                                background: dark ? theme.colors.dark['5'] : theme.colors.gray['0'],
                                                                borderRadius: theme.radius.md,
                                                            }}>
                                                            {val?.updates.map((updates: LegalUpdatesResult, key: number) => (
                                                                <Box
                                                                    key={key}
                                                                    sx={{
                                                                        userSelect: 'none',
                                                                        borderBottom: `1px solid ${
                                                                            dark ? theme.colors.dark['4'] : theme.colors.gray['2']
                                                                        }`,
                                                                        '&:last-child': { border: 'none' },
                                                                    }}
                                                                    py={5}>
                                                                    <Group spacing={5}>
                                                                        <Text weight={500} size={12} color="dimmed">
                                                                            {converDateFromIsonString(updates?.updated_at)}
                                                                        </Text>
                                                                        <Group spacing={3}>
                                                                            <IconClock size={14} stroke={1.75} color={theme.colors.dark['2']} />
                                                                            <Text weight={500} size={12} color="dimmed">
                                                                                {getFormatedTime(updates?.updated_at)}
                                                                            </Text>
                                                                        </Group>
                                                                    </Group>
                                                                    <Group spacing={4}>
                                                                        <IconPoint size={6} stroke={10} color={theme.colors.blue['6']} />
                                                                        <Text weight={500} size={11}>
                                                                            {!_.isNull(updates?.user?.first_name)
                                                                                ? `${updates?.user?.first_name ?? ''} ${
                                                                                      updates?.user?.middle_name ?? ''
                                                                                  } ${updates?.user?.last_name ?? ''}`
                                                                                : updates?.user?.username}
                                                                        </Text>
                                                                    </Group>
                                                                </Box>
                                                            ))}
                                                        </Box>
                                                    )}
                                                </Timeline.Item>
                                            );
                                        })}
                                    </Timeline>
                                </ScrollArea>
                            </Box>
                        </Grid.Col>
                    </Grid>
                )}
            </PaperBox>
            <SuccessModal
                opened={successModal}
                onClose={() => setSuccessModal(false)}
                title="Are you sure?"
                description="This action will send an alert mail to all users to inform them about the new updates."
                loading={legalMutation.isLoading}
                onConfirm={() => legalMutation.mutate({ is_current: true, id: Number(latestDraftId) })}
                confirmButtonText="Yes! Publish"
            />
        </>
    );
};

export default LegalHistory;
