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

    const video = videoRef.current;
    const currentTime = video.currentTime;
    const duration = video.duration;

    setCurrentTime(currentTime);

    // Check if duration is valid (not NaN or 0)
    if (duration && !isNaN(duration) && duration > 0) {
      setDuration(duration);
      setProgress((currentTime / duration) * 100);
    }
  };

  // Handle metadata loaded - ensures duration is available
  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    if (video.duration && !isNaN(video.duration)) {
      setDuration(video.duration);
    }
  };

  // Handle seeking
  const handleSeek = (value: number) => {
    if (!videoRef.current || !duration) return;

    const time = (value / 100) * duration;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
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

  const resetVideoState = () => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    duration ? setDuration(duration) : setDuration(0);
  };

  // Listen for video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleDurationChange = () => {
      if (video.duration && !isNaN(video.duration)) {
        setDuration(video.duration);
      }
    };
    const handleFullScreenChange = () => setIsFullScreen(!!document.fullscreenElement);

    // Add event listeners
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('loadeddata', handleLoadedMetadata);
    document.addEventListener('fullscreenchange', handleFullScreenChange);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('loadeddata', handleLoadedMetadata);
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);

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

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Reset state when new video is loaded
    resetVideoState();

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleDurationChange = () => {
      if (video.duration && !isNaN(video.duration)) {
        setDuration(video.duration);
      }
    };
    const handleFullScreenChange = () => setIsFullScreen(!!document.fullscreenElement);
    const handleLoadStart = () => resetVideoState();
    const handleCanPlay = () => {
      if (video.duration && !isNaN(video.duration)) {
        setDuration(video.duration);
      }
    };

    // Add event listeners
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('loadeddata', handleLoadedMetadata);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    document.addEventListener('fullscreenchange', handleFullScreenChange);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('loadeddata', handleLoadedMetadata);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, [videoRef.current]); // This dependency ensures the effect re-runs when video element changes


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