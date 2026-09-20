import { asyncHandler } from '../lib/asyncHandler';
import { findActivityBuckets } from '../services/activityService';
import type { ActivityRangeQuery } from '../validation/activitySchemas';

export const getActivity = asyncHandler(async (req, res) => {
  const range = req.query as unknown as ActivityRangeQuery;
  res.json({ from: range.from, to: range.to, buckets: await findActivityBuckets(range) });
});
