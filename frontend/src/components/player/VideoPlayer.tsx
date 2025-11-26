'use client';

import { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

interface VideoPlayerProps {
    src: string;
    poster?: string;
    onTimeUpdate?: (currentTime: number) => void;
    onEnded?: () => void;
    autoplay?: boolean;
    startTime?: number;
}

export default function VideoPlayer({
    src,
    poster,
    onTimeUpdate,
    onEnded,
    autoplay = false,
    startTime = 0,
}: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const playerRef = useRef<any>(null);

    useEffect(() => {
        if (!videoRef.current) return;

        // Initialize Video.js
        const player = videojs(videoRef.current, {
            controls: true,
            autoplay,
            preload: 'auto',
            fluid: true,
            aspectRatio: '16:9',
            playbackRates: [0.5, 1, 1.5, 2],
            controlBar: {
                volumePanel: {
                    inline: false,
                },
            },
        });

        playerRef.current = player;

        // Set video source
        player.src({
            src,
            type: 'video/mp4',
        });

        if (poster) {
            player.poster(poster);
        }

        // Set start time if provided
        if (startTime > 0) {
            player.currentTime(startTime);
        }

        // Event listeners
        player.on('timeupdate', () => {
            const currentTime = player.currentTime();
            onTimeUpdate?.(currentTime);
        });

        player.on('ended', () => {
            onEnded?.();
        });

        // Cleanup
        return () => {
            if (playerRef.current) {
                playerRef.current.dispose();
            }
        };
    }, [src]);

    return (
        <div data-vjs-player>
            <video
                ref={videoRef}
                className="video-js vjs-big-play-centered"
            />
        </div>
    );
}
