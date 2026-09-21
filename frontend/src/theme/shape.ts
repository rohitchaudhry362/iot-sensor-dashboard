export const radius = {
  small: 8,
  medium: 16,
  large: 24,
  pill: 9999,
} as const;

export const borderWidth = 1;

export const focusRing = {
  width: 2,
  offset: 3,
} as const;

export const glassBlur = 'blur(14px) saturate(160%)';

export const elevation = {
  none: 'none',
  card: '0 1px 2px rgba(0, 0, 0, 0.04)',
  raised: '0 8px 24px rgba(51, 51, 51, 0.08)',
} as const;
