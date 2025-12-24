import express, { Request, Response, NextFunction } from 'express';
export const app = express();



app.use(express.json());

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  res.status(400).json({
    error: err.message,
  });
});
