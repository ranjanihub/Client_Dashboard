import { Router, type IRouter } from "express";
import healthRouter from "./health";
import dashboardRouter from "./dashboard";
import clientRouter from "./client";
import therapistRouter from "./therapist";
import sessionsRouter from "./sessions";
import activitiesRouter from "./activities";
import assessmentsRouter from "./assessments";
import progressRouter from "./progress";
import resourcesRouter from "./resources";
import messagesRouter from "./messages";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(dashboardRouter);
router.use(clientRouter);
router.use(therapistRouter);
router.use(sessionsRouter);
router.use(activitiesRouter);
router.use(assessmentsRouter);
router.use(progressRouter);
router.use(resourcesRouter);
router.use(messagesRouter);

export default router;
