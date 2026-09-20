import { Router } from 'express';
import { getActivity } from '../../handlers/activityHandlers';
import { validateQuery } from '../../middleware/validate';
import { activityRangeSchema } from '../../validation/activitySchemas';

export const activityRouter = Router();

activityRouter.get('/', validateQuery(activityRangeSchema), getActivity);
