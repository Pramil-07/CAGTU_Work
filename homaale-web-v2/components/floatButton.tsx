"use client"

import { Button } from "@mantine/core"
import { motion } from "framer-motion"
import { useRouter } from "next/router"

const FloatingButton = ({ brandData }: { brandData: any }) => {
    const router = useRouter()
    const gradient =
        brandData === "Cagtu"
            ? "linear-gradient(135deg, #007bff, #00bcd4)"
            : brandData === "Homaale"
                ? "linear-gradient(135deg, #ff7a18, #ffb347)"
                : "linear-gradient(135deg, #ccc, #eee)"

    const hoverGradient =
        brandData?.smallName === "cagtu"
            ? "linear-gradient(135deg, #0062cc, #0097b2)"
            : brandData?.smallName === "homaale"
                ? "linear-gradient(135deg, #e76a00, #ffa837)"
                : "linear-gradient(135deg, #bbb, #ddd)"
    return (
        <motion.div
            animate={{
                y: [0, -6, 0],
            }}
            transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
            }}
            style={{ display: "inline-block" }}
        >
            <Button
                variant="unstyled"
                sx={{
                    fontWeight: 400,
                    borderRadius: 30,
                    boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
                    background: gradient,
                    color: "white",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    "&::before": { display: "none !important" },

                    "&:hover": {
                        transform: "scale(1.05)",
                        boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
                    },
                }}
                onClick={() =>
                    router.push({
                        pathname: "/ai",
                    })
                }
            >
                Try {brandData} AI
            </Button>
        </motion.div>
    )
}

export default FloatingButton
