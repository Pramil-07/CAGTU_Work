"use client"

import { useState, useEffect } from "react"
import {CalculatorDisplay} from "@/components/calculatorDisplay";
import {CalculatorButton} from "@/components/calculatorButton";
import Layout from "@/components/Layout/Layout";
interface CalculatorProps {
    enableKeyboard?: boolean;
}

function Calculator({ enableKeyboard = true }: CalculatorProps) {
    const [display, setDisplay] = useState("0")
    const [previousValue, setPreviousValue] = useState<number | null>(null)
    const [operation, setOperation] = useState<string | null>(null)
    const [waitingForNewValue, setWaitingForNewValue] = useState(false)
    const [isScientific, setIsScientific] = useState(false)
    const [displayExpression, setDisplayExpression] = useState("")

    useEffect(() => {
        if (!enableKeyboard) return;
        const handleKeyPress = (e: KeyboardEvent) => {
            const key = e.key

            if (/[0-9]/.test(key)) {
                e.preventDefault()
                handleNumberClick(key)
            } else if (key === ".") {
                e.preventDefault()
                handleDecimal()
            } else if (key === "+") {
                e.preventDefault()
                handleOperation("+")
            } else if (key === "-") {
                e.preventDefault()
                handleOperation("-")
            } else if (key === "*") {
                e.preventDefault()
                handleOperation("*")
            } else if (key === "/") {
                e.preventDefault()
                handleOperation("/")
            } else if (key === "Enter" || key === "=") {
                e.preventDefault()
                handleEquals()
            } else if (key === "Backspace") {
                e.preventDefault()
                handleDelete()
            } else if (key === "Escape") {
                e.preventDefault()
                handleClear()
            }
        }

        window.addEventListener("keydown", handleKeyPress)
        return () => window.removeEventListener("keydown", handleKeyPress)
    }, [display, previousValue, operation, waitingForNewValue])

    const handleNumberClick = (num: string) => {
        if (waitingForNewValue) {
            setDisplay(num)
            setDisplayExpression(num)
            setWaitingForNewValue(false)
        } else {
            const newDisplay = display === "0" ? num : display + num
            setDisplay(newDisplay)
            setDisplayExpression(displayExpression + num)
        }
    }

    const handleDecimal = () => {
        if (!display.includes(".")) {
            setDisplay(display + ".")
            setDisplayExpression(displayExpression + ".")
            setWaitingForNewValue(false)
        }
    }

    const handleOperation = (op: string) => {
        const currentValue = Number.parseFloat(display)
        const opSymbol = op === "*" ? "×" : op === "/" ? "÷" : op

        if (previousValue === null) {
            setPreviousValue(currentValue)
            setDisplayExpression(currentValue + " " + opSymbol + " ")
        } else if (operation && !waitingForNewValue) {
            const result = calculate(previousValue, currentValue, operation)
            setDisplay(formatResult(result))
            setPreviousValue(result)
            setDisplayExpression(formatResult(result) + " " + opSymbol + " ")
        } else {
            setDisplayExpression(displayExpression.slice(0, -3) + " " + opSymbol + " ")
        }

        setOperation(op)
        setWaitingForNewValue(true)
    }

    const handleEquals = () => {
        const currentValue = Number.parseFloat(display)

        if (operation && previousValue !== null) {
            const result = calculate(previousValue, currentValue, operation)
            const formattedResult = formatResult(result)
            setDisplay(formattedResult)
            setDisplayExpression(formattedResult)
            setPreviousValue(null)
            setOperation(null)
            setWaitingForNewValue(true)
        }
    }

    const calculate = (prev: number, current: number, op: string): number => {
        switch (op) {
            case "+":
                return prev + current
            case "-":
                return prev - current
            case "*":
                return prev * current
            case "/":
                return current !== 0 ? prev / current : 0
            case "%":
                return prev % current
            default:
                return current
        }
    }

    const handleScientificOperation = (func: string) => {
        const value = Number.parseFloat(display)
        let result: number

        switch (func) {
            case "sin":
                result = Math.sin((value * Math.PI) / 180)
                break
            case "cos":
                result = Math.cos((value * Math.PI) / 180)
                break
            case "tan":
                result = Math.tan((value * Math.PI) / 180)
                break
            case "sqrt":
                result = Math.sqrt(value)
                break
            case "x²":
                result = value * value
                break
            case "x³":
                result = value * value * value
                break
            case "log":
                result = Math.log10(value)
                break
            case "ln":
                result = Math.log(value)
                break
            case "π":
                setDisplay(Math.PI.toString())
                setDisplayExpression(Math.PI.toString())
                return
            case "e":
                setDisplay(Math.E.toString())
                setDisplayExpression(Math.E.toString())
                return
            default:
                result = value
        }

        setDisplay(formatResult(result))
        setDisplayExpression(formatResult(result))
        setWaitingForNewValue(true)
    }

    const formatResult = (num: number): string => {
        if (Number.isNaN(num)) return "0"
        return num.toString().length > 10 ? num.toExponential(6) : num.toString()
    }

    const handleClear = () => {
        setDisplay("0")
        setDisplayExpression("")
        setPreviousValue(null)
        setOperation(null)
        setWaitingForNewValue(false)
    }

    const handleDelete = () => {
        if (display.length === 1) {
            setDisplay("0")
            setDisplayExpression("")
        } else {
            setDisplay(display.slice(0, -1))
            setDisplayExpression(displayExpression.slice(0, -1))
        }
    }

    const handleToggleSign = () => {
        const value = Number.parseFloat(display)
        const newValue = (value * -1).toString()
        setDisplay(newValue)
        setDisplayExpression(newValue)
    }

    return (
            <div className="min-h-64  p-4 flex items-center justify-center">
                <div className="w-full max-w-md bg-card rounded-3xl shadow-sm p-6 border-t-2 ">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold text-foreground">Calculator</h2>
                        <button
                            onClick={() => setIsScientific(!isScientific)}
                            className="px-4 py-2 text-sm bg-gray-100 rounded-full text-muted-foreground hover:bg-gray-200 transition-colors font-medium"
                        >
                            {isScientific ? "Basic" : "Scientific"}
                        </button>
                    </div>

                    {/* Display */}
                    <CalculatorDisplay value={display} expression={displayExpression} />

                    {/* Basic Calculator */}
                    {!isScientific && (
                        <div className="grid grid-cols-4 gap-3 mt-6">
                            {/* Row 1: Functions */}
                            <CalculatorButton label="AC" onClick={handleClear} variant="function" />
                            <CalculatorButton label="Del" onClick={handleDelete} variant="function" />
                            <CalculatorButton label="%" onClick={() => handleOperation("%")} variant="operation" />
                            <CalculatorButton label="÷" onClick={() => handleOperation("/")} variant="operation" />

                            {/* Row 2: Numbers 7, 8, 9 */}
                            <CalculatorButton label="7" onClick={() => handleNumberClick("7")} variant="number" />
                            <CalculatorButton label="8" onClick={() => handleNumberClick("8")} variant="number" />
                            <CalculatorButton label="9" onClick={() => handleNumberClick("9")} variant="number" />
                            <CalculatorButton label="×" onClick={() => handleOperation("*")} variant="operation" />

                            {/* Row 3: Numbers 4, 5, 6 */}
                            <CalculatorButton label="4" onClick={() => handleNumberClick("4")} variant="number" />
                            <CalculatorButton label="5" onClick={() => handleNumberClick("5")} variant="number" />
                            <CalculatorButton label="6" onClick={() => handleNumberClick("6")} variant="number" />
                            <CalculatorButton label="−" onClick={() => handleOperation("-")} variant="operation" />

                            {/* Row 4: Numbers 1, 2, 3 */}
                            <CalculatorButton label="1" onClick={() => handleNumberClick("1")} variant="number" />
                            <CalculatorButton label="2" onClick={() => handleNumberClick("2")} variant="number" />
                            <CalculatorButton label="3" onClick={() => handleNumberClick("3")} variant="number" />
                            <CalculatorButton label="+" onClick={() => handleOperation("+")} variant="operation" />

                            {/* Row 5: 0, decimal, equals */}
                            <CalculatorButton label="+/−" onClick={handleToggleSign} variant="function" className="col-span-1" />
                            <CalculatorButton
                                label="0"
                                onClick={() => handleNumberClick("0")}
                                variant="number"
                                className="col-span-1"
                            />
                            <CalculatorButton label="." onClick={handleDecimal} variant="function" />
                            <CalculatorButton label="=" onClick={handleEquals} variant="equals" />
                        </div>
                    )}

                    {/* Scientific Calculator */}
                    {isScientific && (
                        <div className="grid grid-cols-6 gap-2 mt-6">
                            {/* Row 1 */}
                            <CalculatorButton
                                label="sin"
                                onClick={() => handleScientificOperation("sin")}
                                variant="function"
                                className="col-span-1 text-xs py-2"
                            />
                            <CalculatorButton
                                label="cos"
                                onClick={() => handleScientificOperation("cos")}
                                variant="function"
                                className="col-span-1 text-xs py-2"
                            />
                            <CalculatorButton
                                label="tan"
                                onClick={() => handleScientificOperation("tan")}
                                variant="function"
                                className="col-span-1 text-xs py-2"
                            />
                            <CalculatorButton
                                label="√"
                                onClick={() => handleScientificOperation("sqrt")}
                                variant="function"
                                className="col-span-1 text-xs py-2"
                            />
                            <CalculatorButton
                                label="π"
                                onClick={() => handleScientificOperation("π")}
                                variant="function"
                                className="col-span-1 text-xs py-2"
                            />
                            <CalculatorButton
                                label="e"
                                onClick={() => handleScientificOperation("e")}
                                variant="function"
                                className="col-span-1 text-xs py-2"
                            />

                            {/* Row 2 */}
                            <CalculatorButton
                                label="x²"
                                onClick={() => handleScientificOperation("x²")}
                                variant="function"
                                className="col-span-1 text-xs py-2"
                            />
                            <CalculatorButton
                                label="x³"
                                onClick={() => handleScientificOperation("x³")}
                                variant="function"
                                className="col-span-1 text-xs py-2"
                            />
                            <CalculatorButton
                                label="log"
                                onClick={() => handleScientificOperation("log")}
                                variant="function"
                                className="col-span-1 text-xs py-2"
                            />
                            <CalculatorButton
                                label="ln"
                                onClick={() => handleScientificOperation("ln")}
                                variant="function"
                                className="col-span-1 text-xs py-2"
                            />
                            <CalculatorButton label="AC" onClick={handleClear} variant="function" className="col-span-2 text-xs py-2" />

                            {/* Basic buttons grid below */}
                            <div className="col-span-6">
                                <div className="grid grid-cols-4 gap-2 mt-2">
                                    <CalculatorButton
                                        label="7"
                                        onClick={() => handleNumberClick("7")}
                                        variant="number"
                                        className="text-sm py-2"
                                    />
                                    <CalculatorButton
                                        label="8"
                                        onClick={() => handleNumberClick("8")}
                                        variant="number"
                                        className="text-sm py-2"
                                    />
                                    <CalculatorButton
                                        label="9"
                                        onClick={() => handleNumberClick("9")}
                                        variant="number"
                                        className="text-sm py-2"
                                    />
                                    <CalculatorButton
                                        label="÷"
                                        onClick={() => handleOperation("/")}
                                        variant="operation"
                                        className="text-sm py-2"
                                    />

                                    <CalculatorButton
                                        label="4"
                                        onClick={() => handleNumberClick("4")}
                                        variant="number"
                                        className="text-sm py-2"
                                    />
                                    <CalculatorButton
                                        label="5"
                                        onClick={() => handleNumberClick("5")}
                                        variant="number"
                                        className="text-sm py-2"
                                    />
                                    <CalculatorButton
                                        label="6"
                                        onClick={() => handleNumberClick("6")}
                                        variant="number"
                                        className="text-sm py-2"
                                    />
                                    <CalculatorButton
                                        label="×"
                                        onClick={() => handleOperation("*")}
                                        variant="operation"
                                        className="text-sm py-2"
                                    />

                                    <CalculatorButton
                                        label="1"
                                        onClick={() => handleNumberClick("1")}
                                        variant="number"
                                        className="text-sm py-2"
                                    />
                                    <CalculatorButton
                                        label="2"
                                        onClick={() => handleNumberClick("2")}
                                        variant="number"
                                        className="text-sm py-2"
                                    />
                                    <CalculatorButton
                                        label="3"
                                        onClick={() => handleNumberClick("3")}
                                        variant="number"
                                        className="text-sm py-2"
                                    />
                                    <CalculatorButton
                                        label="−"
                                        onClick={() => handleOperation("-")}
                                        variant="operation"
                                        className="text-sm py-2"
                                    />

                                    <CalculatorButton
                                        label="+/−"
                                        onClick={handleToggleSign}
                                        variant="function"
                                        className="col-span-1 text-sm py-2"
                                    />
                                    <CalculatorButton
                                        label="0"
                                        onClick={() => handleNumberClick("0")}
                                        variant="number"
                                        className="col-span-1 text-sm py-2"
                                    />
                                    <CalculatorButton label="." onClick={handleDecimal} variant="function" className="text-sm py-2" />
                                    <CalculatorButton
                                        label="+"
                                        onClick={() => handleOperation("+")}
                                        variant="operation"
                                        className="text-sm py-2"
                                    />

                                    <CalculatorButton
                                        label="DEL"
                                        onClick={handleDelete}
                                        variant="function"
                                        className="col-span-2 text-sm py-2"
                                    />
                                    <CalculatorButton
                                        label="="
                                        onClick={handleEquals}
                                        variant="equals"
                                        className="col-span-2 text-sm py-2"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
    )
}
export default Calculator;
