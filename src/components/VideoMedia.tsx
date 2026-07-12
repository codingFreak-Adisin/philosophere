interface VideoMediaProps {
  src: string;
  alt: string;
  variant: 'featured' | 'card';
}

/**
 * A video container with the spec'd hover interactions:
 * - video scales to 1.08 on hover (0.5s cubic-bezier)
 * - dark overlay fades in (0.4s)
 * - centered "+" icon in a 70px circle scales 0.7 -> 1.0 (0.3s)
 * - white L-shaped corner brackets in all 4 corners, 15px inset
 */
export default function VideoMedia({ src, alt, variant }: VideoMediaProps) {
  const className =
    variant === 'featured'
      ? 'video-media video-media--featured'
      : 'video-media video-media--card';

  return (
    <div className={className} role="img" aria-label={alt}>
      <video
        className="video-media__video"
        src={src}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
      />
      <div className="video-media__overlay" />
      <div className="video-media__plus" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </div>
      <span className="video-media__corner video-media__corner--tl" />
      <span className="video-media__corner video-media__corner--tr" />
      <span className="video-media__corner video-media__corner--bl" />
      <span className="video-media__corner video-media__corner--br" />
    </div>
  );
}
