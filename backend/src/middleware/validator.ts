import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req.body);
      req.body = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const rawIssues = (error as any).issues || (error as any).errors || [];
        const issues = rawIssues.map((err: any) => ({
          field: Array.isArray(err.path) && err.path.length > 0 ? err.path.join('.') : 'payload',
          message: err.message,
        }));
        res.status(400).json({
          error: 'Validation Error',
          message: 'The submitted request payload failed schema validation',
          details: issues,
        });
        return;
      }
      res.status(400).json({ error: 'Invalid request payload' });
    }
  };
}
