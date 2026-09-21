import type { Components, Theme } from '@mui/material/styles';
import { colors } from './colors';
import { borderWidth, elevation, focusRing, glassBlur, radius } from './shape';
import { layout } from './spacing';
import { fontWeight } from './typography';

const HEADER_FLOAT_GAP_PX = layout.headerFloatGap;

const focusOutline = {
  outline: `${focusRing.width}px solid ${colors.focus}`,
  outlineOffset: focusRing.offset,
};

export const components: Components<Omit<Theme, 'components'>> = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      },
      '::selection': {
        backgroundColor: colors.brand[300],
        color: colors.charcoal,
      },
    },
  },
  MuiButtonBase: {
    defaultProps: { disableRipple: true },
    styleOverrides: {
      root: { '&.Mui-focusVisible': focusOutline },
    },
  },
  MuiButton: {
    defaultProps: { variant: 'contained', disableElevation: true },
    styleOverrides: {
      root: {
        borderRadius: radius.pill,
        paddingInline: 24,
        paddingBlock: 10,
        transition: 'background-color 150ms ease, border-color 150ms ease, color 150ms ease',
        variants: [
          {
            props: { variant: 'contained', color: 'primary' },
            style: { '&:hover': { backgroundColor: colors.brand[600] } },
          },
        ],
      },
      sizeSmall: { paddingInline: 16, paddingBlock: 6, fontSize: '0.875rem' },
      sizeLarge: { paddingInline: 32, paddingBlock: 14 },
      outlined: {
        borderColor: colors.border,
        color: colors.charcoal,
        '&:hover': { backgroundColor: colors.brand[100], borderColor: colors.brand[100] },
      },
      text: {
        '&:hover': { backgroundColor: colors.brand[100] },
      },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: { '&:hover': { backgroundColor: colors.brand[100] } },
    },
  },
  MuiTextField: {
    defaultProps: { fullWidth: true },
  },
  MuiInputLabel: {
    styleOverrides: {
      root: { color: colors.textSecondary },
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: radius.small,
        backgroundColor: colors.white,
        '&:hover:not(.Mui-error):not(.Mui-focused) .MuiOutlinedInput-notchedOutline': {
          borderColor: colors.borderStrong,
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderWidth: 2 },
      },
      notchedOutline: { borderColor: colors.border },
    },
  },
  MuiFormHelperText: {
    styleOverrides: {
      root: { marginInline: 0, marginTop: 6 },
    },
  },
  MuiPaper: {
    defaultProps: { elevation: 0 },
    styleOverrides: {
      rounded: { borderRadius: radius.medium },
    },
  },
  MuiCard: {
    defaultProps: { variant: 'outlined' },
    styleOverrides: {
      root: {
        borderRadius: radius.large,
        borderColor: colors.border,
        borderWidth,
        boxShadow: elevation.card,
      },
    },
  },
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: radius.small,
        alignItems: 'center',
        variants: (
          [
            ['error', colors.error.light, colors.error.dark],
            ['success', colors.success.light, colors.success.dark],
            ['warning', colors.warning.light, colors.warning.dark],
            ['info', colors.brand[100], colors.brand[700]],
          ] as const
        ).map(([severity, backgroundColor, color]) => ({
          props: { variant: 'standard', severity },
          style: { backgroundColor, color, '& .MuiAlert-icon': { color } },
        })),
      },
    },
  },
  MuiSnackbarContent: {
    styleOverrides: {
      root: {
        backgroundColor: colors.brand[700],
        color: colors.white,
        borderRadius: radius.small,
        boxShadow: elevation.raised,
        fontWeight: fontWeight.medium,
        minWidth: 'auto',
      },
    },
  },
  MuiLink: {
    defaultProps: { underline: 'hover' },
    styleOverrides: {
      root: {
        fontWeight: fontWeight.medium,
        borderRadius: 2,
        '&.Mui-focusVisible, &:focus-visible': focusOutline,
      },
    },
  },
  MuiAppBar: {
    defaultProps: { elevation: 0, color: 'inherit' },
    styleOverrides: {
      root: {
        backgroundColor: colors.glass.surface,
        backdropFilter: glassBlur,
        WebkitBackdropFilter: glassBlur,
        top: HEADER_FLOAT_GAP_PX,
        marginInline: 'auto',
        width: `calc(100% - ${HEADER_FLOAT_GAP_PX * 2}px)`,
        borderRadius: radius.large,
        border: `${borderWidth}px solid ${colors.glass.edge}`,
        boxShadow: elevation.raised,
        '@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)))': {
          backgroundColor: colors.glass.surfaceOpaque,
        },
      },
    },
  },
  MuiDivider: {
    styleOverrides: {
      root: { borderColor: colors.border },
    },
  },
};
