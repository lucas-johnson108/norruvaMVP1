import express, { type Request, type Response } from 'express';
const router = express.Router();

// Placeholder: GET /products
router.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Products service placeholder' });
});

export const productsRouter = router;
