import express, { type Request, type Response } from 'express';
const router = express.Router();

// Placeholder: GET /analytics/summary
router.get('/summary', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Analytics service placeholder' });
});

export const analyticsRouter = router;
