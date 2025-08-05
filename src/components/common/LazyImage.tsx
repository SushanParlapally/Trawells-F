import React, { useState, useEffect } from 'react';
import { Box, Skeleton, useTheme } from '@mui/material';
import { useIntersectionObserver } from '../../utils/performance';

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  placeholder?: string;
  fallback?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
  className?: string;
  style?: React.CSSProperties;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  width,
  height,
  placeholder,
  fallback,
  onLoad,
  onError,
  className,
  style,
  objectFit = 'cover',
}) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const theme = useTheme();

  const { elementRef, observe } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px',
  });

  useEffect(() => {
    observe(entry => {
      if (entry.isIntersecting && !isIntersecting) {
        setIsIntersecting(true);
      }
    });
  }, [observe, isIntersecting]);

  useEffect(() => {
    if (isIntersecting && src && !isLoaded && !hasError) {
      const img = new Image();

      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
        onLoad?.();
      };

      img.onerror = () => {
        setHasError(true);
        onError?.();
      };

      img.src = src;
    }
  }, [isIntersecting, src, isLoaded, hasError, onLoad, onError]);

  const containerStyle = {
    width: width || '100%',
    height: height || 'auto',
    display: 'inline-block',
    position: 'relative' as const,
    overflow: 'hidden',
    ...style,
  };

  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit,
    transition: 'opacity 0.3s ease-in-out',
    opacity: isLoaded ? 1 : 0,
  };

  if (hasError) {
    return (
      <Box
        ref={elementRef}
        className={className}
        sx={{
          ...containerStyle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.palette.grey[100],
          color: theme.palette.text.secondary,
          fontSize: '0.875rem',
        }}
      >
        {fallback || 'Failed to load image'}
      </Box>
    );
  }

  return (
    <Box ref={elementRef} className={className} sx={containerStyle}>
      {!isLoaded && (
        <Skeleton
          variant='rectangular'
          width='100%'
          height='100%'
          sx={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
        />
      )}

      {placeholder && !isIntersecting && (
        <img
          src={placeholder}
          alt={alt}
          style={{ ...imageStyle, opacity: 1, filter: 'blur(5px)' }}
        />
      )}

      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          style={{
            ...imageStyle,
            position: isLoaded ? 'static' : 'absolute',
            top: 0,
            left: 0,
            zIndex: 2,
          }}
        />
      )}
    </Box>
  );
};

export default LazyImage;
