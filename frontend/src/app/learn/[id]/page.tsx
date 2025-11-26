'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { Course, CourseSection } from '@/types';
import VideoPlayer from '@/components/player/VideoPlayer';
import { checkEnrollment } from '@/lib/stripe';

export default function LearnPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session, status } = useSession();
    const [course, setCourse] = useState<Course | null>(null);
    const [sections, setSections] = useState<CourseSection[]>([]);
    const [currentLecture, setCurrentLecture] = useState<any>(null);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
            <p className="text-muted-foreground">Loading course...</p>
                </div >
            </div >
        );
}

if (!isEnrolled || !course) {
    return null;
}

return (
    <div className="min-h-screen bg-background">
        <div className="flex flex-col lg:flex-row">
            {/* Main Content - Video Player */}
            <div className="flex-1">
                {/* Course Header */}
                <div className="bg-card border-b px-6 py-4">
                    <h1 className="text-2xl font-heading font-bold">{course.title}</h1>
                    {currentLecture && (
                        <p className="text-sm text-muted-foreground mt-1">{currentLecture.title}</p>
                    )}
                </div>

                {/* Video Player */}
                <div className="bg-black">
                    {currentLecture && currentLecture.contentType === 'VIDEO' && currentLecture.contentUrl ? (
                        <VideoPlayer
                            src={currentLecture.contentUrl}
                            onTimeUpdate={handleTimeUpdate}
                            onEnded={handleLectureComplete}
                        />
                    ) : (
                        <div className="aspect-video flex items-center justify-center bg-muted">
                            <p className="text-muted-foreground">No video available</p>
                        </div>
                    )}
                </div>

                {/* Lecture Content */}
                <div className="p-6">
                    <div className="max-w-4xl">
                        <h2 className="text-xl font-heading font-semibold mb-4">
                            {currentLecture?.title || 'Select a lecture'}
                        </h2>

                        {currentLecture?.textContent && (
                            <div className="prose prose-sm max-w-none text-muted-foreground mb-6">
                                {currentLecture.textContent}
                            </div>
                        )}

                        {currentLecture?.contentType === 'PDF' && currentLecture.contentUrl && (
                            <div className="bg-muted p-6 rounded-lg">
                                <a
                                    href={currentLecture.contentUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline flex items-center gap-2"
                                >
                                    📄 Download PDF Resource
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Sidebar - Course Curriculum */}
            <div className="lg:w-96 bg-card border-l">
                <div className="sticky top-0">
                    <div className="border-b px-6 py-4">
                        <h3 className="font-heading font-semibold">Course Content</h3>
                    </div>

                    <div className="overflow-y-auto max-h-[calc(100vh-5rem)]">
                        {sections.map((section, sectionIndex) => (
                            <div key={section.id} className="border-b last:border-0">
                                <div className="px-6 py-3 bg-muted/30">
                                    <div className="font-medium text-sm">
                                        Section {sectionIndex + 1}: {section.title}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        {section.lectures?.length || 0} lectures
                                    </div>
                                </div>

                                {section.lectures && section.lectures.length > 0 && (
                                    <div>
                                        {section.lectures.map((lecture) => (
                                            <button
                                                key={lecture.id}
                                                onClick={() => setCurrentLecture(lecture)}
                                                className={`w-full text-left px-6 py-3 hover:bg-muted/50 transition-colors ${currentLecture?.id === lecture.id ? 'bg-primary/10 border-l-4 border-primary' : ''
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="flex-shrink-0 mt-1">
                                                        {lecture.contentType === 'VIDEO' && '▶'}
                                                        {lecture.contentType === 'PDF' && '📄'}
                                                        {lecture.contentType === 'TEXT' && '📝'}
                                                        {lecture.contentType === 'QUIZ' && '❓'}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-medium truncate">
                                                            {lecture.title}
                                                        </div>
                                                        {lecture.videoDuration && (
                                                            <div className="text-xs text-muted-foreground mt-1">
                                                                {Math.floor(lecture.videoDuration / 60)}:
                                                                {String(lecture.videoDuration % 60).padStart(2, '0')}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
);
}
