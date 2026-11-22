import React from 'react';

interface MascotProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'float' | 'bounce' | 'wave' | 'still';
  showCapBadge?: boolean;
  className?: string;
  alt?: string;
}

const SIZE_MAP = {
  xs: 'w-6 h-6',
  sm: 'w-9 h-9',
  md: 'w-12 h-12',
  lg: 'w-20 h-20',
  xl: 'w-32 h-32',
};

const ANIMATION_MAP = {
  float: 'animate-mascot-float',
  bounce: 'animate-mascot-bounce',
  wave: 'animate-mascot-wave',
  still: '',
};

export const BunkMateMascot: React.FC<MascotProps> = ({
  size = 'md',
  variant = 'float',
  showCapBadge = false,
  className = '',
  alt = 'BunkMate Mascot',
}) => {
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <img
        src="/bunkmate-mascot.png"
        alt={alt}
        className={`${SIZE_MAP[size]} object-contain select-none drop-shadow-sm ${ANIMATION_MAP[variant]}`}
        draggable={false}
      />
      {showCapBadge && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7047FF] opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#7047FF]" />
        </span>
      )}
    </div>
  );
};

export const BunkMateLogo: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  withText?: boolean;
  className?: string;
}> = ({ size = 'md', withText = true, className = '' }) => {
  if (withText) {
    const heightClass = size === 'sm' ? 'h-8' : size === 'lg' ? 'h-14' : 'h-10';
    return (
      <img
        src="/bunkmate-logo.png"
        alt="BunkMate"
        className={`${heightClass} w-auto object-contain select-none drop-shadow-xs ${className}`}
        draggable={false}
      />
    );
  }

  return <BunkMateMascot size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'} className={className} />;
};
