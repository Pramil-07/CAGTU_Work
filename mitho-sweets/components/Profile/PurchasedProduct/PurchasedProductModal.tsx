"use client"

import type React from "react"
import { useState } from "react"
import { Modal, Image, Text, Button, Group, Stack, Badge, Divider, Grid, Tooltip, Box } from "@mantine/core"
import { useMantineTheme } from "@mantine/core"
import { HiOutlineShoppingBag } from "react-icons/hi2"
import { PiShareFatLight } from "react-icons/pi"
import { Heart } from "lucide-react"
import logo from "@/images/logo-bg-min.png"

interface StockDetails {
    color: string
    size_unit: string
    size: number
}

interface CartItemProduct {
    product_name: string
    product_price: number
    product_id: number
    product_image: string | null
    product_images: string[]
    quantity: number
    sub_total: number
    store_name: string
    stock: StockDetails
}

interface ProductModalProps {
    opened: boolean
    onClose: () => void
    product: CartItemProduct
    onAddToCart: () => void
    isInCart: boolean
}

const PurchasedProductModal: React.FC<ProductModalProps> = ({ opened, onClose, product, onAddToCart, isInCart }) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0)
    const theme = useMantineTheme()

    const images = product.product_images?.length > 0 ? product.product_images : [product.product_image || logo]

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            size="xl"
            title={
                <Text fw={600} size="lg">
                    Quick View
                </Text>
            }
            centered
            overlayProps={{
                backgroundOpacity: 0.55,
                blur: 3,
            }}
            styles={{
                content: {
                    borderRadius: "16px",
                },
                header: {
                    borderBottom: `1px solid ${theme.colors.gray[2]}`,
                    paddingBottom: "16px",
                },
                body: {
                    padding: "24px",
                },
            }}
        >
            <Grid gutter="xl">
                {/* Left side - Images */}
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Stack gap="md">
                        {/* Main Image */}
                        <Box
                            style={{
                                position: "relative",
                                backgroundColor: "#f8f9fa",
                                borderRadius: "12px",
                                overflow: "hidden",
                                aspectRatio: "1",
                            }}
                        >
                            <Image
                                src={images[selectedImageIndex] || logo}
                                alt={product.product_name}
                                fit="contain"
                                style={{
                                    width: "100%",
                                    height: "100%",
                                }}
                            />

                            {/* Store Badge */}
                            {product.store_name && (
                                <Badge
                                    variant="filled"
                                    color="pink"
                                    size="sm"
                                    style={{
                                        position: "absolute",
                                        top: "12px",
                                        left: "12px",
                                    }}
                                >
                                    {product.store_name}
                                </Badge>
                            )}
                        </Box>

                        {/* Thumbnail Images */}
                        {images.length > 1 && (
                            <Group gap="xs" justify="center">
                                {images.slice(0, 4).map((image, index) => (
                                    <Box
                                        key={index}
                                        onClick={() => setSelectedImageIndex(index)}
                                        style={{
                                            cursor: "pointer",
                                            border:
                                                selectedImageIndex === index ? `2px solid ${theme.colors.brand[7]}` : "2px solid transparent",
                                            borderRadius: "8px",
                                            overflow: "hidden",
                                            width: "60px",
                                            height: "60px",
                                            backgroundColor: "#f8f9fa",
                                        }}
                                    >
                                        <Image
                                            src={image || logo}
                                            alt={`${product.product_name} ${index + 1}`}
                                            fit="contain"
                                            style={{ width: "100%", height: "100%" }}
                                        />
                                    </Box>
                                ))}
                            </Group>
                        )}
                    </Stack>
                </Grid.Col>

                {/* Right side - Product Details */}
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Stack gap="lg">
                        {/* Product Name */}
                        <div>
                            <Text size="xl" fw={600} c="dark">
                                {product.product_name}
                            </Text>
                            <Text size="sm" c="dimmed" mt="xs">
                                Store: {product.store_name}
                            </Text>
                        </div>

                        {/* Price */}
                        <Group align="baseline" gap="sm">
                            <Text size="2xl" fw={700} style={{ color: theme.colors.brand[7] }}>
                                ${product.product_price?.toFixed(2) || "0.00"}
                            </Text>
                            {/* {product.sub_total && product.sub_total !== product.product_price && (
                                <Text size="lg" td="line-through" c="dimmed">
                                    ${product.sub_total?.toFixed(2)}
                                </Text>
                            )} */}
                        </Group>

                        <Divider />

                        {/* Stock Details */}
                        {product.stock && (
                            <div>
                                <Text size="sm" fw={500} mb="xs">
                                    Product Details:
                                </Text>
                                <Stack gap="xs">
                                    {product.stock.color && (
                                        <Group gap="sm">
                                            <Text size="sm" c="dimmed">
                                                Color:
                                            </Text>
                                            <Badge variant="light" size="sm">
                                                {product.stock.color}
                                            </Badge>
                                        </Group>
                                    )}
                                    {product.stock.size && (
                                        <Group gap="sm">
                                            <Text size="sm" c="dimmed">
                                                Size:
                                            </Text>
                                            <Badge variant="light" size="sm">
                                                {product.stock.size}
                                                {product.stock.size_unit}
                                            </Badge>
                                        </Group>
                                    )}
                                </Stack>
                            </div>
                        )}

                        {/* Quantity */}
                        {product.quantity && (
                            <Group gap="sm">
                                <Text size="sm" c="dimmed">
                                   Purchased Quantity:
                                </Text>
                                <Badge variant="light" color="green" size="sm">
                                    {product.quantity} units
                                </Badge>
                            </Group>
                        )}

                        <Divider />

                        {/* Action Buttons */}
                        {/*<Stack gap="md">*/}
                            {/* Add to Cart Button */}
                            {/*<Button*/}
                            {/*    size="lg"*/}
                            {/*    fullWidth*/}
                            {/*    leftSection={<HiOutlineShoppingBag size={20} />}*/}
                            {/*    onClick={onAddToCart}*/}
                            {/*    style={{*/}
                            {/*        backgroundColor: theme.colors.brand[7],*/}
                            {/*        color: "white",*/}
                            {/*    }}*/}
                            {/*    variant={isInCart ? "light" : "filled"}*/}
                            {/*>*/}
                            {/*    {isInCart ? "Already in Cart" : "Add to Cart"}*/}
                            {/*</Button>*/}

                            {/* Secondary Actions */}
                        {/*    <Group grow>*/}
                        {/*        <Tooltip label="Add to Wishlist">*/}
                        {/*            <Button*/}
                        {/*                variant="light"*/}
                        {/*                leftSection={<Heart size={16} />}*/}
                        {/*                style={{*/}
                        {/*                    color: theme.colors.brand[7],*/}
                        {/*                    borderColor: theme.colors.brand[7],*/}
                        {/*                }}*/}
                        {/*            >*/}
                        {/*                Wishlist*/}
                        {/*            </Button>*/}
                        {/*        </Tooltip>*/}

                        {/*        <Tooltip label="Share Product">*/}
                        {/*            <Button*/}
                        {/*                variant="light"*/}
                        {/*                leftSection={<PiShareFatLight size={16} />}*/}
                        {/*                style={{*/}
                        {/*                    color: theme.colors.brand[7],*/}
                        {/*                    borderColor: theme.colors.brand[7],*/}
                        {/*                }}*/}
                        {/*            >*/}
                        {/*                Share*/}
                        {/*            </Button>*/}
                        {/*        </Tooltip>*/}
                        {/*    </Group>*/}
                        {/*</Stack>*/}

                        {/* Additional Info */}
                        <Box
                            p="md"
                            style={{
                                backgroundColor: theme.colors.gray[0],
                                borderRadius: "8px",
                                border: `1px solid ${theme.colors.gray[2]}`,
                            }}
                        >
                            {/*<Text size="sm" c="dimmed">*/}
                            {/*    <strong>Product ID:</strong> {product.product_id}*/}
                            {/*</Text>*/}
                            {/* {product.sub_total && (
                                <Text size="sm" c="dimmed" mt="xs">
                                    <strong>Subtotal:</strong> ${product.sub_total.toFixed(2)}
                                </Text>
                            )}    */}
                              {product.sub_total && (
                                <Text size="sm" c="dimmed" mt="xs">
                                    <strong>Total:</strong> ${product.product_price.toFixed(2)}
                                </Text>
                            )}
                        </Box>
                    </Stack>
                </Grid.Col>
            </Grid>
        </Modal>
    )
}

export default PurchasedProductModal
