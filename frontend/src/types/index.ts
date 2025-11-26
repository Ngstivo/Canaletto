// User types
export enum UserRole {
    STUDENT = "STUDENT",
    INSTRUCTOR = "INSTRUCTOR",
    ADMIN = "ADMIN",
}

export interface User {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: UserRole;
    avatarUrl?: string;
    bio?: string;
    stripeCustomerId?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Course types
export enum CourseStatus {
    DRAFT = "DRAFT",
    PUBLISHED = "PUBLISHED",
    ARCHIVED = "ARCHIVED",
}

export enum CourseLevel {
    BEGINNER = "BEGINNER",
    INTERMEDIATE = "INTERMEDIATE",
    ADVANCED = "ADVANCED",
}

export interface Course {
    id: string;
    instructorId: string;
    title: string;
    slug: string;
    description?: string;
    shortDescription?: string;
    price: number;
    discountPrice?: number;
    thumbnailUrl?: string;
    promoVideoUrl?: string;
    status: CourseStatus;
    level: CourseLevel;
    category?: string;
    totalDuration?: number;
    totalLectures: number;
    averageRating?: number;
    reviewCount: number;
    enrollmentCount: number;
    createdAt: Date;
    updatedAt: Date;
    instructor?: User;
    sections?: CourseSection[];
}

// Course section types
export interface CourseSection {
    id: string;
    courseId: string;
    title: string;
    description?: string;
    sortOrder: number;
    lectures?: Lecture[];
    createdAt: Date;
}

// Lecture types
export enum ContentType {
    VIDEO = "VIDEO",
    PDF = "PDF",
    TEXT = "TEXT",
    QUIZ = "QUIZ",
}

export interface Lecture {
    id: string;
    sectionId: string;
    title: string;
    contentType: ContentType;
    videoUrl?: string;
    videoDuration?: number;
    pdfUrl?: string;
    content?: string;
    sortOrder: number;
    isPreview: boolean;
    createdAt: Date;
}

// Enrollment types
export interface Enrollment {
    id: string;
    userId: string;
    courseId: string;
    paymentIntentId?: string;
    amountPaid: number;
    enrolledAt: Date;
    course?: Course;
}

// Progress types
export interface UserProgress {
    id: string;
    userId: string;
    lectureId: string;
    courseId: string;
    completed: boolean;
    progressPercentage: number;
    lastPosition?: number;
    updatedAt: Date;
}

// Review types
export interface Review {
    id: string;
    userId: string;
    courseId: string;
    rating: number;
    comment?: string;
    createdAt: Date;
    user?: User;
}

// API Response types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// Form types
export interface LoginFormData {
    email: string;
    password: string;
}

export interface RegisterFormData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

export interface CourseFormData {
    title: string;
    description: string;
    shortDescription: string;
    price: number;
    discountPrice?: number;
    level: CourseLevel;
    category: string;
}
