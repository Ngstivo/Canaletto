'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'link';
import axios from 'axios';

interface ContinueWatchingItem {
    lectureId: string;
    lectureTitle: string;
    currentTime: number;
    lastWatched: Date;
    course: {
        id: string;
        title: string;
        slug: string;
        thumbnailUrl?: string;
    };
}

export default function StudentDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
    const [continueWatching, setContinueWatching] = useState<ContinueWatchingItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        } else if (session) {
            fetchDashboardData();
        }
    }, [session, status]);

    const fetchDashboardData = async () => {
        try {
            const token = await fetch('/api/auth/session').then(res => res.json());

            // Fetch enrolled courses
            const enrollmentsResponse = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/payment/enrollments`,
                {
                    headers: {
                        Authorization: `Bearer ${token.user?.token || ''}`,
                    },
                }
            );

            if (enrollmentsResponse.data.success) {
                setEnrolledCourses(enrollmentsResponse.data.data);
            }

            // Fetch continue watching
            const continueResponse = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/progress/continue-watching`,
                {
                    headers: {
                        Authorization: `Bearer ${token.user?.token || ''}`,
                    },
                }
            );

            if (continueResponse.data.success) {
                setContinueWatching(continueResponse.data.data);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${String(secs).padStart(2, '0')}`;
    };

    if (isLoading || status === 'loading') {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-heading font-bold mb-2">
                            Welcome back, {session?.user?.firstName}!
                        </h1>
                        <p className="text-muted-foreground">Continue your learning journey</p>
                    </div>

                    {/* Continue Watching */}
                    {continueWatching.length > 0 && (
                        <div className="mb-12">
                            <h2 className="text-2xl font-heading font-semibold mb-6">Continue Watching</h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {continueWatching.map((item) => (
                                    <Link
                                        key={item.lectureId}
                                        href={`/learn/${item.course.id}`}
                                        className="bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                                    >
                                        {item.course.thumbnailUrl ? (
                                            <img
                                                src={item.course.thumbnailUrl}
                                                alt={item.course.title}
                                                className="w-full h-40 object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-40 bg-muted flex items-center justify-center">
                                                <span className="text-4xl">🎨</span>
                                            </div>
                                        )}
                                        <div className="p-4">
                                            <h3 className="font-heading font-semibold mb-1 truncate">
                                                {item.course.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground mb-2 truncate">
                                                {item.lectureTitle}
                                            </p>
                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                <span>Resume at {formatTime(item.currentTime)}</span>
                                                <span className="text-primary">▶ Continue</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* My Courses */}
                    <div>
                        <h2 className="text-2xl font-heading font-semibold mb-6">My Courses</h2>

                        {enrolledCourses.length === 0 ? (
                            <div className="bg-card border rounded-lg p-12 text-center">
                                <p className="text-muted-foreground mb-4">You haven't enrolled in any courses yet</p>
                                <Link
                                    href="/courses"
                                    className="inline-block bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-2 px-6 rounded-md transition-colors"
                                >
                                    Browse Courses
                                </Link>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {enrolledCourses.map((enrollment: any) => (
                                    <div
                                        key={enrollment.course.id}
                                        className="bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                                    >
                                        {enrollment.course.thumbnailUrl ? (
                                            <img
                                                src={enrollment.course.thumbnailUrl}
                                                alt={enrollment.course.title}
                                                className="w-full h-40 object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-40 bg-muted flex items-center justify-center">
                                                <span className="text-4xl">🎨</span>
                                            </div>
                                        )}
                                        <div className="p-4">
                                            <h3 className="font-heading font-semibold mb-2">
                                                {enrollment.course.title}
                                            </h3>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                                                <span>{enrollment.course.instructor?.firstName} {enrollment.course.instructor?.lastName}</span>
                                            </div>

                                            {/* TODO: Add progress bar */}

                                            <Link
                                                href={`/learn/${enrollment.course.id}`}
                                                className="block w-full text-center bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-2 px-4 rounded-md transition-colors"
                                            >
                                                Continue Learning
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
