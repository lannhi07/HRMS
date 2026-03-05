import { getConfig, updateConfig } from '../controllers/configController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { Router } from 'express';
const router = Router();
router.use(authenticateToken);
router.get('/', requireRole('hrro'), getConfig);
router.put('/', requireRole('hrro'), updateConfig);
export default router;
