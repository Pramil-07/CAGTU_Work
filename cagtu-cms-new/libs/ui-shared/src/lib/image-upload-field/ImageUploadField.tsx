import { ProfileImageFieldProps, useDark } from '@cagtu-cms/util-formatter';
import { Avatar, Box, Group, Image, Stack, Text, useMantineTheme } from '@mantine/core';
import { IconEdit } from '@tabler/icons';

const ImageUploadField = ({ profileImageData, error, handleBlur, setFieldValue, labelName, name, withAsterisk }: ProfileImageFieldProps) => {
    const [dark] = useDark();
    const theme = useMantineTheme();

    return (
        <Stack mb={15}>
            <Text size="sm" component="label" weight={500} mr={24} color={dark ? theme.colors.dark[0] : theme.colors.gray[9]}>
                {labelName}{' '}
                {withAsterisk && (
                    <Text component="span" color="red">
                        *
                    </Text>
                )}
            </Text>
            <Box>
                <Box mb={5}>
                    <Box sx={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                        {profileImageData && profileImageData?.length ? (
                            profileImageData?.map((val, key) => (
                                <Image
                                    key={key}
                                    src={val.src}
                                    color={error ? 'red' : 'gray'}
                                    width={'100%'}
                                    height={"auto"}
                                />
                            ))
                        ) : (
                            <Image width={'100%'} height={100} withPlaceholder />
                        )}
                        <Box
                            component="label"
                            sx={{
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'absolute',
                                width: 30,
                                height: 30,
                                borderRadius: '100%',
                                background: dark ? theme.colors.dark[3] : theme.colors.gray[0],
                                boxShadow: '0 0 13px 0 rgba(0, 0, 0, .1)',
                                left: 5,
                                bottom: 5,
                            }}>
                            <IconEdit size={18} color={dark ? theme.colors.dark[0] : theme.colors.blue[6]} stroke={1.75} />
                            <input
                                type="file"
                                name={name}
                                onBlur={handleBlur}
                                onChange={(e) => {
                                    if (e.target.files) {
                                        setFieldValue(name, Array.from(e.target.files));
                                        const arrFiles = Array.from(e.target.files);
                                        const multipleFiles = arrFiles.map((file, index) => {
                                            const src = window.URL.createObjectURL(file);
                                            return {
                                                file,
                                                id: index,
                                                src,
                                            };
                                        });
                                        setFieldValue('profilePreviewUrl', multipleFiles);
                                    } else {
                                        setFieldValue('profilePreviewUrl', null);
                                    }
                                }}
                                style={{
                                    width: 0,
                                    height: 0,
                                    overflow: 'hidden',
                                    opacity: 0,
                                }}
                            />
                        </Box>
                    </Box>
                </Box>
                {error && (
                    <Text component="label" weight={500} color="red" sx={{ fontSize: 13 }}>
                        {error}
                    </Text>
                )}
            </Box>
        </Stack>
    );
};

export default ImageUploadField;
