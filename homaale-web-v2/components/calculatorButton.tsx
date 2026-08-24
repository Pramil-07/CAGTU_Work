"use client"


interface CalculatorButtonProps {
    label: string
    onClick: () => void
    variant?: "number" | "operation" | "function" | "equals"
    className?: string
}

export function CalculatorButton({ label, onClick, variant = "number", className }: CalculatorButtonProps) {
    const baseStyles = "py-4 rounded-full font-medium text-base transition-all active:scale-95 border"

    const variantStyles = {
        number: "bg-secondary text-secondary-foreground hover:bg-secondary/90 ",
        operation: "bg-accent text-accent-foreground hover:bg-accent/90 font-semibold",
        function: "bg-muted text-muted-foreground hover:bg-muted/80 font-semibold",
        equals: "bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded",
    }
    const finalClassName = `${baseStyles} ${variantStyles[variant]} ${className || ""}`

    return (
        <button onClick={onClick} className={finalClassName}>
            {label}
        </button>
    )
}
