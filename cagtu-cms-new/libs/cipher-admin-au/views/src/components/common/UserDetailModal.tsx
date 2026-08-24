import { Badge, SkeletonKYCDetail, Button as UserModalButton, TextAreaField, DateField, FormModal, NumberField } from '@cagtu-cms/ui-shared';
import {
    converDateFromIsonString,
    convertDateStringToISO,
    convertTimeStringToAMPM,
    numberValidate,
    stringValidate,
    useDark,
    useIconColorMode,
    UsersResult,
} from '@cagtu-cms/util-formatter';
import {
    ActionIcon,
    Alert,
    Avatar,
    Box,
    Button,
    Divider,
    Grid,
    Group,
    Modal,
    ModalProps,
    Text,
    Title,
    Tooltip,
    useMantineTheme,
} from '@mantine/core';
import { IconCalendar, IconChecks, IconCircleCheck, IconMail, IconMapPin, IconPhone, IconPlus, IconQuestionCircle } from '@tabler/icons';
import { UseMutationResult } from '@tanstack/react-query';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Form, Formik } from 'formik';
import * as _ from 'lodash';
import { useState } from 'react';
import * as Yup from 'yup';

dayjs.extend(relativeTime);

interface UserDetailModalProps {
    opened: boolean;
    onClose: () => void;
    title: string;
    data: UsersResult;
    isLoading: boolean;
    handleProfileVerify: UseMutationResult<
        any,
        void,
        {
            is_profile_verified: boolean;
            id: number;
        },
        unknown
    >;
    handleUserSuspension: UseMutationResult<
        any,
        void,
        {
            user: string;
            to_date: string;
            reason: string;
        },
        unknown
    >;
    handleUserWhitlist: UseMutationResult<
        any,
        void,
        {
            id: string;
        },
        unknown
    >;
    handleRewardPoint: UseMutationResult<
        any,
        void,
        {
            reward_point: number;
        },
        unknown
    >;
    userID: string;
}

