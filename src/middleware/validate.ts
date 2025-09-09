import { ZodError, ZodObject } from "zod";
import { Request, Response, NextFunction } from "express";

type Schema = {
  body?: ZodObject<any>;
  query?: ZodObject<any>;
  params?: ZodObject<any>;
};

export function validate(schema: Schema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schema.body) req.body = await schema.body.parseAsync(req.body);
      if (schema.query)
        (req as any).query = await schema.query.parseAsync(req.query);
      if (schema.params)
        (req as any).params = await schema.params.parseAsync(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: "Validation error",
          issues: error.issues,
        });
      }
      next(error);
    }
  };
}
