import { Router, type Request } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate";
import { cache } from "../middleware/cache";
import {
  createWatchlistSchema,
  updateWatchlistSchema,
  addTermSchema,
  idSchema,
} from "../types/schemas";
import {
  listWatchlists,
  getWatchlist,
  createWatchlist,
  updateWatchlist,
  deleteWatchlist,
  addTerm,
  deleteTerm,
} from "../services/watchlists.service";

export const watchlistsRouter: Router = Router();

watchlistsRouter.get("/", cache(30), async (_req, res, next) => {
  try {
    const data = await listWatchlists();
    res.json(data);
  } catch (e) {
    next(e);
  }
});

watchlistsRouter.post(
  "/",
  validate({ body: createWatchlistSchema }),
  async (req, res, next) => {
    try {
      const created = await createWatchlist(req.body.name);
      res.status(201).json(created);
    } catch (e) {
      next(e);
    }
  }
);

watchlistsRouter.get(
  "/:id",
  validate({ params: z.object({ id: idSchema }) }),
  cache(30),
  async (req, res, next) => {
    try {
      const { id } = req.params as Request["params"] & { id: string };
      const wl = await getWatchlist(id);
      if (!wl) return res.status(404).json({ message: "Not found" });
      res.json(wl);
    } catch (e) {
      next(e);
    }
  }
);

watchlistsRouter.put(
  "/:id",
  validate({
    params: z.object({ id: idSchema }),
    body: updateWatchlistSchema,
  }),
  async (req, res, next) => {
    try {
      const { id } = req.params as Request["params"] & { id: string };
      const updated = await updateWatchlist(id, req.body.name);
      res.json(updated);
    } catch (e) {
      next(e);
    }
  }
);

watchlistsRouter.delete(
  "/:id",
  validate({ params: z.object({ id: idSchema }) }),
  async (req, res, next) => {
    try {
      await deleteWatchlist(req.params.id);
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  }
);

watchlistsRouter.post(
  "/:id/terms",
  validate({
    params: z.object({ id: idSchema }),
    body: addTermSchema,
  }),
  async (req, res, next) => {
    try {
      const { id } = req.params as Request["params"] & { id: string };
      const t = await addTerm(id, req.body.term);
      res.status(201).json(t);
    } catch (e) {
      next(e);
    }
  }
);

watchlistsRouter.delete(
  "/:id/terms/:termId",
  validate({
    params: z.object({
      id: idSchema,
      termId: idSchema,
    }),
  }),
  async (req, res, next) => {
    try {
      await deleteTerm(req.params.termId);
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  }
);
