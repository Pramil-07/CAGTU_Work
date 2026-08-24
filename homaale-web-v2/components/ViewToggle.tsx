import React from 'react';
import { SegmentedControl, Group } from '@mantine/core';
import { Grid, List } from 'lucide-react';

interface ViewToggleProps {
    isGrid: boolean;
    setIsGrid: (value: boolean) => void;
    dark: boolean;
}

const ViewToggleButton: React.FC<ViewToggleProps> = ({ isGrid, setIsGrid, dark }) => {
    return (
        <SegmentedControl
            value={isGrid ? 'grid' : 'table'}
            onChange={(value) => setIsGrid(value === 'grid')}
            data={[
                {
                    value: 'grid',
                    label: (
                        <Group spacing={8}>
                            <Grid className="hover:text-orange-400" size={16} />
                        </Group>
                    ),
                },
                {
                    value: 'table',
                    label: (
                        <Group spacing={8}>
                            <List className="hover:text-orange-400" size={16} />
                        </Group>
                    ),
                },
            ]}
            sx={(theme) => ({
                backgroundColor: dark ? theme.colors.dark[7] : theme.white,
            })}
        />
    );
};

export default ViewToggleButton;
