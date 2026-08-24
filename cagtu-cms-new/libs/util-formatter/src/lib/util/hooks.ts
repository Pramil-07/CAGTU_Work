import { useState } from 'react';
import { useLocalStorage, useMediaQuery } from '@mantine/hooks';
import { useLocation } from 'react-router-dom';
import { ColorScheme } from '@mantine/core';
import * as _ from 'lodash';

// Color Scheme
export const useSwitchColorMode = () => {
    const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
        key: 'theme',
        defaultValue: 'light',
    });

    const toggleColorScheme = (value?: ColorScheme) => {
        setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));
    };

    return { colorScheme, toggleColorScheme };
};

// Sidebar Collapsed
export const useSidebarCollapsed = () => {
    const [opened, setOpened] = useState<boolean>(false);
    const [minimize, setMinimize] = useState<boolean>(false);
    const mediaMatch = useMediaQuery('(min-width: 1000px)');

    const handleAsideToggler = () => {
        setOpened((o) => !o);
        if (mediaMatch) {
            setMinimize((min) => !min);
        } else {
            setMinimize(false);
        }
    };

    return { opened, minimize, handleAsideToggler };
};

// Interviews Table Popover Show and Set the Id
export const useCandidatesStatus = () => {
    const [activePopover, setActivePopover] = useState<string>('');
    const [statusName, setStatusName] = useState<string>('');

    const handlePopover = (rowId: string) => {
        setActivePopover(rowId);
        if (activePopover === rowId) {
            setActivePopover('');
        }
    };

    const handleStatusChange = (name: string) => setStatusName(name);

    const handlePopoverClose = () => {
        setActivePopover('');
        setStatusName('');
    };

    return { activePopover, statusName, handlePopoverClose, handlePopover, handleStatusChange };
};

// Check Last value of location.pathname and set to PageTabNavbar Component Breadcrumb.
export const useBreadCrumbCurrentTitle = () => {
    const location = useLocation();
    const locationName = location.pathname.split('/').pop();
    const currentTitle = _.startCase(String(locationName));

    return { currentTitle };
};

// Change data limit in data table
export const useDataLimit = (limit: string) => {
    const [limitChange, setLimitChange] = useState<string>(limit);
    const handleLimitChange = (value: string) => {
        setLimitChange(value);
    };

    return { limitChange, handleLimitChange };
};

// Change offset limit in data table
export const useDataOffset = () => {
    const [offset, setOffset] = useState<string>('');
    const handleOffsetChange = (value: string) => setOffset(value);

    return { offset, handleOffsetChange };
};
