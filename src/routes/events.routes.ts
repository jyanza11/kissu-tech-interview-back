import { Router, type Request } from "express";
import { z } from "zod";
import { cache } from "../middleware/cache";
import { validate } from "../middleware/validate";
import { simulateEventSchema, idSchema } from "../types/schemas";
import {
  getEventAnalysis,
  listEvents,
  simulateEvent,
  triggerAIAnalysis,
} from "../services/events.service";

export const eventsRouter: Router = Router();

eventsRouter.get("/", cache(15), async (_req, res, next) => {
  try {
    const data = await listEvents();
    res.json(data);
  } catch (e) {
    next(e);
  }
});

eventsRouter.post(
  "/simulate",
  validate({ body: simulateEventSchema }),
  async (req, res, next) => {
    try {
      const created = await simulateEvent(req.body);
      res.status(201).json(created);
    } catch (e) {
      next(e);
    }
  }
);

eventsRouter.get(
  "/:id/analysis",
  validate({ params: z.object({ id: idSchema }) }),
  cache(30),
  async (req, res, next) => {
    try {
      const { id } = req.params as Request["params"] & { id: string };
      const data = await getEventAnalysis(id);
      res.json(data);
    } catch (e) {
      next(e);
    }
  }
);

eventsRouter.post(
  "/:id/analyze",
  validate({ params: z.object({ id: idSchema }) }),
  async (req, res, next) => {
    try {
      const { id } = req.params as Request["params"] & { id: string };
      const analysis = await triggerAIAnalysis(id);
      res.json(analysis);
    } catch (e) {
      next(e);
    }
  }
);
