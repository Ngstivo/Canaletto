/**
 * Generate URL-friendly slug from title
 */
export function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

/**
 * Calculate total duration from lectures
 */
export function calculateTotalDuration(lectures: { videoDuration?: number | null }[]): number {
    return lectures.reduce((total, lecture) => {
        return total + (lecture.videoDuration || 0);
    }, 0);
}
