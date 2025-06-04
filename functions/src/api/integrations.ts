import express, { type Request, type Response } from 'express';
const router = express.Router();

// Placeholder: GET /integrations
router.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Integrations service placeholder' });
});

export const integrationsRouter = router;
