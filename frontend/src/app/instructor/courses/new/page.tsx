'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';

const courseSchema = z.object({
    title: z.string().min(1, 'Title is required').max(255),
    description: z.string().optional(),
    shortDescription: z.string().max(500).optional(),
    price: z.number().min(0, 'Price must be 0 or greater'),
    discountPrice: z.number().min(0).optional(),
    level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
    category: z.string().optional(),
});

type CourseFormData = z.infer<typeof courseSchema>;

export default function NewCoursePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CourseFormData>({
        resolver: zodResolver(courseSchema),
        defaultValues: {
            price: 0,
            level: 'BEGINNER',
        },
    });

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

    if (status === 'unauthenticated' || (session?.user.role !== 'INSTRUCTOR' && session?.user.role !== 'ADMIN')) {
        router.push('/dashboard');
        return null;
    }

    const onSubmit = async (data: CourseFormData) => {
        setIsLoading(true);
        setError('');

        try {
            const token = await fetch('/api/auth/session').then(res => res.json());

            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/courses`,
                data,
                {
                    headers: {
                        Authorization: `Bearer ${token.user?.token || ''}`,
                    },
                }
            );

            if (response.data.success) {
                router.push(`/instructor/courses/${response.data.data.id}/edit`);
            }
        } catch (err: any) {
            if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else {
                setError('An error occurred. Please try again.');
            }
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc (100vh-4rem)] bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-heading font-bold mb-2">
                            Create New Course
                        </h1>
                        <p className="text-muted-foreground">
                            Start building your course. You can add sections and lectures later.
                        </p>
                    </div>

                    {/* Form */}
                    <div className="bg-card border rounded-lg p-8 shadow-sm">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {error && (
                                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                                    {error}
                                </div>
                            )}

                            {/* Title */}
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium mb-2">
                                    Course Title *
                                </label>
                                <input
                                    id="title"
                                    type="text"
                                    {...register('title')}
                                    className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="e.g., Watercolor Painting for Beginners"
                                />
                                {errors.title && (
                                    <p className="mt-1 text-sm text-destructive">{errors.title.message}</p>
                                )}
                            </div>

                            {/* Short Description */}
                            <div>
                                <label htmlFor="shortDescription" className="block text-sm font-medium mb-2">
                                    Short Description
                                </label>
                                <input
                                    id="shortDescription"
                                    type="text"
                                    {...register('shortDescription')}
                                    className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="A brief one-line description"
                                    maxLength={500}
                                />
                                {errors.shortDescription && (
                                    <p className="mt-1 text-sm text-destructive">{errors.shortDescription.message}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium mb-2">
                                    Full Description
                                </label>
                                <textarea
                                    id="description"
                                    rows={6}
                                    {...register('description')}
                                    className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                    placeholder="Describe what students will learn in this course..."
                                />
                                {errors.description && (
                                    <p className="mt-1 text-sm text-destructive">{errors.description.message}</p>
                                )}
                            </div>

                            {/* Level and Category */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="level" className="block text-sm font-medium mb-2">
                                        Level *
                                    </label>
                                    <select
                                        id="level"
                                        {...register('level')}
                                        className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="BEGINNER">Beginner</option>
                                        <option value="INTERMEDIATE">Intermediate</option>
                                        <option value="ADVANCED">Advanced</option>
                                    </select>
                                    {errors.level && (
                                        <p className="mt-1 text-sm text-destructive">{errors.level.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="category" className="block text-sm font-medium mb-2">
                                        Category
                                    </label>
                                    <select
                                        id="category"
                                        {...register('category')}
                                        className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="">Select category</option>
                                        <option value="Painting">Painting</option>
                                        <option value="Drawing">Drawing</option>
                                        <option value="Watercolor">Watercolor</option>
                                        <option value="Digital Art">Digital Art</option>
                                    </select>
                                    {errors.category && (
                                        <p className="mt-1 text-sm text-destructive">{errors.category.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* Price and Discount */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="price" className="block text-sm font-medium mb-2">
                                        Price (USD) *
                                    </label>
                                    <input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        {...register('price', { valueAsNumber: true })}
                                        className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="49.99"
                                    />
                                    {errors.price && (
                                        <p className="mt-1 text-sm text-destructive">{errors.price.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="discountPrice" className="block text-sm font-medium mb-2">
                                        Discount Price (Optional)
                                    </label>
                                    <input
                                        id="discountPrice"
                                        type="number"
                                        step="0.01"
                                        {...register('discountPrice', { valueAsNumber: true })}
                                        className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="29.99"
                                    />
                                    {errors.discountPrice && (
                                        <p className="mt-1 text-sm text-destructive">{errors.discountPrice.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-2.5 px-6 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Creating...' : 'Create Course'}
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
                    </div>
                </div>
            </div>
        </div>
    );
}
