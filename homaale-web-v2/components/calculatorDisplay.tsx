interface CalculatorDisplayProps {
    value: string
    expression?: string
}

export function CalculatorDisplay({ value, expression = "" }: CalculatorDisplayProps) {
    return (
        <div className="bg-muted rounded-xl p-6 text-right">
            {expression && <p className="text-muted-foreground text-sm mb-2 min-h-6">{expression}</p>}
            <p className="text-4xl font-light text-foreground break-words">{value}</p>
        </div>
    )
}
