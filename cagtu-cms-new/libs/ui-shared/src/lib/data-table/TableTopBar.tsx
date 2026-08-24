import { ActionIcon, Group, Loader, TextInput, Tooltip, useMantineTheme } from '@mantine/core';
import { getHotkeyHandler } from '@mantine/hooks';
import { IconSearch, IconTrash, IconX } from '@tabler/icons';
import { ReactNode, useState } from 'react';

/* eslint-disable-next-line  */
export interface TableTopBarProps {
    checked?: string[];
    deleteModal?: () => void;
    onHandleSearch: (query: string) => void;
    children?: ReactNode;
    showDelete?: boolean;
    loading?: boolean;
    query?: string;
    placeholder?: string;
}

const TableTopBar = ({ loading, query = '', checked, deleteModal, onHandleSearch, showDelete = true, placeholder, children }: TableTopBarProps) => {
    const theme = useMantineTheme();
    const [value, setValue] = useState(query as string);
    return (
        <Group position="left" mb={theme.spacing.md} spacing="xs" align="normal">
            <TextInput
                value={value}
                type="search"
                variant="filled"
                placeholder={placeholder ? placeholder : 'Search'}
                size="md"
                rightSection={
                    value && !loading ? (
                        <Tooltip label="Clear" withArrow>
                            <ActionIcon
                                variant="default"
                                onClick={() => {
                                    setValue('');
                                    onHandleSearch('');
                                }}>
                                <IconX size={18} color={theme.colors.gray['5']} stroke={1.75} />
                            </ActionIcon>
                        </Tooltip>
                    ) : value && loading ? (
                        <Loader size={'xs'} />
                    ) : (
                        <IconSearch size={18} color={theme.colors.gray['5']} stroke={1.75} />
                    )
                }
                onChange={(event) => {
                    if (!event.target.value) {
                        onHandleSearch('');
                        setValue(event.target.value);
                    } else {
                        setValue(event.target.value);
                        // onHandleSearch(value) //shows results instantly in the UI
                    }
                }}
                
                onKeyDown={getHotkeyHandler([['Enter', () => onHandleSearch(value)]])}
            />
       {checked && checked.length ? (
                <>
                    {showDelete && (
                        <Tooltip label="Delete All" position="bottom" styles={{ tooltip: { fontSize: 12, padding: '3px 8px', fontWeight: 500 } }}>
                            <ActionIcon
                                variant="light"
                                radius="xl"
                                size={40}
                                color="gray"
                                sx={{
                                    cursor: 'pointer',
                                }}
                                onClick={deleteModal}>
                                <IconTrash size={22} stroke={1.75} />
                            </ActionIcon>
                        </Tooltip>
                    )}
                    {children}
                </>
            ) : null}
        </Group>
    );
};

export default TableTopBar;
