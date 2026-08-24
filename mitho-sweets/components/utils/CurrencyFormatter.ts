export function formatNumberWithCondition(number: number, symbol="AU$"){
    if (!symbol) {
        // Handle undefined symbol
        return number.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 3,
        });
    }

    if (symbol === "रु") {
        // Custom format for Nepali style (NPR)
        return number?.toLocaleString('en-IN', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 3,
        });
    } else if (symbol === "AU$") {
        // Format for AUD with exactly 2 decimal places
        return number?.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    } else {
        // Fallback for other valid symbols
        return number?.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 3,
        });
    }
}
export function calculateEstimatedDeliveryDate(createdAt: string, daysToAdd: number = 3): string | null {
    try {
        // Parse the created_at string to a Date object
        const createdDate = new Date(createdAt);
        if (isNaN(createdDate.getTime())) {
            throw new Error("Invalid created_at date");
        }

        // Add the specified number of days
        const deliveryDate = new Date(createdDate);
        deliveryDate.setDate(createdDate.getDate() + daysToAdd);

        // Format the delivery date (e.g., to ISO string or locale-specific format)
        return deliveryDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    } catch (error) {
        console.error("Error calculating delivery date:", error);
        return null;
    }
}