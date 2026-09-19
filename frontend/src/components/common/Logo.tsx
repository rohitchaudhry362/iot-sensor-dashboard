import { APP_NAME } from '../../config/app';
import { colors, radius } from '../../theme';
import { Box } from './Box';
import { Typography } from './Typography';

const SIZES = { small: 28, medium: 36 } as const;

export const LogoMark = ({ size = 'medium' }: { size?: keyof typeof SIZES }) => (
  <Box
    component="svg"
    viewBox="0 0 32 32"
    aria-hidden="true"
    sx={{ width: SIZES[size], height: SIZES[size], flexShrink: 0, borderRadius: `${radius.small}px` }}
  >
    <rect width="32" height="32" rx="8" fill={colors.brand[500]} />
    <path
      d="M5 17h5l3-7 5 13 3-6h6"
      fill="none"
      stroke={colors.white}
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Box>
);

export const Logo = ({ size = 'medium' }: { size?: keyof typeof SIZES }) => (
  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.25 }}>
    <LogoMark size={size} />
    <Typography component="span" sx={{ fontWeight: 700, fontSize: size === 'small' ? '1.125rem' : '1.375rem' }}>
      {APP_NAME}
    </Typography>
  </Box>
);
