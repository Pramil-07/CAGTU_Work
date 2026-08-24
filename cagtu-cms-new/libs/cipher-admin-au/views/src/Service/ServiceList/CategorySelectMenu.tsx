import { Menu, Box, NavLink, Input, Divider } from '@mantine/core';
import { IconSelector, IconCategory } from '@tabler/icons';
import { Fragment, useEffect, useState } from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props {
    data: object[];
    setFieldValue: (field: string, value: any) => void;
    category?: { value: string; label: string }[];
    rowId?: string | number | null;
    error?: string;
    touch?: boolean;
}

export default function CategorySelectMenu(props: Props) {
    const { data, setFieldValue, category, rowId, error, touch } = props;
    const [opened, setOpened] = useState(false);
    const [selectedCatSubCat, setSelectedCatSubCat] = useState(category ? category[0]?.label ?? '' : '');
    useEffect(() => {
        if (!rowId) {
            setFieldValue('category', '');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rowId]);
    return (
        <Menu opened={opened} onChange={setOpened} shadow="lg" width={'95%'} position="bottom">
            <Menu.Target>
                <Input.Wrapper error={touch ? error : ''}>
                    <Input
                        component="button"
                        type="button"
                        required
                        size="md"
                        icon={<IconCategory size={18} stroke={1.75} />}
                        rightSection={<IconSelector size={18} stroke={1.75} />}>
                        <Input.Placeholder
                            sx={{
                                fontWeight: 600,
                                color: selectedCatSubCat !== '' ? (touch && error ? 'red' : 'black') : touch && error ? 'red' : '',
                            }}>
                            {selectedCatSubCat !== '' ? selectedCatSubCat : 'Select category or sub-category'}
                        </Input.Placeholder>
                    </Input>
                </Input.Wrapper>
            </Menu.Target>
            <Menu.Dropdown sx={{ maxHeight: 300, width: 'inherit', overflowY: 'scroll' }}>
                <Box sx={{ width: 'inherit' }}>
                    <Menu.Label>Categories</Menu.Label>
                    {data?.map((categories: any, index: number) => {
                        if (categories.child.length > 0) {
                            return (
                                <Fragment key={index}>
                                    <NavLink
                                        label={categories.name + `(${categories.child.length})`}
                                        childrenOffset={10}
                                        my={5}
                                        sx={{ fontWeight: 600, border: '1px solid #dadada' }}
                                        active={categories?.name === selectedCatSubCat}
                                        onClick={() => {
                                            setFieldValue('category', categories.id);
                                            setSelectedCatSubCat(categories.name);
                                        }}>
                                        <Menu.Label>sub-categories of {categories?.name}</Menu.Label>
                                        {categories?.child?.map((firstChild: any, index: number) => {
                                            if (firstChild?.child?.length > 0) {
                                                return (
                                                    <Fragment key={index}>
                                                        <Divider variant="dashed" />
                                                        <NavLink
                                                            my={5}
                                                            label={firstChild?.name + `(${firstChild?.child?.length})`}
                                                            childrenOffset={10}
                                                            sx={{ fontWeight: 500, border: '1px solid #eee' }}
                                                            active={firstChild?.name === selectedCatSubCat}
                                                            onClick={() => {
                                                                setFieldValue('category', firstChild.id);
                                                                setSelectedCatSubCat(firstChild.name);
                                                            }}>
                                                            <Menu.Label>sub-categories of {firstChild.name}</Menu.Label>
                                                            {firstChild?.child?.map((secondChild: any, index: number) => {
                                                                return (
                                                                    <Fragment key={index}>
                                                                        <Divider variant="dotted" />
                                                                        <NavLink
                                                                            my={5}
                                                                            active={secondChild?.name === selectedCatSubCat}
                                                                            onClick={() => {
                                                                                setFieldValue('category', secondChild.id);
                                                                                setSelectedCatSubCat(secondChild.name);
                                                                                setOpened(false);
                                                                            }}
                                                                            sx={{ border: '1px solid #eee' }}
                                                                            mb={10}
                                                                            label={secondChild?.name}
                                                                        />
                                                                    </Fragment>
                                                                );
                                                            })}
                                                        </NavLink>
                                                    </Fragment>
                                                );
                                            } else {
                                                return (
                                                    <Fragment key={index}>
                                                        <Divider variant="dashed" />
                                                        <NavLink
                                                            my={5}
                                                            sx={{ border: '1px solid #eee' }}
                                                            active={firstChild?.name === selectedCatSubCat}
                                                            onClick={() => {
                                                                setFieldValue('category', firstChild.id);
                                                                setSelectedCatSubCat(firstChild.name);
                                                                setOpened(false);
                                                            }}
                                                            label={firstChild?.name}
                                                        />
                                                    </Fragment>
                                                );
                                            }
                                        })}
                                    </NavLink>
                                </Fragment>
                            );
                        } else {
                            return (
                                <Fragment key={index}>
                                    <NavLink
                                        active={categories?.name === selectedCatSubCat}
                                        my={5}
                                        sx={{ fontWeight: 600, border: '1px solid #eee' }}
                                        onClick={() => {
                                            setFieldValue('category', categories.id);
                                            setSelectedCatSubCat(categories.name);
                                            setOpened(false);
                                        }}
                                        label={categories.name}
                                    />
                                </Fragment>
                            );
                        }
                    })}
                </Box>
            </Menu.Dropdown>
        </Menu>
    );
}
