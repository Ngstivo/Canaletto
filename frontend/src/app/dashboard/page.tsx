'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        }
    }, [status, router]);

    if (status === 'loading') {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-4xl font-heading font-bold mb-2">
                        Welcome back, {session.user.name || session.user.email}!
                    </h1>
                    <p className="text-muted-foreground">
                        Continue your learning journey
                    </p>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* My Courses Card */}
                    <div className="bg-card border rounded-lg p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-heading font-semibold text-lg">My Courses</h3>
                                <p className="text-sm text-muted-foreground">0 enrolled</p>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                            Browse and enroll in courses to start learning
                        </p>
                        <a
                            href="/courses"
                            className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                        >
                            Browse courses →
                        </a>
                    </div>

                    {/* Progress Card */}
                    <div className="bg-card border rounded-lg p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-heading font-semibold text-lg">Progress</h3>
                                <p className="text-sm text-muted-foreground">0% complete</p>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Your overall learning progress
                        </p>
                    </div>

                    {/* Profile Card */}
                    <div className="bg-card border rounded-lg p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-heading font-semibold text-lg">Profile</h3>
                                <p className="text-sm text-muted-foreground capitalize">{session.user.role?.toLowerCase()}</p>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                            Manage your account settings
                        </p>
                        <a
                            href="/dashboard/profile"
                            className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                        >
                            Edit profile →
                        </a>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-12">
                    <h2 className="text-2xl font-heading font-bold mb-6">Quick Actions</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <a
                            href="/courses"
                            className="bg-card border rounded-lg p-4 text-center hover:shadow-md transition-shadow"
                        >
                            <div className="text-3xl mb-2">📚</div>
                            <div className="font-medium">Browse Courses</div>
                        </a>

                        {session.user.role === 'INSTRUCTOR' && (
                            <a
                                href="/instructor/courses/new"
                                className="bg-card border rounded-lg p-4 text-center hover:shadow-md transition-shadow"
                            >
                                <div className="text-3xl mb-2">➕</div>
                                <div className="font-medium">Create Course</div>
                            </a>
                        )}

                        <a
                            href="/dashboard/profile"
                            className="bg-card border rounded-lg p-4 text-center hover:shadow-md transition-shadow"
                        >
                            <div className="text-3xl mb-2">⚙️</div>
                            <div className="font-medium">Settings</div>
                        </a>

                        <a
                            href="/help"
                            className="bg-card border rounded-lg p-4 text-center hover:shadow-md transition-shadow"
                        >
                            <div className="text-3xl mb-2">❓</div>
                            <div className="font-medium">Help Center</div>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
