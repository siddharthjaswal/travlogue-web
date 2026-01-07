'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { GoogleIcon } from '@/components/icons';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function LoginPage() {
    const { login, isLoading } = useAuth();

    return (
        <div className="relative min-h-screen grid lg:grid-cols-2">
            <Link
                href="/"
                className="absolute left-4 top-4 md:left-8 md:top-8 z-20 flex items-center text-lg font-medium tracking-tight text-foreground lg:text-white transition-colors hover:text-primary lg:hover:text-white/80"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
            </Link>

            {/* Left Decoration - Visible on LG screens */}
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
                <div className="absolute inset-0 bg-primary" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />

                {/* Decorative Circles */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl" />

                <div className="relative z-20 mt-12 flex items-center text-lg font-medium">
                    <span className="text-2xl font-bold">Travlogue</span>
                </div>
                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                        <p className="text-lg">
                            &ldquo;The world is a book and those who do not travel read only one page.&rdquo;
                        </p>
                        <footer className="text-sm">Augustine of Hippo</footer>
                    </blockquote>
                </div>
            </div>

            {/* Right Login Form */}
            <div className="flex flex-col items-center justify-center p-8 h-full w-full">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card className="border-0 shadow-none sm:border sm:shadow-sm">
                            <CardHeader className="space-y-1 text-center">
                                <CardTitle className="text-2xl font-bold tracking-tight">
                                    Welcome back
                                </CardTitle>
                                <CardDescription>
                                    Sign in to account to continue planning your adventures
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                <Button
                                    variant="outline"
                                    className="w-full relative h-12 border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors group"
                                    onClick={login}
                                    disabled={isLoading}
                                >
                                    <GoogleIcon className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                                    Continue with Google
                                </Button>
                            </CardContent>
                            <CardFooter>
                                <p className="px-8 text-center text-sm text-muted-foreground w-full">
                                    By clicking continue, you agree to our{" "}
                                    <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
                                        Terms of Service
                                    </Link>{" "}
                                    and{" "}
                                    <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
                                        Privacy Policy
                                    </Link>
                                    .
                                </p>
                            </CardFooter>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
