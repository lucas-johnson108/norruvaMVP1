import express, { type Request, type Response } from 'express';
const router = express.Router();

// Placeholder: GET /companies
router.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Companies service placeholder' });
});

export const companiesRouter = router;
