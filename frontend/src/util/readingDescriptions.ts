// Turns a reading into something a person can act on: "24.5" is data, "Comfortable" is information.
//
// These bands are general comfort guidance, not thresholds derived from this home or from the sample data.
// Anything learned from a particular home, or set by the person living in it, would belong with the device
// controls rather than hard-coded here.

// One scale shared by both metrics, so a colour means the same thing whichever is on screen: too little,
// about right, too much. Temperature uses all five, humidity four.
export type BandLevel = 'low' | 'slightlyLow' | 'ideal' | 'slightlyHigh' | 'high';

export interface Band {
  // The band covers values up to and including this. The last one is open-ended.
  upTo: number;
  label: string;
  level: BandLevel;
}

export const TEMPERATURE_BANDS: Band[] = [
  { upTo: 18, label: 'Cold', level: 'low' },
  { upTo: 20, label: 'Cool', level: 'slightlyLow' },
  { upTo: 25, label: 'Comfortable', level: 'ideal' },
  { upTo: 28, label: 'Warm', level: 'slightlyHigh' },
  { upTo: Infinity, label: 'Hot', level: 'high' },
];

export const HUMIDITY_BANDS: Band[] = [
  { upTo: 30, label: 'Dry air', level: 'low' },
  { upTo: 60, label: 'Comfortable', level: 'ideal' },
  { upTo: 75, label: 'Humid', level: 'slightlyHigh' },
  { upTo: Infinity, label: 'Very humid', level: 'high' },
];

export const bandFor = (bands: Band[], value: number): Band =>
  bands.find((band) => value <= band.upTo) ?? bands[bands.length - 1];

export const describeTemperature = (celsius: number): string => bandFor(TEMPERATURE_BANDS, celsius).label;

export const describeHumidity = (percent: number): string => bandFor(HUMIDITY_BANDS, percent).label;

// Minutes of movement within one 15-minute bucket, so the bands are read against that maximum.
export const describeActivity = (minutes: number): string => {
  if (minutes === 0) return 'No movement detected';
  if (minutes < 2) return 'Barely any movement';
  if (minutes < 7) return 'Some movement';
  return 'Busy';
};
