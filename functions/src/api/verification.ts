import express, { type Request, type Response } from 'express';
const router = express.Router();

// Placeholder: POST /verification
router.post('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Verification service placeholder' });
});

export const verificationRouter = router;
