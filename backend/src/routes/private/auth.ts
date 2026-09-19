import { Router } from 'express';
import { getCurrentUser } from '../../handlers/authHandlers';

export const privateAuthRouter = Router();

privateAuthRouter.get('/me', getCurrentUser);
