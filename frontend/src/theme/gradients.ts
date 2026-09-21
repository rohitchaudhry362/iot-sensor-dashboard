import { colors } from './colors';

const BRAND_STOP = colors.brand[100];
const MID_STOP = colors.secondary[100];
const MID_STOP_AT = '40%';

const WIDTH_PX = 1400;
const HEIGHT_PX = 600;
const CENTRE_ABOVE_PAGE_PX = 140;

export const gradients = {
  page:
    `radial-gradient(${WIDTH_PX}px ${HEIGHT_PX}px at 50% -${CENTRE_ABOVE_PAGE_PX}px, ` +
    `${BRAND_STOP}, ${MID_STOP} ${MID_STOP_AT}, ${colors.beige})`,
} as const;