const UserDetailModal = ({
    onClose,
    opened,
    title,
    isLoading,
    data,
    handleProfileVerify,
    handleUserSuspension,
    handleUserWhitlist,
    handleRewardPoint,
    userID,
    ...restProps
}: UserDetailModalProps & Partial<ModalProps>) => {
    const [iconColorMode] = useIconColorMode();
    const theme = useMantineTheme();
    const [dark] = useDark();
    const [showUserSuspendForm, setShowUserSuspendForm] = useState(false);
    const [rewardModal, setRewardModal] = useState(false);

    return (
        <>
            <Modal
                {...restProps}
                opened={opened}
                onClose={onClose}
                centered
                title={
                    title && (
                        <Title order={5} sx={{ fontWeight: 600 }}>
                            {title}
                        </Title>
                    )
                }>
                {isLoading ? (
                    <SkeletonKYCDetail />
                ) : (
                    <>
                        {title && <Divider mb={20} />}
                        <Group position="apart" align="normal" mb={20}>
                            <Group position="left" spacing={15} align="normal">
                                <Avatar src={`${data?.profile?.profile_image ?? ''}`} alt="user-profile" size={100} radius="md" />
                                <Box>
                                    <Group spacing={5} mb={3}>
                                        <Title order={5} weight={600}>
                                            {_.isNull(data?.first_name)
                                                ? data?.username
                                                : `${data?.first_name} ${data?.middle_name ?? ''} ${data?.last_name}`}
                                        </Title>
                                        <IconCircleCheck
                                            size={20}
                                            stroke={1.75}
                                            color={
                                                data?.profile?.is_profile_verified
                                                    ? theme.colors['green'][6]
                                                    : dark
                                                    ? theme.colors['dark'][3]
                                                    : theme.colors['dark'][0]
                                            }
                                        />
                                    </Group>
                                    <Text color="dimmed" size={13} weight={400} mb={5}>
                                        @{data?.username}
                                    </Text>
                                    <Group spacing={5} mb={3}>
                                        <IconMail size={16} stroke={1.75} color={iconColorMode} />
                                        <Text color="dimmed">{data?.email ? data?.email : '-'}</Text>
                                    </Group>
                                    <Group spacing={5}>
                                        <IconPhone size={16} stroke={1.75} color={iconColorMode} />
                                        <Text color="dimmed">{data?.phone ? data?.phone : '-'}</Text>
                                    </Group>
                                </Box>
                            </Group>
                            <Box>
                                {data?.profile?.country?.name ? (
                                    <Group position="right" spacing={5} mb={10}>
                                        <IconMapPin size={18} stroke={1.75} />
                                        <Text component="span" color="dimmed">
                                            {data?.profile?.country?.name}
                                        </Text>
                                    </Group>
                                ) : null}
                                <Group position="right" mb={4} spacing={5}>
                                    <Text size="xs" weight={500}>
                                        Created On:
                                    </Text>
                                    <Text size="xs" color="dimmed">
                                        {converDateFromIsonString(data?.created_at)}
                                    </Text>
                                </Group>
                                <Group position="right" mb={4} spacing={5}>
                                    <Text size="xs" weight={500}>
                                        Updated On:{' '}
                                    </Text>
                                    <Text size="xs" color="dimmed">
                                        {dayjs(data?.updated_at).fromNow()}
                                    </Text>
                                </Group>
                                <Group position="right" spacing={5}>
                                    <Text size="xs" weight={500}>
                                        Rewards Point:
                                    </Text>
                                    <Badge size="sm" name={data?.profile?.points ?? '0'} color={data?.profile?.points ? 'green' : 'red'} />
                                    <Tooltip
                                        withArrow
                                        label="Add Reward Point"
                                        styles={{ tooltip: { fontSize: 10, padding: '2px 8px', fontWeight: 500 } }}>
                                        <ActionIcon radius="xl" color="indigo" variant="light" size={18} onClick={() => setRewardModal(true)}>
                                            <IconPlus size={14} stroke={2.5} />
                                        </ActionIcon>
                                    </Tooltip>
                                </Group>
                            </Box>
                        </Group>
                        <Title order={6} weight={600} mb={10}>
                            Basic Information
                        </Title>
                        <Divider mb={20} variant="dashed" />
                        <Grid gutter="md" mb={20}>
                            <Grid.Col>
                                <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                    Bio
                                </Text>
                                <Text color="dimmed">{data?.profile?.bio ? _.upperFirst(data?.profile?.bio) : '-'}</Text>
                            </Grid.Col>
                            <Grid.Col md={3}>
                                <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                    Designation
                                </Text>
                                <Text color="dimmed">{data?.profile?.designation ? data?.profile?.designation : '-'}</Text>
                            </Grid.Col>
                            <Grid.Col md={3}>
                                <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                    Experience Level
                                </Text>
                                <Box>{data?.profile?.experience_level ? <Badge name={_.upperFirst(data?.profile?.experience_level)} /> : null}</Box>
                            </Grid.Col>
                            <Grid.Col md={3}>
                                <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                    Gender
                                </Text>
                                <Text color="dimmed">{data?.profile?.gender ? _.upperFirst(data?.profile?.gender) : '-'}</Text>
                            </Grid.Col>
                            <Grid.Col md={3}>
                                <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                    DOB
                                </Text>
                                <Text color="dimmed">
                                    {data?.profile?.date_of_birth ? convertDateStringToISO(data?.profile?.date_of_birth) : '-'}
                                </Text>
                            </Grid.Col>
                            <Grid.Col md={3}>
                                <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                    Address Line 1
                                </Text>
                                <Text color="dimmed">{data?.profile?.address_line1 ? data?.profile?.address_line1 : '-'}</Text>
                            </Grid.Col>
                            <Grid.Col md={3}>
                                <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                    Address Line 2
                                </Text>
                                <Text color="dimmed">{data?.profile?.address_line2 ? _.upperFirst(data?.profile?.address_line2) : '-'}</Text>
                            </Grid.Col>
                            <Grid.Col md={3}>
                                <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                    Profile Visibility
                                </Text>
                                <Box>{data?.profile?.profile_visibility ? <Badge name={data?.profile?.profile_visibility} /> : '-'}</Box>
                            </Grid.Col>
                            <Grid.Col md={3}>
                                <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                    Task Preferences
                                </Text>
                                <Box>{data?.profile?.task_preferences ? <Badge name={_.upperFirst(data?.profile?.task_preferences)} /> : '-'}</Box>
                            </Grid.Col>
                            <Grid.Col md={3}>
                                <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                    City
                                </Text>
                                <Text color="dimmed">{data?.profile?.city ? data?.profile?.city?.name : '-'}</Text>
                            </Grid.Col>
                            <Grid.Col md={3}>
                                <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                    Language
                                </Text>
                                <Text color="dimmed">{data?.profile?.language ? data?.profile?.language?.name : '-'}</Text>
                            </Grid.Col>
                            <Grid.Col md={3}>
                                <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                    Charge Currency
                                </Text>
                                <Text color="dimmed">
                                    {data?.profile?.charge_currency
                                        ? `${data?.profile?.charge_currency?.name} (${data?.profile?.charge_currency?.code})`
                                        : '-'}
                                </Text>
                            </Grid.Col>
                            <Grid.Col md={3}>
                                <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                    Hourly Rate
                                </Text>
                                <Box>{data?.profile?.hourly_rate ? <Badge name={data?.profile?.hourly_rate} /> : '-'}</Box>
                            </Grid.Col>
                            <Grid.Col md={3}>
                                <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                    Active Hour
                                </Text>
                                {data?.profile?.active_hour_start && data?.profile?.active_hour_end ? (
                                    <Group spacing={4}>
                                        {convertTimeStringToAMPM(data?.profile?.active_hour_start) ? (
                                            <Badge name={convertTimeStringToAMPM(data?.profile?.active_hour_start)} />
                                        ) : null}
                                        {convertTimeStringToAMPM(data?.profile?.active_hour_end) ? (
                                            <Badge name={convertTimeStringToAMPM(data?.profile?.active_hour_end)} />
                                        ) : null}
                                    </Group>
                                ) : (
                                    <Box>-</Box>
                                )}
                            </Grid.Col>
                            <Grid.Col md={3}>
                                <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                    User Type
                                </Text>
                                <Box>
                                    {data?.profile?.user_type ? (
                                        <Group spacing={5}>
                                            {JSON.parse(data?.profile?.user_type)?.map((val: string, index: number) => (
                                                <Badge key={index} name={val} color="indigo" radius="xl" />
                                            ))}
                                        </Group>
                                    ) : (
                                        '-'
                                    )}
                                </Box>
                            </Grid.Col>
                            <Grid.Col md={3}>
                                <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                    Profile Created On
                                </Text>
                                <Text color="dimmed">{data?.profile?.created_at ? converDateFromIsonString(data?.profile?.created_at) : '-'}</Text>
                            </Grid.Col>
                            <Grid.Col md={3}>
                                <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                    Profile Updated On
                                </Text>
                                <Text color="dimmed">{data?.profile?.updated_at ? dayjs(data?.profile?.updated_at).fromNow() : '-'}</Text>
                            </Grid.Col>
                            <Grid.Col>
                                <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                    Skills
                                </Text>
                                <Box>
                                    {data?.profile?.skill ? (
                                        <Group spacing={5}>
                                            {JSON.parse(data?.profile?.skill)?.map((val: string, index: number) => (
                                                <Badge key={index} name={val} color="cyan" radius="xl" />
                                            ))}
                                        </Group>
                                    ) : (
                                        '-'
                                    )}
                                </Box>
                            </Grid.Col>
                        </Grid>
                        <Title order={6} weight={600} mb={10}>
                            Other Information
                        </Title>
                        <Divider mb={20} variant="dashed" />
                        <Grid gutter="md" mb={12}>
                            <Grid.Col md={3}>
                                <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                    Is Superuser
                                </Text>
                                <Box>
                                    <Badge name={data?.is_superuser ? 'Yes' : 'No'} color={data?.is_superuser ? 'green' : 'red'} />
                                </Box>
                            </Grid.Col>
                            <Grid.Col md={3}>
                                <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                    Phone Verified
                                </Text>
                                <Box>
                                    <Badge name={data?.is_phone_verified ? 'Yes' : 'No'} color={data?.is_phone_verified ? 'green' : 'red'} />
                                </Box>
                            </Grid.Col>
                            <Grid.Col md={3}>
                                <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                    Email Verified
                                </Text>
                                <Box>
                                    <Badge name={data?.is_email_verified ? 'Yes' : 'No'} color={data?.is_email_verified ? 'green' : 'red'} />
                                </Box>
                            </Grid.Col>
                            <Grid.Col md={3}>
                                <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                    KYC Verified
                                </Text>
                                <Box>
                                    <Badge name={data?.is_kyc_verified ? 'Yes' : 'No'} color={data?.is_kyc_verified ? 'green' : 'red'} />
                                </Box>
                            </Grid.Col>
                            <Grid.Col md={3}>
                                <Group position="left" spacing={3}>
                                    <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                        MFA
                                    </Text>
                                    <Tooltip
                                        label="Multi Factor Authentication."
                                        position="right-start"
                                        transition="fade"
                                        withArrow
                                        multiline
                                        styles={{ tooltip: { fontSize: 12, padding: '3px 8px', fontWeight: 500, textAlign: 'center' } }}>
                                        <ActionIcon
                                            variant="light"
                                            radius="xl"
                                            size={24}
                                            color="gray"
                                            ml={2}
                                            sx={{
                                                cursor: 'pointer',
                                                position: 'relative',
                                            }}>
                                            <IconQuestionCircle size={16} stroke={1.75} />
                                        </ActionIcon>
                                    </Tooltip>
                                </Group>
                                <Box>
                                    <Badge name={data?.mfa_enabled ? 'Yes' : 'No'} color={data?.mfa_enabled ? 'green' : 'red'} />
                                </Box>
                            </Grid.Col>
                            <Grid.Col md={3}>
                                <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                    Is Verified
                                </Text>
                                <Box>
                                    <Badge name={data?.is_verified ? 'Yes' : 'No'} color={data?.is_verified ? 'green' : 'red'} />
                                </Box>
                            </Grid.Col>
                            <Grid.Col md={3}>
                                <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                    Status
                                </Text>
                                <Box>
                                    <Badge name={data?.is_active ? 'Active' : 'Inactive'} color={data?.is_active ? 'green' : 'red'} />
                                </Box>
                            </Grid.Col>
                            <Grid.Col md={3}>
                                <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                    Last Login
                                </Text>
                                <Box>{_.isNull(data?.last_login) ? '-' : <Badge name={dayjs(data?.last_login).fromNow()} />}</Box>
                            </Grid.Col>
                        </Grid>
                        {/*
                         There seems to be confusion with naming convention and functionality of group and roles.
                         Both roles and groups are functioning interchangeably.
                         we dont need groups for now if group is needed later you can uncomment the below lines
                         */}

                        {/* <Title order={6} weight={600} mb={10}>
                            Roles
                        </Title>
                        <Divider mb={20} variant="dashed" />
                        {data?.roles?.length ? (
                            <Group spacing={5} mb={20}>
                                {data?.roles?.map((val, index) => (
                                    <Badge key={index} name={val?.name} color="gray" radius="xl" />
                                ))}
                            </Group>
                        ) : (
                            <Alert icon={<IconQuestionCircle size={24} stroke={1.75} />} color="blue" mb={20}>
                                No Roles are available
                            </Alert>
                        )} */}

                        {/* Here only name is changed to Role previously it was named as Group
                        if needed it can be reversed back by simply changing role to group.
                        */}
                        <Title order={6} weight={600} mb={10}>
                            Role
                        </Title>
                        <Divider mb={20} variant="dashed" />
                        {data?.groups?.length ? (
                            <Group spacing={5} mb={20}>
                                {data?.groups?.map((val, index) => (
                                    <Badge key={index} name={val?.name} color="gray" radius="xl" />
                                ))}
                            </Group>
                        ) : (
                            <Alert icon={<IconQuestionCircle size={16} stroke={1.75} />} color="blue">
                                No Roles are available
                            </Alert>
                        )}
                        {!_.isNull(data?.suspension_details) && (
                            <>
                                <Title order={6} weight={600} mb={10}>
                                    Suspension Details
                                </Title>
                                <Divider mb={20} variant="dashed" />
                                <Grid gutter="md" mb={12}>
                                    <Grid.Col md={3}>
                                        <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                            Suspended By
                                        </Text>
                                        <Text color="dimmed">{data?.suspension_details?.created_by}</Text>
                                    </Grid.Col>
                                    <Grid.Col md={3}>
                                        <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                            From
                                        </Text>
                                        <Text color="dimmed">{converDateFromIsonString(data?.suspension_details?.from_date)}</Text>
                                    </Grid.Col>
                                    <Grid.Col md={3}>
                                        <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                            To
                                        </Text>
                                        <Text color="dimmed">{converDateFromIsonString(data?.suspension_details?.to_date)}</Text>
                                    </Grid.Col>
                                    <Grid.Col>
                                        <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                            Reason
                                        </Text>
                                        <Text color="dimmed">{data?.suspension_details?.reason}</Text>
                                    </Grid.Col>
                                </Grid>
                            </>
                        )}
                        <Title order={6} weight={600} mt={20} mb={10}>
                            Advanced
                        </Title>
                        <Divider mb={20} variant="dashed" />
                        {!_.isNull(data?.profile) && (
                            <>
                                <Group position="apart">
                                    <Text weight={500}>Verify Profile</Text>
                                    {data?.profile['is_profile_verified'] ? (
                                        <Badge
                                            color="teal"
                                            name="Verified"
                                            leftSection={<IconChecks size={16} stroke={1.75} style={{ position: 'relative', top: 4 }} />}
                                            sx={{ fontWeight: 500 }}
                                        />
                                    ) : (
                                        <Button
                                            compact
                                            variant="default"
                                            sx={{ fontWeight: 500, fontSize: 12 }}
                                            loading={handleProfileVerify.isLoading}
                                            onClick={() => handleProfileVerify.mutate({ is_profile_verified: true, id: data?.profile?.id })}>
                                            Verify
                                        </Button>
                                    )}
                                </Group>
                                <Divider my={10} />
                            </>
                        )}
                        <Group position="apart" mb={showUserSuspendForm ? 10 : 0}>
                            <Box>
                                <Title order={6} weight={600} mb={5}>
                                    Account Suspension
                                </Title>
                                <Text>Suspended users are prevented from booking, create task and services.</Text>
                            </Box>
                            <UserModalButton
                                name={showUserSuspendForm ? 'Collapse' : 'Expand'}
                                variant="default"
                                onClick={() => setShowUserSuspendForm(!showUserSuspendForm)}
                            />
                        </Group>
                        {showUserSuspendForm && (
                            <Box sx={{ background: theme.colors.gray['1'], borderRadius: theme.radius.md, padding: theme.spacing.md }}>
                                {_.isNull(data?.suspension_details) ? (
                                    <Formik
                                        enableReinitialize
                                        initialValues={{ to_date: '', reason: '' }}
                                        validationSchema={Yup.object().shape({
                                            to_date: Yup.date().required('Required field').nullable(true),
                                            reason: stringValidate,
                                        })}
                                        onSubmit={async (values, actions) => {
                                            await handleUserSuspension.mutate(
                                                { user: userID, to_date: values?.to_date, reason: values?.reason },
                                                {
                                                    onSuccess: () => {
                                                        actions.resetForm();
                                                        setShowUserSuspendForm(false);
                                                    },
                                                }
                                            );
                                        }}>
                                        {({ errors, touched, setFieldValue, handleBlur }) => (
                                            <Form>
                                                <DateField
                                                    name="to_date"
                                                    labelName="Till Date"
                                                    placeHolder="Select date"
                                                    error={errors.to_date}
                                                    touch={touched.to_date}
                                                    icon={<IconCalendar size={18} stroke={1.75} />}
                                                    minDate={new Date()}
                                                    handleChange={(value) => setFieldValue('to_date', value)}
                                                    onBlur={handleBlur}
                                                    withAsterisk
                                                />
                                                <TextAreaField
                                                    name="reason"
                                                    labelName="Reason"
                                                    placeHolder="Enter the reason"
                                                    error={errors.reason}
                                                    touch={touched.reason}
                                                    withAsterisk
                                                />
                                                <UserModalButton type="submit" name="Suspend" color="red" loading={handleUserSuspension?.isLoading} />
                                            </Form>
                                        )}
                                    </Formik>
                                ) : (
                                    <Group position="apart">
                                        <Box>
                                            <Text>
                                                This account is currently <strong>suspended.</strong>
                                            </Text>
                                        </Box>
                                        <UserModalButton
                                            name="Unsuspend"
                                            color="red"
                                            onClick={() =>
                                                handleUserWhitlist.mutate(
                                                    { id: userID },
                                                    {
                                                        onSuccess: () => {
                                                            setShowUserSuspendForm(false);
                                                        },
                                                    }
                                                )
                                            }
                                            loading={handleUserWhitlist.isLoading}
                                        />
                                    </Group>
                                )}
                            </Box>
                        )}
                    </>
                )}
            </Modal>
            <Formik
                enableReinitialize
                initialValues={{ reward_point: 0 }}
                validationSchema={Yup.object().shape({
                    reward_point: numberValidate.max(1000, 'Cannot add more than 1000 reward point'),
                })}
                onSubmit={async (values, actions) => {
                    await handleRewardPoint.mutate(
                        { reward_point: values?.reward_point },
                        {
                            onSuccess: () => {
                                actions.resetForm();
                                setRewardModal(false);
                            },
                        }
                    );
                }}>
                {({ errors, touched, handleSubmit, handleReset, values, setFieldValue }) => (
                    <FormModal
                        opened={rewardModal}
                        onClose={() => {
                            if (!handleRewardPoint.isLoading) {
                                handleReset();
                            }
                            setRewardModal(false);
                        }}
                        title="Add Reward Point"
                        onConfirm={handleRewardPoint ? handleSubmit : () => undefined}
                        confirmButtonText="Add"
                        loading={handleRewardPoint.isLoading}
                        size="xs">
                        <Form>
                            <NumberField
                                value={values?.reward_point}
                                name="reward_point"
                                error={errors.reward_point}
                                touch={touched.reward_point}
                                onChange={(value) => {
                                    setFieldValue('reward_point', value);
                                }}
                                placeHolder="e.g. 100"
                                withAsterisk
                            />
                        </Form>
                    </FormModal>
                )}
            </Formik>
        </>
    );
};

export default UserDetailModal;
