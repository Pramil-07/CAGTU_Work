import { Button, Menu } from '@mantine/core';
import React, { useState } from 'react';

interface Item {
    id: number;
    title: string;
    description: string;
}

interface DropdownProps {
    tasks: Item[];
    services: Item[];
    is_Requested: boolean;  // Boolean to determine which items to show
}

export function Dropdown({ tasks, services, is_Requested }: DropdownProps) {
    const [displayedItems, setDisplayedItems] = useState<Item[]>([]);

    // Update displayed items based on isRequested
    const updateDisplayedItems = () => {
        if (is_Requested) {
            setDisplayedItems([...tasks, ...services]); // Show both if requested
        } else {
            setDisplayedItems(services); // Show only services if not requested
        }
    };

    return (
        <Menu width={200} shadow="md">
            <Menu.Target>
                <Button onClick={updateDisplayedItems}>Show Service/Task</Button>
            </Menu.Target>

            <Menu.Dropdown style={{ lineHeight: "27.73px", textAlign: 'start' }}>
                <Menu.Item onClick={() => {
                    setDisplayedItems(tasks);
                }}>
                    <div style={{
                        justifyContent: "center",
                        display: "flex",
                        gap: '0.5rem',
                        marginRight: '30px'
                    }}>
                        Show Tasks
                    </div>
                </Menu.Item>
                <Menu.Item onClick={() => {
                    setDisplayedItems(services);
                }}>
                    <div style={{
                        justifyContent: "center",
                        display: "flex",
                        gap: '0.5rem',
                        marginRight: '30px'
                    }}>
                        Show Services
                    </div>
                </Menu.Item>
            </Menu.Dropdown>

            <div style={{ marginTop: "1rem" }}>
                {displayedItems.map((item) => (
                    <div key={item.id}>
                        <h3>{item.title}</h3>
                        <p>{item.description}</p>
                    </div>
                ))}
            </div>
        </Menu>
    );
}
