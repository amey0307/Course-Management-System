import { useState, useRef, useEffect } from 'react';

export const useVideoPlayer = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showCaptions, setShowCaptions] = useState(false);

  // Handle play/pause
  const togglePlay = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      setIsPlaying(false);
      videoRef.current.pause();
    } else {
      setIsPlaying(true);
      videoRef.current.play();
    }
  };

  // Handle volume change
  const handleVolumeChange = (value: number) => {
    if (!videoRef.current) return;

    setVolume(value);
    videoRef.current.volume = value;
    setIsMuted(value === 0);
  };

  // Handle mute toggle
  const toggleMute = () => {
    if (!videoRef.current) return;

    if (isMuted) {
      videoRef.current.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  // Handle playback rate change
  const handlePlaybackRateChange = (rate: number) => {
    if (!videoRef.current) return;

    setPlaybackRate(rate);
    videoRef.current.playbackRate = rate;
  };

  // Handle time update
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;

    const currentTime = videoRef.current.currentTime;
    const duration = videoRef.current.duration;

    setCurrentTime(currentTime);
    setProgress((currentTime / duration) * 100);
  };

  // Handle seeking
  const handleSeek = (value: number) => {
    if (!videoRef.current) return;

    const time = (value / 100) * videoRef.current.duration;
    videoRef.current.currentTime = time;
    setProgress(value);
  };

  // Handle full screen
  const toggleFullScreen = () => {
    if (!videoRef.current) return;

    if (!document.fullscreenElement) {
      videoRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Handle skipping forward/backward
  const skip = (seconds: number) => {
    if (!videoRef.current) return;

    videoRef.current.currentTime += seconds;
  };

  // Handle captions
  const toggleCaptions = () => {
    setShowCaptions(prev => !prev);
  };

  // Listen for play/pause events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleDurationChange = () => setDuration(video.duration);
    const handleFullScreenChange = () => setIsFullScreen(!!document.fullscreenElement);

    video.addEventListener('pause', handlePause);
    video.addEventListener('play', handlePlay);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    document.addEventListener('fullscreenchange', handleFullScreenChange);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, [videoRef]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoRef.current) return;

      // Don't handle shortcuts if user is in an input field
      if (document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'arrowright':
          e.preventDefault();
          skip(10);
          break;
        case 'arrowleft':
          e.preventDefault();
          skip(-10);
          break;
        case 'f':
          e.preventDefault();
          toggleFullScreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'c':
          e.preventDefault();
          toggleCaptions();
          break;
        // Playback rate controls
        case '1':
          e.preventDefault();
          handlePlaybackRateChange(1);
          break;
        case '2':
          e.preventDefault();
          handlePlaybackRateChange(1.5);
          break;
        case '3':
          e.preventDefault();
          handlePlaybackRateChange(2);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return {
    videoRef,
    isPlaying,
    progress,
    volume,
    isMuted,
    playbackRate,
    duration,
    currentTime,
    isFullScreen,
    showCaptions,
    togglePlay,
    handleVolumeChange,
    toggleMute,
    handlePlaybackRateChange,
    handleSeek,
    toggleFullScreen,
    skip,
    toggleCaptions,
  };
};