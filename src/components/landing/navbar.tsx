'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { motion } from 'framer-motion';
import { ModeToggle } from '@/components/mode-toggle';

export function Navbar() {
    const { user, isLoading } = useAuth();

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md"
        >
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                        Travlogue
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-6">
                    <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        Features
                    </Link>
                    <Link href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        About
                    </Link>
                </nav>

                <div className="flex items-center gap-4">
                    <ModeToggle />
                    {!isLoading && (
                        user ? (
                            <Link href="/dashboard">
                                <Button>Dashboard</Button>
                            </Link>
                        ) : (
                            <>
                                <Link href="/login">
                                    <Button variant="ghost">Log in</Button>
                                </Link>
                                <Link href="/login">
                                    <Button>Get Started</Button>
                                </Link>
                            </>
                        )
                    )}
                </div>
            </div>
        </motion.header>
    );
}
