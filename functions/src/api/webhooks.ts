import express, { type Request, type Response } from 'express';
const router = express.Router();

// Placeholder: POST /webhooks/receive
router.post('/receive', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Webhooks service placeholder' });
});

export const webhooksRouter = router;
