'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export function Navbar() {
  const { user, isLoading } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'border-b border-border/40 bg-background/80 backdrop-blur-xl shadow-lg'
          : 'bg-transparent border-b border-white/5'
      }`}
    >
      <div className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 group-hover:scale-105 transition-transform flex-shrink-0">
            <Image src="/ic_travlogue.svg" alt="Travlogue" width={32} height={32} className="invert" />
          </div>
          <span className={`text-xl font-bold tracking-tight transition-colors ${
            scrolled ? 'text-foreground' : 'text-white'
          }`}>
            Travlogue
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-8">
          {[
            { href: '#features', label: 'Features' },
            { href: '#how-it-works', label: 'How it works' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm font-medium transition-colors hover:text-foreground ${
                scrolled ? 'text-muted-foreground' : 'text-white/70 hover:text-white'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {!isLoading && (
            user ? (
              <Link href="/dashboard">
                <Button size="sm" className="shadow-lg shadow-primary/20">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login" className="hidden sm:block">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={scrolled ? '' : 'text-white/80 hover:text-white hover:bg-white/10'}
                  >
                    Log in
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="sm"
                    className="shadow-lg shadow-primary/25 hover:shadow-primary/40"
                  >
                    Get Started
                  </Button>
                </Link>
              </>
            )
          )}
        </div>
      </div>
    </motion.header>
  );
}
