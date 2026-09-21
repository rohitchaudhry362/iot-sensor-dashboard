export const SPACING_UNIT = 8;

export const space = {
  tight: 1,
  text: 2,
  cardSmall: 3,
  cardMedium: 4,
  sectionSmall: 8,
  sectionMedium: 12,
  sectionLarge: 16,
} as const;

export const layout = {
  pagePaddingX: { xs: 2, md: 5 },
  contentMaxWidth: 1200,
  authFormMaxWidth: 440,
  headerHeight: 64,
  headerFloatGap: 8,
} as const;
