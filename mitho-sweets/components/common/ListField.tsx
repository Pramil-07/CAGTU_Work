import type { TextInputProps } from "@mantine/core";
import { Space } from "@mantine/core";
import {
    ActionIcon,
    Box,
    List,
    Text,
    TextInput,
} from "@mantine/core";
import { IconCheck, IconCirclePlus, IconX } from "@tabler/icons-react";
import type { KeyboardEvent } from "react";
import { useEffect } from "react";
import { useState } from "react";
import {createStyles} from "@mantine/styles";

export interface TaskListProps extends TextInputProps {
    initialLists?: any;
    onListChange: (requirements: string[]) => void;
    labelName: string;
    description?: string;
    touch?: boolean;
    error?: string;
}
export const ListField = ({
                              initialLists,
                              touch,
                              onListChange,
                              labelName,
                              error,
                              ...rest
                          }: TaskListProps) => {
    const { classes } = useStyles();
    const [lists, setlists] = useState<string[]>(() =>
        initialLists ? initialLists : []
    );
    console.log("initial list", initialLists)
    const errTouch = error && touch ? error : null;

    const [newList, setNewList] = useState("");

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== "Enter") return;
        event.preventDefault();
        handleAddList();
    };

    const handleAddList = () => {
        if (!newList) return;
        const listAlreadyExist = lists.find((list) => list === newList);
        if (listAlreadyExist) {
            setNewList("");
            return;
        }
        setlists((previousLists) => [...previousLists, newList]);
        setNewList("");
    };
    const handleRemoveList = (name: string) => {
        setlists((previousLists) =>
            previousLists.filter((list) => list !== name)
        );
    };
    useEffect(() => {
        onListChange(lists);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lists]);

    const renderList = () => {
        if (!Array.isArray(lists)) {
            console.error("lists is not an array:", lists);
            return null;
        }
        return  lists?.map((requirement, index) => (
            <li className={classes.listItem} key={index}>
                <ActionIcon color={"none"}>
                    <IconCheck style={{ color: "#3EAEFF" }} />
                </ActionIcon>
                <Text className={classes.listItemTitle}>{requirement}</Text>
                <ActionIcon color={"none"} onClick={() => handleRemoveList(requirement)}>
                    <IconX style={{ color: "#CED4DA" }} />
                </ActionIcon>
            </li>
        ));
    };
    return (
        <Box mb={24}>
            <Box className={classes.requirement}>
                <Text>{labelName}</Text>
            </Box>
            <Space h={10} />
            <List>{ initialLists &&renderList()}</List>
            <TextInput
                {...rest}
                error={errTouch}
                value={newList}
                radius="md"
                size="md"
                onChange={(event) => setNewList(event.currentTarget.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add requirements"
                rightSection={
                    <ActionIcon color={"none"} onClick={handleAddList}>
                        <IconCirclePlus

                            style={{
                                color: "#3EAEFF",


                            }}
                        />
                    </ActionIcon>
                }
            />
        </Box>
    );
};

export const useStyles = createStyles((theme) => ({
    listItem: {
        display: "flex",
        gap: "0.8rem",
        marginBottom: 6,
    },
    listItemTitle: {
        flex: 1,
    },
    requirement: {
        display: "flex",
        alignItems: "center",
        gap: ".8rem",
        color:
            theme.colorScheme === "dark"
                ? theme.colors.dark[0]
                : theme.colors.gray[8],
        fontWeight: 400,
    },
}));
