import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth';
import { activityRouter } from './activity';
import { privateAuthRouter } from './auth';
import { sensorRouter } from './sensor';

// Everything mounted here requires a valid access token.
export const privateRouter = Router();

privateRouter.use(requireAuth);
privateRouter.use('/auth', privateAuthRouter);
privateRouter.use('/sensor', sensorRouter);
privateRouter.use('/activity', activityRouter);
