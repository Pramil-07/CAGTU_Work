"use client"

import { Modal, Button, Text, Group, Stack, ThemeIcon } from "@mantine/core"
import { useRouter } from "next/navigation"
import type { Icon } from "@tabler/icons-react"

interface AuthModalProps {
    opened: boolean
    onClose: () => void
    color: string
    title: string
    description: string
    link?: string
    buttonTitle?: string
    icon: Icon
}

export function AuthModal({
                                     opened,
                                     onClose,
                                     color,
                                     title,
                                     description,
                                     link,
                                     buttonTitle,
                                     icon: IconComponent,
                                 }: AuthModalProps) {
    const router = useRouter()

    const handleAction = () => {
        if (link) {
            router.push(link)
        }
        onClose()
    }

    return (
        <Modal opened={opened} onClose={onClose} centered withCloseButton={false} size="sm" radius="md" padding="xl">
            <Stack align="center" gap="lg">
                <ThemeIcon size={64} radius="xl" style={{ backgroundColor: color }} variant="filled">
                    <IconComponent size={32} color="white" />
                </ThemeIcon>

                <Stack align="center" gap="xs">
                    <Text size="lg" fw={600} ta="center">
                        {title}
                    </Text>
                    <Text size="sm" c="dimmed" ta="center">
                        {description}
                    </Text>
                </Stack>

                <Group gap="sm" w="100%">
                    <Button variant="outline" onClick={onClose} flex={1} radius="md">
                        Cancel
                    </Button>
                    {buttonTitle && (
                        <Button onClick={handleAction} flex={1} radius="md" style={{ backgroundColor: color }}>
                            {buttonTitle}
                        </Button>
                    )}
                </Group>
            </Stack>
        </Modal>
    )
}
