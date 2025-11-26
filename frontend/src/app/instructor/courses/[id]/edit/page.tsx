'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { Course, CourseSection, Lecture } from '@/types';

const courseSchema = z.object({
    title: z.string().min(1).max(255),
    shortDescription: z.string().max(500).optional(),
    description: z.string().optional(),
    price: z.number().min(0),
    discountPrice: z.number().min(0).optional(),
    level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
    category: z.string().optional(),
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
});

type CourseFormData = z.infer<typeof courseSchema>;

export default function EditCoursePage() {
    const params = useParams();
    const router = useRouter();
    const { data: session, status } = useSession();
    const [course, setCourse] = useState<Course | null>(null);
    const [sections, setSections] = useState<CourseSection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('details'); // details, curriculum

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<CourseFormData>({
        resolver: zodResolver(courseSchema),
    });

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        } else if (session && params.id) {
            fetchCourse();
            fetchSections();
        }
    }, [session, status, params.id]);

    const fetchCourse = async () => {
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/courses/${params.id}`
            );

            if (response.data.success) {
                const courseData = response.data.data;
                setCourse(courseData);

                // Populate form
                setValue('title', courseData.title);
                setValue('shortDescription', courseData.shortDescription || '');
                setValue('description', courseData.description || '');
                setValue('price', Number(courseData.price));
                setValue('discountPrice', courseData.discountPrice ? Number(courseData.discountPrice) : undefined);
                setValue('level', courseData.level);
                setValue('category', courseData.category || '');
                setValue('status', courseData.status);
            }
        } catch (error) {
            console.error('Error fetching course:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSections = async () => {
        try {
            const token = await fetch('/api/auth/session').then(res => res.json());

            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/content/courses/${params.id}/sections`,
                {
                    headers: {
                        Authorization: `Bearer ${token.user?.token || ''}`,
                    },
                }
            );

            if (response.data.success) {
                setSections(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching sections:', error);
        }
    };

    const onSubmit = async (data: CourseFormData) => {
        setIsSaving(true);

        try {
            const token = await fetch('/api/auth/session').then(res => res.json());

            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/courses/${params.id}`,
                data,
                {
                    headers: {
                        Authorization: `Bearer ${token.user?.token || ''}`,
                    },
                }
            );

            alert('Course updated successfully!');
        } catch (error: any) {
            alert(error.response?.data?.error || 'Error updating course');
        } finally {
            setIsSaving(false);
        }
    };

    const addSection = async () => {
        const title = prompt('Enter section title:');
        if (!title) return;

        try {
            const token = await fetch('/api/auth/session').then(res => res.json());

            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/content/courses/${params.id}/sections`,
                { title },
                {
                    headers: {
                        Authorization: `Bearer ${token.user?.token || ''}`,
                    },
                }
            );

            fetchSections();
        } catch (error) {
            alert('Error creating section');
        }
    };

    const addLecture = async (sectionId: string) => {
        const title = prompt('Enter lecture title:');
        if (!title) return;

        try {
            const token = await fetch('/api/auth/session').then(res => res.json());

            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/content/sections/${sectionId}/lectures`,
                {
                    title,
                    contentType: 'VIDEO',
                    isFree: false,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token.user?.token || ''}`,
                    },
                }
            );

            fetchSections();
        } catch (error) {
            alert('Error creating lecture');
        }
    };

    const deleteSection = async (sectionId: string) => {
        if (!confirm('Delete this section and all its lectures?')) return;

        try {
            const token = await fetch('/api/auth/session').then(res => res.json());

            await axios.delete(
                `${process.env.NEXT_PUBLIC_API_URL}/api/content/sections/${sectionId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token.user?.token || ''}`,
                    },
                }
            );

            fetchSections();
        } catch (error) {
            alert('Error deleting section');
        }
    };

    const deleteLecture = async (lectureId: string) => {
        if (!confirm('Delete this lecture?')) return;

        try {
            const token = await fetch('/api/auth/session').then(res => res.json());

            await axios.delete(
                `${process.env.NEXT_PUBLIC_API_URL}/api/content/lectures/${lectureId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token.user?.token || ''}`,
                    },
                }
            );

            fetchSections();
        } catch (error) {
            alert('Error deleting lecture');
        }
    };

    if (isLoading || status === 'loading') {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!course) {
        return null;
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-heading font-bold mb-2">
                            Edit Course
                        </h1>
                        <p className="text-muted-foreground">{course.title}</p>
                    </div>

                    {/* Tabs */}
                    <div className="bg-card border rounded-lg mb-6">
                        <div className="flex border-b">
                            <button
                                onClick={() => setActiveTab('details')}
                                className={`px-6 py-3 font-medium transition-colors ${activeTab === 'details'
                                    ? 'border-b-2 border-primary text-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                Course Details
                            </button>
                            <button
                                onClick={() => setActiveTab('curriculum')}
                                className={`px-6 py-3 font-medium transition-colors ${activeTab === 'curriculum'
                                    ? 'border-b-2 border-primary text-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                Curriculum
                            </button>
                        </div>

                        {/* Details Tab */}
                        {activeTab === 'details' && (
                            <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Title *</label>
                                    <input
                                        type="text"
                                        {...register('title')}
                                        className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                            {...register('level')}
                                            className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                        >
                                            <option value="BEGINNER">Beginner</option>
                                            <option value="INTERMEDIATE">Intermediate</option>
                                            <option value="ADVANCED">Advanced</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Category</label>
                                        <select
                                            {...register('category')}
                                            className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                        >
                                            <option value="">Select category</option>
                                            <option value="Painting">Painting</option>
                                            <option value="Drawing">Drawing</option>
                                            <option value="Watercolor">Watercolor</option>
                                            <option value="Digital Art">Digital Art</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Price (USD) *</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            {...register('price', { valueAsNumber: true })}
                                            className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Discount Price</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            {...register('discountPrice', { valueAsNumber: true })}
                                            className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Status *</label>
                                        <select
                                            {...register('status')}
                                            className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                        >
                                            <option value="DRAFT">Draft</option>
                                            <option value="PUBLISHED">Published</option>
                                            <option value="ARCHIVED">Archived</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-2.5 px-6 rounded-md transition-colors disabled:opacity-50"
                                    >
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => router.back()}
                                        className="border border-input hover:bg-muted font-medium py-2.5 px-6 rounded-md transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}

                    {/* Curriculum Tab */}
                    {activeTab === 'curriculum' && (
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-heading font-semibold">Course Curriculum</h2>
                                <button
                                    onClick={addSection}
                                    className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-2 px-4 rounded-md text-sm transition-colors"
                                >
                                    + Add Section
                                </button>
                            </div>

                            {sections.length === 0 ? (
                                <div className="text-center py-12 bg-muted/50 rounded-lg">
                                    <p className="text-muted-foreground mb-4">No sections yet</p>
                                    <button
                                        onClick={addSection}
                                        className="text-primary hover:underline"
                                    >
                                        Add your first section
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {sections.map((section, index) => (
                                        <div key={section.id} className="border rounded-lg">
                                            <div className="bg-muted/30 p-4 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-medium">Section {index + 1}:</span>
                                                    <span className="font-medium">{section.title}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => addLecture(section.id)}
                                                        className="text-sm text-primary hover:underline"
                                                    >
                                                        + Add Lecture
                                                    </button>
                                                    <button
                                                        onClick={() => deleteSection(section.id)}
                                                        className="text-sm text-destructive hover:underline"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>

                                            {section.lectures && section.lectures.length > 0 && (
                                                <div className="p-4 space-y-2">
                                                    {section.lectures.map((lecture) => (
                                                        <div
                                                            key={lecture.id}
                                                            className="flex items-center justify-between py-2 px-3 hover:bg-muted/20 rounded"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-sm">{lecture.contentType === 'VIDEO' && '▶'}</span>
                                                                <span>{lecture.title}</span>
                                                                {lecture.isFree && (
                                                                    <span className="text-xs bg-success/10 text-success px-2 py-1 rounded">
                                                                        Free Preview
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <button
                                                                onClick={() => deleteLecture(lecture.id)}
                                                                className="text-sm text-destructive hover:underline"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
        </div >
    );
}
