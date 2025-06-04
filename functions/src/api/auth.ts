import express, { type Request, type Response } from 'express';
const router = express.Router();

// Placeholder: GET /auth/status
router.get('/status', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Auth service is running' });
});

// Placeholder: POST /auth/login
router.post('/login', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Login endpoint placeholder' });
});

export const authRouter = router;
