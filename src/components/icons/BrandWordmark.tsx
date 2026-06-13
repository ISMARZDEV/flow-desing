import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { APP_NAME } from '@/lib/brand';

// Wordmark lockup ("AiSpace Flow"). Two variants by target background:
// - logo-light.png → dark ink, for LIGHT themes
// - logo-dark.png  → light ink, for DARK themes
const WORDMARK_LIGHT = '/logos/logo-light.png';
const WORDMARK_DARK = '/logos/logo-dark.png';

export const BrandWordmark: React.FC<{ className?: string; alt?: string }> = ({
  className = '',
  alt = APP_NAME,
}) => {
  const { resolvedTheme } = useTheme();
  const src = resolvedTheme === 'dark' ? WORDMARK_DARK : WORDMARK_LIGHT;

  return <img src={src} alt={alt} className={`object-contain ${className}`.trim()} />;
};
