import * as React from "react";
import { Box, IconButton, Slider, Typography } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";

interface AudioPlayerProps {
  url: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ url }) => {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [isSeeking, setIsSeeking] = React.useState(false);

  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoaded = () => setDuration(audio.duration);
    const handleTimeUpdate = () => {
      if (!isSeeking) setProgress(audio.currentTime);
    };

    audio.addEventListener("loadedmetadata", handleLoaded);
    audio.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoaded);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [isSeeking, url]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
    } else {
      audio.play().catch((e) => console.log("Play error:", e));
    }
    setPlaying(!playing);
  };

  const handleSeekChange = (_event: Event, value: number | number[]) => {
    const seekTime = Array.isArray(value) ? value[0] : value;
    setProgress(seekTime);
  };

  const handleSeekCommit = (
    _event: Event | React.SyntheticEvent,
    value: number | number[],
  ) => {
    const audio = audioRef.current;
    if (!audio) return;
    const seekTime = Array.isArray(value) ? value[0] : value;
    audio.currentTime = Math.min(Math.max(seekTime, 0), duration);
    setProgress(audio.currentTime);
    setIsSeeking(false);
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time) || !isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <Box
      sx={{
        width: "100%",
        p: 1,
        display: "flex",
        alignItems: "center",
        bgcolor: "grey.800",
        borderRadius: 2,
      }}
    >
      <audio ref={audioRef} src={url} preload="metadata" />
      <IconButton onClick={togglePlay} sx={{ color: "#fff" }}>
        {playing ? <PauseIcon /> : <PlayArrowIcon />}
      </IconButton>

      <Slider
        value={progress}
        min={0}
        max={duration || 0}
        onChange={handleSeekChange}
        onChangeCommitted={handleSeekCommit}
        onMouseDown={() => setIsSeeking(true)}
        onTouchStart={() => setIsSeeking(true)}
        sx={{ mx: 2, color: "primary.main" }}
      />

      <Typography variant="body2" sx={{ minWidth: 50 }}>
        {formatTime(progress)} / {formatTime(duration)}
      </Typography>
    </Box>
  );
};

export default AudioPlayer;
