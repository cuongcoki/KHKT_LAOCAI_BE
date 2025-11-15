/**
 * Node modules
 */

import {Router} from 'express';

/**
 * Routes
 */
import authRouter from "./auth";
import userRouter from "./user";
import ragRouter from "./rag";

const publicRouter = Router();

publicRouter.use('/auth', authRouter);
publicRouter.use('/users', userRouter);
publicRouter.use('/rag', ragRouter);

export default publicRouter;