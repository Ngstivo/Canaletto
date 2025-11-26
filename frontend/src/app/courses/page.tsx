'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Course } from '@/types';

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({
        level: '',
        category: '',
        search: '',
    });

    useEffect(() => {
        fetchCourses();
    }, [filters]);

    const fetchCourses = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.level) params.append('level', filters.level);
            if (filters.category) params.append('category', filters.category);
            if (filters.search) params.append('search', filters.search);

            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/courses?${params}`
            );

            if (response.data.success) {
                setCourses(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-heading font-bold mb-2">
                        Explore Courses
                    </h1>
                    <p className="text-muted-foreground">
                        Discover amazing art courses from expert instructors
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-card border rounded-lg p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Search
                            </label>
                            <input
                                type="text"
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                placeholder="Search courses..."
                                className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        {/* Level Filter */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Level
                            </label>
                            <select
                                value={filters.level}
                                onChange={(e) => setFilters({ ...filters, level: e.target.value })}
                                className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="">All Levels</option>
                                <option value="BEGINNER">Beginner</option>
                                <option value="INTERMEDIATE">Intermediate</option>
                                <option value="ADVANCED">Advanced</option>
                            </select>
                        </div>

                        {/* Category Filter */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Category
                            </label>
                            <select
                                value={filters.category}
                                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="">All Categories</option>
                                <option value="Painting">Painting</option>
                                <option value="Drawing">Drawing</option>
                                <option value="Watercolor">Watercolor</option>
                                <option value="Digital Art">Digital Art</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Course Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-card border rounded-lg overflow-hidden animate-pulse">
                                <div className="w-full h-48 bg-muted"></div>
                                <div className="p-6">
                                    <div className="h-6 bg-muted rounded mb-2"></div>
                                    <div className="h-4 bg-muted rounded w-3/4"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : courses.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🎨</div>
                        <h3 className="text-xl font-heading font-semibold mb-2">
                            No courses found
                        </h3>
                        <p className="text-muted-foreground">
                            Try adjusting your filters or check back later
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <Link
                                key={course.id}
                                href={`/courses/${course.slug}`}
                                className="bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-all group"
                            >
                                {/* Thumbnail */}
                                <div className="relative w-full h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                                    {course.thumbnailUrl ? (
                                        <img
                                            src={course.thumbnailUrl}
                                            alt={course.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-6xl">🎨</span>
                                    )}
                                    {course.level && (
                                        <div className="absolute top-3 right-3 bg-background/90 backdrop-blur px-3 py-1 rounded-full text-xs font-medium capitalize">
                                            {course.level.toLowerCase()}
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <h3 className="font-heading font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                                        {course.title}
                                    </h3>

                                    {course.shortDescription && (
                                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                            {course.shortDescription}
                                        </p>
                                    )}

                                    {/* Instructor */}
                                    {course.instructor && (
                                        <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                                <span className="text-xs">
                                                    {course.instructor.firstName?.charAt(0)}
                                                </span>
                                            </div>
                                            <span>
                                                {course.instructor.firstName} {course.instructor.lastName}
                                            </span>
                                        </div>
                                    )}

                                    {/* Footer */}
                                    <div className="flex items-center justify-between pt-4 border-t">
                                        <div className="flex items-center gap-1">
                                            {course.averageRating && course.averageRating > 0 ? (
                                                <>
                                                    <span className="text-yellow-500">★</span>
                                                    <span className="text-sm font-medium">
                                                        {Number(course.averageRating).toFixed(1)}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        ({course.reviewCount})
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">No reviews yet</span>
                                            )}
                                        </div>
                                        <div className="text-lg font-bold text-primary">
                                            {course.discountPrice ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="line-through text-sm text-muted-foreground">
                                                        ${Number(course.price).toFixed(0)}
                                                    </span>
                                                    <span>${Number(course.discountPrice).toFixed(0)}</span>
                                                </div>
                                            ) : (
                                                <span>${Number(course.price).toFixed(0)}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
