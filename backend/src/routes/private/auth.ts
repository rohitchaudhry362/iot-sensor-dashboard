import { Router } from 'express';
import { getCurrentUser, updateCurrentUser } from '../../handlers/authHandlers';
import { validateBody } from '../../middleware/validate';
import { updateProfileSchema } from '../../validation/authSchemas';

export const privateAuthRouter = Router();

privateAuthRouter.get('/me', getCurrentUser);
privateAuthRouter.put('/me', validateBody(updateProfileSchema), updateCurrentUser);
