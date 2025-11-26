'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { Course } from '@/types';

export default function InstructorCoursesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated' || (session && session.user.role !== 'INSTRUCTOR' && session.user.role !== 'ADMIN')) {
            router.push('/dashboard');
        } else if (session) {
            fetchCourses();
        }
    }, [session, status]);

    const fetchCourses = async () => {
        try {
            const token = await fetch('/api/auth/session').then(res => res.json());

            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/courses`,
                {
                    headers: {
                        Authorization: `Bearer ${token.user?.token || ''}`,
                    },
                }
            );

            if (response.data.success) {
                // Filter to only show instructor's own courses
                const userCourses = response.data.data.filter(
                    (course: Course) => course.instructorId === session?.user.id
                );
                setCourses(userCourses);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (status === 'loading' || isLoading) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!session || (session.user.role !== 'INSTRUCTOR' && session.user.role !== 'ADMIN')) {
        return null;
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-heading font-bold mb-2">
                            My Courses
                        </h1>
                        <p className="text-muted-foreground">
                            Manage your courses and track performance
                        </p>
                    </div>
                    <Link
                        href="/instructor/courses/new"
                        className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 font-medium transition-colors"
                    >
                        + Create New Course
                    </Link>
                </div>

                {/* Courses Grid */}
                {courses.length === 0 ? (
                    <div className="bg-card border rounded-lg p-12 text-center">
                        <div className="text-6xl mb-4">📚</div>
                        <h3 className="text-xl font-heading font-semibold mb-2">
                            No courses yet
                        </h3>
                        <p className="text-muted-foreground mb-6">
                            Create your first course to start teaching
                        </p>
                        <Link
                            href="/instructor/courses/new"
                            className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 font-medium transition-colors"
                        >
                            Create Your First Course
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <div key={course.id} className="bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                                {/* Thumbnail */}
                                <div className="relative w-full h-40 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                                    {course.thumbnailUrl ? (
                                        <img
                                            src={course.thumbnailUrl}
                                            alt={course.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-5xl">🎨</span>
                                    )}
                                    <div className="absolute top-3 right-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${course.status === 'PUBLISHED'
                                                ? 'bg-success/90 text-success-foreground'
                                                : course.status === 'DRAFT'
                                                    ? 'bg-muted text-muted-foreground'
                                                    : 'bg-destructive/90 text-destructive-foreground'
                                            }`}>
                                            {course.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <h3 className="font-heading font-semibold text-lg mb-2">
                                        {course.title}
                                    </h3>

                                    {/* Stats */}
                                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-muted-foreground">
                                        <div>
                                            <div className="font-medium text-foreground">{course.enrollmentCount || 0}</div>
                                            <div>Students</div>
                                        </div>
                                        <div>
                                            <div className="font-medium text-foreground">
                                                {course.averageRating ? Number(course.averageRating).toFixed(1) : 'N/A'}
                                            </div>
                                            <div>Rating</div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-4 border-t">
                                        <Link
                                            href={`/instructor/courses/${course.id}/edit`}
                                            className="flex-1 text-center border border-input hover:bg-muted font-medium py-2 px-4 rounded-md text-sm transition-colors"
                                        >
                                            Edit
                                        </Link>
                                        <Link
                                            href={`/courses/${course.slug}`}
                                            className="flex-1 text-center bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-2 px-4 rounded-md text-sm transition-colors"
                                        >
                                            View
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
