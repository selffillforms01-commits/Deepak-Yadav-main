import React, { useEffect, useState } from 'react';
import { resolveFileUrl } from '../../lib/firestoreService';

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  fallbackIcon?: React.ReactNode;
}

export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  fallbackIcon,
  alt,
  className,
  style,
  ...props
}) => {
  const [resolvedSrc, setResolvedSrc] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    if (!src) {
      setResolvedSrc('');
      return;
    }

    if (src.startsWith('indexeddb://')) {
      resolveFileUrl(src).then((url) => {
        if (isMounted) setResolvedSrc(url);
      });
    } else {
      setResolvedSrc(src);
    }

    return () => {
      isMounted = false;
    };
  }, [src]);

  if (!resolvedSrc && fallbackIcon) {
    return <>{fallbackIcon}</>;
  }

  return (
    <img
      src={resolvedSrc || src}
      alt={alt || 'Image'}
      className={className}
      style={style}
      {...props}
    />
  );
};

