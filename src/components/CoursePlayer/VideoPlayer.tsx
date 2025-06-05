import React, { useEffect, useState } from 'react';
import {
  Play, Pause, Volume2, VolumeX,
  SkipBack, SkipForward, Maximize,
  Minimize, Subtitles, Bookmark, Settings,
  Loader,
  CheckCircle
} from 'lucide-react';
import { useVideoPlayer } from '../../hooks/useVideoPlayer';
import { formatTime } from '../../utils/helpers';
import { Video } from '../../types';
import { videoStorage } from '../../utils/db';

interface VideoPlayerProps {
  video: Video;
  onComplete: () => void;
  isCompleted: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ video, onComplete, isCompleted }) => {
  const {
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
    skip,
    toggleCaptions,
  } = useVideoPlayer();

  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [captionUrl, setCaptionUrl] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showPlaybackOptions, setShowPlaybackOptions] = useState(false);

  // Reference to the main container (for fullscreen)
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Load video and caption URLs
  useEffect(() => {
    const loadVideo = async () => {
      try {
        // Clear previous video URL
        if (videoUrl) {
          URL.revokeObjectURL(videoUrl);
          setVideoUrl(null);
        }

        const videoBlob = await videoStorage.getVideo(video.path);
        if (videoBlob) {
          const newVideoUrl = URL.createObjectURL(videoBlob);
          setVideoUrl(newVideoUrl);
        }

        if (video.caption) {
          const captionBlob = await videoStorage.getVideo(video.caption);
          if (captionBlob) {
            setCaptionUrl(URL.createObjectURL(captionBlob));
          }
        }
      } catch (error) {
        console.error('Error loading video:', error);
      }
    };

    loadVideo();

    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      if (captionUrl) URL.revokeObjectURL(captionUrl);
    };
  }, [video, video.path]);

  // Show controls when hovering or when video is playing
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (isHovering || !isPlaying) {
      setShowControls(true);
      if (timer) clearTimeout(timer);
    } else {
      timer = setTimeout(() => {
        setShowControls(false);
      }, 2000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isHovering, isPlaying]);

  // Check if video is completed
  useEffect(() => {
    if (videoRef.current) {
      const checkCompletion = () => {
        const video = videoRef.current;
        if (video && !isCompleted) {
          if (video.currentTime >= video.duration * 0.9) {
            onComplete();
          }
        }
      };

      const videoElement = videoRef.current;
      videoElement.addEventListener('timeupdate', checkCompletion);

      return () => {
        videoElement.removeEventListener('timeupdate', checkCompletion);
      };
    }
  }, [videoRef, isCompleted, onComplete]);

  // Handle fullscreen changes and always show controls
  useEffect(() => {
    const handleFullscreenChange = () => {
      // Always show controls when entering/exiting fullscreen
      setShowControls(true);
      setIsHovering(true); // Force hover state to keep controls visible

      // Force remove any browser controls that might have appeared
      if (videoRef.current) {
        videoRef.current.controls = false;
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Disable default video controls
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.controls = false;
      videoRef.current.oncontextmenu = (e) => e.preventDefault();
    }
  }, [videoUrl]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle shortcuts if user is in an input field
      if (document.activeElement?.tagName === 'INPUT' || 
          document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          skip(10);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skip(-10);
          break;
        case 'KeyF':
          e.preventDefault();
          handleFullScreenToggle();
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        case 'KeyC':
          e.preventDefault();
          toggleCaptions();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [togglePlay, skip, toggleMute, toggleCaptions]);

  // Custom fullscreen toggle that uses the container instead of just the video
  const handleFullScreenToggle = () => {
    if (!document.fullscreenElement) {
      // Enter fullscreen with the entire container
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      // Exit fullscreen
      document.exitFullscreen();
    }
  };

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => {
    // Don't hide controls in fullscreen mode
    if (!document.fullscreenElement) {
      setIsHovering(false);
    }
  };

  const handleVideoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    togglePlay();
  };

  const playbackOptions = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  if (!videoUrl) {
    return (
      <div className="flex items-center justify-center h-full bg-black">
        <div className="text-white"><Loader />Loading video...</div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-black"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full cursor-pointer"
        controls={false}
        controlsList="nodownload nofullscreen noremoteplayback"
        disablePictureInPicture
        onClick={(e) => {
          handleVideoClick(e);
        }}
        onEnded={onComplete}
        playsInline
        onContextMenu={(e) => e.preventDefault()}
      >
        {captionUrl && (
          <track
            kind="subtitles"
            src={captionUrl}
            label="English"
            default={showCaptions}
          />
        )}
      </video>

      {/* Play button overlay - only shown when paused */}
      {!isPlaying && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer z-10"
          onClick={(e) => {
            handleVideoClick(e);
          }}
        >
          <button
            className="w-20 h-20 flex items-center justify-center rounded-full bg-blue-600/80 text-white hover:bg-blue-600 transition-all duration-200"
            id='play-button'
          >
            <Play className="h-10 w-10" />
          </button>
        </div>
      )}

      {/* Controls overlay - Always visible in fullscreen */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-4 py-2 transition-opacity duration-200 z-20 ${
          showControls || !isPlaying || document.fullscreenElement ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress bar */}
        <div
          className="relative w-full h-2 bg-gray-700 rounded-full mb-4 cursor-pointer group"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = ((e.clientX - rect.left) / rect.width) * 100;
            handleSeek(percent);
          }}
        >
          <div
            className="absolute top-0 left-0 h-2 bg-blue-600 rounded-full"
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          />
          <div className="absolute top-0 left-0 w-full h-2 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          <div 
            className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `${Math.max(0, Math.min(100, progress))}%`, marginLeft: '-6px' }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-center space-x-4">
            <button onClick={togglePlay} className="text-white hover:text-blue-400 transition-colors">
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>

            <button onClick={() => skip(-10)} className="text-white hover:text-blue-400 transition-colors">
              <SkipBack className="h-5 w-5" />
            </button>

            <button onClick={() => skip(10)} className="text-white hover:text-blue-400 transition-colors">
              <SkipForward className="h-5 w-5" />
            </button>

            <div
              className="relative"
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <button onClick={toggleMute} className="text-white hover:text-blue-400 transition-colors">
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>

              {showVolumeSlider && (
                <div className="absolute bottom-8 left-0 p-2 bg-gray-900 rounded-md w-32 z-30">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>
              )}
            </div>

            <div className="text-white text-xs">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {captionUrl && (
              <button
                onClick={toggleCaptions}
                className={`text-white hover:text-blue-400 transition-colors ${showCaptions ? 'text-blue-400' : ''}`}
              >
                <Subtitles className="h-5 w-5" />
              </button>
            )}

            <div className="relative">
              <button
                onClick={() => setShowPlaybackOptions(!showPlaybackOptions)}
                className="text-white hover:text-blue-400 transition-colors"
              >
                <Settings className="h-5 w-5" />
              </button>

              {showPlaybackOptions && (
                <div className="absolute bottom-8 right-0 p-2 bg-gray-900 rounded-md w-40 z-30">
                  <div className="text-white text-xs mb-2">Playback Speed</div>
                  <div className="grid grid-cols-3 gap-1">
                    {playbackOptions.map((rate) => (
                      <button
                        key={rate}
                        onClick={() => handlePlaybackRateChange(rate)}
                        className={`text-xs px-2 py-1 rounded-sm transition-colors ${playbackRate === rate
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-white hover:bg-gray-600'
                          }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onComplete();
              }}
              className={`text-white hover:text-blue-400 transition-colors ${isCompleted ? 'text-green-500' : ''}`}
            >
              <CheckCircle className="h-5 w-5" />
            </button>

            <button
              onClick={handleFullScreenToggle}
              className="text-white hover:text-blue-400 transition-colors"
            >
              {document.fullscreenElement ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;