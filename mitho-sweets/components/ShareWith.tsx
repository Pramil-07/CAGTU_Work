import {
    faFacebookF,
    faInstagram,
    faLinkedinIn,
    faTwitter,
    faWhatsapp,
} from "@fortawesome/free-brands-svg-icons"
import { faCheck, faCopy } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    FacebookShareButton,
    LinkedinShareButton,
    TwitterShareButton,
    WhatsappShareButton,
} from "next-share"
import { useState } from "react"
import {Modal, Button, useMantineTheme} from "@mantine/core"
import {PiShareFatLight} from "react-icons/pi";

export const ShareWith = ({ modal = false, slug = "" }: { modal?: boolean, slug?: string }) => {
    const [copied, setCopied] = useState({
        facebook: false,
        twitter: false,
        linkedin: false,
        whatsapp: false,
        instagram: false,
        copy: false,
        check: false,
    })
    const [hoveredIcon, setHoveredIcon] = useState<string | null>(null)
    const [opened, setOpened] = useState(false)
    const theme = useMantineTheme()
    const currentUrl = typeof window !== "undefined" ? modal && slug ? `${window.location.origin}/product/${slug}` : window.location.href : "";
    const handleCopy = async (iconKey: string) => {
        try {
            await navigator.clipboard.writeText(currentUrl)
            setCopied((prev) => ({ ...prev, [iconKey]: true }))
            setTimeout(() => {
                setCopied((prev) => ({ ...prev, [iconKey]: false }))
            }, 2000)
        } catch (err) {
            console.error("Failed to copy URL: ", err)
        }
    }

    const handleInstagramShare = () => {
        // Instagram doesn't have a direct web share URL, so we'll copy the URL instead
        // handleCopy("instagram")
        // You could also open Instagram app or web version
        window.open(`https://www.instagram.com/`, '_blank');
    }

    const getIconSize = (iconType: string) => {
        if (
            iconType === "whatsapp" ||
            iconType === "instagram" ||
            iconType === "check"
        ) {
            return "15px" // Bigger size for WhatsApp and Instagram
        }
        return "15px" // Default size for other icons
    }

    const getIconWeight = (iconType: string) => {
        if (
            iconType === "whatsapp" ||
            iconType === "instagram" ||
            iconType === "check"
        ) {
            return "normal" // Bolder weight
        }
        return "normal"
    }

    const iconStyle = (isCopied: boolean, iconType: string) => ({
        fontSize: getIconSize(iconType),
        fontWeight: getIconWeight(iconType),
        color: isCopied ? theme.colors.brand[7] : hoveredIcon === iconType ? theme.colors.brand[7] : "#555",
        backgroundColor: "#ffffff",
        cursor: "pointer",
        transition: "color 0.3s ease",
    })

    const containerStyle = {
        display: "flex",
        alignItems: "center",
        justifyContent: modal ? "space-between" : "flex-start",
        gap: modal ? "0px" : "6px",
    };


    const shareContent = (
        <div style={containerStyle}>
            <FacebookShareButton
                url={currentUrl}
                quote="Check out this page!"
                hashtag="share"
            >
                <FontAwesomeIcon
                    icon={faFacebookF}
                    style={iconStyle(copied.facebook, "facebook")}
                    onClick={() => handleCopy("facebook")}
                    onMouseEnter={() => setHoveredIcon("facebook")}
                    onMouseLeave={() => setHoveredIcon(null)}
                />
            </FacebookShareButton>

            <TwitterShareButton url={currentUrl} hashtags={["share"]}>
                <FontAwesomeIcon
                    icon={faTwitter}
                    style={iconStyle(copied.twitter, "twitter")}
                    onClick={() => handleCopy("twitter")}
                    onMouseEnter={() => setHoveredIcon("twitter")}
                    onMouseLeave={() => setHoveredIcon(null)}
                />
            </TwitterShareButton>

            <LinkedinShareButton url={currentUrl}>
                <FontAwesomeIcon
                    icon={faLinkedinIn}
                    style={iconStyle(copied.linkedin, "linkedin")}
                    onClick={() => handleCopy("linkedin")}
                    onMouseEnter={() => setHoveredIcon("linkedin")}
                    onMouseLeave={() => setHoveredIcon(null)}
                />
            </LinkedinShareButton>

            <WhatsappShareButton url={currentUrl} title="Check out this page!">
                <FontAwesomeIcon
                    icon={faWhatsapp}
                    style={iconStyle(copied.whatsapp, "whatsapp")}
                    onClick={() => handleCopy("whatsapp")}
                    onMouseEnter={() => setHoveredIcon("whatsapp")}
                    onMouseLeave={() => setHoveredIcon(null)}
                />
            </WhatsappShareButton>

            {/* Fixed Instagram share - using a regular button since Instagram doesn't have direct web sharing */}
            {/*// Instagram share button*/}
            {/*<button*/}
            {/*    style={{*/}
            {/*        backgroundColor: "#ffffff",*/}
            {/*        border: "none",*/}
            {/*        padding: "0",*/}
            {/*        cursor: "pointer"*/}
            {/*    }}*/}
            {/*    onClick={() => {*/}
            {/*        handleCopy("instagram");*/}
            {/*        // Optional: open Instagram website*/}
            {/*        // window.open("https://www.instagram.com/", "_blank");*/}
            {/*    }}*/}
            {/*    onMouseEnter={() => setHoveredIcon("instagram")}*/}
            {/*    onMouseLeave={() => setHoveredIcon(null)}*/}
            {/*    title={copied.instagram ? "Copied!" : "Copy URL for Instagram"}*/}
            {/*>*/}
            {/*    {!copied.instagram ? (*/}
            {/*        <FontAwesomeIcon*/}
            {/*            icon={faInstagram}*/}
            {/*            style={iconStyle(copied.instagram, "instagram")}*/}
            {/*        />*/}
            {/*    ) : (*/}
            {/*        <FontAwesomeIcon*/}
            {/*            icon={faCheck} // show checkmark when copied*/}
            {/*            style={iconStyle(true, "check")}*/}
            {/*        />*/}
            {/*    )}*/}
            {/*</button>*/}


            <button
                style={{
                    backgroundColor: "#ffffff",
                    border: "none",
                    padding: "0",
                }}
                onClick={() => handleCopy("copy")}
                onMouseEnter={() => setHoveredIcon("copy")}
                onMouseLeave={() => setHoveredIcon(null)}
                title={copied.copy ? "Copied!" : "Copy URL"}
            >
                {!copied.copy ? (
                    <FontAwesomeIcon
                        icon={faCopy}
                        style={iconStyle(copied.copy, "copy")}
                    />
                ) : (
                    <FontAwesomeIcon
                        icon={faCheck}
                        style={iconStyle(copied.copy, "check")}
                    />
                )}
            </button>
        </div>
    )

    if (!modal) {
        return shareContent
    }

    return (
        <>
            <button onClick={() => setOpened(true)}><PiShareFatLight size={18}/></button>
            <Modal
                opened={opened}
                onClose={() => setOpened(false)}
                title="Share With"
                centered
                size={395}
            >
                {shareContent}
            </Modal>
        </>
    )
}