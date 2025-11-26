'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';

export default function Navbar() {
    const { data: session, status } = useSession();
    const [showDropdown, setShowDropdown] = useState(false);

    const handleSignOut = async () => {
        await signOut({ callbackUrl: '/' });
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <Image
                            src="/logo.jpg"
                            alt="Canaletto Art School"
                            width={40}
                            height={40}
                            className="rounded-full"
                            priority
                        />
                        <div className="flex flex-col">
                            <span className="font-heading text-xl font-bold">Canaletto</span>
                            <span className="text-xs text-muted-foreground">Art Platform</span>
                        </div>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link href="/courses" className="text-sm font-medium hover:text-primary transition-colors">
                            Courses
                        </Link>
                        <Link href="/instructors" className="text-sm font-medium hover:text-primary transition-colors">
                            Instructors
                        </Link>
                        <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
                            About
                        </Link>
                    </div>

                    {/* Auth Section */}
                    <div className="flex items-center gap-4">
                        {status === 'loading' ? (
                            <div className="w-20 h-8 bg-muted animate-pulse rounded"></div>
                        ) : session ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                                >
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                        <span className="text-sm font-medium text-primary">
                                            {session.user.name?.charAt(0) || session.user.email?.charAt(0)}
                                        </span>
                                    </div>
                                    <span className="hidden sm:inline text-sm font-medium">
                                        {session.user.name || 'Account'}
                                    </span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {showDropdown && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setShowDropdown(false)}
                                        />
                                        <div className="absolute right-0 mt-2 w-48 bg-card border rounded-lg shadow-lg z-50 py-1">
                                            <Link
                                                href="/dashboard"
                                                className="block px-4 py-2 text-sm hover:bg-muted transition-colors"
                                                onClick={() => setShowDropdown(false)}
                                            >
                                                Dashboard
                                            </Link>
                                            <Link
                                                href="/dashboard/profile"
                                                className="block px-4 py-2 text-sm hover:bg-muted transition-colors"
                                                onClick={() => setShowDropdown(false)}
                                            >
                                                Profile
                                            </Link>
                                            {session.user.role === 'INSTRUCTOR' && (
                                                <Link
                                                    href="/instructor"
                                                    className="block px-4 py-2 text-sm hover:bg-muted transition-colors"
                                                    onClick={() => setShowDropdown(false)}
                                                >
                                                    Instructor Dashboard
                                                </Link>
                                            )}
                                            {session.user.role === 'ADMIN' && (
                                                <Link
                                                    href="/admin"
                                                    className="block px-4 py-2 text-sm hover:bg-muted transition-colors"
                                                    onClick={() => setShowDropdown(false)}
                                                >
                                                    Admin Panel
                                                </Link>
                                            )}
                                            <div className="border-t border-border my-1"></div>
                                            <button
                                                onClick={handleSignOut}
                                                className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-muted transition-colors"
                                            >
                                                Sign out
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <>
                                <Link
                                    href="/auth/login"
                                    className="text-sm font-medium hover:text-primary transition-colors"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/auth/register"
                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 transition-colors"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
