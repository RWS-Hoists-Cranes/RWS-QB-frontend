import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { RxExclamationTriangle, RxCheckCircled } from "react-icons/rx"
import { useState, useEffect } from "react"

const alertStyles = {
    position: 'absolute',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '80%',
    maxWidth: '600px',
    zIndex: 1000,
}

const errorAlertStyles = {
    backgroundColor: 'white',
    border: '1px solid #f87171', // Light red border
    color: '#dc2626', // Red text
}

const successAlertStyles = {
    backgroundColor: 'white',
    border: '1px solid #4ade80', // Light green border
    color: '#16a34a', // Green text
}

export function ErrorAlert({ message }) {
    const [visible, setVisible] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false)
        }, 5000)

        return () => clearTimeout(timer)
    }, [])

    if (!visible) return null

    return (
        <div style={alertStyles}>
            <Alert variant="destructive" style={errorAlertStyles}>
                <RxExclamationTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
            </Alert>
        </div>
    )
}

export function SuccessAlert({ message }) {
    const [visible, setVisible] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false)
        }, 5000)

        return () => clearTimeout(timer)
    }, [])

    if (!visible) return null

    return (
        <div style={alertStyles}>
            <Alert variant="default" style={successAlertStyles}>
                <RxCheckCircled className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
            </Alert>
        </div>
    )
}