"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

export function ModeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <Button variant="ghost" size="icon" disabled className="opacity-50" />
    }

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark")
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="relative w-10 h-10 rounded-full hover:bg-muted/50 transition-colors"
            aria-label="Toggle theme"
        >
            <AnimatePresence mode="wait" initial={false}>
                {theme === "dark" ? (
                    <motion.div
                        key="moon"
                        initial={{ scale: 0.5, rotate: -90, opacity: 0 }}
                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                        exit={{ scale: 0.5, rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="absolute"
                    >
                        <Moon className="h-5 w-5 text-blue-400 fill-blue-400/20" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="sun"
                        initial={{ scale: 0.5, rotate: -90, opacity: 0 }}
                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                        exit={{ scale: 0.5, rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="absolute"
                    >
                        <Sun className="h-5 w-5 text-amber-500 fill-amber-500/20" />
                    </motion.div>
                )}
            </AnimatePresence>
        </Button>
    )
}
