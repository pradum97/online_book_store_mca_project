"use client";

import React, { useState, useEffect, memo, useRef } from "react";
import { CircularProgress, Box } from "@mui/material";

interface AvatarWithLoadingProps {
  imageUrl?: string;
  altText?: string;
  size?: number;
  fallbackText?: string;
}

const AvatarWithLoadingComponent: React.FC<AvatarWithLoadingProps> = ({
  imageUrl,
  altText = "avatar",
  size = 40,
  fallbackText = "?",
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (imageUrl) {
      setLoading(true);
      setError(false);
    } else {
      setLoading(false);
      setError(true);
    }
  }, [imageUrl]);

  useEffect(() => {
    if (
      imgRef.current &&
      imgRef.current.complete &&
      imgRef.current.naturalWidth !== 0
    ) {
      setLoading(false);
    }
  }, [imageUrl]);

  return (
    <Box
      sx={{
        position: "relative",
        width: size,
        height: size,
        borderRadius: "50%",
        bgcolor: "#1976d2",
        color: "#fff",
        fontWeight: 700,
        fontSize: size / 2,
        overflow: "hidden",
        userSelect: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {(error || !imageUrl) && (
        <span
          style={{
            position: "absolute",
            userSelect: "none",
            zIndex: 1,
          }}
        >
          {fallbackText}
        </span>
      )}

      {loading && !error && (
        <CircularProgress
          size={size / 2}
          sx={{ position: "absolute", zIndex: 2 }}
        />
      )}

      {imageUrl && !error && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={imageUrl}
          alt={altText}
          width={size}
          height={size}
          style={{
            borderRadius: "50%",
            objectFit: "cover",
            display: loading ? "none" : "block",
          }}
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
          draggable={false}
        />
      )}
    </Box>
  );
};

export default memo(AvatarWithLoadingComponent);
