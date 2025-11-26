'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * z from 'zod';
import axios from 'axios';

const profileSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
    const { data: session, status, update } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string>('');

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
    });

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        }
    }, [status, router]);

    useEffect(() => {
        if (session?.user) {
            const nameParts = session.user.name?.split(' ') || ['', ''];
            setValue('firstName', nameParts[0] || '');
            setValue('lastName', nameParts.slice(1).join(' ') || '');
        }
    }, [session, setValue]);

    const onSubmit = async (data: ProfileFormData) => {
        setIsLoading(true);
        setError('');
        setSuccess(false);

        try {
            const token = await fetch('/api/auth/session').then(res => res.json());

            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`,
                data,
                {
                    headers: {
                        Authorization: `Bearer ${token.user?.token || ''}`,
                    },
                }
            );

            setSuccess(true);
            await update(); // Refresh session

            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else {
                setError('An error occurred. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

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
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-heading font-bold mb-2">
                            Profile Settings
                        </h1>
                        <p className="text-muted-foreground">
                            Manage your account information
                        </p>
                    </div>

                    {/* Profile Form */}
                    <div className="bg-card border rounded-lg p-8 shadow-sm">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {success && (
                                <div className="bg-success/10 text-success text-sm p-3 rounded-md">
                                    Profile updated successfully!
                                </div>
                            )}

                            {error && (
                                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                                    {error}
                                </div>
                            )}

                            {/* Account Info */}
                            <div>
                                <h3 className="font-heading font-semibold text-lg mb-4">
                                    Account Information
                                </h3>

                                <div className="space-y-4">
                                    {/* Email (read-only) */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={session.user.email || ''}
                                            disabled
                                            className="w-full px-3 py-2 border border-input rounded-md bg-muted text-muted-foreground cursor-not-allowed"
                                        />
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Email cannot be changed
                                        </p>
                                    </div>

                                    {/* Role (read-only) */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Role
                                        </label>
                                        <input
                                            type="text"
                                            value={session.user.role || ''}
                                            disabled
                                            className="w-full px-3 py-2 border border-input rounded-md bg-muted text-muted-foreground cursor-not-allowed capitalize"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Personal Info */}
                            <div>
                                <h3 className="font-heading font-semibold text-lg mb-4">
                                    Personal Information
                                </h3>

                                <div className="space-y-4">
                                    {/* Name Fields */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="firstName" className="block text-sm font-medium mb-2">
                                                First name
                                            </label>
                                            <input
                                                id="firstName"
                                                type="text"
                                                {...register('firstName')}
                                                className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                            />
                                            {errors.firstName && (
                                                <p className="mt-1 text-xs text-destructive">{errors.firstName.message}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="lastName" className="block text-sm font-medium mb-2">
                                                Last name
                                            </label>
                                            <input
                                                id="lastName"
                                                type="text"
                                                {...register('lastName')}
                                                className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                            />
                                            {errors.lastName && (
                                                <p className="mt-1 text-xs text-destructive">{errors.lastName.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Bio */}
                                    <div>
                                        <label htmlFor="bio" className="block text-sm font-medium mb-2">
                                            Bio
                                        </label>
                                        <textarea
                                            id="bio"
                                            rows={4}
                                            {...register('bio')}
                                            className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                            placeholder="Tell us about yourself..."
                                        />
                                        {errors.bio && (
                                            <p className="mt-1 text-xs text-destructive">{errors.bio.message}</p>
                                        )}
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Maximum 500 characters
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-2.5 px-6 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Saving...' : 'Save changes'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => router.push('/dashboard')}
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
