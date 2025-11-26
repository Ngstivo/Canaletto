'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import axios from 'axios';
import { Course } from '@/types';
import { enrollInCourse, checkEnrollment } from '@/lib/stripe';

export default function CourseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session } = useSession();
    const [course, setCourse] = useState<Course | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [isEnrolling, setIsEnrolling] = useState(false);

    useEffect(() => {
        if (params.slug) {
            fetchCourse();
        }
    }, [params.slug]);

    useEffect(() => {
        if (course && session) {
            checkUserEnrollment();
        }
    }, [course, session]);

    useEffect(() => {
        const success = searchParams.get('success');
        const canceled = searchParams.get('canceled');

        if (success === 'true') {
            alert('Payment successful! You are now enrolled.');
            if (course && session) {
                checkUserEnrollment();
            }
        } else if (canceled === 'true') {
            alert('Payment was canceled.');
        }
    }, [searchParams]);

    const fetchCourse = async () => {
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/courses/${params.slug}`
            );

            if (response.data.success) {
                setCourse(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching course:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const checkUserEnrollment = async () => {
        if (!course) return;

        try {
            const enrolled = await checkEnrollment(course.id);
            setIsEnrolled(enrolled);
        } catch (error) {
            console.error('Error checking enrollment:', error);
        }
    };

    const handleEnroll = async () => {
        if (!session) {
            router.push('/auth/login');
            return;
        }

        if (!course) return;

        setIsEnrolling(true);

        try {
            await enrollInCourse(course.id);
        } catch (error: any) {
            alert(error.message || 'Enrollment failed');
            setIsEnrolling(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading course...</p>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-heading font-bold mb-2">Course not found</h2>
                    <p className="text-muted-foreground mb-4">The course you're looking for doesn't exist</p>
                    <Link href="/courses" className="text-primary hover:underline">
                        ← Back to courses
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="max-w-5xl mx-auto">
                    <div className="mb-6 text-sm text-muted-foreground">
                        <Link href="/courses" className="hover:text-primary">Courses</Link>
                        <span className="mx-2">›</span>
                        <span>{course.title}</span>
                    </div>

                    <div className="bg-card border rounded-lg p-8 mb-6">
                        <div className="flex flex-col lg:flex-row gap-8">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-4">
                                    {course.level && (
                                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium capitalize">
                                            {course.level.toLowerCase()}
                                        </span>
                                    )}
                                    {course.category && (
                                        <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm font-medium">
                                            {course.category}
                                        </span>
                                    )}
                                </div>

                                <h1 className="text-4xl font-heading font-bold mb-4">{course.title}</h1>

                                {course.shortDescription && (
                                    <p className="text-lg text-muted-foreground mb-6">{course.shortDescription}</p>
                                )}

                                {course.instructor && (
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                            <span className="text-lg">{course.instructor.firstName?.charAt(0)}</span>
                                        </div>
                                        <div>
                                            <div className="text-sm text-muted-foreground">Instructor</div>
                                            <div className="font-medium">
                                                {course.instructor.firstName} {course.instructor.lastName}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                    {course.averageRating && course.averageRating > 0 && (
                                        <div className="flex items-center gap-1">
                                            <span className="text-yellow-500">★</span>
                                            <span className="font-medium text-foreground">
                                                {Number(course.averageRating).toFixed(1)}
                                            </span>
                                            <span>({course.reviewCount} reviews)</span>
                                        </div>
                                    )}
                                    <div>{course.enrollmentCount || 0} students enrolled</div>
                                </div>
                            </div>

                            <div className="lg:w-80">
                                <div className="bg-background border rounded-lg p-6">
                                    {isEnrolled ? (
                                        <div className="mb-6">
                                            <div className="bg-success/10 text-success px-4 py-3 rounded-lg text-center mb-4">
                                                ✓ You're enrolled in this course
                                            </div>
                                            <Link
                                                href={`/learn/${course.id}`}
                                                className="block w-full text-center bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-3 px-4 rounded-md transition-colors"
                                            >
                                                Go to Course
                                            </Link>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="mb-6">
                                                {course.discountPrice ? (
                                                    <div>
                                                        <div className="text-3xl font-bold text-primary mb-1">
                                                            ${Number(course.discountPrice).toFixed(0)}
                                                        </div>
                                                        <div className="line-through text-muted-foreground">
                                                            ${Number(course.price).toFixed(0)}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-3xl font-bold text-primary">
                                                        ${Number(course.price).toFixed(0)}
                                                    </div>
                                                )}
                                            </div>

                                            <button
                                                onClick={handleEnroll}
                                                disabled={isEnrolling}
                                                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-3 px-4 rounded-md transition-colors mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isEnrolling ? 'Processing...' : 'Enroll Now'}
                                            </button>

                                            <div className="text-center text-sm text-muted-foreground">
                                                30-day money-back guarantee
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {course.description && (
                        <div className="bg-card border rounded-lg p-8 mb-6">
                            <h2 className="text-2xl font-heading font-bold mb-4">About this course</h2>
                            <div className="prose prose-sm max-w-none text-muted-foreground">
                                {course.description}
                            </div>
                        </div>
                    )}

                    {course.sections && course.sections.length > 0 && (
                        <div className=" bg-card border rounded-lg p-8 mb-6">
                            <h2 className="text-2xl font-heading font-bold mb-4">Course Content</h2>
                            <div className="space-y-2">
                                {course.sections.map((section, index) => (
                                    <details key={section.id} className="group border rounded-lg">
                                        <summary className="cursor-pointer p-4 hover:bg-muted/50 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-medium">Section {index + 1}:</span>
                                                    <span className="font-medium">{section.title}</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-sm text-muted-foreground">
                                                        {section.lectures?.length || 0} lectures
                                                    </span>
                                                    <svg className="w-5 h-5 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </summary>
                                        <div className="border-t p-4 bg-muted/20">
                                            {section.lectures && section.lectures.length > 0 ? (
                                                <ul className="space-y-2">
                                                    {section.lectures.map((lecture) => (
                                                        <li key={lecture.id} className="flex items-center justify-between py-2">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded bg-background flex items-center justify-center">
                                                                    {lecture.contentType === 'VIDEO' && '▶'}
                                                                    {lecture.contentType === 'PDF' && '📄'}
                                                                    {lecture.contentType === 'TEXT' && '📝'}
                                                                    {lecture.contentType === 'QUIZ' && '❓'}
                                                                </div>
                                                                <span className="text-sm">{lecture.title}</span>
                                                            </div>
                                                            {lecture.videoDuration && (
                                                                <span className="text-sm text-muted-foreground">
                                                                    {Math.floor(lecture.videoDuration / 60)}:{String(lecture.videoDuration % 60).padStart(2, '0')}
                                                                </span>
                                                            )}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-sm text-muted-foreground">No lectures yet</p>
                                            )}
                                        </div>
                                    </details>
                                ))}
                            </div>
                        </div>
                    )}

                    {course.reviews && course.reviews.length > 0 && (
                        <div className="bg-card border rounded-lg p-8">
                            <h2 className="text-2xl font-heading font-bold mb-6">Student Reviews</h2>
                            <div className="space-y-6">
                                {course.reviews.map((review) => (
                                    <div key={review.id} className="border-b last:border-0 pb-6 last:pb-0">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                <span>{review.user?.firstName?.charAt(0) || 'U'}</span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="font-medium">
                                                        {review.user?.firstName} {review.user?.lastName}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <span key={i} className={i < review.rating ? 'text-yellow-500' : 'text-gray-300'}>
                                                                ★
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                {review.comment && (
                                                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
