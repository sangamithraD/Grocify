import { Router, Response } from 'express';
import { query } from '../config/db';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import t from '../utils/i18n';

const router = Router();

// Secure all routes with authMiddleware
router.use(authMiddleware);

// 1. Fetch All Active Pantry Items for Logged-In User
router.get('/', async (req: AuthRequest, res: Response) => {
  const acceptLanguage = req.headers['accept-language'] as string | undefined;
  try {
    const result = await query(
      'SELECT id, product_name AS "productName", quantity, TO_CHAR(expiry_date, \'YYYY-MM-DD\') AS "expiryDate", category FROM items WHERE user_id = $1 AND status = \'active\' ORDER BY expiry_date ASC',
      [req.userId]
    );
    return res.json(result.rows);
  } catch (error) {
    console.error('Fetch items error:', error);
    return res.status(500).json({ error: t(acceptLanguage, 'fetchItemsError') });
  }
});

// 2. Fetch All Historical Items (Active, Consumed, Expired)
router.get('/history', async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      'SELECT id, product_name AS "productName", quantity, TO_CHAR(expiry_date, \'YYYY-MM-DD\') AS "expiryDate", category, status, TO_CHAR(created_at, \'YYYY-MM-DD\') AS "createdAt", TO_CHAR(consumed_at, \'YYYY-MM-DD\') AS "consumedAt", TO_CHAR(wasted_at, \'YYYY-MM-DD\') AS "wastedAt", saved_via_recipe AS "savedViaRecipe" FROM items WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    return res.json(result.rows);
  } catch (error) {
    console.error('Fetch items history error:', error);
    return res.status(500).json({ error: 'Failed to fetch items history' });
  }
});

// 3. Add New Pantry Item
router.post('/', async (req: AuthRequest, res: Response) => {
  const { productName, quantity, expiryDate, category } = req.body;
  const acceptLanguage = req.headers['accept-language'] as string | undefined;

  if (!productName || !expiryDate || !category) {
    return res.status(400).json({ error: t(acceptLanguage, 'itemFieldsRequired') });
  }

  if (category !== 'food' && category !== 'non-food') {
    return res.status(400).json({ error: t(acceptLanguage, 'invalidCategory') });
  }

  const parsedQty = parseInt(quantity, 10) || 1;

  try {
    const result = await query(
      'INSERT INTO items (user_id, product_name, quantity, expiry_date, category, status) VALUES ($1, $2, $3, $4, $5, \'active\') RETURNING id, product_name AS "productName", quantity, TO_CHAR(expiry_date, \'YYYY-MM-DD\') AS "expiryDate", category',
      [req.userId, productName.trim(), parsedQty, expiryDate, category]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add item error:', error);
    return res.status(500).json({ error: t(acceptLanguage, 'addItemError') });
  }
});

// 4. Mark Item Consumed
router.put('/:id/consume', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { usedInRecipe } = req.body;
  const acceptLanguage = req.headers['accept-language'] as string | undefined;
  const isUsedInRecipe = usedInRecipe === true;

  try {
    const checkResult = await query('SELECT * FROM items WHERE id = $1 AND user_id = $2', [id, req.userId]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: t(acceptLanguage, 'itemNotFound') });
    }

    await query(
      'UPDATE items SET status = \'consumed\', consumed_at = CURRENT_TIMESTAMP, saved_via_recipe = $1 WHERE id = $2 AND user_id = $3',
      [isUsedInRecipe, id, req.userId]
    );
    return res.json({ message: 'Item marked as consumed successfully' });
  } catch (error) {
    console.error('Consume item error:', error);
    return res.status(500).json({ error: 'Failed to mark item as consumed' });
  }
});

// 5. Mark Item Expired
router.put('/:id/expire', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const acceptLanguage = req.headers['accept-language'] as string | undefined;

  try {
    const checkResult = await query('SELECT * FROM items WHERE id = $1 AND user_id = $2', [id, req.userId]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: t(acceptLanguage, 'itemNotFound') });
    }

    await query(
      'UPDATE items SET status = \'expired\', wasted_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );
    return res.json({ message: 'Item marked as expired successfully' });
  } catch (error) {
    console.error('Expire item error:', error);
    return res.status(500).json({ error: 'Failed to mark item as expired' });
  }
});

// 6. Delete Single Pantry Item (Mistake/Trash Fresh Removal)
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const acceptLanguage = req.headers['accept-language'] as string | undefined;

  try {
    const checkResult = await query('SELECT * FROM items WHERE id = $1 AND user_id = $2', [id, req.userId]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: t(acceptLanguage, 'itemNotFound') });
    }

    await query('DELETE FROM items WHERE id = $1 AND user_id = $2', [id, req.userId]);
    return res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete item error:', error);
    return res.status(500).json({ error: t(acceptLanguage, 'deleteItemError') });
  }
});

// 7. Clear All Pantry Items (Bulk Delete)
router.delete('/', async (req: AuthRequest, res: Response) => {
  const acceptLanguage = req.headers['accept-language'] as string | undefined;
  try {
    await query('DELETE FROM items WHERE user_id = $1', [req.userId]);
    return res.json({ message: t(acceptLanguage, 'pantryCleared') });
  } catch (error) {
    console.error('Clear pantry error:', error);
    return res.status(500).json({ error: t(acceptLanguage, 'clearPantryError') });
  }
});

export default router;
