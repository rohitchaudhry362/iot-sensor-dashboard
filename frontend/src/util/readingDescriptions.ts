// Turns a reading into something a person can act on: "24.5" is data, "Comfortable" is information.
//
// These bands are general comfort guidance, not thresholds derived from this home or from the sample data.
// Anything learned from a particular home, or set by the person living in it, would belong with the device
// controls rather than hard-coded here.

export const describeTemperature = (celsius: number): string => {
  if (celsius < 18) return 'Cold';
  if (celsius < 20) return 'Cool';
  if (celsius <= 25) return 'Comfortable';
  if (celsius <= 28) return 'Warm';
  return 'Hot';
};

export const describeHumidity = (percent: number): string => {
  if (percent < 30) return 'Dry air';
  if (percent <= 60) return 'Comfortable';
  if (percent <= 75) return 'Humid';
  return 'Very humid';
};

// Minutes of movement within one 15-minute bucket, so the bands are read against that maximum.
export const describeActivity = (minutes: number): string => {
  if (minutes === 0) return 'No movement detected';
  if (minutes < 2) return 'Barely any movement';
  if (minutes < 7) return 'Some movement';
  return 'Busy';
};
